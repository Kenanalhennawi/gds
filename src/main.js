import { parseLog } from "./parser.js";
import { renderTimeline } from "./ui.js";

// DOM Elements
const els = {
    input: document.getElementById("gdsInput"),
    timeline: document.getElementById("timeline"),
    status: document.getElementById("inputStatus"),
    clear: document.getElementById("btnClear")
};

// Main Processing Function
const processInput = () => {
    if (!els.input) return; // Safety check

    const raw = els.input.value;
    
    // If empty, show empty state
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
                ? `Analyzed ${events.length} event blocks successfully` 
                : "No structured data detected";
        }
    } catch (e) {
        console.error("Parsing error:", e);
        if(els.status) els.status.textContent = "Error parsing data";
    }
};

// Event Listeners
if (els.input) {
    els.input.addEventListener("input", processInput);
}

if (els.clear) {
    els.clear.addEventListener("click", () => {
        if(els.input) els.input.value = "";
        processInput();
        if(els.input) els.input.focus();
    });
}

// Initial Load
processInput();
