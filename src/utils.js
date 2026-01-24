export const esc = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const uniq = (arr) => Array.from(new Set((arr || []).filter(Boolean)));

export const wrapToken = (t) => `<span class="token">${esc(t)}</span>`;

export const normalize = (s) =>
  String(s ?? "")
    .replace(/\u0000/g, "")
    .replace(/\r\n?/g, "\n")
    .trim();

export const tokenize = (text) =>
  normalize(text)
    .split(/[\s]+/)
    .map((x) => x.trim())
    .filter(Boolean);
