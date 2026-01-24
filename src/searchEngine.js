import { cleanSpaces, fuzzyScore, tokenizeForSearch, upper } from "./utils.js";

export function createSearchEngine(kb) {
  const items = Array.isArray(kb) ? kb : [];

  const indexed = items.map((it, i) => {
    const code = upper(it.code || it.id || "");
    const title = cleanSpaces(it.title || it.meaning || it.name || "");
    const body = cleanSpaces([it.meaning, it.description, it.trigger, it.notes, it.standard, it.category, it.example].filter(Boolean).join(" "));
    const blob = upper([code, title, body].join(" "));
    return { i, it, code, title, body, blob };
  });

  function search(q, limit = 10) {
    const query = cleanSpaces(q);
    if (!query) return [];
    const toks = tokenizeForSearch(query);

    const scored = [];
    for (const row of indexed) {
      let s = 0;
      s += fuzzyScore(row.code, query) * 2.2;
      s += fuzzyScore(row.title, query) * 1.6;
      s += fuzzyScore(row.body, query) * 1.0;

      for (const t of toks) {
        if (!t) continue;
        if (row.blob.includes(t)) s += Math.min(90, 30 + t.length * 2);
      }
      if (s > 0) scored.push({ score: s, item: row.it });
    }

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, Math.max(1, Math.min(50, limit)));
  }

  return { search };
}
