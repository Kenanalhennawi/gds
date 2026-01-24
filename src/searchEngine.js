import { n } from "./utils.js";

export const createSearchEngine = ({ getFuzzy }) => {
  const score = (m, term) => {
    if (!term) return 1;
    const s = n(`${m.code} ${m.title} ${m.meaning} ${m.trigger} ${m.category} ${m.standard}`);
    if (s.includes(term)) return 100;
    if (!getFuzzy()) return 0;
    const parts = term.split(/\s+/).filter(Boolean);
    let hit = 0;
    for (const p of parts) if (s.includes(p)) hit++;
    return hit > 0 ? Math.min(60, hit * 20) : 0;
  };

  const existsCode = (data, code) => {
    const up = (code || "").toString().trim().toUpperCase();
    if (!up) return false;
    return data.some((m) => (m.code || "").toString().toUpperCase() === up);
  };

  const bestItemForTerm = (data, term) => {
    const t = n(term || "").trim();
    if (!t) return null;
    let best = null;
    let bestS = -1;
    for (const m of data) {
      const s = score(m, t);
      if (s > bestS) {
        bestS = s;
        best = m;
        if (bestS >= 100) break;
      }
    }
    if (bestS <= 0) return null;
    return { item: best, score: bestS };
  };

  const runSearch = ({ data, activeStandard, term }) => {
    let list = data;
    if (activeStandard !== "ALL") list = list.filter((m) => m.standard === activeStandard);

    if (term) {
      const scored = list
        .map((m) => ({ m, s: score(m, term) }))
        .filter((x) => x.s > 0)
        .sort((a, b) => b.s - a.s)
        .map((x) => x.m);
      list = scored;
    }

    return list;
  };

  return { score, existsCode, bestItemForTerm, runSearch };
};
