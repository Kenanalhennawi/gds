import { translateAirline, translateCity, translateStatus, translateEnvelope, translateHeaderType, translateOSI } from "./translator.js";

export const renderTimeline = (container, data) => {
    container.innerHTML = "";
    
    // Handle both new format {events, summary} and old format [events]
    const events = Array.isArray(data) ? data : (data.events || []);
    const summary = Array.isArray(data) ? null : data.summary;
    const changes = Array.isArray(data) ? null : (data.changes || []);
    
    // Create a map of changes by event index for quick lookup
    const changesByEventIndex = new Map();
    if (changes) {
        changes.forEach(changeGroup => {
            changesByEventIndex.set(changeGroup.eventIndex, changeGroup.changes);
        });
    }

    // 1. Render Summary Dashboard (always show if we have events)
    if (summary && events.length > 0) {
        const summaryCard = document.createElement("div");
        summaryCard.className = `glass-panel summary-card ${summary.alertLevel}`;
        summaryCard.style.marginBottom = "20px";
        summaryCard.style.padding = "20px";
        summaryCard.style.borderLeft = "4px solid " + (
            summary.alertLevel === 'critical' ? 'var(--error-red)' : 
            summary.alertLevel === 'success' ? 'var(--success-green)' : 
            summary.alertLevel === 'warning' ? 'var(--warning-amber)' : 'var(--info-blue)'
        );
        
        summaryCard.innerHTML = `
            <h2 style="margin-bottom:5px; color:#fff;">${summary.status}</h2>
            <p style="color:var(--text-muted); font-size:14px;">${summary.description}</p>
        `;
        container.appendChild(summaryCard);
    }

    // 2. Empty State
    if (!events || events.length === 0) {
        container.innerHTML = `
            <div class="empty-state modern-empty">
                <div class="empty-icon-large">📊</div>
                <h3>No Data Detected</h3>
                <p style="margin-top: 12px; font-size: 14px; color: var(--text-dim);">Paste a valid history log to begin analysis and unlock powerful insights.</p>
                <div class="empty-actions">
                    <button class="btn-hero" onclick="document.getElementById('gdsInput')?.focus()">
                        Start Analysis
                    </button>
                </div>
            </div>`;
        return;
    }
    
    // Hide hero section when data is present
    

    // 3. Render Events
    events.forEach((evt, eventIndex) => {
        const card = document.createElement("div");
        card.className = "timeline-card";
        
        // Check if this event has changes
        const eventChanges = changesByEventIndex.get(eventIndex) || [];
        const hasChanges = eventChanges.length > 0;
        
        if (hasChanges) {
            card.style.borderLeft = "4px solid var(--neon-gold)";
            card.style.boxShadow = "0 0 25px rgba(255, 193, 7, 0.3), 0 0 50px rgba(255, 200, 0, 0.1)";
            card.style.background = "linear-gradient(135deg, rgba(255, 200, 0, 0.05), var(--glass))";
        }

        // Get envelope explanation
        const envelopeInfo = translateEnvelope(evt.envelope);
        let action = envelopeInfo.title;
        let actionDesc = envelopeInfo.desc;
        
        // Parse header for additional context
        let headerInfo = "";
        if (evt.rawHeader) {
            // Check for PEKRMCA format (Office + RM + Airline)
            const officeRmMatch = evt.rawHeader.match(/([A-Z]{3})RM([A-Z0-9]{2})/);
            if (officeRmMatch) {
                headerInfo = `${translateCity(officeRmMatch[1])} (${officeRmMatch[1]}) - ${translateAirline(officeRmMatch[2])} (${officeRmMatch[2]})`;
            }
        }
        
        let sourceName = "System";
        if (evt.context.airline) sourceName = translateAirline(evt.context.airline);
        if (evt.context.office) sourceName += ` (${translateCity(evt.context.office)})`;
        if (headerInfo && !evt.context.office) sourceName = headerInfo;

        // Get header type explanation
        let headerTypeHtml = "";
        if (evt.headerType) {
            const headerInfo = translateHeaderType(evt.headerType);
            if (headerInfo) {
                headerTypeHtml = `<div class="context-row">
                    <span class="ctx-label">Message Type:</span> 
                    <span class="ctx-val" title="${headerInfo.desc}">${headerInfo.title}</span>
                </div>`;
            }
        }

        // Build detailed explanation section - ALWAYS show context section
        let contextHtml = `<div class="card-context">
            <div class="context-row">
                <span class="ctx-label">Detected Type:</span> 
                <span class="ctx-val">GDS_HISTORY</span>
            </div>
            <div class="context-row">
                <span class="ctx-label">Message Type:</span> 
                <span class="ctx-val" title="${actionDesc}">${action || evt.envelope || 'N/A'}</span>
            </div>`;
        
        if (evt.rawHeader) {
                // Parse header components for detailed explanation
                const headerParts = [];
                if (evt.rawHeader.includes('HDQ')) {
                    if (evt.rawHeader.includes('HDQRM')) {
                        headerParts.push('HDQ (Host Data Queue)');
                        headerParts.push('RM (Record Message)');
                        const airlineMatch = evt.rawHeader.match(/HDQRM([A-Z0-9]{2})/);
                        if (airlineMatch) {
                            headerParts.push(`${airlineMatch[1]} (${translateAirline(airlineMatch[1])})`);
                        }
                    } else {
                        headerParts.push('HDQ (Host Data Queue)');
                        const airlineMatch = evt.rawHeader.match(/HDQ([A-Z0-9]{2})/);
                        if (airlineMatch) {
                            headerParts.push(`${airlineMatch[1]} (${translateAirline(airlineMatch[1])})`);
                        }
                    }
                }
                if (evt.rawHeader.match(/^([A-Z]{3})RM([A-Z0-9]{2})/)) {
                    const officeMatch = evt.rawHeader.match(/^([A-Z]{3})RM([A-Z0-9]{2})/);
                    if (officeMatch) {
                        headerParts.push(`${officeMatch[1]} (${translateCity(officeMatch[1])})`);
                        headerParts.push('RM (Record Message)');
                        headerParts.push(`${officeMatch[2]} (${translateAirline(officeMatch[2])})`);
                    }
                }
                
            contextHtml += `<div class="context-row">
                <span class="ctx-label">Header:</span> 
                <span class="ctx-val" style="font-family:var(--font-code);">${evt.rawHeader || 'N/A'}</span>
            </div>`;
            if (headerParts.length > 0) {
                contextHtml += `<div class="context-row" style="font-size:11px; color:var(--text-muted); margin-top:4px;">
                    <span>${headerParts.join(' + ')}</span>
                </div>`;
            }
        } else {
            contextHtml += `<div class="context-row">
                <span class="ctx-label">Header:</span> 
                <span class="ctx-val" style="font-family:var(--font-code);">N/A</span>
            </div>`;
        }
        
        if (evt.timestamp) {
            // Format timestamp: 050437 -> 05:04:37 or date format
            const ts = evt.timestamp;
            const formattedTime = ts.length === 6 ? `${ts.substring(0,2)}:${ts.substring(2,4)}:${ts.substring(4,6)}` : ts;
            contextHtml += `<div class="context-row">
                <span class="ctx-label">Timestamp:</span> 
                <span class="ctx-val">${formattedTime}</span>
            </div>`;
        }
        
        if (evt.context.office) {
            contextHtml += `<div class="context-row">
                <span class="ctx-label">Office/Sign-in:</span> 
                <span class="ctx-val">${translateCity(evt.context.office)} (${evt.context.office})</span>
            </div>`;
        }
        if (evt.context.recordLocator) {
            contextHtml += `<div class="context-row">
                <span class="ctx-label">Active Record (PNR):</span> 
                <span class="ctx-val pnr">${evt.context.recordLocator}</span>
            </div>`;
        }
        if (evt.context.airline) {
            contextHtml += `<div class="context-row">
                <span class="ctx-label">Airline Context:</span> 
                <span class="ctx-val">${translateAirline(evt.context.airline)} (${evt.context.airline})</span>
            </div>`;
        } else {
            // Always show Airline Context field, even if empty
            contextHtml += `<div class="context-row">
                <span class="ctx-label">Airline Context:</span> 
                <span class="ctx-val">N/A</span>
            </div>`;
        }
        contextHtml += headerTypeHtml;
        contextHtml += `</div>`;
        
        // Add change explanation section
        let changesHtml = "";
        if (hasChanges) {
            changesHtml = `<div class="changes-section" style="margin-top:15px; padding:15px; background:rgba(251,191,36,0.1); border-radius:8px; border-left:3px solid var(--warning-amber);">
                <div style="font-weight:700; color:var(--warning-amber); margin-bottom:10px; font-size:13px; text-transform:uppercase; letter-spacing:0.5px;">
                    📋 What Happened:
                </div>`;
            eventChanges.forEach(change => {
                const changeIcon = {
                    'booking_cancelled': '❌',
                    'segment_cancelled': '✕',
                    'segment_dropped': '🗑️',
                    'segment_added': '➕',
                    'segment_reissued': '🔄',
                    'fdis': '⚠️',
                    'status_change': '🔄'
                }[change.type] || '•';
                
                changesHtml += `<div style="margin-bottom:8px; padding:8px; background:rgba(0,0,0,0.2); border-radius:4px; font-size:13px; line-height:1.5; border-left:2px solid var(--warning-amber);">
                    <span style="margin-right:6px; font-size:16px;">${changeIcon}</span>
                    <span style="color:var(--text-main);">${change.description}</span>
                </div>`;
            });
            changesHtml += `</div>`;
        }

        let html = `
            <div class="card-header">
                <div class="header-main">
                    <div class="source-badge">
                        <span class="source-dot"></span>
                        ${sourceName}
                    </div>
                    <div class="action-title">${action}</div>
                </div>
                <div class="header-meta">
                    <span class="context-pill">${evt.envelope || 'LOG'}</span>
                </div>
            </div>
            ${contextHtml}
        `;

        if (evt.passengers && evt.passengers.length > 0) {
            html += `<div class="pax-list" style="margin-bottom:15px; padding-left:15px;">
                <div style="font-weight:700; color:var(--text-main); margin-bottom:10px; font-size:12px; text-transform:uppercase; letter-spacing:0.5px;">
                    👤 Passenger(s):
                </div>`;
            evt.passengers.forEach(p => {
                const titleDisplay = p.title ? ` ${p.title}` : '';
                html += `<div class="pax-item" style="margin-bottom:6px;">
                    <div style="font-weight:700;">${p.surname}/${p.given}${titleDisplay}</div>
                    <div style="font-size:10px; color:var(--text-muted); margin-top:2px;">
                        <div><strong>Surname:</strong> ${p.surname}</div>
                        <div><strong>Given Name:</strong> ${p.given}</div>
                        ${p.title ? `<div><strong>Title:</strong> ${p.title}</div>` : ''}
                    </div>
                </div>`;
            });
            html += `</div>`;
        }

        if (evt.segments.length > 0) {
            html += `<div class="segments-grid">`;
            evt.segments.forEach(seg => {
                const carrier = translateAirline(seg.carrier);
                const from = translateCity(seg.from);
                const to = translateCity(seg.to);
                const st = translateStatus(seg.status);
                
                // Build flight display with fare class if available
                let flightDisplay = `${seg.carrier}${seg.flight}`;
                if (seg.fareClass) {
                    flightDisplay += seg.fareClass;
                }
                
                // Detailed segment explanation
                let segmentDetails = `<div style="font-size:10px; color:var(--text-muted); margin-top:4px; line-height:1.4;">
                    <div><strong>Carrier:</strong> ${seg.carrier} (${carrier})</div>
                    <div><strong>Flight:</strong> ${seg.flight}${seg.fareClass ? `, Fare Class: ${seg.fareClass}` : ''}</div>
                    <div><strong>Route:</strong> ${seg.from} (${from}) → ${seg.to} (${to})</div>
                    <div><strong>Date:</strong> ${seg.date}</div>
                    <div><strong>Status:</strong> ${seg.status} (${st.label})</div>
                `;
                
                // Add codeshare info if available
                let codeshareInfo = '';
                if (seg.codeshare) {
                    const marketingCarrierName = seg.marketingCarrier ? translateAirline(seg.marketingCarrier) : seg.marketingCarrier;
                    codeshareInfo = `<div style="font-size:10px; color:var(--text-muted); margin-top:2px;">
                        <span style="color:var(--info-blue);">${seg.codeshare}</span> - Codeshare: Operated by ${carrier}, Marketed by ${marketingCarrierName}
                    </div>`;
                    segmentDetails += `<div><strong>Codeshare:</strong> ${seg.codeshare} - Operating: ${carrier}, Marketing: ${marketingCarrierName}</div>`;
                }
                segmentDetails += `</div>`;
                
                html += `
                    <div class="segment-row" style="border-left-color:${st.class === 'status-hk' ? 'var(--success-green)' : st.class === 'status-hx' ? 'var(--error-red)' : 'var(--warning-amber)'}">
                        <div class="seg-code" title="${carrier}">${flightDisplay}</div>
                        <div class="seg-route">
                            ${from} ➝ ${to} <span style="opacity:0.5; margin-left:5px">${seg.date}</span>
                            ${codeshareInfo}
                            ${segmentDetails}
                        </div>
                        <div class="seg-status ${st.class}">${st.icon} ${st.label}</div>
                    </div>
                `;
            });
            html += `</div>`;
        }

        // Display SSR codes with explanations
        if (evt.ssrs && evt.ssrs.length > 0) {
            html += `<div class="ssr-container" style="margin-top:15px; padding-left:15px;">
                <div style="font-weight:700; color:var(--info-blue); margin-bottom:10px; font-size:12px; text-transform:uppercase; letter-spacing:0.5px;">
                    📋 Special Service Requests (SSR):
                </div>`;
            evt.ssrs.forEach(ssr => {
                const msg = evt.messages.find(m => m.ssrCode === ssr.code);
                const explanation = msg ? msg.details || msg.msg : '';
                const carrierName = translateAirline(ssr.carrier);
                const statusInfo = ssr.status ? translateStatus(ssr.status) : null;
                
                html += `
                    <div style="margin-bottom:8px; padding:10px; background:rgba(96,165,250,0.1); border-radius:6px; border-left:3px solid var(--info-blue); transition:all 0.3s ease;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                            <strong style="color:var(--info-blue); font-size:12px;">SSR ${ssr.code}</strong>
                            <span style="font-size:11px; color:var(--text-muted);">${ssr.carrier} (${carrierName})</span>
                        </div>
                        <div style="font-size:10px; color:var(--text-muted); margin-top:2px; line-height:1.4;">
                            <div><strong>SSR Code:</strong> ${ssr.code}</div>
                            <div><strong>Carrier:</strong> ${ssr.carrier} (${carrierName})</div>
                            ${ssr.status ? `<div><strong>Status:</strong> ${ssr.status} ${statusInfo ? `(${statusInfo.label})` : ''}</div>` : ''}
                            ${explanation ? `<div style="margin-top:4px; color:var(--text-main); font-size:11px;"><strong>Explanation:</strong> ${explanation}</div>` : ''}
                        </div>
                        ${ssr.details ? `<div style="font-size:11px; color:var(--text-muted); margin-top:4px; font-family:var(--font-code); opacity:0.8; background:rgba(0,0,0,0.2); padding:4px; border-radius:3px;">${ssr.details}</div>` : ''}
                    </div>
                `;
            });
            html += `</div>`;
        }

        // Display OSI messages
        if (evt.osis && evt.osis.length > 0) {
            html += `<div class="osi-container" style="margin-top:15px; padding-left:15px;">
                <div style="font-weight:700; color:var(--success-green); margin-bottom:10px; font-size:12px; text-transform:uppercase; letter-spacing:0.5px;">
                    ℹ️ Other Service Information (OSI):
                </div>`;
            evt.osis.forEach(osi => {
                const osiInfo = translateOSI(osi.raw);
                const carrierDisplay = osiInfo && osiInfo.carrier ? osiInfo.carrier : (osi.carrier === "YY" ? "YY (System/Any Carrier)" : osi.carrier);
                const title = osiInfo ? osiInfo.title : "Other Service Information";
                const explanation = osiInfo ? osiInfo.msg : osi.message;
                
                // Parse contact information details
                let detailsHtml = '';
                if (osi.message.includes('CTCP') || osi.message.includes('CTCT')) {
                    const contactMatch = osi.message.match(/(CTCP|CTCT)\s*(.+)/i);
                    if (contactMatch) {
                        const contactType = contactMatch[1];
                        const contactData = contactMatch[2].trim();
                        const phoneMatch = contactData.match(/([\d\s\-\(\)]+)/);
                        const phone = phoneMatch ? phoneMatch[1].trim() : '';
                        const company = contactData.replace(phone, '').replace(/^[\s\-]+|[\s\-]+$/g, '').trim();
                        
                        detailsHtml = `<div style="font-size:10px; color:var(--text-muted); margin-top:4px; line-height:1.4;">
                            <div><strong>Type:</strong> ${contactType === 'CTCP' ? 'Contact Phone (Primary)' : 'Contact Telephone'}</div>
                            ${phone ? `<div><strong>Phone:</strong> ${phone}</div>` : ''}
                            ${company ? `<div><strong>Company/Agency:</strong> ${company}</div>` : ''}
                            <div><strong>Full Text:</strong> <span style="font-family:var(--font-code);">${contactData}</span></div>
                        </div>`;
                    }
                }
                
                html += `
                    <div style="margin-bottom:8px; padding:10px; background:rgba(74,222,128,0.1); border-radius:6px; border-left:3px solid var(--success-green);">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                            <strong style="color:var(--success-green); font-size:12px;">${title}</strong>
                            <span style="font-size:11px; color:var(--text-muted);">${carrierDisplay}</span>
                        </div>
                        <div style="font-size:12px; color:var(--text-main); margin-top:4px;">${explanation}</div>
                        ${detailsHtml}
                        <div style="font-size:10px; color:var(--text-muted); margin-top:4px; font-family:var(--font-code); opacity:0.8; background:rgba(0,0,0,0.2); padding:4px; border-radius:3px;">
                            Raw: ${osi.message}
                        </div>
                    </div>
                `;
            });
            html += `</div>`;
        }

        if (evt.messages.length > 0) {
            html += `<div class="alerts-container" style="margin-top:15px;">`;
            evt.messages.forEach(msg => {
                // Skip SSR and OSI messages that are already displayed above
                if (msg.ssrCode || msg.title && (msg.title.includes('Contact') || msg.title.includes('E-Ticket'))) {
                    return;
                }
                html += `
                    <div class="alert-box alert-${msg.type}">
                        <strong>${msg.title}:</strong> ${msg.msg}
                    </div>
                `;
            });
            html += `</div>`;
        }
        
        // Add changes section before closing
        html += changesHtml;

        card.innerHTML = html;
        container.appendChild(card);
    });
};
