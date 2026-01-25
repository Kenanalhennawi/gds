import { parseLog } from "./parser.js";
import { renderTimeline } from "./ui.js";
import { analyzeBookingChanges } from "./analyzer.js";
import { renderExcessBaggageCalculator } from "./excessBaggageUI.js";

const els = {
    input: document.getElementById("gdsInput"),
    timeline: document.getElementById("timeline"),
    status: document.getElementById("inputStatus"),
    clear: document.getElementById("btnClear"),
    tabDecoder: document.getElementById("tabDecoder"),
    tabExcessBaggage: document.getElementById("tabExcessBaggage"),
    decoderSection: document.getElementById("decoderSection"),
    decoderOutput: document.getElementById("decoderOutput"),
    excessBaggageSection: document.getElementById("excessBaggageSection"),
    excessBaggageContainer: document.getElementById("excessBaggageContainer")
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

// Tab switching
if (els.tabDecoder && els.tabExcessBaggage) {
    // Ensure buttons are clickable
    els.tabDecoder.style.pointerEvents = "auto";
    els.tabDecoder.style.cursor = "pointer";
    els.tabDecoder.style.position = "relative";
    els.tabDecoder.style.zIndex = "10";
    
    els.tabExcessBaggage.style.pointerEvents = "auto";
    els.tabExcessBaggage.style.cursor = "pointer";
    els.tabExcessBaggage.style.position = "relative";
    els.tabExcessBaggage.style.zIndex = "10";
    
    els.tabDecoder.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        els.tabDecoder.classList.add("active");
        els.tabExcessBaggage.classList.remove("active");
        
        if (els.decoderSection) els.decoderSection.style.display = "block";
        if (els.decoderOutput) els.decoderOutput.style.display = "block";
        if (els.excessBaggageSection) els.excessBaggageSection.style.display = "none";
    });
    
    els.tabExcessBaggage.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        els.tabExcessBaggage.classList.add("active");
        els.tabDecoder.classList.remove("active");
        
        if (els.decoderSection) els.decoderSection.style.display = "none";
        if (els.decoderOutput) els.decoderOutput.style.display = "none";
        if (els.excessBaggageSection) els.excessBaggageSection.style.display = "block";
        
        // Hide hero section when excess baggage is active
        
        // Initialize excess baggage calculator if not already done
        if (els.excessBaggageContainer && els.excessBaggageContainer.children.length === 0) {
            renderExcessBaggageCalculator(els.excessBaggageContainer);
        }
    });
} else {
    console.error("Tab elements not found:", { 
        tabDecoder: !!els.tabDecoder, 
        tabExcessBaggage: !!els.tabExcessBaggage 
    });
}

processInput();
