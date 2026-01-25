import { parseLog } from "./parser.js";
import { renderTimeline } from "./ui.js";

const els = {
    input: document.getElementById("gdsInput"),
    timeline: document.getElementById("timeline"),
    status: document.getElementById("inputStatus"),
    clear: document.getElementById("btnClear"),
    btnParse: document.getElementById("btnParse")
};

const processInput = () => {
    if (!els.input) return;
    const raw = els.input.value;
    
    if (!raw || !raw.trim()) {
        renderTimeline(els.timeline, { events: [], summary: null });
        if (els.status) els.status.textContent = "Ready";
        return;
    }

    try {
        const result = parseLog(raw);
        renderTimeline(els.timeline, result);
        if (els.status) els.status.textContent = `Analyzed ${result.events.length} blocks`;
    } catch (e) {
        console.error(e);
        if (els.status) els.status.textContent = "Error parsing log";
    }
};

if (els.btnParse) els.btnParse.addEventListener("click", processInput);
if (els.clear) els.clear.addEventListener("click", () => { els.input.value = ""; processInput(); });
if (els.input) els.input.addEventListener("paste", () => setTimeout(processInput, 100));

processInput();
