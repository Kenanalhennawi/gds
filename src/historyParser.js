import { uniq } from "./utils.js";

// Clean messy copy-pastes with hidden control characters
const toLines = (text) => {
  if (!text) return [];
  
  let clean = text.toString();
  
  // FIX: Replace SOH () and STX () and other control chars with newlines
  clean = clean.replace(/[\u0001\u0002\u0003\u0004]/g, "\n");
  
  // Heuristic: If we see a 6-digit number followed by dot/chars (like 231737 .DXB), split it
  clean = clean.replace(/(\d{6})\s+(\.?[A-Z]{2,3})/g, "$1\n$2");
  
  return clean
    .split(/\r\n|\r|\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0);
};

const isEnvelopeLine = (l) => /^(QP|QK|QD)(\s+|$)/.test(l);

const parseEnvelopeLine = (l) => {
  const m = l.match(/^(QP|QK|QD)\s+(\S+)(?:\s+.*)?$/);
  if (!m) return { envelope: l.substring(0,2), header: null };
  return { envelope: m[1], header: m[2] };
};

const parseDotLine = (l) => {
  const m = l.match(/^\.(\S+)(?:\s+(\S+))?$/);
  if (!m) return null;
  return { dotHeader: m[1], stamp: m[2] || null };
};

const parseActionLine = (l) => {
  const m = l.match(/^(TRL|AKA|NAR|DVD|ASC|NCO)$/);
  return m ? m[1] : null;
};

const parseOfficeLine = (l) => {
  // Matches: MUC1A BAB9HM/YTO6W2140/6759931/YTO/1A/T/CA//SU
  let m = l.match(/^([A-Z0-9]{2,3})\s+([A-Z0-9]{5,8})\/(\S+)/);
  if (m) return { office: m[1], recordLocator: m[2], signIn: m[3] };

  // Matches: DXBEK DTZMGS (City/Airline + RLOC)
  m = l.match(/^([A-Z]{3})([A-Z0-9]{2})\s+([A-Z0-9]{6})$/);
  if (m) return { office: m[1], airline: m[2], recordLocator: m[3] };

  return null;
};

const parseAirimpContext = (l) => {
  // Matches standard: LAX1SQ 123456...
  let m = l.match(/^(\S{2}Q\S{4})\s+([A-Z0-9]{6})\/(\S+)\/(\d{6,})\/(\S+)\/(\S{2})\/(\S)\/(\S{2})\/(\S{3})/);
  if (m) return { airlineContext: m[1], recordRef: m[2] };

  // Matches compressed: HDQFZ9PVL96/TLV/86494564/TLV/FZ/A/IL/USD
  m = l.match(/^HDQ([A-Z0-9]{2})([A-Z0-9]{6})\/([A-Z]{3})\/(\d+)\/([A-Z]{3})\/([A-Z0-9]{2})\//);
  if (m) return { 
    airlineContext: m[1], // FZ
    recordRef: m[2],      // 9PVL96
    office: m[3],         // TLV
    iata: m[4]
  };

  return null;
};

const parsePassengerLine = (l) => {
  // Matches: 1LEVY/YUVALMR
  const m = l.match(/^(\d+)([A-Z'\-\s]+)\/([A-Z'\-\s]+)$/);
  if (!m) return null;
  return { index: Number(m[1]), surname: m[2].trim(), given: m[3].trim() };
};

const parseSsrLine = (l) => {
  if (!l.startsWith("SSR")) return null;
  // Matches: SSR TKNE EK HK1 ...
  const m = l.match(/^SSR\s+([A-Z0-9]{3,4})\s+([A-Z0-9]{2})\s+([A-Z]{2})(\d+)\/?(.*)$/);
  if (!m) {
    // Matches: SSR OTHS EK ...
    const m2 = l.match(/^SSR\s+([A-Z0-9]{3,4})\s+([A-Z0-9]{2})\s+(.*)$/);
    if (!m2) return { raw: l };
    return { type: m2[1], carrier: m2[2], raw: l, text: (m2[3] || "").trim() };
  }
  return { type: m[1], carrier: m[2], status: `${m[3]}${m[4]}`, raw: l, text: (m[5] || "").trim() };
};

const parseOsiLine = (l) => {
  if (!l.startsWith("OSI")) return null;
  return { raw: l, text: l.replace(/^OSI\s+/, "") };
};

const splitStatus = (s) => {
  const m = (s || "").match(/^([A-Z]{2})(\d+)$/);
  return m ? { code: m[1], num: Number(m[2]) } : null;
};

const parseSegment = (l) => {
  // Matches: EK0374K29JAN DXBBKK SS1/2235 0735/1
  const m = l.match(/^([A-Z0-9]{2})(\d{1,4})([A-Z])\s*([0-9]{2}[A-Z]{3})\s+([A-Z]{3})([A-Z]{3})\s+([A-Z]{2}\d+)(?:\/(\d{4})\s+(\d{4})(?:\/(\d))?)?/);
  
  if (!m) {
    // Short format fallback
    const m2 = l.match(/^([A-Z0-9]{2})(\d{1,4})([A-Z])\s+([0-9]{2}[A-Z]{3})\s+([A-Z]{3})([A-Z]{3})\s+([A-Z]{2}\d+)$/);
    if(m2) {
       const status = m2[7];
       return {
        kind: "SEG",
        carrier: m2[1],
        flight: m2[2],
        bookingClass: m2[3],
        date: m2[4],
        from: m2[5],
        to: m2[6],
        status,
        statusCode: splitStatus(status)?.code || null
       };
    }
    return null;
  }
  
  const status = m[7];
  return {
    kind: "SEG",
    carrier: m[1],
    flight: m[2],
    bookingClass: m[3],
    date: m[4],
    from: m[5],
    to: m[6],
    status,
    statusCode: splitStatus(status)?.code || null,
    depTime: m[8] || null,
    arrTime: m[9] || null
  };
};

const parseTicketNumber = (s) => {
  const m = s.match(/\b(\d{13})\b/);
  return m ? m[1] : null;
};

export const parseHistory = (input) => {
  const lines = toLines(input);
  if (!lines.length) return {};

  const blocks = [];
  let current = null;

  const startBlock = (l, env = null, head = null) => {
    if (current) blocks.push(current);
    current = {
      envelope: env,
      header: head,
      lines: [l],
      segments: [],
      ssr: [],
      osi: [],
      pax: null,
      office: null,
      action: null,
      recordLocator: null,
      airlineContext: null
    };
  };

  lines.forEach((l) => {
    if (isEnvelopeLine(l)) {
      const p = parseEnvelopeLine(l);
      startBlock(l, p.envelope, p.header);
      return;
    }

    if (!current) startBlock(l);
    else current.lines.push(l);

    const act = parseActionLine(l);
    if (act) {
      current.action = act;
      return;
    }

    const off = parseOfficeLine(l);
    if (off) {
      if (off.office) current.office = off.office;
      if (off.recordLocator) current.recordLocator = off.recordLocator;
      if (off.airline) current.airlineContext = off.airline;
      return;
    }

    const ctx = parseAirimpContext(l);
    if (ctx) {
      if (ctx.airlineContext) current.airlineContext = ctx.airlineContext;
      if (ctx.recordRef) current.recordLocator = ctx.recordRef;
      if (ctx.office) current.office = ctx.office;
      return;
    }

    const dot = parseDotLine(l);
    if (dot && !current.header) {
      current.header = dot.dotHeader;
    }

    const pax = parsePassengerLine(l);
    if (pax) {
      current.pax = pax;
      return;
    }

    const seg = parseSegment(l);
    if (seg) {
      current.segments.push(seg);
      return;
    }

    const ssr = parseSsrLine(l);
    if (ssr) {
      current.ssr.push(ssr);
      return;
    }

    const osi = parseOsiLine(l);
    if (osi) {
      current.osi.push(osi);
      return;
    }
  });

  if (current) blocks.push(current);

  // Aggregates for the technical breakdown
  const allSegments = blocks.flatMap(b => b.segments);
  const allSsr = blocks.flatMap(b => b.ssr);
  const allOsi = blocks.flatMap(b => b.osi);
  const envelopes = uniq(blocks.map(b => b.envelope).filter(Boolean));
  const header = blocks.find(b => b.header)?.header || null;
  const office = blocks.find(b => b.office)?.office || null;
  const recordLocator = blocks.find(b => b.recordLocator)?.recordLocator || null;
  const airlineContext = blocks.find(b => b.airlineContext)?.airlineContext || null;

  let queueLogic = [];
  if (header && header.startsWith("HDQ")) {
    queueLogic.push({ code: "HDQ", meaning: "Queue Handling Message" });
    if (header.includes("RM")) queueLogic.push({ code: "RM", meaning: "Record Message Snapshot" });
    const carrier = header.replace(/^HDQRM?/, "").substring(0,2);
    if (carrier) queueLogic.push({ code: carrier, meaning: "Carrier Context" });
  }

  return {
    kind: "GDS_HISTORY",
    blocks,
    header,
    office,
    recordLocator,
    airlineContext,
    envelopes,
    segments: allSegments,
    ssr: allSsr,
    osi: allOsi,
    queueLogic
  };
};
