import { cleanSpaces, safeStr, upper } from "./utils.js";

function el(tag, attrs = {}, children = []) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (k === "class") n.className = v;
    else if (k === "text") n.textContent = v;
    else if (k === "html") n.innerHTML = v;
    else n.setAttribute(k, v);
  }
  for (const c of children || []) {
    if (c === null || c === undefined) continue;
    if (typeof c === "string") n.appendChild(document.createTextNode(c));
    else n.appendChild(c);
  }
  return n;
}

function pill(text) {
  return el("span", { class: "pill", text: text });
}

function badge(text, kind) {
  return el("span", { class: `badge badge--${kind}`, text });
}

function keyRow(k, v) {
  return el("div", { class: "row" }, [
    el("div", { class: "row__left" }, [el("span", { class: "tag", text: k })]),
    el("div", { class: "small", text: safeStr(v) || "-" }),
  ]);
}

function segStatusKind(code) {
  const c = upper(code || "");
  if (c.startsWith("HK")) return "ok";
  if (c.startsWith("SS") || c.startsWith("DK") || c.startsWith("CS") || c.startsWith("CH")) return "warn";
  if (c.startsWith("UC") || c.startsWith("UN") || c.startsWith("XX") || c.startsWith("HX")) return "bad";
  if (c.startsWith("TK") || c.startsWith("LK")) return "warn";
  return "warn";
}

function renderSegments(segments) {
  if (!segments || !segments.length) return el("div", { class: "small", text: "No segments detected." });
  const table = el("table", { class: "table" });
  const thead = el("thead");
  thead.appendChild(el("tr", {}, [
    el("th", { text: "Route" }),
    el("th", { text: "Date" }),
    el("th", { text: "Flight" }),
    el("th", { text: "Class" }),
    el("th", { text: "Status" }),
    el("th", { text: "Qty" }),
    el("th", { text: "Times" }),
  ]));
  table.appendChild(thead);

  const tbody = el("tbody");
  for (const s of segments) {
    const route = `${safeStr(s.from)}→${safeStr(s.to)}`;
    const date = safeStr(s.date) || "-";

    let flight = "-";
    let cls = "-";
    if (s.kind === "codeshare") {
      flight = `${safeStr(s.marketingCarrier)}${safeStr(s.marketingFlight)}/${safeStr(s.operatingCarrier)}${safeStr(s.operatingFlight)}`;
      cls = `${safeStr(s.marketingClass)}/${safeStr(s.operatingClass)}`;
    } else {
      flight = `${safeStr(s.carrier)}${safeStr(s.flight)}`;
      cls = safeStr(s.cls);
    }

    const st = `${safeStr(s.status)}${safeStr(s.qty)}`;
    const stKind = segStatusKind(st);
    const times = s.times ? `${safeStr(s.times.dep)}-${safeStr(s.times.arr)}${s.dayOffset ? `+${s.dayOffset}` : ""}` : (safeStr(s.tail) || "");

    tbody.appendChild(el("tr", {}, [
      el("td", { text: route }),
      el("td", { text: date }),
      el("td", { text: flight }),
      el("td", { text: cls }),
      el("td", {}, [badge(st, stKind)]),
      el("td", { text: String(s.qty || "") }),
      el("td", { text: times || "-" }),
    ]));
  }
  table.appendChild(tbody);
  return table;
}

function renderSSRs(ssrs) {
  if (!ssrs || !ssrs.length) return el("div", { class: "small", text: "No SSRs detected." });
  const list = el("div", { class: "list" });
  for (const s of ssrs) {
    list.appendChild(el("div", { class: "row" }, [
      el("div", { class: "row__left" }, [
        el("span", { class: "tag", text: `SSR ${safeStr(s.type)}` }),
        s.carrier ? el("span", { class: "tag", text: safeStr(s.carrier) }) : null,
      ]),
      el("div", { class: "small", text: safeStr(s.raw) }),
    ]));
  }
  return list;
}

function renderOSIs(osis) {
  if (!osis || !osis.length) return el("div", { class: "small", text: "No OSIs detected." });
  const list = el("div", { class: "list" });
  for (const o of osis) {
    list.appendChild(el("div", { class: "row" }, [
      el("div", { class: "row__left" }, [
        el("span", { class: "tag", text: "OSI" }),
        o.carrier ? el("span", { class: "tag", text: safeStr(o.carrier) }) : null,
      ]),
      el("div", { class: "small", text: safeStr(o.raw) }),
    ]));
  }
  return list;
}

function renderMessageInfos(msgInfos) {
  if (!msgInfos || !msgInfos.length) return el("div", { class: "small", text: "No diagnostic blocks detected." });

  const wrap = el("div", { class: "list" });

  for (const mi of msgInfos) {
    const head = el("div", { class: "card" }, [
      el("div", { class: "card__title", text: "MESSAGE INFORMATION" }),
      el("div", { class: "tags" }, [
        mi.reason ? el("span", { class: "tag", text: mi.reason }) : null,
        mi.systemCode ? el("span", { class: "tag", text: `SYS ${mi.systemCode}` }) : null,
        mi.recordLocator ? el("span", { class: "tag", text: `RLOC ${mi.recordLocator}` }) : null,
        mi.confirmation ? el("span", { class: "tag", text: `CNF ${mi.confirmation}` }) : null,
      ].filter(Boolean)),
      el("div", { class: "kv" }, [
        el("div", { html: `<b>Time:</b> ${safeStr(mi.time || "-")}` }),
      ]),
    ]);

    wrap.appendChild(head);

    if (mi.flights && mi.flights.length) {
      const table = el("table", { class: "table" });
      const thead = el("thead");
      thead.appendChild(el("tr", {}, [
        el("th", { text: "Flight" }),
        el("th", { text: "Route" }),
        el("th", { text: "Date" }),
        el("th", { text: "Class" }),
        el("th", { text: "Seats" }),
        el("th", { text: "Fare" }),
        el("th", { text: "Basis" }),
      ]));
      table.appendChild(thead);

      const tbody = el("tbody");
      for (const f of mi.flights) {
        const flt = `${safeStr(f.carrier || "")}${safeStr(f.flightNumber || "")}`.trim() || "-";
        const route = `${safeStr(f.origin || "-")}→${safeStr(f.destination || "-")}`;
        const seats = `${safeStr(f.seatsAvailable ?? "-")}/${safeStr(f.seatsRequested ?? "-")}`;
        const fare = `${safeStr(f.fareAmount ?? "-")} ${safeStr(f.currency ?? "")}`.trim();
        tbody.appendChild(el("tr", {}, [
          el("td", { text: flt }),
          el("td", { text: route }),
          el("td", { text: safeStr(f.flightDate || "-") }),
          el("td", { text: safeStr(f.fareClass || "-") }),
          el("td", { text: seats }),
          el("td", { text: fare || "-" }),
          el("td", { text: safeStr(f.fareBasis || "-") }),
        ]));
      }
      table.appendChild(tbody);
      wrap.appendChild(table);
    }

    if (mi.raw && mi.raw.length) {
      wrap.appendChild(el("div", { class: "card" }, [
        el("div", { class: "card__title", text: "Raw Diagnostic Text" }),
        el("div", { class: "pre", text: mi.raw.join("\n") }),
      ]));
    }
  }

  return wrap;
}

export function renderParsed(parsed) {
  const root = el("div", { class: "list" });
  const messages = parsed.messages || [];

  if (!messages.length) {
    root.appendChild(el("div", { class: "small", text: "No messages detected. Paste logs and click Parse." }));
    return root;
  }

  for (const m of messages) {
    const titleParts = [];
    if (m.envelope) titleParts.push(pill(m.envelope));
    if (m.family) titleParts.push(pill(m.family));
    if (m.record) titleParts.push(pill(m.record));
    if (m.markers && m.markers.length) for (const x of m.markers) titleParts.push(pill(x));

    const metaParts = [];
    if (m.recordExtra) metaParts.push(`Ref: ${m.recordExtra}`);
    const hdqMain = (m.hdq || []).find((x) => upper(x.key).startsWith("HDQF"));
    if (hdqMain) metaParts.push(`Ctx: ${hdqMain.value}`);

    const msgEl = el("div", { class: "msg" }, [
      el("div", { class: "msg__head" }, [
        el("div", { class: "msg__title" }, titleParts.length ? titleParts : [pill("MSG")]),
        el("div", { class: "msg__meta", text: metaParts.join(" · ") }),
      ]),
      el("div", { class: "msg__body" }, [
        el("div", { class: "grid" }, [
          el("div", {
