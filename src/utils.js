export function normalizeText(input) {
  const s = String(input || "");
  return s
    .replace(/\u0000/g, "")
    .replace(/\u0001/g, "\n")
    .replace(/\u0002/g, "\n")
    .replace(/\u0003/g, "\n")
    .replace(/\u0004/g, "\n")
    .replace(/\u001a/g, "\n")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");
}

export function splitLines(input) {
  return normalizeText(input)
    .split("\n")
    .map((l) => l.replace(/[ \t]+$/g, ""))
    .filter((l) => l !== "");
}

export function safeStr(v) {
  if (v === null || v === undefined) return "";
  return String(v);
}

export function upper(s) {
  return safeStr(s).toUpperCase();
}

export function cleanSpaces(s) {
  return safeStr(s).replace(/\s+/g, " ").trim();
}

export function uniq(arr) {
  const out = [];
  const seen = new Set();
  for (const x of arr || []) {
    const k = typeof x === "string" ? x : JSON.stringify(x);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(x);
  }
  return out;
}

export function clamp(n, a, b) {
  const x = Number(n);
  if (Number.isNaN(x)) return a;
  return Math.min(b, Math.max(a, x));
}

export async function loadKnowledgeBase(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return [];
  const json = await res.json();
  if (Array.isArray(json)) return json;
  if (Array.isArray(json.items)) return json.items;
  return [];
}

export function tokenizeForSearch(input) {
  const s = upper(cleanSpaces(input));
  const parts = s.split(/[^A-Z0-9]+/g).filter(Boolean);
  return parts.slice(0, 64);
}

export function fuzzyScore(hay, needle) {
  const h = upper(hay);
  const n = upper(needle);
  if (!n) return 0;
  if (h === n) return 1000;
  if (h.includes(n)) return 700 + Math.min(200, Math.floor((n.length / Math.max(1, h.length)) * 200));
  let score = 0;
  let hi = 0;
  for (let ni = 0; ni < n.length; ni++) {
    const ch = n[ni];
    const idx = h.indexOf(ch, hi);
    if (idx === -1) return 0;
    score += idx === hi ? 12 : 6;
    hi = idx + 1;
  }
  score += Math.min(120, n.length * 4);
  return score;
}

export function pick(obj, keys) {
  const o = {};
  for (const k of keys) if (obj && Object.prototype.hasOwnProperty.call(obj, k)) o[k] = obj[k];
  return o;
}

export function toISODate(dateToken) {
  const m = String(dateToken || "").match(/^(\d{2})([A-Z]{3})$/);
  if (!m) return null;
  const dd = Number(m[1]);
  const mon = m[2];
  const mm = { JAN: 1, FEB: 2, MAR: 3, APR: 4, MAY: 5, JUN: 6, JUL: 7, AUG: 8, SEP: 9, OCT: 10, NOV: 11, DEC: 12 }[mon];
  if (!mm) return null;
  const now = new Date();
  const y = now.getUTCFullYear();
  const d = new Date(Date.UTC(y, mm - 1, dd));
  return d.toISOString().slice(0, 10);
}
