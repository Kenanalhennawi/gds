import { normalize } from "./utils.js";

const scoreText = (hay, needle) => {
  if (!needle) return 0;
  if (!hay) return -Infinity;
  if (hay === needle) return 1000;
  if (hay.startsWith(needle)) return 400;
  const idx = hay.indexOf(needle);
  if (idx >= 0) return 200 - Math.min(idx, 50);
  let s = 0;
  for (let i = 0; i < needle.length; i++) if (hay.includes(needle[i])) s += 2;
  return s;
};

export const buildIndex = (codes) => {
  const items = (codes || []).map((c, i) => {
    const blob = normalize(
      [c.code, c.title, c.meaning, c.trigger, c.direction, c.category, c.standard].filter(Boolean).join(" ")
    ).toLowerCase();
    return { ...c, _id: i + 1, _blob: blob, _code: String(c.code || "").toLowerCase() };
  });
  return items;
};

export const search = (indexed, query) => {
  const q = normalize(query).toLowerCase();
  const parts = q ? q.split(/\s+/).filter(Boolean) : [];
  const scored = indexed
    .map((m) => {
      if (!q) return { m, s: 0 };
      let s = 0;
      s += scoreText(m._code, q);
      parts.forEach((p) => (s += scoreText(m._blob, p)));
      return { m, s };
    })
    .filter((x) => !q || x.s > 0)
    .sort((a, b) => b.s - a.s || a.m._id - b.m._id)
    .map((x) => ({ ...x.m, _score: x.s }));
  return scored;
};
