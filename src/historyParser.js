import { uniq } from "./utils.js";

/**
 * Parse pasted GDS history / EDIFACT-ish blocks into structured hints
 * so the UI can auto-explain important parts.
 */
export const parseHistory = (raw) => {
  const rawStr = (raw || "").toString();
  const lines = rawStr
    .replace(/\r/g, "")
    .split("\n")
    .map((l) => l.replace(/\s+$/g, ""))
    .filter((l) => l.trim().length > 0);
  const text = rawStr.replace(/\s+/g, " ").trim();
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
    seatAvailability: null,
  };

  // Parse verbose GDS blocks like "SEATS NOT AVAILABLE" (Galileo/1G style)
  // Keep this independent from whitespace-normalized parsing.
  const parseSeatAvailability = () => {
    if (!/SEATS\s+NOT\s+AVAILABLE/i.test(rawStr)) return null;

    const info = {
      reason: null,
      time: null,
      confirmation: null,
      systemCode: null,
      recordLocator: null,
      flights: [],
    };

    const reason = rawStr.match(/Message Reason:\s*(.+)/i);
    if (reason) info.reason = reason[1].trim();
    const time = rawStr.match(/Message Time:\s*(.+)/i);
    if (time) info.time = time[1].trim();
    const conf = rawStr.match(/Confirmation #:\s*(.+)/i);
    if (conf) info.confirmation = conf[1].trim();
    const sys = rawStr.match(/System Code:\s*(.+)/i);
    if (sys) info.systemCode = sys[1].trim();
    const rloc = rawStr.match(/Record Locator:\s*(.+)/i);
    if (rloc) info.recordLocator = rloc[1].trim();

    // Split on repeated seat blocks
    const blocks = rawStr.split(/\*{3,}\s*\n\*{3,}\s*\n\*{3,}[\s\S]*?\*{5,}\s*\n\s*\*{2,}\s*S\s*E\s*A\s*T\s*S[\s\S]*?\*{2,}\s*\n/);
    // Above split is unreliable across variants; fallback to scanning sections.

    const sections = rawStr.split(/\*{2,}\s*S\s*E\s*A\s*T\s*S\s+N\s*O\s*T\s+\s*A\s*V\s*A\s*I\s*L\s*A\s*B\s*L\s*E\s*\*{2,}/i);
    // sections[0] is header; subsequent contain per-flight details
    sections.slice(1).forEach((sec) => {
      const carrier = sec.match(/Carrier Code:\s*([A-Z0-9]{2})/i)?.[1] || null;
      const flightNumber = sec.match(/Flight Number:\s*([0-9]{1,4})/i)?.[1] || null;
      const origin = sec.match(/Origin:\s*([A-Z]{3})/i)?.[1] || null;
      const destination = sec.match(/Destination:\s*([A-Z]{3})/i)?.[1] || null;
      const flightDate = sec.match(/Flight Date:\s*([0-9]{1,2}[A-Z]{3})/i)?.[1] || null;
      const fareClass = sec.match(/Fare Class:\s*([A-Z])/i)?.[1] || null;
      const seatsAvailable = sec.match(/Seats Available:\s*([0-9]+)/i)?.[1] || null;
      const seatsRequested = sec.match(/Seats Requested:\s*([0-9]+)/i)?.[1] || null;
      const fareAmount = sec.match(/Fare Amount:\s*([0-9]+(?:\.[0-9]+)?)/i)?.[1] || null;
      const fareBasisCode = sec.match(/Fare Basis Code:\s*([A-Z0-9]+)/i)?.[1] || null;
      const logicalFlightId = sec.match(/Logical Flight ID:\s*([0-9]+)/i)?.[1] || null;
      const currencyCode = sec.match(/Currency Code:\s*([A-Z]{3})/i)?.[1] || null;
      const directionalOrigin = sec.match(/Directional Origin:\s*([A-Z]{3})/i)?.[1] || null;

      // Only add if it looks like a real flight block
      if (carrier && (flightNumber || origin || destination)) {
        info.flights.push({
          carrier,
          flightNumber,
          origin,
          destination,
          flightDate,
          fareClass,
          seatsAvailable: seatsAvailable ? Number(seatsAvailable) : null,
          seatsRequested: seatsRequested ? Number(seatsRequested) : null,
          fareAmount: fareAmount ? Number(fareAmount) : null,
          fareBasisCode,
          logicalFlightId,
          currencyCode,
          directionalOrigin,
        });
      }
    });

    // De-dupe same carrier/flight/date blocks
    const seen = new Set();
    info.flights = info.flights.filter((f) => {
      const k = `${f.carrier}-${f.flightNumber}-${f.flightDate}-${f.origin}-${f.destination}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });

    if (!info.reason && !info.flights.length) return null;
    return info;
  };

  out.seatAvailability = parseSeatAvailability();

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
  // Segment parsing (line-based, supports codeshare like FZ1263M/EK2474B24JAN)
  // Examples:
  //   FZ641L02APR DXBADD HK1/0035 0350
  //   FZ1263M/EK2474B24JAN DXBVNO CH1
  //   FZ010W24JAN DOHDXB DK5/19002110 .1.
  //   FZ010W24JAN DOHDXB HK4.4.
  let m;
  const segLineRe =
    /^([A-Z0-9]{2})(\d{1,4})([A-Z])(?:\/([A-Z0-9]{2})(\d{1,4})([A-Z]))?(\d{2}[A-Z]{3})\s+([A-Z]{3})([A-Z]{3})\s+([A-Z]{2})(\d)(?:\.(\d)\.)?(.*)$/;
  lines.forEach((line) => {
    const s = line.trim();
    const mm = s.match(segLineRe);
    if (!mm) return;

    const status = `${mm[10]}${mm[11]}`;
    const shareQty = mm[12] ? Number(mm[12]) : null;
    const rest = (mm[13] || "").trim();

    // Time patterns usually appear after status: /1735 2240 or /1955 0125/1
    const t = rest.match(/\/(\d{3,4})\s+(\d{3,4})(?:\/(\d))?/);
    const depTime = t ? t[1] : null;
    const arrTime = t ? t[2] : null;
    const dayOffset = t && t[3] ? Number(t[3]) : null;

    // Some DK lines carry vendor timestamps like /19002110 and sometimes .1. segment markers.
    const vendorStamp = rest.match(/\/(\d{6,8})/)?.[1] || null;

    out.segments.push({
      marketing: {
        carrier: mm[1],
        flight: mm[2],
        bookingClass: mm[3],
      },
      operating: mm[4]
        ? {
            carrier: mm[4],
            flight: mm[5],
            bookingClass: mm[6],
          }
        : null,
      date: mm[7],
      from: mm[8],
      to: mm[9],
      status,
      requestedQty: Number(mm[11]),
      shareQty,
      depTime,
      arrTime,
      dayOffset,
      vendorStamp,
      rawTail: rest || null,
    });
  });

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
