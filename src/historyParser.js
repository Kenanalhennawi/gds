import { uniq } from "./utils.js";

const stripControls = (s) => (s || "").toString().replace(/[\u0000-\u001F\u007F]/g, (c) => (c === "\n" || c === "\t" ? c : ""));

const toLines = (text) =>
  stripControls(text)
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((l) => l.trimEnd());

const isEnvelopeLine = (l) => /^(QP|QK|QD)\s+\S+/.test((l || "").trim());
const isDotHeaderLine = (l) => /^\.\S+/.test((l || "").trim());

const parseEnvelope = (line) => {
  const m = line.trim().match(/^(QP|QK|QD)\s+(.+?)\s*$/);
  if (!m) return null;
  return { envelope: m[1], header: m[2].trim() };
};

const parseDotHeader = (line) => {
  const m = line.trim().match(/^\.(\S+)\s+(\d{6}|\d{4,6})\s*$/);
  if (!m) return null;
  return { hostHeader: m[1], time: m[2] };
};

const parseActionLine = (line) => {
  const t = line.trim();
  const m = t.match(/^(TRL|AKA|NAR|DVD|ASC|NCO)\b/);
  return m ? m[1] : null;
};

const parseRecordRef = (line) => {
  const m = (line || "").match(/(?:^|\s)([A-Z0-9]{5,8}\/[A-Z0-9]{7,9})(?:\s|$)/);
  if (m) return m[1];
  const m2 = (line || "").match(/\b([A-Z0-9]{5,8}\/\d{7,9})\b/);
  return m2 ? m2[1] : null;
};

const parseOffice = (line) => {
  const m = (line || "").match(/\b([A-Z]{3}[A-Z0-9]{2,})(?:\s+)?\b/);
  return m ? m[1] : null;
};

const parsePax = (line) => {
  const t = (line || "").trim();
  const m = t.match(/^\d+([A-Z' -]+)\/([A-Z' -]+)\s*(MR|MS|MRS|MSTR|MISS)?\s*$/i);
  if (!m) return null;
  return {
    surname: m[1].trim().toUpperCase(),
    given: m[2].trim().toUpperCase(),
    title: (m[3] || "").toUpperCase()
  };
};

const parseStatus = (s) => {
  const m = (s || "").match(/^([A-Z]{2})(\d+)?$/);
  if (!m) return null;
  return { code: m[1], n: m[2] ? Number(m[2]) : null };
};

const parseSegmentLine = (line) => {
  const t = (line || "").trim();
  if (!t) return null;

  const cs = t.match(
    /^([A-Z0-9]{2})(\d{1,4})([A-Z])\/([A-Z0-9]{2})(\d{1,4})([A-Z])(\d{2}[A-Z]{3})\s+([A-Z]{3})([A-Z]{3})\s+([A-Z]{2}\d+)(?:\/(\d{3,4})\s+(\d{3,4})(?:\/(\d+))?)?\s*$/
  );
  if (cs) {
    const st = parseStatus(cs[10]);
    const dayOffset = cs[13] ? Number(cs[13]) : null;
    return {
      carrier: cs[1],
      flight: cs[2],
      bookingClass: cs[3],
      operatingCarrier: cs[4],
      operatingFlight: cs[5],
      operatingClass: cs[6],
      date: cs[7],
      from: cs[8],
      to: cs[9],
      status: st ? st.code : cs[10],
      paxCount: st?.n ?? null,
      depTime: cs[11] || null,
      arrTime: cs[12] || null,
      dayOffset
    };
  }

  const seg = t.match(
    /^([A-Z0-9]{2})(\d{1,4})([A-Z])(\d{2}[A-Z]{3})\s+([A-Z]{3})([A-Z]{3})\s+([A-Z]{2}\d+)(?:\/(\d{3,4})\s+(\d{3,4})(?:\/(\d+))?)?\s*$/
  );
  if (seg) {
    const st = parseStatus(seg[7]);
    const dayOffset = seg[10] ? Number(seg[10]) : null;
    return {
      carrier: seg[1],
      flight: seg[2],
      bookingClass: seg[3],
      operatingCarrier: null,
      operatingFlight: null,
      operatingClass: null,
      date: seg[4],
      from: seg[5],
      to: seg[6],
      status: st ? st.code : seg[7],
      paxCount: st?.n ?? null,
      depTime: seg[8] || null,
      arrTime: seg[9] || null,
      dayOffset
    };
  }

  return null;
};

const parseSSR = (line) => {
  const t = (line || "").trim();
  if (!t.startsWith("SSR ")) return null;
  return t;
};

const parseOSI = (line) => {
  const t = (line || "").trim();
  if (!t.startsWith("OSI ")) return null;
  return t;
};

const extractTicketNumbers = (text) => {
  const nums = [];
  const re1 = /\bSSR\s+TKNE\s+[A-Z0-9]{2}\s+[A-Z]{2}\d+\s+([0-9]{10,14})(?:[A-Z]\d)?\b/g;
  let m;
  while ((m = re1.exec(text))) nums.push(m[1]);
  const re2 = /\bSSRTKNE[A-Z0-9]{2}[A-Z]{2}\d+\b[^.]*\.(\d{10,14})/g;
  while ((m = re2.exec(text))) nums.push(m[1]);
  const re3 = /\b(\d{13})\b/g;
  while ((m = re3.exec(text))) nums.push(m[1]);
  return uniq(nums);
};

const parseSeatsNotAvailable = (lines) => {
  const idx = lines.findIndex((l) => /\bSEATS\s+NOT\s+A\s+V\s+A\s+I\s+L\s+A\s+B\s+L\s+E\b/i.test(l) || /\bSEATS\s+NOT\s+AVAILABLE\b/i.test(l));
  if (idx < 0) return null;

  const d = { flights: [] };

  for (const l of lines) {
    const m1 = l.match(/^Message Reason:\s*(.+)$/i);
    if (m1) d.reason = m1[1].trim();
    const m2 = l.match(/^Message Time:\s*(.+)$/i);
    if (m2) d.time = m2[1].trim();
    const m3 = l.match(/^Confirmation #:\s*(.+)$/i);
    if (m3) d.confirmation = m3[1].trim();
    const m4 = l.match(/^System Code:\s*(.+)$/i);
    if (m4) d.systemCode = m4[1].trim();
    const m5 = l.match(/^Record Locator:\s*(.+)$/i);
    if (m5) d.recordLocator = m5[1].trim();
  }

  const flightBlocks = [];
  let current = null;
  for (let i = idx; i < lines.length; i++) {
    const l = lines[i];
    if (/^\*{5,}\s+F\s+L\s+I\s+G\s+H\s+T\s+\s+I\s+N\s+F\s+O/i.test(l) || /^\*{5,}\s+F\s+L\s+I\s+G\s+H\s+T/i.test(l)) {
      current = {};
      flightBlocks.push(current);
      continue;
    }
    if (!current) continue;

    const kv = l.trim().match(/^([A-Za-z ]+):\s*(.+)$/);
    if (!kv) continue;
    const k = kv[1].trim().toLowerCase();
    const v = kv[2].trim();
    if (k === "carrier code") current.carrier = v;
    else if (k === "flight number") current.flightNumber = v;
    else if (k === "origin") current.origin = v;
    else if (k === "destination") current.destination = v;
    else if (k === "flight date") current.flightDate = v;
    else if (k === "fare class") current.fareClass = v;
    else if (k === "seats available") current.seatsAvailable = Number(v);
    else if (k === "seats requested") current.seatsRequested = Number(v);
    else if (k === "fare amount") current.fareAmount = v;
    else if (k === "fare basis code") current.fareBasisCode = v;
    else if (k === "logical flight id") current.logicalFlightId = v;
    else if (k === "currency code") current.currencyCode = v;
    else if (k === "directional origin") current.directionalOrigin = v;
  }

  d.flights = flightBlocks.filter((b) => b && (b.carrier || b.flightNumber || b.origin || b.destination));
  return d;
};

export const parseHistory = (rawText) => {
  const lines = toLines(rawText);
  const out = {
    kind: "GDS_HISTORY",
    header: null,
    airlineContext: null,
    office: null,
    recordRef: null,
    pax: null,
    envelopes: [],
    actions: [],
    segments: [],
    ssr: [],
    ssrLines: [],
    osi: [],
    ticketNumbers: [],
    statuses: [],
    statusTokens: [],
    diagnostics: {}
  };

  const allText = lines.join("\n");
  out.ticketNumbers = extractTicketNumbers(allText);

  const diagSeats = parseSeatsNotAvailable(lines);
  if (diagSeats) out.diagnostics.seatsNotAvailable = diagSeats;

  let currentEnvelope = null;
  let currentHostHeader = null;

  for (let i = 0; i < lines.length; i++) {
    const l = (lines[i] || "").trim();
    if (!l) continue;

    if (isEnvelopeLine(l)) {
      const e = parseEnvelope(l);
      if (e) {
        currentEnvelope = e.envelope;
        out.envelopes.push(e.envelope);
        if (!out.header) out.header = e.header;
      }
      continue;
    }

    if (isDotHeaderLine(l)) {
      const dh = parseDotHeader(l);
      if (dh) {
        currentHostHeader = dh.hostHeader;
        out.envelopes.push(dh.hostHeader);
      }
      continue;
    }

    const action = parseActionLine(l);
    if (action) out.actions.push(action);

    if (!out.recordRef) {
      const rr = parseRecordRef(l);
      if (rr) out.recordRef = rr;
    }

    if (!out.office && /\b[A-Z]{3}[A-Z0-9]{2,}\b/.test(l) && !l.startsWith("SSR") && !l.startsWith("OSI")) {
      const off = parseOffice(l);
      if (off && off.length >= 5) out.office = off;
    }

    if (!out.pax) {
      const px = parsePax(l);
      if (px) out.pax = px;
    }

    const seg = parseSegmentLine(l);
    if (seg) {
      out.segments.push(seg);
      if (seg.status) {
        const st = seg.paxCount ? `${seg.status}${seg.paxCount}` : seg.status;
        out.statusTokens.push(st);
        out.statuses.push(seg.status);
      }
      continue;
    }

    const ssr = parseSSR(l);
    if (ssr) {
      out.ssrLines.push(ssr);
      const type = ssr.split(/\s+/)[1] || "";
      if (type) out.ssr.push(type.toUpperCase());
      continue;
    }

    const osi = parseOSI(l);
    if (osi) {
      out.osi.push(osi);
      continue;
    }
  }

  out.envelopes = uniq(out.envelopes);
  out.actions = uniq(out.actions);
  out.ssr = uniq(out.ssr);
  out.statusTokens = uniq(out.statusTokens);
  out.statuses = uniq(out.statuses);

  const ctxMatch = allText.match(/\b([A-Z0-9]{2})\/[A-Z]{3}\/\d{6,}\b/);
  if (ctxMatch) out.airlineContext = ctxMatch[1];

  if (!out.airlineContext) {
    const c2 = allText.match(/\bSSR\s+[A-Z]{3,4}\s+([A-Z0-9]{2})\b/);
    if (c2) out.airlineContext = c2[1];
  }

  out.header = out.header || currentHostHeader || currentEnvelope || null;
  return out;
};
