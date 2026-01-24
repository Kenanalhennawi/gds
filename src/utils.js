export const n = (s) => (s || "").toString().toLowerCase();

export const esc = (s) =>
  (s || "")
    .toString()
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

export const escAttr = (s) =>
  (s || "")
    .toString()
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

export const uniq = (arr) => [...new Set(arr || [])];

export const wrapToken = (token) =>
  `<code data-token="${escAttr(token)}">${esc(token)}</code>`;
