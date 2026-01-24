import data from "../data.json" assert { type: "json" };
import { buildIndex, search } from "./searchEngine.js";
import { normalize, tokenize } from "./utils.js";
import { parseHistory } from "./historyParser.js";
import { TOKEN_GROUPS, TOKEN_PATTERNS } from "./tokens.js";
import { renderResults, renderDetails, renderDetect, renderExplain, ensureVisible } from "./ui.js";

const els = {
  q: document.getElementById("q"),
  results: document.getElementById("results"),
  stats: document.getElementById("stats"),
  details: document.getElementById("details"),
  history: document.getElementById("history"),
  btnDetect: document.getElementById("btnDetect"),
  btnExplain: document.getElementById("btnExplain"),
  btnClear: document.getElementById("btnClear"),
  detectChips: document.getElementById("detectChips"),
  detectEmpty: document.getElementById("detectEmpty"),
  explainBody: document.getElementById("explainBody"),
  explainEmpty: document.getElementById("explainEmpty")
};

const indexed = buildIndex(data.codes || []);
let current = null;
let results = [];
let activeIndex = 0;

const setActive = (i) => {
  activeIndex = Math.max(0, Math.min(i, results.length - 1));
  const m = results[activeIndex];
  if (!m) return;
  current = m;
  renderDetails(els, m);
  renderResults(
    { ...els, activeId: m._id, onSelect: (idx) => setActive(idx) },
    results.map((x) => ({ ...x, id: x._id }))
  );
  const item = els.results.querySelector(`[data-index="${activeIndex}"]`);
  ensureVisible(item, els.results);
};

const doSearch = (keepActive) => {
  results = search(indexed, els.q.value || "");
  renderResults(
    { ...els, activeId: keepActive && current ? current._id : null, onSelect: (idx) => setActive(idx) },
    results.map((x) => ({ ...x, id: x._id }))
  );
  els.stats.textContent = `${results.length} results`;
  if (!keepActive || !current) setActive(0);
  else {
    const idx = results.findIndex((x) => x._id === current._id);
    setActive(idx >= 0 ? idx : 0);
  }
};

const detectTokens = (text) => {
  const t = normalize(text);
  if (!t) return [];
  const found = [];

  TOKEN_PATTERNS.forEach((p) => {
    const m = t.match(p.rx);
    if (m && m.length) m.forEach((x) => found.push(x));
  });

  tokenize(t).forEach((w) => {
    if (/^[A-Z]{2,4}$/.test(w)) found.push(w);
    if (/^[A-Z]{2}\d+$/.test(w)) found.push(w.replace(/\d+$/, ""));
    if (/^[A-Z0-9]{2}\d{1,4}[A-Z]\d{2}[A-Z]{3}$/.test(w)) found.push("SEGMENT");
  });

  return Array.from(new Set(found)).slice(0, 80);
};

els.q.addEventListener("input", () => doSearch(true));
els.q.addEventListener("keydown", (e) => {
  if (e.key === "ArrowDown") {
    e.preventDefault();
    setActive(activeIndex + 1);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    setActive(activeIndex - 1);
  } else if (e.key === "Enter") {
    e.preventDefault();
    setActive(activeIndex);
  }
});

els.results.addEventListener("keydown", (e) => {
  if (e.key === "ArrowDown") {
    e.preventDefault();
    setActive(activeIndex + 1);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    setActive(activeIndex - 1);
  }
});

els.btnDetect.onclick = () => {
  const tokens = detectTokens(els.history.value);
  renderDetect({ ...els, q: els.q, search: doSearch }, tokens);
};

els.btnExplain.onclick = () => {
  const parsed = parseHistory(els.history.value);
  renderExplain(els, parsed);
};

els.btnClear.onclick = () => {
  els.history.value = "";
  renderDetect({ ...els, q: els.q, search: doSearch }, []);
  renderExplain(els, null);
};

doSearch(false);
