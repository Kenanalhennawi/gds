import { translateAirline, translateCity, translateStatus } from "./translator.js";

export const renderTimeline = (container, events) => {
    container.innerHTML = "";
    
    if (events.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">nodata</div>
                <h3>No Data Detected</h3>
                <p>Paste a valid history log to begin analysis.</p>
            </div>`;
        return;
    }

    events.forEach(evt => {
        const card = document.createElement("div");
        card.className = "timeline-card";

        let action = "Update";
        if (evt.envelope === "QK") action = "Request (Input)";
        if (evt.envelope === "QP") action = "Response (Output)";
        
        let sourceName = "System";
        if (evt.context.airline) sourceName = translateAirline(evt.context.airline);
        if (evt.context.office) sourceName += ` (${translateCity(evt.context.office)})`;

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
                    ${evt.context.recordLocator ? `<span class="context-pill">PNR: ${evt.context.recordLocator}</span>` : ''}
                    <span class="context-pill">${evt.envelope || 'LOG'}</span>
                </div>
            </div>
        `;

        if (evt.pax) {
            html += `<div style="padding:0 15px 10px; font-size:12px; color:#fff; font-weight:700;">👤 ${evt.pax}</div>`;
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

        card.innerHTML = html;
        container.appendChild(card);
    });
};
