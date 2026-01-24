import { uniq } from "./utils.js";

/**
 * Parse pasted GDS history / EDIFACT-ish blocks into structured hints
 * so the UI can auto-explain important parts.
 */
export const parseHistory = (raw) => {
  const text = (raw || "").toString().replace(/\s+/g, " ").trim();
  if (!text) return null;

  const out = {
    kind: null,
    header: null,
    airlineContext: null,
    office: null,
    recordRef: null,
    pax: null,
    segments: [],
    ssr: [],
    osi: [],
    fare: [],
    edifact: { segments: [], messageTypes: [], ticketNumbers: [] },
    queueLogic: [],
  };

  const hd = text.match(/\bHD[A-Z]{2,6}[A-Z0-9]{0,2}\b/);
  if (hd) {
    out.kind = "GDS_HISTORY";
    out.header = hd[0];
    if (out.header.startsWith("HDQ"))
      out.queueLogic.push({
        code: "HDQ",
        meaning: "Queue-related history (line produced under queue workflow).",
      });
    if (out.header.includes("RM"))
      out.queueLogic.push({
        code: "RM",
        meaning: "Record message snapshot (multiple logical elements inside one line).",
      });
    const m = out.header.match(/^HD[A-Z]{2,6}([A-Z0-9]{2})$/);
    if (m) out.airlineContext = m[1];
    if (out.airlineContext)
      out.queueLogic.push({
        code: out.airlineContext,
        meaning:
          "Carrier/context tag carried in history header (implementation-specific).",
      });
  }

  // EDIFACT envelope detection (minimal, generic)
  if (text.includes("UNB+") || text.includes("UNH+")) {
    out.kind = out.kind || "EDIFACT";
    const segs = [];
    (text.match(/\bUNB\b|\bUNH\b|\bUNT\b|\bUNZ\b|\bORG\b|\bTKT\b|\bMSG\b/g) || []).forEach(
      (s) => {
        if (!segs.includes(s)) segs.push(s);
      }
    );
    out.edifact.segments = segs;
    out.edifact.messageTypes = uniq(text.match(/\b[A-Z]{3,6}REQ\b/g) || []);
    const tkt = (text.match(/\bTKT\+([0-9]{10,14})/g) || [])
      .map((x) => x.replace("TKT+", "").split(/[^\d]/)[0])
      .filter(Boolean);
    out.edifact.ticketNumbers = uniq(tkt);
  }

  // Record reference like //1141D8A... etc
  const ref = text.match(/\/\/([A-Z0-9]{10,})/);
  if (ref) out.recordRef = ref[1];

  // PAX in typical host history: 1SURNAME/GIVEN TITLE
  const pax = text.match(
    /\b\d([A-Z][A-Z0-9' -]{1,30})\/([A-Z][A-Z0-9' -]{1,30})\s+(MR|MRS|MS|MISS|CHD|INF)\b/
  );
  if (pax)
    out.pax = {
      surname: pax[1].trim(),
      given: pax[2].trim(),
      title: pax[3].trim(),
    };

  // Office / sign-in patterns (best-effort, generic)
  const officeA = text.match(/\.[A-Z0-9]{4,10}\b/);
  const officeB = text.match(/\b[A-Z]{3}[0-9]A\b/);
  const officeC = text.match(/\b[A-Z]{3}\/1A\b/);
  const officeParts = [];
  if (officeA) officeParts.push(officeA[0]);
  if (officeB) officeParts.push(officeB[0]);
  if (officeC) officeParts.push(officeC[0]);
  if (officeParts.length) out.office = officeParts.join(" ");

  // Segment pattern: XX1234Y01JAN AAABBB HK1
  const segRe =
    /\b([A-Z0-9]{2})(\d{1,4})([A-Z])(\d{2}[A-Z]{3})\s+([A-Z]{3})([A-Z]{3})\s+([A-Z]{2}\d)\b/g;
  let m;
  while ((m = segRe.exec(text)) !== null) {
    out.segments.push({
      carrier: m[1],
      flight: m[2],
      bookingClass: m[3],
      date: m[4],
      from: m[5],
      to: m[6],
      status: m[7],
    });
  }

  // SSR types
  const ssrRe = /\bSSR\s+([A-Z]{3,4})\b/g;
  const ssrTypes = [];
  while ((m = ssrRe.exec(text)) !== null) ssrTypes.push(`SSR ${m[1]}`);
  out.ssr = uniq(ssrTypes);

  // OSI lines (best-effort: keep short, prevent giant dumps)
  if (/\bOSI\b/.test(text)) {
    const osiLines = [];
    const parts = text.split(/\bOSI\b/).slice(1);
    parts.forEach((p) => {
      const s = ("OSI" + p).trim();
      if (s.length > 3) osiLines.push(s.substring(0, 220));
    });
    out.osi = uniq(osiLines);
  }

  // Fare tokens hints
  const fareTokens = [];
  (text.match(/\bNUC\b|\bROE\b|\bXT\b/g) || []).forEach((x) => fareTokens.push(x));
  if (fareTokens.length) out.fare = uniq(fareTokens);

  return out;
};
