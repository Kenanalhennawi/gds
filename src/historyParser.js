import { cleanSpaces, splitLines, uniq, upper } from "./utils.js";

function parseEnvelope(line) {
  const m = line.match(/^(QP|QK|QD)\s+([A-Z0-9]+)\s*$/);
  if (!m) return null;
  return { envelope: m[1], family: m[2] };
}

function parseDotHeader(line) {
  const m = line.match(/^\.(\S+)(?:\s+(.+))?$/);
  if (!m) return null;
  const a = m[1];
  const b = cleanSpaces(m[2] || "");
  return { record: a, extra: b || null };
}

function parseHDQLine(line) {
  const m = line.match(/^(HDQ[A-Z0-9]{0,4})\s+(.+)$/);
  if (!m) return null;
  return { key: m[1], value: cleanSpaces(m[2]) };
}

function parsePax(line) {
  const m = line.match(/^\d+([A-Z0-9' -]+)\/([A-Z0-9' -]+)(.*)$/);
  if (!m) return null;
  const last = cleanSpaces(m[1]);
  const first = cleanSpaces(m[2] + cleanSpaces(m[3] || ""));
  const name = cleanSpaces(`${last}/${first}`);
  return { name };
}

function parseSSR(line) {
  const m = line.match(/^SSR\s+([A-Z0-9]{3,4})\s+(.+)$/);
  if (!m) return null;
  const type = m[1];
  const rest = cleanSpaces(m[2]);
  const carrier = (rest.match(/^([A-Z0-9]{2})\b/) || [])[1] || null;
  return { type, carrier, raw: rest, line };
}

function parseOSI(line) {
  const m = line.match(/^OSI\s+(.+)$/);
  if (!m) return null;
  const rest = cleanSpaces(m[1]);
  const carrier = (rest.match(/^([A-Z0-9]{2})\b/) || [])[1] || null;
  return { carrier, raw: rest, line };
}

function parseSegment(line) {
  const s = cleanSpaces(line);

  const cs = s.match(/^([A-Z0-9]{2})(\d{1,4})([A-Z])\/([A-Z0-9]{2})(\d{1,4})([A-Z])(\d{2}[A-Z]{3})\s+([A-Z]{3})([A-Z]{3})\s+([A-Z]{2})(\d+)(.*)$/);
  if (cs) {
    const tail = cleanSpaces(cs[12] || "");
    const extra = parseSegmentTail(tail);
    return {
      marketingCarrier: cs[1],
      marketingFlight: cs[2],
      marketingClass: cs[3],
      operatingCarrier: cs[4],
      operatingFlight: cs[5],
      operatingClass: cs[6],
      date: cs[7],
      from: cs[8],
      to: cs[9],
      status: cs[10],
      qty: Number(cs[11]),
      ...extra,
      raw: s,
      kind: "codeshare",
    };
  }

  const st = s.match(/^([A-Z0-9]{2})(\d{1,4})([A-Z])(\d{2}[A-Z]{3})\s+([A-Z]{3})([A-Z]{3})\s+([A-Z]{2})(\d+)(.*)$/);
  if (st) {
    const tail = cleanSpaces(st[9] || "");
    const extra = parseSegmentTail(tail);
    return {
      carrier: st[1],
      flight: st[2],
      cls: st[3],
      date: st[4],
      from: st[5],
      to: st[6],
      status: st[7],
      qty: Number(st[8]),
      ...extra,
      raw: s,
      kind: "standard",
    };
  }

  return null;
}

function parseSegmentTail(tail) {
  if (!tail) return {};
  const out = { times: null, suffix: null, dayOffset: null };

  const t1 = tail.match(/^\/(\d{3,4})\s+(\d{3,4})(?:\/(\d))?$/);
  if (t1) {
    out.times = { dep: t1[1], arr: t1[2] };
    if (t1[3]) out.dayOffset = Number(t1[3]);
    return out;
  }

  const t2 = tail.match(/^\/(\d{4})(\d{4})(?:\/(\d))?(?:\s+(\.\d+\.)|(\.\d+\.))?$/);
  if (t2) {
    out.times = { dep: t2[1], arr: t2[2] };
    if (t2[3]) out.dayOffset = Number(t2[3]);
    out.suffix = cleanSpaces(t2[4] || t2[5] || "") || null;
    return out;
  }

  const t3 = tail.match(/^\/(\d{4})(\d{4})(?:\/(\d))?\s*(\.\d+\.)?$/);
  if (t3) {
    out.times = { dep: t3[1], arr: t3[2] };
    if (t3[3]) out.dayOffset = Number(t3[3]);
    out.suffix = cleanSpaces(t3[4] || "") || null;
    return out;
  }

  const suf = tail.match(/^(\.\d+\.|\.\d+\.)$/);
  if (suf) {
    out.suffix = suf[1];
    return out;
  }

  return { tail };
}

function isMessageInfoStart(line) {
  return upper(line).includes("M E S S A G E    I N F O R M A T I O N");
}

function parseMessageInfo(lines, startIdx) {
  let i = startIdx;
  const info = {
    reason: null,
    time: null,
    confirmation: null,
    systemCode: null,
    recordLocator: null,
    flights: [],
    raw: [],
  };

  function readKV(l) {
    const m = l.match(/^\s*([A-Za-z ]+):\s*(.+)\s*$/);
    if (!m) return null;
    return { k: cleanSpaces(m[1]), v: cleanSpaces(m[2]) };
  }

  for (; i < lines.length; i++) {
    const l = lines[i];
    info.raw.push(l);
    const up = upper(l);

    const kv = readKV(l);
    if (kv) {
      const k = upper(kv.k);
      if (k === "MESSAGE REASON") info.reason = kv.v;
      else if (k === "MESSAGE TIME") info.time = kv.v;
      else if (k === "CONFIRMATION #") info.confirmation = kv.v;
      else if (k === "SYSTEM CODE") info.systemCode = kv.v;
      else if (k === "RECORD LOCATOR") info.recordLocator = kv.v;
      continue;
    }

    if (up.includes("F L I G H T") && up.includes("I N F O R M A T I O N")) {
      const flight = { carrier: null, flightNumber: null, origin: null, destination: null, flightDate: null, fareClass: null, seatsAvailable: null, seatsRequested: null, fareAmount: null, fareBasis: null, currency: null, logicalFlightId: null, directionalOrigin: null };
      let j = i + 1;
      for (; j < lines.length; j++) {
        const z = lines[j];
        info.raw.push(z);
        const kv2 = readKV(z);
        if (kv2) {
          const k2 = upper(kv2.k);
          if (k2 === "CARRIER CODE") flight.carrier = kv2.v;
          else if (k2 === "FLIGHT NUMBER") flight.flightNumber = kv2.v;
          else if (k2 === "ORIGIN") flight.origin = kv2.v;
          else if (k2 === "DESTINATION") flight.destination = kv2.v;
          else if (k2 === "FLIGHT DATE") flight.flightDate = kv2.v;
          else if (k2 === "FARE CLASS") flight.fareClass = kv2.v;
          else if (k2 === "SEATS AVAILABLE") flight.seatsAvailable = kv2.v;
          else if (k2 === "SEATS REQUESTED") flight.seatsRequested = kv2.v;
          else if (k2 === "FARE AMOUNT") flight.fareAmount = kv2.v;
          else if (k2 === "FARE BASIS CODE") flight.fareBasis = kv2.v;
          else if (k2 === "LOGICAL FLIGHT ID") flight.logicalFlightId = kv2.v;
          else if (k2 === "DIRECTIONAL ORIGIN") flight.directionalOrigin = kv2.v;
          else if (k2 === "CURRENCY CODE") flight.currency = kv2.v;
          continue;
        }
        if (upper(z).includes("*****") && upper(z).includes("S E A T S")) break;
        if (upper(z).includes("A C T U A L") && upper(z).includes("G D S")) break;
      }
      info.flights.push(flight);
      i = j - 1;
      continue;
    }

    if (upper(l).includes("A C T U A L") && upper(l).includes("G D S")) break;
    if (upper(l).startsWith("QK ") || upper(l).startsWith("QP ") || upper(l).startsWith("QD ")) break;
    if (upper(l).startsWith("HDQ")) break;
  }

  return { info, nextIndex: i };
}

export function parseHistory(input) {
  const lines = splitLines(input);
  const messages = [];

  let current = null;

  function pushCurrent() {
    if (!current) return;
    current.pax = uniq(current.pax);
    current.segments = uniq(current.segments);
    current.ssrs = uniq(current.ssrs);
    current.osis = uniq(current.osis);
    current.tokens = uniq(current.tokens);
    current.blocks = uniq(current.blocks);
    current.messageInfos = uniq(current.messageInfos);
    current.raw = current.raw || [];
    messages.push(current);
    current = null;
  }

  function ensureCurrent() {
    if (!current) {
      current = {
        envelope: null,
        family: null,
        record: null,
        recordExtra: null,
        markers: [],
        hdq: [],
        pax: [],
        segments: [],
        ssrs: [],
        osis: [],
        tokens: [],
        blocks: [],
        messageInfos: [],
        raw: [],
      };
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (isMessageInfoStart(line)) {
      ensureCurrent();
      const { info, nextIndex } = parseMessageInfo(lines, i);
      current.messageInfos.push(info);
      i = nextIndex;
      continue;
    }

    const env = parseEnvelope(line);
    if (env) {
      pushCurrent();
      ensureCurrent();
      current.envelope = env.envelope;
      current.family = env.family;
      current.raw.push(line);
      continue;
    }

    const dot = parseDotHeader(line);
    if (dot) {
      ensureCurrent();
      current.record = dot.record;
      current.recordExtra = dot.extra;
      current.raw.push(line);
      continue;
    }

    const hdq = parseHDQLine(line);
    if (hdq) {
      ensureCurrent();
      current.hdq.push(hdq);
      current.raw.push(line);
      continue;
    }

    const pax = parsePax(line);
    if (pax) {
      ensureCurrent();
      current.pax.push(pax);
      current.raw.push(line);
      continue;
    }

    const seg = parseSegment(line);
    if (seg) {
      ensureCurrent();
      current.segments.push(seg);
      current.tokens.push(upper(seg.status));
      current.tokens.push(upper(`${seg.status}${seg.qty}`));
      if (seg.kind === "codeshare") {
        current.tokens.push(upper(seg.marketingCarrier));
        current.tokens.push(upper(seg.operatingCarrier));
      } else {
        current.tokens.push(upper(seg.carrier));
      }
      current.raw.push(line);
      continue;
    }

    const ssr = parseSSR(line);
    if (ssr) {
      ensureCurrent();
      current.ssrs.push(ssr);
      current.tokens.push(upper(`SSR ${ssr.type}`));
      current.tokens.push(upper(ssr.type));
      if (ssr.carrier) current.tokens.push(upper(ssr.carrier));
      current.raw.push(line);
      continue;
    }

    const osi = parseOSI(line);
    if (osi) {
      ensureCurrent();
      current.osis.push(osi);
      current.tokens.push("OSI");
      if (osi.carrier) current.tokens.push(upper(osi.carrier));
      current.raw.push(line);
      continue;
    }

    const marker = line.match(/^(TRL|AKA|NAR|DVD|ASC|NCO)\b/);
    if (marker) {
      ensureCurrent();
      current.markers.push(marker[1]);
      current.tokens.push(marker[1]);
      current.raw.push(line);
      continue;
    }

    const tokenLike = line.match(/\b(HK|UC|UN|TK|XX|HX|DK|CS|CH|SS|LK|RR|RQ)\d+/g);
    if (tokenLike) {
      ensureCurrent();
      for (const t of tokenLike) current.tokens.push(upper(t));
      current.raw.push(line);
      continue;
    }

    if (line) {
      ensureCurrent();
      current.raw.push(line);
    }
  }

  pushCurrent();

  const allTokens = uniq(messages.flatMap((m) => m.tokens || []));
  const allRecords = uniq(messages.map((m) => m.record).filter(Boolean));
  const allPax = uniq(messages.flatMap((m) => (m.pax || []).map((p) => p.name)).filter(Boolean));

  return { messages, tokens: allTokens, records: allRecords, pax: allPax };
}
