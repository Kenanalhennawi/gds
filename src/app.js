const $ = (sel) => document.querySelector(sel)
const $$ = (sel) => Array.from(document.querySelectorAll(sel))

const state = {
  data: null,
  library: [],
  codeIndex: null,
  standardSet: new Set(),
  categorySet: new Set(),
  lastDetected: []
}

function norm(s) {
  return (s || "").toString().toUpperCase()
}

function escHtml(s) {
  return (s || "").toString()
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;")
}

function uniq(arr) {
  const seen = new Set()
  const out = []
  for (const x of arr) {
    const k = norm(x).trim()
    if (!k) continue
    if (seen.has(k)) continue
    seen.add(k)
    out.push(k)
  }
  return out
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function buildCodeIndex(messages) {
  const entries = []
  const aliasToId = new Map()

  for (const m of messages) {
    const code = (m.code || "").toString().trim()
    if (!code) continue

    const id = (m.id || code).toString()
    const base = {
      id,
      code,
      codeNorm: norm(code).trim(),
      standard: (m.standard || "").toString(),
      category: (m.category || "").toString(),
      title: (m.title || "").toString(),
      meaning: (m.meaning || "").toString(),
      trigger: (m.trigger || "").toString(),
      direction: (m.direction || "").toString(),
      source: (m.source || "").toString(),
      examples: Array.isArray(m.examples) ? m.examples.map(String) : [],
      aliases: Array.isArray(m.aliases) ? m.aliases.map(String) : []
    }

    entries.push(base)

    const allKeys = uniq([base.code, ...base.aliases])
    for (const k of allKeys) {
      if (!aliasToId.has(k)) aliasToId.set(k, id)
    }
  }

  const patterns = []
  const keys = Array.from(aliasToId.keys())
    .sort((a,b) => b.length - a.length)

  for (const key of keys) {
    const id = aliasToId.get(key)
    const isWord = /^[A-Z0-9]+$/.test(key)
    const hasSpace = key.includes(" ")
    let rx

    if (hasSpace) {
      const parts = key.split(/\s+/).filter(Boolean).map(escapeRegExp)
      rx = new RegExp(`(^|[^A-Z0-9])(${parts.join("\\s+")})(?=([^A-Z0-9]|$))`, "g")
    } else if (isWord) {
      rx = new RegExp(`(^|[^A-Z0-9])(${escapeRegExp(key)})(?=([^A-Z0-9]|$))`, "g")
    } else {
      rx = new RegExp(`(${escapeRegExp(key)})`, "g")
    }

    patterns.push({ key, id, rx })
  }

  const byId = new Map()
  for (const e of entries) byId.set(e.id, e)

  return { entries, byId, aliasToId, patterns }
}

function analyzeText(raw) {
  const text = norm(raw || "")
  const lines = (raw || "").toString().split(/\r?\n/)
  const matchesById = new Map()

  for (const p of state.codeIndex.patterns) {
    p.rx.lastIndex = 0
    let count = 0
    while (p.rx.exec(text)) count++
    if (!count) continue

    const id = p.id
    if (!matchesById.has(id)) {
      matchesById.set(id, {
        id,
        keys: new Set(),
        count: 0,
        lineHits: new Set()
      })
    }

    const item = matchesById.get(id)
    item.count += count
    item.keys.add(p.key)

    const keyNorm = p.key
    for (let i = 0; i < lines.length; i++) {
      const ln = norm(lines[i])
      if (!ln) continue
      if (p.key.includes(" ")) {
        const parts = keyNorm.split(/\s+/).filter(Boolean)
        const ok = parts.every(part => ln.includes(part))
        if (ok) item.lineHits.add(i)
      } else {
        if (ln.includes(keyNorm)) item.lineHits.add(i)
      }
    }
  }

  const out = []
  for (const v of matchesById.values()) {
    const meta = state.codeIndex.byId.get(v.id)
    if (!meta) continue
    out.push({
      ...meta,
      count: v.count,
      matchedKeys: Array.from(v.keys),
      lineIdx: Array.from(v.lineHits).sort((a,b)=>a-b),
      lines
    })
  }

  out.sort((a,b) => (b.count - a.count) || (b.code.length - a.code.length) || a.code.localeCompare(b.code))
  return out
}

function renderEmpty(el, text) {
  el.innerHTML = `<div class="empty">${escHtml(text)}</div>`
}

function renderDetected(list) {
  const el = $("#detectedList")
  const hint = $("#detectedHint")
  const showCtx = $("#showContext").checked

  hint.textContent = `${list.length} codes`

  if (!list.length) {
    renderEmpty(el, "No codes detected. Paste text then click Analyze.")
    return
  }

  const filterText = norm($("#filterDetected").value).trim()
  let filtered = list

  if (filterText) {
    filtered = list.filter(x => {
      const blob = norm([x.code, x.title, x.meaning, x.category, x.standard, x.matchedKeys.join(" ")].join(" "))
      return blob.includes(filterText)
    })
  }

  const sortMode = $("#sortDetected").value
  if (sortMode === "alpha") {
    filtered = [...filtered].sort((a,b)=>a.code.localeCompare(b.code))
  } else if (sortMode === "category") {
    filtered = [...filtered].sort((a,b)=>(a.category||"").localeCompare(b.category||"") || a.code.localeCompare(b.code))
  } else {
    filtered = [...filtered].sort((a,b)=>(b.count-a.count) || a.code.localeCompare(b.code))
  }

  if (!filtered.length) {
    renderEmpty(el, "No matches for your filter.")
    return
  }

  el.innerHTML = filtered.map(item => {
    const meta = [
      item.standard ? `<span class="pill">${escHtml(item.standard)}</span>` : "",
      item.category ? `<span class="pill">${escHtml(item.category)}</span>` : "",
      item.direction ? `<span class="pill">${escHtml(item.direction)}</span>` : ""
    ].filter(Boolean).join(" ")

    const matchedKeys = item.matchedKeys && item.matchedKeys.length
      ? `<span class="pill">Matched: ${escHtml(item.matchedKeys.slice(0,6).join(", "))}${item.matchedKeys.length>6?"…":""}</span>`
      : ""

    const ctx = showCtx
      ? renderContextLines(item)
      : ""

    return `
      <div class="item">
        <div class="badge">
          <div class="code">${escHtml(item.code)}</div>
          <div class="count">${item.count} hit${item.count===1?"":"s"}</div>
        </div>
        <div class="content">
          <div class="row1">
            <div class="title">${escHtml(item.title || "")}</div>
            <div class="meta">${meta}${matchedKeys ? " " + matchedKeys : ""}</div>
          </div>
          <div class="desc">${escHtml(item.meaning || "")}</div>
          ${ctx}
        </div>
      </div>
    `
  }).join("")
}

function renderContextLines(item) {
  const idx = item.lineIdx || []
  if (!idx.length) return ""
  const lines = item.lines || []
  const out = []
  const max = 10

  for (let i = 0; i < idx.length && out.length < max; i++) {
    const n = idx[i]
    const s = (lines[n] ?? "").toString()
    if (!s.trim()) continue
    out.push(`<div class="ctxLine">${escHtml(s)}</div>`)
  }

  if (!out.length) return ""

  return `
    <div class="context">
      ${out.join("")}
    </div>
  `
}

function renderLibrary() {
  const el = $("#libraryList")
  const q = norm($("#librarySearch").value).trim()
  const std = ($("#libraryStandard").value || "").trim()
  const cat = ($("#libraryCategory").value || "").trim()

  let list = state.library

  if (std) list = list.filter(x => (x.standard || "") === std)
  if (cat) list = list.filter(x => (x.category || "") === cat)

  if (q) {
    list = list.filter(x => {
      const blob = norm([
        x.code, x.title, x.meaning, x.category, x.standard,
        (x.aliases||[]).join(" "),
        (x.examples||[]).join(" ")
      ].join(" "))
      return blob.includes(q)
    })
  }

  list = [...list].sort((a,b)=>a.code.localeCompare(b.code))

  if (!list.length) {
    renderEmpty(el, "No results.")
    return
  }

  el.innerHTML = list.map(item => {
    const meta = [
      item.standard ? `<span class="pill">${escHtml(item.standard)}</span>` : "",
      item.category ? `<span class="pill">${escHtml(item.category)}</span>` : ""
    ].filter(Boolean).join(" ")

    const alias = Array.isArray(item.aliases) && item.aliases.length
      ? `<div class="desc"><span class="pill">Aliases</span> ${escHtml(item.aliases.join(", "))}</div>`
      : ""

    const ex = Array.isArray(item.examples) && item.examples.length
      ? `<div class="context">${item.examples.slice(0,4).map(x=>`<div class="ctxLine">${escHtml(String(x))}</div>`).join("")}</div>`
      : ""

    return `
      <div class="item">
        <div class="badge">
          <div class="code">${escHtml(item.code)}</div>
          <div class="count">${escHtml(item.id)}</div>
        </div>
        <div class="content">
          <div class="row1">
            <div class="title">${escHtml(item.title || "")}</div>
            <div class="meta">${meta}</div>
          </div>
          <div class="desc">${escHtml(item.meaning || "")}</div>
          ${alias}
          ${ex}
        </div>
      </div>
    `
  }).join("")
}

function bindTabs() {
  $$(".tab").forEach(btn => {
    btn.addEventListener("click", () => {
      $$(".tab").forEach(b => b.classList.remove("active"))
      btn.classList.add("active")
      const tab = btn.getAttribute("data-tab")
      $$(".panel").forEach(p => p.classList.remove("active"))
      $("#tab-" + tab).classList.add("active")
    })
  })
}

function fillSelectOptions() {
  const stdSel = $("#libraryStandard")
  const catSel = $("#libraryCategory")

  const standards = Array.from(state.standardSet).sort((a,b)=>a.localeCompare(b))
  const categories = Array.from(state.categorySet).sort((a,b)=>a.localeCompare(b))

  for (const s of standards) {
    const opt = document.createElement("option")
    opt.value = s
    opt.textContent = s
    stdSel.appendChild(opt)
  }

  for (const c of categories) {
    const opt = document.createElement("option")
    opt.value = c
    opt.textContent = c
    catSel.appendChild(opt)
  }
}

function wireAnalyzer() {
  $("#analyzeBtn").addEventListener("click", () => {
    const raw = $("#inputText").value || ""
    state.lastDetected = analyzeText(raw)
    renderDetected(state.lastDetected)
  })

  $("#clearBtn").addEventListener("click", () => {
    $("#inputText").value = ""
    state.lastDetected = []
    $("#filterDetected").value = ""
    renderDetected([])
  })

  $("#filterDetected").addEventListener("input", () => renderDetected(state.lastDetected))
  $("#sortDetected").addEventListener("change", () => renderDetected(state.lastDetected))
  $("#showContext").addEventListener("change", () => renderDetected(state.lastDetected))
}

function wireLibrary() {
  $("#librarySearch").addEventListener("input", renderLibrary)
  $("#libraryStandard").addEventListener("change", renderLibrary)
  $("#libraryCategory").addEventListener("change", renderLibrary)
}

async function init() {
  bindTabs()

  const res = await fetch("data.json", { cache: "no-store" })
  const data = await res.json()

  state.data = data
  state.library = Array.isArray(data.messages) ? data.messages.map(x => ({
    id: (x.id || "").toString(),
    standard: (x.standard || "").toString(),
    code: (x.code || "").toString(),
    title: (x.title || "").toString(),
    meaning: (x.meaning || "").toString(),
    trigger: (x.trigger || "").toString(),
    direction: (x.direction || "").toString(),
    category: (x.category || "").toString(),
    source: (x.source || "").toString(),
    examples: Array.isArray(x.examples) ? x.examples.map(String) : [],
    aliases: Array.isArray(x.aliases) ? x.aliases.map(String) : []
  })) : []

  for (const m of state.library) {
    if (m.standard) state.standardSet.add(m.standard)
    if (m.category) state.categorySet.add(m.category)
  }

  state.codeIndex = buildCodeIndex(state.library)

  const meta = [
    data.scope ? data.scope : "",
    data.updated ? `Updated ${data.updated}` : "",
    data.version ? `v${data.version}` : ""
  ].filter(Boolean).join(" • ")

  $("#metaLine").textContent = meta || "Ready"
  fillSelectOptions()
  wireAnalyzer()
  wireLibrary()

  renderDetected([])
  renderLibrary()
}

init()
