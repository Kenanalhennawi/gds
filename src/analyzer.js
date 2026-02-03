

const segmentKey = (seg) => {
    return `${seg.carrier}${seg.flight}-${seg.date}-${seg.from}${seg.to}`;
};

const isConfirmed = (status) => {
    const s = (status || "").substring(0, 2).toUpperCase();

    return ['HK', 'KK', 'KL', 'SS', 'LK', 'PK', 'RR'].includes(s);
};

const isCancelled = (status) => {
    const s = (status || "").substring(0, 2).toUpperCase();
    return ['HX', 'XX', 'UN', 'UC', 'US', 'NO'].includes(s);
};

const isScheduleChange = (status) => {
    const s = (status || "").substring(0, 2).toUpperCase();
    return ['TK', 'DK'].includes(s);
};

const isChangeStatus = (status) => {
    const s = (status || "").substring(0, 2).toUpperCase();
    return ['CH', 'CS', 'UC'].includes(s);
};

const findSegment = (segments, targetSeg) => {
    const key = segmentKey(targetSeg);
    return segments.find(s => segmentKey(s) === key);
};

export const analyzeBookingChanges = (events) => {
    if (!events || events.length === 0) {
        return {
            summary: {
                status: "No History Available",
                description: "No booking history found to analyze.",
                alertLevel: "info"
            },
            changes: [],
            events: []
        };
    }

    const changes = [];
    const segmentHistory = new Map();


    events.forEach((event, eventIndex) => {
        event.segments.forEach(seg => {
            const key = segmentKey(seg);
            if (!segmentHistory.has(key)) {
                segmentHistory.set(key, {
                    key: key,
                    carrier: seg.carrier,
                    flight: seg.flight,
                    date: seg.date,
                    from: seg.from,
                    to: seg.to,
                    firstSeen: eventIndex,
                    lastSeen: eventIndex,
                    statusHistory: [{ eventIndex, status: seg.status }],
                    currentStatus: seg.status
                });
            } else {
                const history = segmentHistory.get(key);
                history.lastSeen = eventIndex;
                history.statusHistory.push({ eventIndex, status: seg.status });
                history.currentStatus = seg.status;
            }
        });
    });

    for (let i = 1; i < events.length; i++) {
        const prevEvent = events[i - 1];
        const currEvent = events[i];
        const detectedChanges = [];

        const prevSegments = new Map();
        prevEvent.segments.forEach(s => {
            prevSegments.set(segmentKey(s), s);
        });

        const currSegments = new Map();
        currEvent.segments.forEach(s => {
            currSegments.set(segmentKey(s), s);
        });

        prevSegments.forEach((seg, key) => {
            if (!currSegments.has(key)) {
                const prevStatus = seg.status.substring(0, 2).toUpperCase();
                detectedChanges.push({
                    type: 'segment_dropped',
                    segment: seg,
                    previousStatus: prevStatus,
                    description: `Segment ${seg.carrier}${seg.flight} (${seg.from} → ${seg.to}) was removed from the booking.`
                });
            }
        });

        currSegments.forEach((seg, key) => {
            if (!prevSegments.has(key)) {
                const currStatus = seg.status.substring(0, 2).toUpperCase();
                detectedChanges.push({
                    type: 'segment_added',
                    segment: seg,
                    status: currStatus,
                    description: `New segment ${seg.carrier}${seg.flight} (${seg.from} → ${seg.to}) was added to the booking.`
                });
            }
        });

        prevSegments.forEach((prevSeg, key) => {
            const currSeg = currSegments.get(key);
            if (currSeg) {
                const prevStatus = prevSeg.status.substring(0, 2).toUpperCase();
                const currStatus = currSeg.status.substring(0, 2).toUpperCase();
                
                if (prevStatus !== currStatus) {

                    if (isConfirmed(prevStatus) && isCancelled(currStatus)) {
                        detectedChanges.push({
                            type: 'segment_cancelled',
                            segment: currSeg,
                            previousStatus: prevStatus,
                            newStatus: currStatus,
                            description: `Segment ${currSeg.carrier}${currSeg.flight} (${currSeg.from} → ${currSeg.to}) was cancelled. Status changed from ${prevStatus} to ${currStatus}.`
                        });
                    }

                    else if (isConfirmed(prevStatus) && isScheduleChange(currStatus)) {
                        detectedChanges.push({
                            type: 'fdis',
                            segment: currSeg,
                            previousStatus: prevStatus,
                            newStatus: currStatus,
                            description: `Flight Disruption (FDIS): Segment ${currSeg.carrier}${currSeg.flight} (${currSeg.from} → ${currSeg.to}) has a schedule change. The airline has modified the flight schedule and requires confirmation.`
                        });
                    }

                    else if ((isCancelled(prevStatus) || isScheduleChange(prevStatus)) && isConfirmed(currStatus)) {
                        detectedChanges.push({
                            type: 'segment_reissued',
                            segment: currSeg,
                            previousStatus: prevStatus,
                            newStatus: currStatus,
                            description: `Segment ${currSeg.carrier}${currSeg.flight} (${currSeg.from} → ${currSeg.to}) was reissued. Status changed from ${prevStatus} to ${currStatus} (confirmed).`
                        });
                    }

                    else {
                        detectedChanges.push({
                            type: 'status_change',
                            segment: currSeg,
                            previousStatus: prevStatus,
                            newStatus: currStatus,
                            description: `Segment ${currSeg.carrier}${currSeg.flight} (${currSeg.from} → ${currSeg.to}) status changed from ${prevStatus} to ${currStatus}.`
                        });
                    }
                }
            }
        });

        if (currEvent.segments.length > 0) {
            const allCancelled = currEvent.segments.every(s => isCancelled(s.status));
            const hasFDIS = currEvent.segments.some(s => isScheduleChange(s.status));
            const hasChangeStatus = currEvent.segments.some(s => isChangeStatus(s.status));
            
            if (allCancelled && prevEvent && prevEvent.segments.some(s => isConfirmed(s.status))) {
                detectedChanges.push({
                    type: 'booking_cancelled',
                    description: "The entire booking was cancelled. All segments have been cancelled."
                });
            }
            
            if (hasFDIS && !detectedChanges.some(c => c.type === 'fdis')) {
                detectedChanges.push({
                    type: 'fdis',
                    description: "Flight Disruption (FDIS) detected: One or more segments have schedule changes that require attention."
                });
            }

            if (hasChangeStatus && !detectedChanges.some(c => c.type === 'status_change' || c.type === 'fdis')) {
                const chSegments = currEvent.segments.filter(s => isChangeStatus(s.status));
                chSegments.forEach(seg => {
                    detectedChanges.push({
                        type: 'status_change',
                        segment: seg,
                        newStatus: seg.status.substring(0, 2),
                        description: `Segment ${seg.carrier}${seg.flight} (${seg.from} → ${seg.to}) has a change/hold status (${seg.status}). This indicates a modification to the booking.`
                    });
                });
            }
        }

        currEvent.messages.forEach(msg => {
            if (msg.type === 'critical') {
                if (msg.title.includes('Cancellation')) {
                    detectedChanges.push({
                        type: 'booking_cancelled',
                        description: msg.msg || "Booking cancellation detected from system message."
                    });
                }
            }
        });

        if (detectedChanges.length > 0) {
            changes.push({
                eventIndex: i,
                event: currEvent,
                changes: detectedChanges
            });
        }
    }

    const summary = generateSummary(events, changes, segmentHistory);

    return {
        summary,
        changes,
        events
    };
};

const generateSummary = (events, changes, segmentHistory) => {
    if (changes.length === 0) {

        const lastEvent = events[events.length - 1];
        if (lastEvent && lastEvent.segments.length > 0) {
            const allConfirmed = lastEvent.segments.every(s => isConfirmed(s.status));
            const allCancelled = lastEvent.segments.every(s => isCancelled(s.status));
            const hasFDIS = lastEvent.segments.some(s => isScheduleChange(s.status));
            
            const hasChangeStatus = lastEvent.segments.some(s => isChangeStatus(s.status));
            
            if (hasChangeStatus) {
                return {
                    status: "Booking Changes Pending",
                    description: "One or more segments have change/hold status, indicating modifications to the booking.",
                    alertLevel: "warning"
                };
            } else if (allConfirmed) {
                return {
                    status: "Booking Active",
                    description: "All segments are confirmed. No significant changes detected in the booking history.",
                    alertLevel: "success"
                };
            } else if (allCancelled) {
                return {
                    status: "Booking Cancelled",
                    description: "All segments in this booking have been cancelled.",
                    alertLevel: "critical"
                };
            } else if (hasFDIS) {
                return {
                    status: "Schedule Changes Pending",
                    description: "One or more segments have schedule changes (FDIS) that require confirmation.",
                    alertLevel: "warning"
                };
            }
        }

        return {
            status: "No Changes Detected",
            description: "No significant booking changes were detected in the history.",
            alertLevel: "info"
        };
    }

    const changeCounts = {
        booking_cancelled: 0,
        segment_cancelled: 0,
        segment_dropped: 0,
        segment_added: 0,
        segment_reissued: 0,
        fdis: 0,
        status_change: 0
    };

    changes.forEach(changeGroup => {
        changeGroup.changes.forEach(change => {
            changeCounts[change.type] = (changeCounts[change.type] || 0) + 1;
        });
    });

    let status = "Booking Modified";
    let description = "";
    let alertLevel = "warning";

    const lastEvent = events[events.length - 1];
    const finalHasConfirmed = lastEvent && lastEvent.segments && lastEvent.segments.some(s => isConfirmed(s.status));
    const finalAllCancelled = lastEvent && lastEvent.segments && lastEvent.segments.length > 0 && lastEvent.segments.every(s => isCancelled(s.status));

    if (changeCounts.booking_cancelled > 0 && (finalAllCancelled || !finalHasConfirmed)) {
        status = "Booking Cancelled";
        description = "The booking has been cancelled. ";
        alertLevel = "critical";
    } else if (changeCounts.booking_cancelled > 0 && finalHasConfirmed) {
        status = "Booking Modified";
        description = "The booking was modified: some segments were cancelled or changed, and the itinerary was rebooked. ";
        alertLevel = "warning";
    } else if (changeCounts.fdis > 0) {
        status = "Flight Disruption (FDIS)";
        description = "Flight schedule changes detected. ";
        alertLevel = "warning";
    } else if (changeCounts.segment_cancelled > 0 || changeCounts.segment_dropped > 0) {
        status = "Segments Cancelled/Dropped";
        description = "One or more flight segments were cancelled or removed. ";
        alertLevel = "critical";
    } else if (changeCounts.segment_reissued > 0) {
        status = "Booking Reissued";
        description = "The booking has been reissued with changes. ";
        alertLevel = "warning";
    }

    const details = [];
    if (changeCounts.segment_cancelled > 0) {
        details.push(`${changeCounts.segment_cancelled} segment(s) cancelled`);
    }
    if (changeCounts.segment_dropped > 0) {
        details.push(`${changeCounts.segment_dropped} segment(s) dropped`);
    }
    if (changeCounts.segment_added > 0) {
        details.push(`${changeCounts.segment_added} new segment(s) added`);
    }
    if (changeCounts.segment_reissued > 0) {
        details.push(`${changeCounts.segment_reissued} segment(s) reissued`);
    }
    if (changeCounts.fdis > 0) {
        details.push(`${changeCounts.fdis} schedule change(s) (FDIS)`);
    }
    if (changeCounts.status_change > 0) {
        details.push(`${changeCounts.status_change} status change(s)`);
    }

    if (details.length > 0) {
        description += details.join(", ") + ".";
    } else {
        description += "Various modifications were made to the booking.";
    }

    if (changeCounts.fdis > 0) {
        description += " Review the timeline below for details on each change.";
    } else if (changeCounts.segment_reissued > 0) {
        description += " The booking was successfully reissued with updated segments.";
    }

    return {
        status,
        description,
        alertLevel
    };
};
