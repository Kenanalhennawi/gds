import { translateAirline, translateCity, translateStatus, translateEnvelope, translateHeaderType } from "./translator.js";

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
            <div class="empty-state">
                <div class="empty-icon">nodata</div>
                <h3>No Data Detected</h3>
                <p>Paste a valid history log to begin analysis.</p>
            </div>`;
        return;
    }
    

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
        
        let sourceName = "System";
        if (evt.context.airline) sourceName = translateAirline(evt.context.airline);
        if (evt.context.office) sourceName += ` (${translateCity(evt.context.office)})`;

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

        let contextHtml = "";
        if (evt.context.recordLocator || evt.headerType) {
            contextHtml = `<div class="card-context">
                <div class="context-row">
                    <span class="ctx-label">Message Type:</span> 
                    <span class="ctx-val" title="${actionDesc}">${action}</span>
                </div>`;
            if (evt.context.recordLocator) {
                contextHtml += `<div class="context-row">
                    <span class="ctx-label">Active Record (PNR):</span> 
                    <span class="ctx-val pnr">${evt.context.recordLocator}</span>
                </div>`;
            }
            if (evt.context.airline) {
                contextHtml += `<div class="context-row">
                    <span class="ctx-label">Context:</span> 
                    <span class="ctx-val">${translateAirline(evt.context.airline)} (${evt.context.airline})</span>
                </div>`;
            }
            contextHtml += headerTypeHtml;
            contextHtml += `</div>`;
        }
        
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
            html += `<div class="pax-list">`;
            evt.passengers.forEach(p => {
                const titleDisplay = p.title ? ` ${p.title}` : '';
                html += `<div class="pax-item">👤 ${p.surname}/${p.given}${titleDisplay}</div>`;
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
                
                html += `
                    <div class="segment-row" style="border-left-color:${st.class === 'status-hk' ? 'var(--success-green)' : st.class === 'status-hx' ? 'var(--error-red)' : 'var(--warning-amber)'}">
                        <div class="seg-code" title="${carrier}">${seg.carrier}${seg.flight}</div>
                        <div class="seg-route">${from} ➝ ${to} <span style="opacity:0.5; margin-left:5px">${seg.date}</span></div>
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
                html += `
                    <div style="margin-bottom:8px; padding:10px; background:rgba(96,165,250,0.1); border-radius:6px; border-left:3px solid var(--info-blue); transition:all 0.3s ease;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                            <strong style="color:var(--info-blue); font-size:12px;">SSR ${ssr.code}</strong>
                            <span style="font-size:11px; color:var(--text-muted);">${ssr.carrier}</span>
                        </div>
                        ${explanation ? `<div style="font-size:12px; color:var(--text-main); margin-top:4px;">${explanation}</div>` : ''}
                        ${ssr.details ? `<div style="font-size:11px; color:var(--text-muted); margin-top:4px; font-family:var(--font-code); opacity:0.8;">${ssr.details.substring(0, 100)}${ssr.details.length > 100 ? '...' : ''}</div>` : ''}
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
                const msg = evt.messages.find(m => m.title && m.title.includes('Contact'));
                html += `
                    <div style="margin-bottom:6px; padding:8px; background:rgba(74,222,128,0.1); border-radius:6px; border-left:3px solid var(--success-green);">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2px;">
                            <span style="font-size:11px; color:var(--text-muted);">${osi.carrier}</span>
                        </div>
                        <div style="font-size:12px; color:var(--text-main);">${osi.message}</div>
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
