import { uniq } from "./utils.js";

const stripControls = (s) => (s || "").toString().replace(/[\u0000-\u001F\u007F]/g, (c) => (c === "\n" || c === "\t" ? c : ""));

const toLines = (text) =>
  stripControls(text)
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((l) => l.trimEnd());

const isEnvelopeLine = (l) => /^(QP|QK|QD)\s+\S+/.test((l || "").trim());

const parseEnvelopeLine = (l) => {
  const m = (l || "").trim().match(/^(QP|QK|QD)\s+(\S+)(?:\s+.*)?$/);
  if (!m) return null;
  return { envelope: m[1], header: m[2] };
};

const parseDotLine = (l) => {
  const m = (l || "").trim().match(/^\.(\S+)(?:\s+(\S+))?$/);
  if (!m) return null;
  return { dotHeader: m[1], stamp: m[2] || null };
};

const parseActionLine = (l) => {
  const x = (l || "").trim();
  if (!x) return null;
  const m = x.match(/^(TRL|AKA|NAR|DVD|ASC|NCO|AKA)$/);
  return m ? m[1] : null;
};

const parseOfficeLine = (l) => {
  const m = (l || "").trim().match(/^([A-Z0-9]{2,3})\s+([A-Z0-9]{5,8})\/(\S+)/);
  if (!m) return null;
  return { office: m[1], recordLocator: m[2], signIn: m[3] };
};

const parseAirimpContext = (l) => {
  const m = (l || "").trim().match(/^(\S{2}Q\S{4})\s+([A-Z0-9]{6})\/(\S+)\/(\d{6,})\/(\S+)\/(\S{2})\/(\S)\/(\S{2})\/(\S{3})/);
  if (!m) return null;
  return { airlineContext: m[1], recordRef: m[2], host: m[3], agent: m[4], city: m[5], carrier: m[6], messageType: m[7], country: m[8], currency: m[9] };
};

const parsePassengerLine = (l) => {
  const m = (l || "").trim().match(/^(\d+)([A-Z'\-]+)\/([A-Z'\-]+)(?:\s+([A-Z\.]{1,4}))?\s*$/);
  if (!m) return null;
  return { index: Number(m[1]), surname: m[2], given: m[3], title: (m[4] || "").trim() };
};

const parseSsrLine = (l) => {
  const s = (l || "").trim();
  if (!s.startsWith("SSR")) return null;
  const m = s.match(/^SSR\s+([A-Z0-9]{3,4})\s+([A-Z0-9]{2})\s+([A-Z]{2})(\d+)\/?(.*)$/);
  if (!m) {
    const m2 = s.match(/^SSR\s+([A-Z0-9]{3,4})\s+([A-Z0-9]{2})\s+(.*)$/);
    if (!m2) return { raw: s };
    return { type: m2[1], carrier: m2[2], raw: s, text: (m2[3] || "").trim() };
  }
  return { type: m[1], carrier: m[2], status: `${m[3]}${m[4]}`, raw: s, text: (m[5] || "").trim() };
};

const parseOsiLine = (l) => {
  const s = (l || "").trim();
  if (!s.startsWith("OSI")) return null;
  return { raw: s, text: s.replace(/^OSI\s+/, "") };
};

const splitStatus = (s) => {
  const m = (s || "").match(/^([A-Z]{2})(\d+)$/);
  return m ? { code: m[1], num: Number(m[2]) } : null;
};

const parseRegularSegment = (l) => {
  const s = (l || "").trim();
  const m = s.match(/^([A-Z0-9]{2})(\d{1,4})([A-Z])([0-9]{2}[A-Z]{3})\s+([A-Z]{3})([A-Z]{3})\s+([A-Z]{2}\d+)\/(\d{4})\s+(\d{4})(?:\/(\d))?$/);
  if (!m) return null;
  const status = m[7];
  const st = splitStatus(status);
  return {
    kind: "SEG",
    carrier: m[1],
    flight: m[2],
    bookingClass: m[3],
    date: m[4],
    from: m[5],
    to: m[6],
    status,
    statusCode: st?.code || null,
    partySize: st?.num ?? null,
    depTime: m[8],
    arrTime: m[9],
    dayOffset: m[10] ? Number(m[10]) : 0,
  };
};

const parseCodeShareSegment = (l) => {
  const s = (l || "").trim();
  const m = s.match(/^([A-Z0-9]{2})(\d{1,4})([A-Z])\/(?:([A-Z0-9]{2})(\d{1,4})([A-Z]))([0-9]{2}[A-Z]{3})\s+([A-Z]{3})([A-Z]{3})\s+([A-Z]{2}\d+)\/(\d{4})\s+(\d{4})(?:\/(\d))?$/);
  if (!m) return null;
  const status = m[10];
  const st = splitStatus(status);
  return {
    kind: "SEG",
    carrier: m[1],
    flight: m[2],
    bookingClass: m[3],
    operatingCarrier: m[4],
    operatingFlight: m[5],
    operatingClass: m[6],
    date: m[7],
    from: m[8],
    to: m[9],
    status,
    statusCode: st?.code || null,
    partySize: st?.num ?? null,
    depTime: m[11],
    arrTime: m[12],
    dayOffset: m[13] ? Number(m[13]) : 0,
  };
};

const parseSegment = (l) => parseCodeShareSegment(l) || parseRegularSegment(l);

const parseTicketNumber = (s) => {
  const m1 = (s || "").match(/\b(\d{13})\b/);
  if (m1) return m1[1];
  const m2 = (s || "").match(/\.(\d{13})C\d\b/);
  return m2 ? m2[1] : null;
};

const parseMessageInfo = (lines) => {
  const joined = (lines || []).join("\n");
  if (!/\bSEATS\s+NOT\s+AVAILABLE\b/i.test(joined)) return null;

  const reason = (joined.match(/Message\s+Reason:\s*(.*)/i)?.[1] || "").trim() || null;
  const time = (joined.match(/Message\s+Time:\s*(.*)/i)?.[1] || "").trim() || null;
  const confirmation = (joined.match(/Confirmation\s+#:\s*(.*)/i)?.[1] || "").trim() || null;
  const systemCode = (joined.match(/System\s+Code:\s*(.*)/i)?.[1] || "").trim() || null;
  const recordLocator = (joined.match(/Record\s+Locator:\s*(.*)/i)?.[1] || "").trim() || null;

  const flights = [];
  const blocks = joined.split(/\*{5,}\s*S\s*E\s*A\s*T\s*S\s*\s*N\s*O\s*T\s*\s*A\s*V\s*A\s*I\s*L\s*A\s*B\s*L\s*E\s*\*{5,}/i);
  blocks.forEach((b) => {
    if (!/Carrier\s+Code:/i.test(b)) return;
    const carrier = (b.match(/Carrier\s+Code:\s*([A-Z0-9]{2})/i)?.[1] || "").trim() || null;
    const flightNumber = (b.match(/Flight\s+Number:\s*(\d{1,4})/i)?.[1] || "").trim() || null;
    const origin = (b.match(/Origin:\s*([A-Z]{3})/i)?.[1] || "").trim() || null;
    const destination = (b.match(/Destination:\s*([A-Z]{3})/i)?.[1] || "").trim() || null;
    const flightDate = (b.match(/Flight\s+Date:\s*([0-9]{2}[A-Z]{3})/i)?.[1] || "").trim() || null;
    const fareClass = (b.match(/Fare\s+Class:\s*([A-Z])/i)?.[1] || "").trim() || null;
    const seatsAvailable = b.match(/Seats\s+Available:\s*(\d+)/i)?.[1] ? Number(b.match(/Seats\s+Available:\s*(\d+)/i)[1]) : null;
    const seatsRequested = b.match(/Seats\s+Requested:\s*(\d+)/i)?.[1] ? Number(b.match(/Seats\s+Requested:\s*(\d+)/i)[1]) : null;
    const fareAmount = b.match(/Fare\s+Amount:\s*(\d+)/i)?.[1] ? Number(b.match(/Fare\s+Amount:\s*(\d+)/i)[1]) : null;
    const fareBasisCode = (b.match(/Fare\s+Basis\s+Code:\s*(\S+)/i)?.[1] || "").trim() || null;
    const logicalFlightId = (b.match(/Logical\s+Flight\s+ID:\s*(\d+)/i)?.[1] || "").trim() || null;
    const currencyCode = (b.match(/Currency\s+Code:\s*([A-Z]{3})/i)?.[1] || "").trim() || null;
    flights.push({ carrier, flightNumber, origin, destination, flightDate, fareClass, seatsAvailable, seatsRequested, fareAmount, fareBasisCode, logicalFlightId, currencyCode });
  });

  return { reason, time, confirmation, systemCode, recordLocator, flights };
};

export const parseHistory = (input) => {
  const raw = (input || "").toString().trim();
  if (!raw) return {};

  const lines = toLines(raw);
  const blocks = [];
  let current = null;

  const push = () => {
    if (!current) return;
    const compact = current.lines.filter((x) => x && x.trim()).slice();
    current.lines = compact;
    blocks.push(current);
    current = null;
  };

  lines.forEach((l) => {
    if (isEnvelopeLine(l)) {
      push();
      const env = parseEnvelopeLine(l);
      current = { envelope: env.envelope, header: env.header, dotHeader: null, stamp: null, action: null, office: null, recordLocator: null, signIn: null, airlineContext: null, recordRef: null, pax: null, segments: [], ssr: [], osi: [], tickets: [], statusCodes: [], lines: [l] };
      return;
    }

    if (!current) {
      current = { envelope: null, header: null, dotHeader: null, stamp: null, action: null, office: null, recordLocator: null, signIn: null, airlineContext: null, recordRef: null, pax: null, segments: [], ssr: [], osi: [], tickets: [], statusCodes: [], lines: [] };
    }

    current.lines.push(l);

    const dot = parseDotLine(l);
    if (dot) {
      current.dotHeader = current.dotHeader || dot.dotHeader;
      current.stamp = current.stamp || dot.stamp;
      return;
    }

    const act = parseActionLine(l);
    if (act) {
      current.action = current.action || act;
      return;
    }

    const office = parseOfficeLine(l);
    if (office) {
      current.office = current.office || office.office;
      current.recordLocator = current.recordLocator || office.recordLocator;
      current.signIn = current.signIn || office.signIn;
      return;
    }

    const ctx = parseAirimpContext(l);
    if (ctx) {
      current.airlineContext = current.airlineContext || ctx.carrier || ctx.airlineContext;
      current.recordRef = current.recordRef || ctx.recordRef;
      return;
    }

    const pax = parsePassengerLine(l);
    if (pax && !current.pax) {
      current.pax = pax;
      return;
    }

    const seg = parseSegment(l);
    if (seg) {
      current.segments.push(seg);
      if (seg.statusCode) current.statusCodes.push(seg.statusCode);
      return;
    }

    const ssr = parseSsrLine(l);
    if (ssr) {
      current.ssr.push(ssr);
      const t = parseTicketNumber(ssr.raw || ssr.text || "");
      if (t) current.tickets.push(t);
      return;
    }

    const osi = parseOsiLine(l);
    if (osi) {
      current.osi.push(osi);
      return;
    }
  });

  push();

  const allSegments = blocks.flatMap((b) => b.segments || []);
  const allSsr = blocks.flatMap((b) => b.ssr || []);
  const allOsi = blocks.flatMap((b) => b.osi || []);
  const allTickets = uniq(blocks.flatMap((b) => b.tickets || []).filter(Boolean));
  const envelopes = uniq(blocks.map((b) => b.envelope).filter(Boolean));
  const actions = uniq(blocks.map((b) => b.action).filter(Boolean));
  const statusCodes = uniq(blocks.flatMap((b) => b.statusCodes || []).filter(Boolean));

  const any = blocks.find((b) => b.airlineContext || b.header || b.dotHeader) || null;
  const pax = blocks.find((b) => b.pax)?.pax || null;
  const office = blocks.find((b) => b.office)?.office || null;
  const recordRef = blocks.find((b) => b.recordRef)?.recordRef || null;
  const recordLocator = blocks.find((b) => b.recordLocator)?.recordLocator || null;
  const header = any?.dotHeader || any?.header || null;
  const airlineContext = any?.airlineContext || null;

  const ssrTypes = uniq(allSsr.map((x) => x.type).filter(Boolean));
  const osiText = uniq(allOsi.map((x) => x.text).filter(Boolean));

  const msgInfo = parseMessageInfo(lines);

  return {
    kind: "GDS_HISTORY",
    header,
    airlineContext,
    office,
    recordRef: recordRef || recordLocator || null,
    pax,
    envelopes,
    actions,
    statusCodes,
    segments: allSegments,
    ssr: ssrTypes,
    ssrLines: allSsr,
    osi: osiText,
    tickets: allTickets,
    diagnostics: msgInfo ? { seatsNotAvailable: msgInfo } : null,
    blocks,
  };
};
