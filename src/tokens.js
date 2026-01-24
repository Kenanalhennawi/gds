import { uniq } from "./utils.js";

/**
 * Detect tokens to show as clickable chips when user pastes a block.
 */
export const detectTokens = (text) => {
  const t = [];
  const add = (x) => {
    if (x && !t.includes(x)) t.push(x);
  };
  const up = (text || "").toString();
  (up.match(/\bUNB\b|\bUNH\b|\bUNT\b|\bUNZ\b|\bORG\b|\bTKT\b|\bMSG\b/g) || []).forEach(add);
  (up.match(/\b[A-Z]{3,6}REQ\b/g) || []).forEach(add);
  (up.match(/\bTKCREQ\b/g) || []).forEach(add);
  (up.match(/\bSSR\s+[A-Z]{3,4}\b/g) || []).forEach(add);
  (up.match(/\bOSI\b/g) || []).forEach(add);
  (up.match(/\bNUC\b|\bROE\b|\bXT\b/g) || []).forEach(add);
  (up.match(/\bHK\d\b|\bHL\d\b|\bUC\d\b|\bUN\d\b|\bNO\d\b|\bTK\d\b|\bLK\d\b|\bRR\d\b|\bRQ\d\b/g) || []).forEach(add);
  (up.match(/\bHD[A-Z]{2,6}[A-Z0-9]{0,2}\b/g) || []).forEach(add);
  return t;
};

export const extractCandidates = (token) => {
  const t = (token || "").toString().trim();
  if (!t) return [];
  const up = t.toUpperCase();
  const c = [];

  const add = (x) => {
    const v = (x || "").toString().trim().toUpperCase();
    if (v && !c.includes(v)) c.push(v);
  };

  add(up);

  const ssr = up.match(/\bSSR\s+([A-Z]{3,4})\b/);
  if (ssr) add(`SSR ${ssr[1]}`);

  const hd = up.match(/\bHD[A-Z]{2,6}[A-Z0-9]{0,2}\b/);
  if (hd) add(hd[0]);

  (up.match(/\bUNB\b|\bUNH\b|\bUNT\b|\bUNZ\b|\bORG\b|\bTKT\b|\bMSG\b/g) || []).forEach(add);
  (up.match(/\b[A-Z]{3,6}REQ\b/g) || []).forEach(add);
  (up.match(/\bTKCREQ\b/g) || []).forEach(add);
  (up.match(/\bNUC\b|\bROE\b|\bXT\b/g) || []).forEach(add);

  const status = up.match(/\b(HK|HL|UC|UN|NO|TK|RR|RQ|LK)(\d)\b/);
  if (status) add(`${status[1]}${status[2]}`);

  const seg = up.match(
    /\b([A-Z0-9]{2})(\d{1,4})([A-Z])(\d{2}[A-Z]{3})\s+([A-Z]{3})([A-Z]{3})\s+([A-Z]{2}\d)\b/
  );
  if (seg) {
    add(seg[7]);
    add(seg[1]);
    add(`${seg[1]}${seg[2]}`);
  }

  const tkt = up.match(/\b(0[0-9]{9,13})\b/);
  if (tkt) add(tkt[1]);

  const words = up.match(/\b[A-Z0-9]{2,12}\b/g) || [];
  words.slice(0, 14).forEach(add);

  return c;
};

export const pickBestCandidate = (rawToken, { existsCode, bestItemForTerm }) => {
  const candidates = extractCandidates(rawToken);
  let best = null;

  for (const cand of candidates) {
    const r = bestItemForTerm(cand);
    if (r && (!best || r.score > best.score)) best = { term: cand, item: r.item, score: r.score };
  }

  if (best) return best;

  const fallback = candidates.find((x) => existsCode(x)) || candidates[0] || rawToken;
  return { term: fallback, item: null, score: 0 };
};
