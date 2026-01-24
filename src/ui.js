import { esc, wrapToken } from "./utils.js";

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
  if (
    !parsed ||
    (!parsed.kind &&
      !parsed.header &&
      !parsed?.edifact?.segments?.length &&
      !parsed?.segments?.length &&
      !parsed?.ssr?.length)
  ) {
    explainEmpty.style.display = "block";
    return;
  }
  explainEmpty.style.display = "none";

  if (parsed.sentences && Array.isArray(parsed.sentences) && parsed.sentences.length) {
    const box = document.createElement("div");
    box.className = "explain-sentences";
    parsed.sentences.slice(0, 12).forEach((s) => {
      const row = document.createElement("div");
      row.className = "explain-sentence";
      row.innerHTML = esc(String(s));
      box.appendChild(row);
    });
    explainBody.appendChild(box);
  }

  const rows = [];
  const add = (k, v) => {
    if (v === null || v === undefined) return;
    if (Array.isArray(v) && v.length === 0) return;
    if (typeof v === "string" && !v.trim()) return;
    rows.push([k, v]);
  };

  add("Detected type", parsed.kind || "—");
  add("Header", parsed.header ? wrapToken(parsed.header) : "—");
  add("Airline context", parsed.airlineContext ? wrapToken(parsed.airlineContext) : "—");
  add("Office / sign-in", parsed.office || "—");
  add("Record reference", parsed.recordRef ? wrapToken(parsed.recordRef) : "—");
  if (parsed.envelopes?.length) add("Envelopes", parsed.envelopes.map((x) => wrapToken(x)).join(" "));
  if (parsed.actions?.length) add("Action codes", parsed.actions.map((x) => wrapToken(x)).join(" "));
  if (parsed.statuses?.length) add("Segment statuses", parsed.statuses.map((x) => wrapToken(x)).join(" "));
  if (parsed.ticketNumbers?.length) add("Ticket numbers", parsed.ticketNumbers.map((s) => wrapToken(s)).join(" "));

  if (parsed.pax) add("Passenger", `${esc(parsed.pax.surname)}/${esc(parsed.pax.given)} ${esc(parsed.pax.title)}`);

  if (parsed.segments?.length) {
    const seg = parsed.segments
      .map((s) => {
        const mkt = `${s.carrier}${s.flight}${s.bookingClass}${s.date}`;
        const op = s.operatingCarrier ? `${s.operatingCarrier}${s.operatingFlight}${s.operatingClass}` : "";
        const loc = `${s.from}${s.to}`;
        const st = s.status || "";
        const pax = s.paxCount ? `/${s.paxCount}` : "";
        const t = s.depTime || s.arrTime ? ` ${s.depTime || ""}→${s.arrTime || ""}${s.dayOffset ? `(+${s.dayOffset})` : ""}` : "";
        const cs = op ? ` (${op})` : "";
        return `${wrapToken(mkt)} ${wrapToken(loc)} ${wrapToken(st + pax)}${cs ? ` ${wrapToken(cs.trim())}` : ""}${t ? ` ${wrapToken(t.trim())}` : ""}`;
      })
      .join("<br>");
    add("Segments", seg);
  }

  if (parsed.ssr?.length) add("SSR types", parsed.ssr.map((s) => wrapToken(s)).join(" "));
  if (parsed.ssrLines?.length)
    add(
      "SSR lines",
      parsed.ssrLines
        .slice(0, 40)
        .map((s) => wrapToken(s))
        .join("<br>") + (parsed.ssrLines.length > 40 ? "<br>..." : "")
    );
  if (parsed.osi?.length) add("OSI", parsed.osi.map((s) => wrapToken(s)).join("<br>"));
  if (parsed.ticketNumbers?.length) add("Ticket numbers", parsed.ticketNumbers.map((s) => wrapToken(s)).join(" "));
  if (parsed.statusTokens?.length) add("Status tokens", parsed.statusTokens.map((s) => wrapToken(s)).join(" "));
  if (parsed.edifact?.segments?.length) add("EDIFACT segments", parsed.edifact.segments.map((s) => wrapToken(s)).join(" "));
  if (parsed.edifact?.messageTypes?.length) add("EDIFACT message types", parsed.edifact.messageTypes.map((s) => wrapToken(s)).join(" "));
  if (parsed.edifact?.ticketNumbers?.length) add("Ticket numbers", parsed.edifact.ticketNumbers.map((s) => wrapToken(s)).join(" "));
  if (parsed.fare?.length) add("Fare tokens", parsed.fare.map((s) => wrapToken(s)).join(" "));

  if (parsed.queueLogic?.length) {
    const ql = parsed.queueLogic.map((x) => `<div>${wrapToken(x.code)} ${esc(x.meaning)}</div>`).join("");
    add("Queue logic", ql);
  }

  if (parsed.diagnostics?.seatsNotAvailable) {
    const d = parsed.diagnostics.seatsNotAvailable;
    const lines = [];
    if (d.reason) lines.push(`<div><b>Reason</b> ${esc(d.reason)}</div>`);
    if (d.time) lines.push(`<div><b>Time</b> ${esc(d.time)}</div>`);
    if (d.confirmation) lines.push(`<div><b>Confirmation</b> ${esc(d.confirmation)}</div>`);
    if (d.systemCode) lines.push(`<div><b>System</b> ${esc(d.systemCode)}</div>`);
    if (d.recordLocator) lines.push(`<div><b>Record Locator</b> ${esc(d.recordLocator)}</div>`);
    if (d.flights?.length) {
      const f = d.flights
        .map((x) => {
          const base = `${x.carrier || ""}${x.flightNumber || ""} ${x.origin || ""}-${x.destination || ""} ${x.flightDate || ""} ${x.fareClass || ""}`.trim();
          const seats = x.seatsAvailable !== undefined && x.seatsRequested !== undefined ? `Seats ${x.seatsAvailable}/${x.seatsRequested}` : "";
          const amt = x.fareAmount ? `${x.fareAmount} ${x.currencyCode || ""}`.trim() : "";
          return `<div>${wrapToken(base)} ${esc(seats)} ${esc(amt)}</div>`;
        })
        .join("");
      lines.push(`<div style="margin-top:8px"><b>Flights</b>${f}</div>`);
    }
    add("Diagnostics", lines.join(""));
  }

  const grid = document.createElement("div");
  grid.className = "explain-grid";
  rows.forEach(([k, v]) => {
    const kk = document.createElement("div");
    kk.className = "explain-k";
    kk.textContent = k;
    const vv = document.createElement("div");
    vv.className = "explain-v";
    vv.innerHTML = typeof v === "string" ? v : esc(JSON.stringify(v));
    grid.appendChild(kk);
    grid.appendChild(vv);
  });
  explainBody.appendChild(grid);
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
