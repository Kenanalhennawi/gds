import { stripControl } from "./utils.js";

const normLine = (l) => stripControl((l || "").trim());

const splitLines = (raw) =>
  (raw || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map(normLine)
    .filter((x) => x.length);

const detectProvider = (lines) => {
  const blob = lines.join(" ");
  const m = blob.match(/\b[A-Z]{3}(1A|1G|1S|1B)\b/);
  if (m) {
    const code = m[1];
    if (code === "1A") return { code: "1A", name: "Amadeus" };
    if (code === "1G") return { code: "1G", name: "Galileo/Travelport" };
    if (code === "1S") return { code: "1S", name: "Sabre" };
    if (code === "1B") return { code: "1B", name: "Abacus/Travelport" };
  }
  if (/\bGALILEO\b/i.test(blob)) return { code: "1G", name: "Galileo/Travelport" };
  if (/\bSABRE\b/i.test(blob)) return { code: "1S", name: "Sabre" };
  if (/\bAMADEUS\b/i.test(blob)) return { code: "1A", name: "Amadeus" };
  return null;
};

const parseEnvelopeLine = (line) => {
  const m = line.match(/^(QP|QK|QD|QQ)\s+([A-Z0-9]{3,12})(?:\s+(.*))?$/);
  if (!m) return null;
  const env = m[1];
  const header = m[2] || "";
  const rest = (m[3] || "").trim();
  const airline = header.match(/([A-Z]{2})$/) ? header.slice(-2) : null;
  return { env, header, airline, rest };
};

const parseOfficeLine = (line) => {
  const m = line.match(/^\.(\S{6})(?:\s+(\d{6}))?(?:\/(\S+))?$/);
  if (!m) return null;
  return { office: m[1], time: m[2] || null, extra: m[3] || null };
};

const parseRecordLine = (line) => {
  const m = line.match(/^([A-Z0-9]{5,6})\s+([A-Z0-9]{5,6})(?:\/([A-Z0-9]{6,12}))?$/);
  if (!m) return null;
  return { station: m[1], locator: m[2], ref: m[3] || null };
};

const normalizeSsrOsiLine = (line) => {
  if (/^SSR[A-Z0-9]{4}[A-Z0-9]{2}[A-Z]{2}\d/.test(line)) {
    const a = line.slice(0, 3);
    const b = line.slice(3, 7);
    const c = line.slice(7, 9);
    const d = line.slice(9, 12);
    const rest = line.slice(12);
    return `${a} ${b} ${c} ${d}${rest}`;
  }
  if (/^OSI[A-Z0-9]{2}\s/.test(line)) return `OSI ${line.slice(3)}`;
  if (/^OSIFZ/.test(line) && !/^OSI\s/.test(line)) {
    const rest = line.slice(5);
    return `OSI FZ ${rest.startsWith(" ") ? rest.trimStart() : rest}`;
  }
  return line;
};

const parseSsrLine = (line) => {
  const l = normalizeSsrOsiLine(line);
  if (!l.startsWith("SSR")) return null;
  const m = l.match(/^SSR\s+([A-Z0-9]{4})\s+([A-Z0-9]{2})\s+([A-Z]{2}\d)(?:\/(.*))?$/);
  if (m) return { type: m[1], carrier: m[2], status: m[3], data: (m[4] || "").trim() };
  const m2 = l.match(/^SSR\s+([A-Z0-9]{4})\s+([A-Z0-9]{2})\s+(.*)$/);
  if (m2) return { type: m2[1], carrier: m2[2], status: null, data: (m2[3] || "").trim() };
  const m3 = l.match(/^SSR\s+([A-Z0-9]{4})([A-Z0-9]{2})([A-Z]{2}\d)(.*)$/);
  if (m3) return { type: m3[1], carrier: m3[2], status: m3[3], data: (m3[4] || "").replace(/^\//, "").trim() };
  return { type: null, carrier: null, status: null, data: l.slice(3).trim() };
};

const parseOsiLine = (line) => {
  const l = normalizeSsrOsiLine(line);
  if (!l.startsWith("OSI")) return null;
  const m = l.match(/^OSI\s+([A-Z0-9]{2})\s+(.*)$/);
  if (!m) return null;
  return { carrier: m[1], data: (m[2] || "").trim() };
};

const parseSegmentLine = (line) => {
  const m = line.match(/^([A-Z0-9]{2})\s*([0-9]{1,4})([A-Z])([0-9]{2}[A-Z]{3})\s+([A-Z]{3})([A-Z]{3})\s+([A-Z]{2}\d)(?:\/([0-9]{3,4})\s+([0-9]{3,4})(?:\/1)?)?/);
  if (!m) return null;
  return {
    carrier: m[1],
    flight: m[2],
    cls: m[3],
    date: m[4],
    from: m[5],
    to: m[6],
    status: m[7],
    dep: m[8] || null,
    arr: m[9] || null
  };
};

const uniq = (arr) => Array.from(new Set((arr || []).filter(Boolean)));

export const parseHistory = (raw) => {
  const lines = splitLines(raw);
  if (!lines.length) {
    return { kind: "UNKNOWN", sentences: ["No content detected."] };
  }

  const envelope = parseEnvelopeLine(lines[0]);
  const office = lines.find((l) => l.startsWith(".")) ? parseOfficeLine(lines.find((l) => l.startsWith("."))) : null;

  let record = null;
  for (const l of lines) {
    const r = parseRecordLine(l);
    if (r) {
      record = r;
      break;
    }
  }

  const provider = detectProvider(lines);

  const segments = [];
  const ssrs = [];
  const osis = [];

  for (const l0 of lines) {
    const l = normalizeSsrOsiLine(l0);
    const seg = parseSegmentLine(l);
    if (seg) segments.push(seg);
    const s = parseSsrLine(l);
    if (s) ssrs.push(s);
    const o = parseOsiLine(l);
    if (o) osis.push(o);
  }

  const airlineFromSegs = uniq(segments.map((s) => s.carrier));
  const airlineFromSsr = uniq(ssrs.map((s) => s.carrier));
  const airlineFromOsi = uniq(osis.map((o) => o.carrier));
  const airlines = uniq([envelope?.airline, ...airlineFromSegs, ...airlineFromSsr, ...airlineFromOsi]);

  const kind = envelope ? "GDS_HISTORY" : /UNB\+|UNH\+|UNT\+|UNZ\+/.test(lines.join(" ")) ? "EDIFACT" : "TEXT";

  const sentences = [];
  sentences.push(`Detected type: ${kind}`);
  if (provider) sentences.push(`Detected GDS: ${provider.name} (${provider.code})`);
  if (envelope?.env) sentences.push(`Envelope: ${envelope.env}`);
  if (envelope?.header) sentences.push(`Header: ${envelope.header}`);
  if (office?.office) sentences.push(`Office/sign-in: ${office.office}`);
  if (record?.locator) sentences.push(`Record locator: ${record.locator}`);
  if (airlines.length) sentences.push(`Airlines: ${airlines.join(", ")}`);

  return {
    kind,
    provider,
    envelope,
    header: envelope?.header || null,
    airlineContext: airlines.length ? airlines : null,
    office,
    record,
    segments,
    ssrs,
    osis,
    sentences
  };
};
