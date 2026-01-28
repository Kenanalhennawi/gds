// Lightweight heuristic detector for common GDS / platforms.
// Many logs don't explicitly identify the system; this returns best-effort guesses.

const SYSTEMS = [
  { id: "amadeus", label: "Amadeus (1A)" },
  { id: "sabre", label: "Sabre (1S)" },
  { id: "travelport", label: "Travelport (1G/1P)" },
  { id: "galileo", label: "Galileo (1G)" },
  { id: "worldspan", label: "Worldspan (1P)" },
  { id: "abacus", label: "Abacus (1B)" },
  { id: "infini", label: "Infini (1F)" },
  { id: "axess", label: "Axess (1J)" },
  { id: "ndc", label: "NDC / Direct Airline" },
  { id: "unknown", label: "Unknown / Generic" },
];

export function getKnownSystems() {
  return SYSTEMS.filter((s) => s.id !== "unknown");
}

const addHit = (hits, id, reason, weight = 1) => {
  const prev = hits.get(id) || { score: 0, reasons: [] };
  prev.score += weight;
  prev.reasons.push(reason);
  hits.set(id, prev);
};

export function detectSystem(rawText) {
  const raw = (rawText || "").toString();
  const text = raw.toUpperCase();
  const hits = new Map();

  // Explicit system/PCC identifiers (strongest)
  if (/\b1A\b/.test(text)) addHit(hits, "amadeus", "Found token '1A'", 4);
  if (/\b1S\b/.test(text)) addHit(hits, "sabre", "Found token '1S'", 4);
  if (/\b1G\b/.test(text)) addHit(hits, "galileo", "Found token '1G'", 4);
  if (/\b1P\b/.test(text)) addHit(hits, "worldspan", "Found token '1P'", 4);
  if (/\b1B\b/.test(text)) addHit(hits, "abacus", "Found token '1B'", 4);
  if (/\b1F\b/.test(text)) addHit(hits, "infini", "Found token '1F'", 4);
  if (/\b1J\b/.test(text)) addHit(hits, "axess", "Found token '1J'", 4);

  // Brand names (medium)
  if (text.includes("AMADEUS")) addHit(hits, "amadeus", "Contains 'AMADEUS'", 2);
  if (text.includes("SABRE")) addHit(hits, "sabre", "Contains 'SABRE'", 2);
  if (text.includes("GALILEO")) addHit(hits, "galileo", "Contains 'GALILEO'", 2);
  if (text.includes("TRAVELPORT")) addHit(hits, "travelport", "Contains 'TRAVELPORT'", 2);
  if (text.includes("WORLDSPAN")) addHit(hits, "worldspan", "Contains 'WORLDSPAN'", 2);
  if (text.includes("ABACUS")) addHit(hits, "abacus", "Contains 'ABACUS'", 2);
  if (text.includes("INFINI")) addHit(hits, "infini", "Contains 'INFINI'", 2);
  if (text.includes("AXESS")) addHit(hits, "axess", "Contains 'AXESS'", 2);

  // Heuristic cues (weak)
  // SWI is used as "switch" routing commonly associated with Galileo/Travelport.
  if (/\bSWI[A-Z0-9]{0,10}\b/.test(text)) {
    addHit(hits, "galileo", "Found 'SWI' switch routing", 1);
    addHit(hits, "travelport", "Found 'SWI' switch routing", 1);
  }

  // NDC/direct cues
  if (text.includes("NDC") || text.includes("ORDERCHANGE") || text.includes("ORDERVIEW")) {
    addHit(hits, "ndc", "Found NDC keyword(s)", 3);
  }

  // Travelport rollup if Galileo/Worldspan present
  if (hits.has("galileo") || hits.has("worldspan")) {
    addHit(hits, "travelport", "Galileo/Worldspan implies Travelport family", 1);
  }

  // Choose best match
  let best = { id: "unknown", label: "Unknown / Generic", confidence: "low", reasons: [] };
  let bestScore = 0;
  for (const [id, info] of hits.entries()) {
    if (info.score > bestScore) {
      bestScore = info.score;
      const sys = SYSTEMS.find((s) => s.id === id) || best;
      best = { id: sys.id, label: sys.label, confidence: "low", reasons: info.reasons };
    }
  }

  if (bestScore >= 6) best.confidence = "high";
  else if (bestScore >= 3) best.confidence = "medium";
  else if (bestScore >= 1) best.confidence = "low";

  return best;
}

