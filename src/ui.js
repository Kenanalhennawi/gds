import { esc, wrapToken } from "./utils.js";
import { translateStatus, translateSSR, translateAirline, translateCity } from "./translator.js";

export const ensureVisible = (el, container) => {
  if (!el || !container) return;
  const r = el.getBoundingClientRect();
  const c = container.getBoundingClientRect();
  if (r.top < c.top) container.scrollTop -= c.top - r.top + 12;
  else if (r.bottom > c.bottom) container.scrollTop += r.bottom - c.bottom + 12;
};

export const renderDetect = ({ detectChips, detectEmpty, q, search }, tokens) => {
  detectChips.innerHTML = "";
  if (!tokens.length) {
    detectEmpty.style.display = "block";
    return;
  }
  detectEmpty.style.display = "none";
  tokens.forEach((t) => {
    const b = document.createElement("button");
    b.className = "detect-chip";
    b.type = "button";
    b.textContent = t;
    b.onclick = () => {
      q.value = t;
      search(true);
      q.focus();
      q.select();
    };
    detectChips.appendChild(b);
  });
};

export const renderExplain = ({ explainBody, explainEmpty }, parsed) => {
  explainBody.innerHTML = "";
  if (!parsed || parsed.kind !== "GDS_HISTORY") {
    explainEmpty.style.display = "block";
    return;
  }
  explainEmpty.style.display = "none";

  // --- PART 1: OVERVIEW CARD ---
  const grid = document.createElement("div");
  grid.className = "explain-grid";

  const addRow = (k, v) => {
    if (!v || v === "—") return;
    const kk = document.createElement("div");
    kk.className = "explain-k";
    kk.textContent = k;
    const vv = document.createElement("div");
    vv.className = "explain-v";
    vv.innerHTML = v;
    grid.appendChild(kk);
    grid.appendChild(vv);
  };

  const airlineName = parsed.airlineContext ? translateAirline(parsed.airlineContext) : null;
  const officeName = parsed.office ? translateCity(parsed.office.substring(0,3)) : null;

  addRow("Airline", airlineName ? `<b>${airlineName}</b> (${parsed.airlineContext})` : "—");
  addRow("Location", officeName ? `${officeName} (${parsed.office})` : (parsed.office || "—"));
  addRow("Record Ref", parsed.recordLocator ? wrapToken(parsed.recordLocator) : "—");
  
  explainBody.appendChild(grid);

  // --- PART 2: SEPARATOR ---
  const hr = document.createElement("hr");
  hr.style.margin = "16px 0";
  hr.style.border = "none";
  hr.style.borderTop = "1px solid var(--stroke)";
  explainBody.appendChild(hr);

  const timelineTitle = document.createElement("div");
  timelineTitle.className = "explain-title";
  timelineTitle.textContent = "History of Events";
  timelineTitle.style.marginBottom = "10px";
  explainBody.appendChild(timelineTitle);


  // --- PART 3: HUMAN TIMELINE ---
  const container = document.createElement("div");
  container.className = "timeline";

  const blocks = parsed.blocks || [];

  blocks.forEach((block) => {
    const eventDiv = document.createElement("div");
    eventDiv.className = "timeline-event";

    const header = document.createElement("div");
    header.className = "event-header";
    
    // Determine WHO did it (Source)
    let who = "System";
    let detail = "";

    if (block.office) {
        who = "Agent";
        detail = translateCity(block.office.substring(0,3));
    } else if (block.airlineContext) {
        who = translateAirline(block.airlineContext);
        detail = "System";
    }

    // Determine WHAT they did (Action)
    let what = "Update";
    if (block.envelope === "QK") what = "Request";
    if (block.envelope === "QP") what = "Response";
    if (block.action === "TRL") what = "Transaction Log";
    if (block.action === "AKA") what = "Acknowledged";
    if (block.action === "DVD") what = "Split PNR";
    
    header.innerHTML = `
      <div class="event-meta">
        <span class="event-source">${esc(who)} ${esc(detail)}</span>
        <span class="event-action">${esc(what)}</span>
      </div>
    `;
    eventDiv.appendChild(header);

    // --- FIX: Explicitly explain the PNR/Context line here ---
    if (block.recordLocator || block.airlineContext) {
       const ctxDiv = document.createElement("div");
       ctxDiv.style.background = "rgba(255, 255, 255, 0.05)";
       ctxDiv.style.padding = "8px";
       ctxDiv.style.borderRadius = "6px";
       ctxDiv.style.fontSize = "12px";
       ctxDiv.style.marginBottom = "8px";
       
       let ctxHtml = "";
       if (block.recordLocator) {
         ctxHtml += `<div><strong>Active Record (PNR):</strong> <span style="color:var(--accent); font-weight:bold">${esc(block.recordLocator)}</span></div>`;
       }
       if (block.airlineContext) {
         const air = translateAirline(block.airlineContext);
         ctxHtml += `<div><strong>Airline Context:</strong> ${esc(air)} (${esc(block.airlineContext)})</div>`;
       }
       if (block.office) {
         const city = translateCity(block.office.substring(0,3));
         ctxHtml += `<div><strong>Origin Office:</strong> ${esc(city)} (${esc(block.office)})</div>`;
       }
       ctxDiv.innerHTML = ctxHtml;
       eventDiv.appendChild(ctxDiv);
    }

    if (block.pax) {
        const paxDiv = document.createElement("div");
        paxDiv.className = "event-pax";
        paxDiv.textContent = `👤 Passenger: ${block.pax.surname} / ${block.pax.given}`;
        eventDiv.appendChild(paxDiv);
    }

    if (block.segments && block.segments.length > 0) {
      const segList = document.createElement("div");
      segList.className = "segment-list";
      
      block.segments.forEach(seg => {
        const trans = translateStatus(seg.status);
        const carrierName = translateAirline(seg.carrier);
        const depCity = translateCity(seg.from);
        const arrCity = translateCity(seg.to);

        const item = document.createElement("div");
        item.className = "segment-item";
        item.style.borderLeftColor = trans.color;

        item.innerHTML = `
          <div class="seg-main">
            <span class="seg-code" title="${carrierName}">${esc(seg.carrier)}${esc(seg.flight)}</span>
            <span class="seg-route">${esc(depCity)} ➔ ${esc(arrCity)}</span>
            <span class="seg-date">${esc(seg.date)}</span>
          </div>
          <div class="seg-status" style="color: ${trans.color}">
            <span class="status-icon">${trans.icon}</span>
            <span>${trans.label}</span>
          </div>
        `;
        segList.appendChild(item);
      });
      eventDiv.appendChild(segList);
    }

    const alerts = [];
    const rawLines = [...(block.ssr || []), ...(block.osi || [])];
    
    rawLines.forEach(line => {
      const text = line.text || line.raw || "";
      const human = translateSSR(text);
      if (human) {
        alerts.push(`
          <div class="alert alert-${human.type}">
            <div class="alert-title">${esc(human.title)}</div>
            <div class="alert-msg">${esc(human.msg)}</div>
          </div>
        `);
      }
    });

    if (alerts.length > 0) {
      const alertBox = document.createElement("div");
      alertBox.className = "event-alerts";
      alertBox.innerHTML = alerts.join("");
      eventDiv.appendChild(alertBox);
    }

    container.appendChild(eventDiv);
  });

  explainBody.appendChild(container);
};

export const renderResults = ({ results, stats, activeId, onSelect }, list) => {
  results.innerHTML = "";
  stats.textContent = `${list.length} results`;
  list.forEach((m, i) => {
    const d = document.createElement("div");
    d.className = "result" + (m.id === activeId ? " is-active" : "");
    d.setAttribute("role", "listitem");
    d.setAttribute("tabindex", "-1");
    d.dataset.index = String(i);
    d.innerHTML = `<div class="code">${esc(m.code)} (${esc(m.standard)})</div><div>${esc(m.title || "")}</div>`;
    d.onclick = () => onSelect(i);
    results.appendChild(d);
  });
};

export const renderDetails = ({ details }, m) => {
  details.innerHTML = `
    <div class="big-code">${esc(m.code || "")}</div>
    <div class="muted">${esc(m.standard || "")}</div>
    <div class="kv">
      <div>Title</div><div>${esc(m.title || "")}</div>
      <div>Meaning</div><div>${esc(m.meaning || "")}</div>
      <div>Trigger</div><div>${esc(m.trigger || "")}</div>
      <div>Direction</div><div>${esc(m.direction || "")}</div>
      <div>Category</div><div>${esc(m.category || "")}</div>
      <div>Source</div><div>${esc(m.source || "")}</div>
    </div>
  `;
};
