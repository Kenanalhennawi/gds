import { uniq } from "./utils.js";

const stripControls = (s) => (s || "").toString().replace(/[\u0000-\u0009\u000B-\u001F\u007F]/g, "");

const toLines = (text) => {
  if (!text) return [];
  
  let clean = text.toString();
  
  clean = clean.replace(/[\u0001\u0002\u0003\u0004]/g, "\n");
  
  clean = clean.replace(/([0-9]{6})\s+(\.?[A-Z]{2,3})/g, "$1\n$2");
  
  return clean
    .split(/\r\n|\r|\n/)
    .map(l => l.trim())
    .filter(l => l.length > 0);
};

const isEnvelopeLine = (l) => /^(QP|QK|QD)\s+/.test(l);

const parseEnvelopeLine = (l) => {
  const m = l.match(/^(QP|QK|QD)\s+(\S+)(?:\s+.*)?$/);
  if (!m) return null;
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
  const m = l.match(/^([A-Z0-9]{2,3})\s+([A-Z0-9]{5,8})\/(\S+)/);
  if (!m) return null;
  return { office: m[1], recordLocator: m[2], signIn: m[3] };
};

const parseAirimpContext = (l) => {
  const m = l.match(/^(\S{2}Q\S{4})\s+([A-Z0-9]{6})\/(\S+)\/(\d{6,})\/(\S+)\/(\S{2})\/(\S)\/(\S{2})\/(\S{3})/);
  if (!m) return null;
  return { airlineContext: m[1], recordRef: m[2] };
};

const parsePassengerLine = (l) => {
  const m = l.match(/^(\d+)([A-Z'\-\s]+)\/([A-Z'\-\s]+)$/);
  if (!m) return null;
  return { index: Number(m[1]), surname: m[2].trim(), given: m[3].trim() };
};

const parseSsrLine = (l) => {
  if (!l.startsWith("SSR")) return null;
  const m = l.match(/^SSR\s+([A-Z0-9]{3,4})\s+([A-Z0-9]{2})\s+([A-Z]{2})(\d+)\/?(.*)$/);
  if (!m) {
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
  const m = l.match(/^([A-Z0-9]{2})(\d{1,4})([A-Z])\s*([0-9]{2}[A-Z]{3})\s+([A-Z]{3})([A-Z]{3})\s+([A-Z]{2}\d+)(?:\/(\d{4})\s+(\d{4})(?:\/(\d))?)?/);
  
  if (!m) {
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
      action: null
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
      current.office = off.office;
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

  const allSegments = blocks.flatMap(b => b.segments);
  const allSsr = blocks.flatMap(b => b.ssr);
  const allOsi = blocks.flatMap(b => b.osi);

  return {
    kind: "GDS_HISTORY",
    blocks,
    segments: allSegments,
    ssr: allSsr,
    osi: allOsi
  };
};
