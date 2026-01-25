import { translateAirline, translateCity, translateStatus } from "./translator.js";

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

    // 1. Render Summary Dashboard
    if (summary && events.length > 0) {
        const summaryCard = document.createElement("div");
        summaryCard.className = `glass-panel summary-card ${summary.alertLevel}`;
        summaryCard.style.marginBottom = "20px";
        summaryCard.style.padding = "20px";
        summaryCard.style.borderLeft = "4px solid " + (
            summary.alertLevel === 'critical' ? 'var(--neon-red)' : 
            summary.alertLevel === 'success' ? 'var(--neon-green)' : 'var(--neon-gold)'
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
            card.style.boxShadow = "0 0 15px rgba(255, 193, 7, 0.2)";
        }

        let action = "Update";
        if (evt.envelope === "QK") action = "Request (Input)";
        if (evt.envelope === "QP") action = "Response (Output)";
        
        let sourceName = "System";
        if (evt.context.airline) sourceName = translateAirline(evt.context.airline);
        if (evt.context.office) sourceName += ` (${translateCity(evt.context.office)})`;

        let contextHtml = "";
        if (evt.context.recordLocator) {
            contextHtml = `<div class="card-context">
                <div class="context-row">
                    <span class="ctx-label">Active Record (PNR):</span> 
                    <span class="ctx-val pnr">${evt.context.recordLocator}</span>
                </div>`;
            if (evt.context.airline) {
                contextHtml += `<div class="context-row">
                    <span class="ctx-label">Context:</span> 
                    <span class="ctx-val">${translateAirline(evt.context.airline)} (${evt.context.airline})</span>
                </div>`;
            }
            contextHtml += `</div>`;
        }
        
        // Add change explanation section
        let changesHtml = "";
        if (hasChanges) {
            changesHtml = `<div class="changes-section" style="margin-top:15px; padding:15px; background:rgba(255,193,7,0.1); border-radius:8px; border-left:3px solid var(--neon-gold);">
                <div style="font-weight:700; color:var(--neon-gold); margin-bottom:10px; font-size:13px; text-transform:uppercase; letter-spacing:0.5px;">
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
                
                changesHtml += `<div style="margin-bottom:8px; padding:8px; background:rgba(0,0,0,0.3); border-radius:4px; font-size:13px; line-height:1.5;">
                    <span style="margin-right:6px;">${changeIcon}</span>
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
                html += `<div class="pax-item">👤 ${p.surname}/${p.given} ${p.title}</div>`;
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
                    <div class="segment-row" style="border-color:${st.class === 'status-hk' ? 'var(--neon-green)' : 'var(--neon-red)'}">
                        <div class="seg-code" title="${carrier}">${seg.carrier}${seg.flight}</div>
                        <div class="seg-route">${from} ➝ ${to} <span style="opacity:0.5; margin-left:5px">${seg.date}</span></div>
                        <div class="seg-status ${st.class}">${st.icon} ${st.label}</div>
                    </div>
                `;
            });
            html += `</div>`;
        }

        if (evt.messages.length > 0) {
            html += `<div class="alerts-container">`;
            evt.messages.forEach(msg => {
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
