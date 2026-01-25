import { parseLog } from "./parser.js";
import { renderTimeline } from "./ui.js";
import { analyzeBookingChanges } from "./analyzer.js";

const els = {
    input: document.getElementById("gdsInput"),
    timeline: document.getElementById("timeline"),
    status: document.getElementById("inputStatus"),
    clear: document.getElementById("btnClear")
};

const processInput = () => {
    if (!els.input) return;
    const raw = els.input.value;
    
    if (!raw || !raw.trim()) {
        renderTimeline(els.timeline, []);
        if (els.status) els.status.textContent = "Ready - Auto-Analyzing";
        return;
    }

    try {
        const events = parseLog(raw);
        
        // Analyze booking changes
        const analysis = analyzeBookingChanges(events);
        
        // Render with summary and change details
        renderTimeline(els.timeline, {
            events: analysis.events,
            summary: analysis.summary,
            changes: analysis.changes
        });
        
        const count = analysis.events.length;
        const changeCount = analysis.changes.length;
        
        if (els.status) {
            els.status.textContent = changeCount > 0 
                ? `Analyzed ${count} events, ${changeCount} change(s) detected`
                : `Analyzed ${count} events`;
        }
    } catch (e) {
        console.error(e);
        if (els.status) els.status.textContent = "Error parsing log";
    }
};

// Auto-analyze on input, paste, or typing
if (els.input) {
    let debounceTimer;
    els.input.addEventListener("input", () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(processInput, 300);
    });
    els.input.addEventListener("paste", () => setTimeout(processInput, 100));
    els.input.addEventListener("keyup", () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(processInput, 500);
    });
}

if (els.clear) els.clear.addEventListener("click", () => { 
    els.input.value = ""; 
    processInput(); 
});

processInput();
