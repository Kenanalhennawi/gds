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

  if (parsed.pax) add("Passenger", `${esc(parsed.pax.surname)}/${esc(parsed.pax.given)} ${esc(parsed.pax.title)}`);

  if (parsed.segments?.length) {
    const seg = parsed.segments
      .map((s) => {
        const mkt = s.marketing ? `${s.marketing.carrier}${s.marketing.flight}${s.marketing.bookingClass}` : "";
        const op = s.operating ? `/${s.operating.carrier}${s.operating.flight}${s.operating.bookingClass}` : "";
        const times = s.depTime && s.arrTime ? ` ${s.depTime}-${s.arrTime}${s.dayOffset ? `(+${s.dayOffset})` : ""}` : "";
        const token = `${mkt}${op}${s.date} ${s.from}${s.to} ${s.status}${times}`;
        return wrapToken(token);
      })
      .join("<br>");
    add("Segments", seg);
  }

  if (parsed.seatAvailability) {
    const sa = parsed.seatAvailability;
    const head = [
      sa.reason ? `<div><b>Reason:</b> ${esc(sa.reason)}</div>` : "",
      sa.time ? `<div><b>Message time:</b> ${esc(sa.time)}</div>` : "",
      sa.confirmation ? `<div><b>Confirmation #:</b> ${wrapToken(sa.confirmation)}</div>` : "",
      sa.systemCode ? `<div><b>System:</b> ${wrapToken(sa.systemCode)}</div>` : "",
      sa.recordLocator ? `<div><b>Record locator:</b> ${wrapToken(sa.recordLocator)}</div>` : "",
    ]
      .filter(Boolean)
      .join("");

    const flights = (sa.flights || [])
      .map((f) => {
        const k = `${f.carrier}${f.flightNumber || ""} ${f.origin}-${f.destination} ${f.flightDate} ${f.fareClass}`;
        const v = `Avail ${f.seatsAvailable} / Req ${f.seatsRequested}${f.currencyCode ? ` (${f.currencyCode})` : ""}`;
        return `<div style="margin-top:6px">${wrapToken(k)}<div class="small muted">${esc(v)}${
          f.fareBasisCode ? ` • ${esc(f.fareBasisCode)}` : ""
        }</div></div>`;
      })
      .join("");

    add("Seat availability", `<div>${head}${flights}</div>`);
  }

  if (parsed.ssr?.length) add("SSR types", parsed.ssr.map((s) => wrapToken(s)).join(" "));
  if (parsed.osi?.length) add("OSI", parsed.osi.map((s) => wrapToken(s)).join("<br>"));
  if (parsed.edifact?.segments?.length)
    add("EDIFACT segments", parsed.edifact.segments.map((s) => wrapToken(s)).join(" "));
  if (parsed.edifact?.messageTypes?.length)
    add("EDIFACT message types", parsed.edifact.messageTypes.map((s) => wrapToken(s)).join(" "));
  if (parsed.edifact?.ticketNumbers?.length)
    add("Ticket numbers", parsed.edifact.ticketNumbers.map((s) => wrapToken(s)).join(" "));
  if (parsed.fare?.length) add("Fare tokens", parsed.fare.map((s) => wrapToken(s)).join(" "));

  if (parsed.queueLogic?.length) {
    const ql = parsed.queueLogic.map((x) => `<div>${wrapToken(x.code)} ${esc(x.meaning)}</div>`).join("");
    add("Queue logic", ql);
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
