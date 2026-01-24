export const TOKEN_GROUPS = [
  {
    id: "envelopes",
    patterns: [/\bQP\b/g, /\bQK\b/g, /\bQD\b/g, /\bHDQRM[A-Z0-9]{0,6}\b/g],
  },
  {
    id: "actions",
    patterns: [/\bAKA\b/g, /\bTRL\b/g, /\bNAR\b/g, /\bDVD\b/g, /\bASC\b/g, /\bNCO\b/g],
  },
  {
    id: "segmentStatus",
    patterns: [/\b(HK|HL|HN|LK|UC|UN|NO|RR|DK|CS|CH|TK|HX|XX)\d+\b/g],
  },
  {
    id: "ssr",
    patterns: [/\bSSR\s+[A-Z0-9]{3,5}\b/g],
  },
  {
    id: "osi",
    patterns: [/\bOSI\s+[A-Z0-9]{2}\b/g],
  },
  {
    id: "edifact",
    patterns: [/\bUNB\b/g, /\bUNH\b/g, /\bUNT\b/g, /\bUNZ\b/g],
  },
  {
    id: "diagnostics",
    patterns: [/SEATS\s+NOT\s+AVAILABLE/gi, /\bNOSHO\b/gi, /\bXLD\b/gi],
  },
];

export const detectTokens = (text) => {
  const found = new Set();
  TOKEN_GROUPS.forEach((g) => {
    g.patterns.forEach((p) => {
      const m = text.match(p);
      if (m) m.forEach((x) => found.add(x.replace(/\d+$/, "")));
    });
  });
  return Array.from(found);
};

export const pickBestCandidate = (raw, helpers) => {
  const term = raw.toUpperCase();
  if (helpers.existsCode(term)) return { term, item: helpers.bestItemForTerm(term) };
  return { term, item: helpers.bestItemForTerm(term) };
};
