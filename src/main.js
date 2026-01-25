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
        renderTimeline(els.timeline, { events: [], summary: null }); // Pass empty structure
        if(els.status) els.status.textContent = "Ready for input";
        return;
    }

    try {
        // Now returns { events, summary }
        const result = parseLog(raw); 
        renderTimeline(els.timeline, result);
        
        if (els.status) {
            els.status.textContent = result.events.length > 0 
                ? `Analyzed ${result.events.length} blocks | ${result.summary.status}` 
                : "No valid data found";
        }
    } catch (e) {
        console.error(e);
        if(els.status) els.status.textContent = "Error parsing data";
    }
};

if (els.btnParse) els.btnParse.addEventListener("click", processInput);

if (els.clear) {
    els.clear.addEventListener("click", () => {
        if(els.input) {
            els.input.value = "";
            processInput();
            els.input.focus();
        }
    });
}

if (els.input) {
    els.input.addEventListener("paste", () => {
        setTimeout(processInput, 100);
    });
}

processInput();
