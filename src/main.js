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
        renderTimeline(els.timeline, []);
        if (els.status) els.status.textContent = "Ready";
        return;
    }

    try {
        const result = parseLog(raw);
        renderTimeline(els.timeline, result);
        
        // FIXED: Check if result is an array (old parser) or object (new parser) to avoid crashes
        const count = Array.isArray(result) ? result.length : (result.events ? result.events.length : 0);
        
        if (els.status) els.status.textContent = `Analyzed ${count} blocks`;
    } catch (e) {
        console.error(e);
        if (els.status) els.status.textContent = "Error parsing log";
    }
};

if (els.btnParse) els.btnParse.addEventListener("click", processInput);
if (els.clear) els.clear.addEventListener("click", () => { els.input.value = ""; processInput(); });
if (els.input) els.input.addEventListener("paste", () => setTimeout(processInput, 100));

processInput();
