export const TOKEN_GROUPS = [
  {
    id: "envelopes",
    title: "Envelope / Transport",
    items: [
      { key: "QP", label: "QP", desc: "Passenger Name Record update/response wrapper" },
      { key: "QK", label: "QK", desc: "Passenger Name Record update/response wrapper" },
      { key: "QD", label: "QD", desc: "Passenger Name Record update/response wrapper" },
      { key: "HDQRM", label: "HDQRM*", desc: "Host/queue PNR message label" }
    ],
    patterns: [/\bQP\b/, /\bQK\b/, /\bQD\b/, /\bHDQRM[A-Z0-9]{0,6}\b/]
  },
  {
    id: "pnr_core",
    title: "PNR Core",
    items: [
      { key: "PNR", label: "PNR", desc: "Passenger Name Record" },
      { key: "PNL", label: "PNL", desc: "Passenger Name List" }
    ],
    patterns: [/\bPNR\b/, /\bPNL\b/]
  },
  {
    id: "queue",
    title: "Queue",
    items: [
      { key: "QG", label: "QG", desc: "Queue Get" },
      { key: "QF", label: "QF", desc: "Queue Finish" },
      { key: "QET", label: "QET", desc: "Queue Entry" },
      { key: "QRT", label: "QRT", desc: "Queue Remove" },
      { key: "QCH", label: "QCH", desc: "Queue Change" },
      { key: "QAD", label: "QAD", desc: "Queue Add" },
      { key: "HDQ", label: "HDQ", desc: "Queue Handling history prefix" },
      { key: "HDQR", label: "HDQR", desc: "Queue Request history prefix" },
      { key: "HDQRO", label: "HDQRO", desc: "Queue Remove history entry" }
    ],
    patterns: [/\bQG\b/, /\bQF\b/, /\bQET\b/, /\bQRT\b/, /\bQCH\b/, /\bQAD\b/, /\bHDQ\b/, /\bHDQR\b/, /\bHDQRO[A-Z0-9]{0,6}\b/]
  },
  {
    id: "ticketing",
    title: "Ticketing",
    items: [
      { key: "TKTL", label: "TKTL", desc: "Ticketing time limit" },
      { key: "ET", label: "ET", desc: "Electronic ticket indicator" },
      { key: "EXCH", label: "EXCH", desc: "Exchange / reissue workflow" },
      { key: "RFND", label: "RFND", desc: "Refund workflow" },
      { key: "FOP", label: "FOP", desc: "Form of payment" }
    ],
    patterns: [/\bTKTL\b/, /\bET\b/, /\bEXCH\b/, /\bRFND\b/, /\bFOP\b/]
  },
  {
    id: "irrops",
    title: "Schedule & IRROPS",
    items: [
      { key: "SK", label: "SK", desc: "Schedule change" },
      { key: "SC", label: "SC", desc: "Detailed schedule change" },
      { key: "TK", label: "TK", desc: "Time change" },
      { key: "IRR", label: "IRR", desc: "Irregular operations" },
      { key: "MIS", label: "MIS", desc: "Misconnection" },
      { key: "CNL", label: "CNL", desc: "Cancellation" }
    ],
    patterns: [/\bSK\b/, /\bSC\b/, /\bTK\b/, /\bIRR\b/, /\bMIS\b/, /\bCNL\b/]
  },
  {
    id: "segment_status",
    title: "Segment Status",
    items: [
      { key: "HK", label: "HK", desc: "Confirmed" },
      { key: "HL", label: "HL", desc: "Waitlisted" },
      { key: "HN", label: "HN", desc: "Need confirmation" },
      { key: "LK", label: "LK", desc: "Pending from waitlist" },
      { key: "UC", label: "UC", desc: "Unable to confirm" },
      { key: "UN", label: "UN", desc: "Cancelled" },
      { key: "NO", label: "NO", desc: "No action" },
      { key: "RR", label: "RR", desc: "Reconfirmed" }
    ],
    patterns: [/\bHK\d?\b/, /\bHL\d?\b/, /\bHN\d?\b/, /\bLK\d?\b/, /\bUC\d?\b/, /\bUN\d?\b/, /\bNO\d?\b/, /\bRR\d?\b/]
  },
  {
    id: "actions",
    title: "Action Codes",
    items: [
      { key: "SS", label: "SS", desc: "Sell segment" },
      { key: "XX", label: "XX", desc: "Cancel segment" }
    ],
    patterns: [/\bSS\d?\b/, /\bXX\d?\b/]
  },
  {
    id: "osi_ssr",
    title: "OSI / SSR",
    items: [
      { key: "OSI", label: "OSI", desc: "Other Service Information" },
      { key: "SSR", label: "SSR", desc: "Special Service Request" },
      { key: "CTCE", label: "CTCE", desc: "Email contact (SSR)" },
      { key: "CTCM", label: "CTCM", desc: "Mobile contact (SSR)" },
      { key: "DOCS", label: "DOCS", desc: "Travel document (SSR)" },
      { key: "DOCO", label: "DOCO", desc: "Other document (SSR)" },
      { key: "DOCA", label: "DOCA", desc: "Address (SSR)" }
    ],
    patterns: [/\bOSI\b/, /\bSSR\b/, /\bCTCE\b/, /\bCTCM\b/, /\bDOCS\b/, /\bDOCO\b/, /\bDOCA\b/]
  },
  {
    id: "edifact",
    title: "EDIFACT",
    items: [
      { key: "UNB", label: "UNB", desc: "Interchange header" },
      { key: "UNH", label: "UNH", desc: "Message header" },
      { key: "MSG", label: "MSG", desc: "Message function/reason" },
      { key: "ORG", label: "ORG", desc: "Originator details" },
      { key: "TKT", label: "TKT", desc: "Ticket reference segment" },
      { key: "UNT", label: "UNT", desc: "Message trailer" },
      { key: "UNZ", label: "UNZ", desc: "Interchange trailer" }
    ],
    patterns: [/\bUNB\b/, /\bUNH\b/, /\bMSG\b/, /\bORG\b/, /\bTKT\b/, /\bUNT\b/, /\bUNZ\b/]
  },
  {
    id: "fare",
    title: "Fare Construction",
    items: [
      { key: "NUC", label: "NUC", desc: "Neutral Unit of Construction" },
      { key: "END", label: "END", desc: "End of fare construction" },
      { key: "ROE", label: "ROE", desc: "Rate of exchange" },
      { key: "XT", label: "XT", desc: "Additional taxes indicator" },
      { key: "X", label: "X", desc: "Transfer indicator" }
    ],
    patterns: [/\bNUC\b/, /\bEND\b/, /\bROE\b/, /\bXT\b/, /\bX\b/]
  }
];

export const tokenizeText = (input) => {
  const text = String(input || "");
  const out = [];
  const seen = new Set();
  const push = (token, groupId) => {
    const t = String(token || "").trim();
    if (!t) return;
    const k = `${groupId}::${t.toUpperCase()}`;
    if (seen.has(k)) return;
    seen.add(k);
    out.push({ token: t, groupId });
  };
  for (const g of TOKEN_GROUPS) {
    for (const rx of g.patterns || []) {
      const m = text.match(rx);
      if (!m) continue;
      if (Array.isArray(m)) {
        for (const v of m) push(v, g.id);
      } else {
        push(m, g.id);
      }
    }
  }
  return out;
};

export const explainTokenGroups = (tokens) => {
  const byGroup = new Map();
  for (const t of tokens || []) {
    if (!byGroup.has(t.groupId)) byGroup.set(t.groupId, []);
    byGroup.get(t.groupId).push(t.token);
  }
  const lines = [];
  for (const g of TOKEN_GROUPS) {
    const arr = byGroup.get(g.id);
    if (!arr || !arr.length) continue;
    const uniq = Array.from(new Set(arr.map((x) => String(x).toUpperCase())));
    lines.push({ groupId: g.id, title: g.title, tokens: uniq });
  }
  return lines;
};

export const detectTokens = (text) => {
  const seen = new Set();
  const out = [];
  const push = (t) => {
    if (!t) return;
    const k = t.trim().toUpperCase().replace(/\s+/g, " ");
    if (!k) return;
    if (seen.has(k)) return;
    seen.add(k);
    out.push(k);
  };

  const s = String(text || "").replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim();

  const headerMatch = s.match(/\bHDQ[A-Z0-9]{2,10}\b/);
  if (headerMatch) push(headerMatch[0]);

  const env = s.match(/\bQ[P|K|D]\b/g);
  if (env) env.forEach(push);

  const msg3 = s.match(/\b(TRL|AKA|AKX|NAR|ASC|NCO|DVD|TRL)\b/g);
  if (msg3) msg3.forEach(push);

  const ssr = s.match(/\bSSR\s+([A-Z0-9]{3,4})\b/g);
  if (ssr) ssr.forEach((x) => push(x.replace(/\s+/g, " ").toUpperCase()));

  const osi = s.match(/\bOSI\s+([A-Z0-9]{2})\b/g);
  if (osi) osi.forEach((x) => push(x.replace(/\s+/g, " ").toUpperCase()));

  const status = s.match(/\b(HK|HL|HN|LK|UC|UN|NO|RR|TK|SS|XX|DK|CS|CH|DP|HX)\d?\b/g);
  if (status) status.forEach((x) => push(x.toUpperCase()));

  const airline = s.match(/\b[A-Z0-9]{2}\b/g);
  if (airline) airline.forEach((x) => {
    if (x === "QP" || x === "QK" || x === "QD") return;
    if (x === "HK" || x === "SS" || x === "XX" || x === "TK") return;
    if (x === "UN" || x === "UC" || x === "HL" || x === "HN" || x === "LK") return;
    if (x === "NO" || x === "RR" || x === "DK" || x === "CS" || x === "CH" || x === "DP" || x === "HX") return;
    push(x.toUpperCase());
  });

  return out.slice(0, 40);
};

export const pickBestCandidate = (rawToken, { existsCode, bestItemForTerm } = {}) => {
  const norm = String(rawToken || "").trim().toUpperCase().replace(/\s+/g, " ");
  const candidates = [];
  const add = (t) => {
    if (!t) return;
    const k = String(t).trim().toUpperCase().replace(/\s+/g, " ");
    if (!k) return;
    if (candidates.includes(k)) return;
    candidates.push(k);
  };

  add(norm);

  const noDigits = norm.replace(/\d+/g, "");
  if (noDigits !== norm) add(noDigits);

  const m = norm.match(/^([A-Z]{2,6})([A-Z0-9]{0,6})$/);
  if (m) {
    add(m[1]);
    if (norm.startsWith("HDQRM")) add("HDQRM");
    if (norm.startsWith("HDQR")) add("HDQR");
    if (norm.startsWith("HDQ")) add("HDQ");
  }

  if (norm.startsWith("SSR ")) add(norm.split(" ").slice(0, 2).join(" "));
  if (norm.startsWith("OSI ")) add(norm.split(" ").slice(0, 2).join(" "));

  for (const term of candidates) {
    if (typeof existsCode === "function" && existsCode(term)) {
      const item = typeof bestItemForTerm === "function" ? bestItemForTerm(term) : null;
      return { term, item };
    }
  }

  let bestItem = null;
  let bestTerm = norm || "";
  if (typeof bestItemForTerm === "function") {
    for (const term of candidates) {
      const item = bestItemForTerm(term);
      if (item) {
        bestItem = item;
        bestTerm = term;
        break;
      }
    }
    if (!bestItem && norm) {
      const item = bestItemForTerm(norm);
      if (item) {
        bestItem = item;
        bestTerm = norm;
      }
    }
  }

  return { term: bestTerm, item: bestItem };
};
