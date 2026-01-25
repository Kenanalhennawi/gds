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
        if(els.status) els.status.textContent = "Ready for input";
        return;
    }

    try {
        const events = parseLog(raw);
        renderTimeline(els.timeline, events);
        
        if (els.status) {
            els.status.textContent = events.length > 0 
                ? `Analyzed ${events.length} event blocks` 
                : "No valid data found";
        }
    } catch (e) {
        console.error(e);
        if(els.status) els.status.textContent = "Error parsing data";
    }
};

if (els.btnParse) {
    els.btnParse.addEventListener("click", processInput);
}

if (els.clear) {
    els.clear.addEventListener("click", () => {
        if(els.input) {
            els.input.value = "";
            processInput();
            els.input.focus();
        }
    });
}

// Also parse on paste for convenience
if (els.input) {
    els.input.addEventListener("paste", () => {
        setTimeout(processInput, 100);
    });
}
