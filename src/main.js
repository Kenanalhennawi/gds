import { n } from "./utils.js";
import { detectTokens, pickBestCandidate } from "./tokens.js";
import { parseHistory } from "./historyParser.js";
import { createSearchEngine } from "./searchEngine.js";
import { setTheme, toggleTheme } from "./theme.js";
import { ensureVisible, renderDetect, renderExplain, renderResults, renderDetails } from "./ui.js";

const els = {
  q: document.getElementById("q"),
  results: document.getElementById("results"),
  details: document.getElementById("details"),
  stats: document.getElementById("stats"),
  detectChips: document.getElementById("detectChips"),
  detectEmpty: document.getElementById("detectEmpty"),
  explainBody: document.getElementById("explainBody"),
  explainEmpty: document.getElementById("explainEmpty"),
  chips: [...document.querySelectorAll(".chip")],
  toggleFuzzy: document.getElementById("toggleFuzzy"),
  toggleAutoSelect: document.getElementById("toggleAutoSelect"),
  themeToggle: document.getElementById("themeToggle"),
  themeToggleLabel: document.getElementById("themeToggleLabel"),
  help: document.getElementById("helpModal"),
  btnClear: document.getElementById("btnClear"),
  btnHelp: document.getElementById("btnHelp"),
  btnCloseHelp: document.getElementById("btnCloseHelp"),
  year: document.getElementById("year"),
};

const state = {
  data: [],
  activeStandard: "ALL",
  activeId: null,
  fuzzy: true,
  autoOpen: true,
  currentList: [],
  activeIndex: -1,
};

const engine = createSearchEngine({ getFuzzy: () => state.fuzzy });

const selectIndex = (idx) => {
  if (!state.currentList.length) return;
  const i = Math.max(0, Math.min(state.currentList.length - 1, idx));
  state.activeIndex = i;
  state.activeId = state.currentList[i].id;

  renderDetails({ details: els.details }, state.currentList[i]);
  renderResults(
    {
      results: els.results,
      stats: els.stats,
      activeId: state.activeId,
      onSelect: (index) => selectIndex(index),
    },
    state.currentList
  );

  const el = els.results.querySelector(`.result[data-index="${i}"]`);
  ensureVisible(el, els.results);
};

const search = (fromTokenClick = false) => {
  const text = els.q.value.trim();

  renderDetect({ detectChips: els.detectChips, detectEmpty: els.detectEmpty, q: els.q, search }, detectTokens(text));
  renderExplain({ explainBody: els.explainBody, explainEmpty: els.explainEmpty }, parseHistory(text));

  const term = n(text);
  const list = engine.runSearch({ data: state.data, activeStandard: state.activeStandard, term });

  state.currentList = list;

  if (!state.currentList.length) {
    state.activeId = null;
    state.activeIndex = -1;
    renderResults(
      { results: els.results, stats: els.stats, activeId: state.activeId, onSelect: (index) => selectIndex(index) },
      []
    );
    els.stats.textContent = "0 results";
    return;
  }

  if (state.autoOpen && !fromTokenClick) {
    const keepIndex =
      state.activeIndex >= 0 &&
      state.activeIndex < state.currentList.length &&
      state.activeId === state.currentList[state.activeIndex]?.id;

    if (!keepIndex) selectIndex(0);
    else {
      renderDetails({ details: els.details }, state.currentList[state.activeIndex]);
      renderResults(
        { results: els.results, stats: els.stats, activeId: state.activeId, onSelect: (index) => selectIndex(index) },
        state.currentList
      );
    }
  } else {
    if (state.activeId) {
      const idx = state.currentList.findIndex((x) => x.id === state.activeId);
      state.activeIndex = idx >= 0 ? idx : -1;
    }
    renderResults(
      { results: els.results, stats: els.stats, activeId: state.activeId, onSelect: (index) => selectIndex(index) },
      state.currentList
    );
    if (state.activeIndex >= 0 && state.activeIndex < state.currentList.length)
      renderDetails({ details: els.details }, state.currentList[state.activeIndex]);
  }
};

const openByBestCandidate = (rawToken) => {
  const best = pickBestCandidate(rawToken, {
    existsCode: (code) => engine.existsCode(state.data, code),
    bestItemForTerm: (term) => engine.bestItemForTerm(state.data, term),
  });

  els.q.value = best.term;
  search(true);

  if (best.item) {
    const idx = state.currentList.findIndex((x) => x.id === best.item.id);
    if (idx >= 0) {
      selectIndex(idx);
      els.q.focus();
      els.q.select();
      return;
    }
  }

  if (state.currentList.length) selectIndex(0);
  els.q.focus();
  els.q.select();
};

const resetPanels = () => {
  els.detectChips.innerHTML = "";
  els.detectEmpty.style.display = "block";
  els.explainBody.innerHTML = "";
  els.explainEmpty.style.display = "block";
};

const wireUI = () => {
  els.chips.forEach((c) => {
    c.onclick = () => {
      els.chips.forEach((x) => x.classList.remove("is-active"));
      c.classList.add("is-active");
      state.activeStandard = c.dataset.standard;
      state.activeIndex = -1;
      state.activeId = null;
      search();
    };
  });

  els.btnClear.onclick = () => {
    els.q.value = "";
    resetPanels();
    state.activeId = null;
    state.activeIndex = -1;
    search();
    els.q.focus();
  };

  els.q.addEventListener("input", () => search());

  els.toggleFuzzy.addEventListener("change", () => {
    state.fuzzy = !!els.toggleFuzzy.checked;
    search();
  });

  els.toggleAutoSelect.addEventListener("change", () => {
    state.autoOpen = !!els.toggleAutoSelect.checked;
    search();
  });

  els.year.textContent = new Date().getFullYear();

  els.btnHelp.onclick = () => els.help.showModal();
  els.btnCloseHelp.onclick = () => els.help.close();
  els.themeToggle.onclick = () => toggleTheme({ themeToggleLabel: els.themeToggleLabel });

  document.querySelectorAll(".example-pill").forEach((b) => {
    b.onclick = () => {
      els.q.value = b.dataset.example || "";
      search();
      els.q.focus();
    };
  });

  els.explainBody.addEventListener("click", (e) => {
    const el = e.target?.closest?.("code[data-token]");
    if (!el) return;
    const token = (el.getAttribute("data-token") || "").trim();
    if (!token) return;
    openByBestCandidate(token);
  });

  document.addEventListener("keydown", (e) => {
    const key = e.key;

    if (key === "/" && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const tag = (document.activeElement?.tagName || "").toLowerCase();
      if (tag !== "input" && tag !== "textarea") {
        e.preventDefault();
        els.q.focus();
        els.q.select();
        return;
      }
    }

    if (key === "Escape") {
      if (els.help.open) {
        els.help.close();
        return;
      }
      if (document.activeElement === els.q && els.q.value.trim()) {
        e.preventDefault();
        els.q.value = "";
        search();
        return;
      }
      if (document.activeElement !== els.q) {
        e.preventDefault();
        els.q.focus();
        els.q.select();
        return;
      }
    }

    const tag = (document.activeElement?.tagName || "").toLowerCase();
    const inText = tag === "input" || tag === "textarea";

    if ((key === "ArrowDown" || key === "ArrowUp") && state.currentList.length) {
      e.preventDefault();
      if (state.activeIndex < 0) state.activeIndex = 0;
      const next = key === "ArrowDown" ? state.activeIndex + 1 : state.activeIndex - 1;
      selectIndex(next);
      return;
    }

    if (key === "Enter" && state.currentList.length) {
      if (inText || document.activeElement === els.q) {
        e.preventDefault();
        if (state.activeIndex < 0) state.activeIndex = 0;
        selectIndex(state.activeIndex);
        return;
      }
    }

    if (key === "t" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      toggleTheme({ themeToggleLabel: els.themeToggleLabel });
      return;
    }
  });
};

const loadData = async () => {
  const url = new URL("../data.json", import.meta.url);
  const r = await fetch(url);
  const j = await r.json();

  state.data = (j.messages || []).map((x) => ({
    id: x.id,
    standard: (x.standard || "").toString().toUpperCase(),
    code: (x.code || "").toString().toUpperCase(),
    title: x.title || "",
    meaning: x.meaning || "",
    trigger: x.trigger || "",
    direction: x.direction || "",
    category: x.category || "",
    source: x.source || "",
    examples: x.examples || [],
  }));

  const saved = localStorage.getItem("gdsTheme");
  setTheme({ themeToggleLabel: els.themeToggleLabel }, saved || "dark");

  search();
};

wireUI();
loadData();
