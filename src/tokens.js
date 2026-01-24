import { stripControl } from "./utils.js";

const normalize = (t) => stripControl((t || "")).toUpperCase();

const push = (map, token) => {
  const k = token.trim();
  if (!k) return;
  map.set(k, (map.get(k) || 0) + 1);
};

const addMatches = (map, text, re, pick) => {
  let m;
  while ((m = re.exec(text))) {
    const tok = pick(m);
    if (tok) push(map, tok);
  }
};

export const detectGroups = (tokens) => {
  const g = new Set();
  for (const t of tokens) {
    if (/^UN[HBZT]$/.test(t) || /^(MSG|ORG|TKT|NAD|RFF|DTM|FOP|TVL)$/.test(t)) g.add("EDIFACT");
    if (/^(QP|QK|QD|QQ|HDQ|HDQR|HDQRM|HDQRO)$/.test(t) || /^HDQ[A-Z0-9]{2,6}$/.test(t)) g.add("GDS_HISTORY");
    if (/^SSR$/.test(t) || /^OSI$/.test(t) || /^SSR\s/.test(t) || /^OSI\s/.test(t)) g.add("SSR_OSI");
    if (/^[A-Z]{2}\d$/.test(t)) g.add("STATUS");
    if (/^[A-Z0-9]{2}$/.test(t)) g.add("AIRLINE");
  }
  return Array.from(g);
};

export const detectTokens = (raw) => {
  const text = normalize(raw);
  const map = new Map();

  addMatches(map, text, /\b(UNB|UNH|UNT|UNZ|MSG|ORG|TKT|NAD|RFF|DTM|FOP|TVL)\b/g, (m) => m[1]);
  addMatches(map, text, /\b(TKCREQ|PNR|PNL|IRM|ACK|REJ|ERR|ADL|ADM)\b/g, (m) => m[1]);

  addMatches(map, text, /\b(QP|QK|QD|QQ)\b/g, (m) => m[1]);
  addMatches(map, text, /\b(HDQRO[A-Z0-9]{2,3}|HDQRM[A-Z0-9]{2,3}|HDQR[A-Z0-9]{0,3}|HDQ[A-Z0-9]{0,3})\b/g, (m) => m[1]);

  addMatches(map, text, /\b(SSRDOCS|SSRDOCO|SSRDOCA|SSRCTCE|SSRCTCM|SSRCTCT|SSRINFT|SSRUMNR|SSRWCHR|SSRWCHS|SSRWCHC|SSRMAAS|SSRMEDA|SSROXYG|SSRSEAT|SSREXST|SSRPETC|SSRAVIH|SSRWEAP|SSRSPML|SSRAVML|SSRVGML|SSRKSML|SSRHNML|SSRMOML|SSRCHML|SSRBBML|SSRFPML)\b/g, (m) => `SSR ${m[1].slice(3)}`);
  addMatches(map, text, /\bSSR\s+([A-Z0-9]{4})\b/g, (m) => `SSR ${m[1]}`);
  addMatches(map, text, /\bOSI\s+([A-Z0-9]{2})\b/g, (m) => `OSI ${m[1]}`);
  addMatches(map, text, /\bOSI([A-Z0-9]{2})\b/g, (m) => `OSI ${m[1]}`);

  addMatches(map, text, /\b(HK|HL|HN|LK|UC|UN|NO|RR|KK|NN|PN|RQ|SA)(\d)\b/g, (m) => `${m[1]}${m[2]}`);
  addMatches(map, text, /\b(HK|HL|HN|LK|UC|UN|NO|RR|KK|NN|PN|RQ|SA)\b/g, (m) => m[1]);

  addMatches(map, text, /\b([A-Z0-9]{2})\s*\d{1,4}[A-Z]?\b/g, (m) => m[1]);

  const entries = Array.from(map.entries());
  entries.sort((a, b) => b[1] - a[1] || b[0].length - a[0].length || a[0].localeCompare(b[0]));
  const tokens = entries.map((x) => x[0]);

  return tokens.slice(0, 40);
};
