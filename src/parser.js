import { translateSSR } from "./translator.js";

// ... (Existing cleanText function remains the same) ...
const cleanText = (text) => {
    if (!text) return [];
    let clean = text.toString();
    clean = clean.replace(/[\u0001\u0002\u0003\u0004]/g, "\n");
    clean = clean.replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, "\n");
    clean = clean.replace(/([A-Z0-9])(QP|QK|QD|HDQ|SWI|TRL|AKA|NAR|DVD)/g, "$1\n$2");
    clean = clean.replace(/(\d{6})\s*(\.?[A-Z]{2,3})/g, "$1\n$2");
    clean = clean.replace(/([0-9A-Z]{2}\d{3,4}[A-Z]?\d{2}[A-Z]{3})([A-Z]{3})/g, "$1 $2");
    return clean.split(/\r\n|\r|\n/).map(l => l.trim()).filter(l => l.length > 0);
};

// NEW: The Intelligence Engine
const generateSummary = (events) => {
    const summary = {
        status: "Unknown",
        description: "No significant events detected.",
        alertLevel: "info" // info, warning, critical, success
    };

    let hasCancellation = false;
    let hasReissue = false;
    let hasScheduleChange = false;
    let hasTicket = false;
    let isConfirmed = false;

    events.forEach(evt => {
        // Check Segments
        evt.segments.forEach(seg => {
            if (["HX", "UC", "UN", "XX", "NO"].includes(seg.status)) hasCancellation = true;
            if (["TK", "SK"].includes(seg.status)) hasScheduleChange = true;
            if (["HK", "KK", "KL"].includes(seg.status)) isConfirmed = true;
        });

        // Check Messages for Tickets
        evt.messages.forEach(msg => {
            if (msg.title === "Ticket Issued") {
                hasTicket = true;
                // If we see a ticket AFTER a cancellation or change, it might be a reissue
                if (hasScheduleChange || hasCancellation) hasReissue = true;
            }
        });
    });

    // Determine the "Story"
    if (hasCancellation && !isConfirmed) {
        summary.status = "Booking Cancelled";
        summary.description = "The reservation was completely cancelled by the airline or agent.";
        summary.alertLevel = "critical";
    } else if (hasReissue) {
        summary.status = "Ticket Reissued";
        summary.description = "The flight details changed, and a new ticket was issued to match.";
        summary.alertLevel = "success";
    } else if (hasScheduleChange && isConfirmed) {
        summary.status = "Schedule Change";
        summary.description = "The airline changed the flight times. The booking is confirmed but may need acceptance.";
        summary.alertLevel = "warning";
    } else if (hasTicket && isConfirmed) {
        summary.status = "Ticketed & Confirmed";
        summary.description = "Everything looks good. Ticket numbers are issued and flights are confirmed.";
        summary.alertLevel = "success";
    } else if (isConfirmed && !hasTicket) {
        summary.status = "Confirmed (Un-Ticketed)";
        summary.description = "Seats are held, but no ticket number was found yet. Payment may be pending.";
        summary.alertLevel = "warning";
    }

    return summary;
};

export const parseLog = (input) => {
    const lines = cleanText(input);
    const events = [];
    let currentBlock = null;

    // ... (Existing startNewBlock and finalizeBlock functions remain the same) ...
    const finalizeBlock = () => {
        if (currentBlock) {
            events.push(currentBlock);
            currentBlock = null;
        }
    };

    const startNewBlock = (envelope, header, rawLine) => {
        finalizeBlock();
        currentBlock = {
            id: Math.random().toString(36).substr(2, 9),
            envelope: envelope,
            header: header,
            rawHeader: rawLine,
            context: { airline: null, recordLocator: null, office: null },
            segments: [],
            messages: [],
            passengers: []
        };
        parseContextFromHeader(currentBlock, header, rawLine);
    };

    const parseContextFromHeader = (block, header, line) => {
        const mComp = line.match(/HDQ([A-Z0-9]{2})([A-Z0-9]{6})/);
        if (mComp) {
            block.context.airline = mComp[1];
            block.context.recordLocator = mComp[2];
            return;
        }
        const mSwi = line.match(/SWI([A-Z0-9]{2})\s+([A-Z0-9]{6})/);
        if (mSwi) {
            block.context.airline = mSwi[1];
            block.context.recordLocator = mSwi[2];
            return;
        }
        const mCity = line.match(/^([A-Z]{3})([A-Z0-9]{2})\s+([A-Z0-9]{6})$/);
        if (mCity) {
            block.context.office = mCity[1];
            block.context.airline = mCity[2];
            block.context.recordLocator = mCity[3];
            return;
        }
    };

    // ... (Existing extractPassengers function remains the same) ...
    const extractPassengers = (line) => {
        const paxes = [];
        const regex = /\d+([A-Z]+)\/([A-Z]+)(?:\s+([A-Z]{1,4}))?/g;
        let match;
        while ((match = regex.exec(line)) !== null) {
            paxes.push({ raw: match[0], surname: match[1], given: match[2], title: match[3] || "" });
        }
        return paxes;
    };

    lines.forEach(line => {
        const envMatch = line.match(/^(QP|QK|QD)\s+(\S+)/);
        if (envMatch) {
            startNewBlock(envMatch[1], envMatch[2], line);
            return;
        }
        if (line.startsWith("SWI") || line.startsWith("HDQ")) {
            if (!currentBlock) startNewBlock("SYS", line.split(' ')[0], line);
            parseContextFromHeader(currentBlock, null, line);
            return;
        }
        if (!currentBlock) {
            if (line.length > 4) startNewBlock('UNK', 'FRAGMENT', line);
            else return; 
        }

        const foundPaxes = extractPassengers(line);
        if (foundPaxes.length > 0) {
            currentBlock.passengers.push(...foundPaxes);
            return;
        }

        const segMatch = line.match(/([A-Z0-9]{2})\s*(\d{1,4}[A-Z]?)\s*([0-9]{2}[A-Z]{3})\s+([A-Z]{3})([A-Z]{3})\s+([A-Z]{2}\d+)/);
        if (segMatch) {
            currentBlock.segments.push({
                carrier: segMatch[1],
                flight: segMatch[2],
                date: segMatch[3],
                from: segMatch[4],
                to: segMatch[5],
                status: segMatch[6]
            });
            return;
        }

        const ssrInfo = translateSSR(line);
        if (ssrInfo) {
            currentBlock.messages.push(ssrInfo);
        }
    });

    finalizeBlock();
    
    // NEW: Attach the summary to the result
    const summary = generateSummary(events);
    return { events, summary };
};
