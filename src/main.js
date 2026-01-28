import { parseLog } from "./parser.js";
import { renderTimeline } from "./ui.js";
import { analyzeBookingChanges } from "./analyzer.js";
import { renderExcessBaggageCalculator } from "./excessBaggageUI.js";

const els = {
    input: document.getElementById("gdsInput"),
    timeline: document.getElementById("timeline"),
    status: document.getElementById("inputStatus"),
    clear: document.getElementById("btnClear"),
    outputHint: document.getElementById("outputHint"),
    loadingBar: document.getElementById("loadingBar"),
    tabDecoder: document.getElementById("tabDecoder"),
    tabExcessBaggage: document.getElementById("tabExcessBaggage"),
    decoderSection: document.getElementById("decoderSection"),
    decoderOutput: document.getElementById("decoderOutput"),
    excessBaggageSection: document.getElementById("excessBaggageSection"),
    excessBaggageContainer: document.getElementById("excessBaggageContainer")
};

// Show loading state
const showLoading = () => {
    if (els.status) {
        els.status.innerHTML = `<span class="status-dot" style="animation:pulse 1.5s infinite;"></span><span>Analyzing...</span>`;
    }
    // Hide hint and show loading bar
    if (els.outputHint) els.outputHint.style.display = "none";
    if (els.loadingBar) {
        els.loadingBar.style.display = "block";
        // Animate progress bar
        const fill = els.loadingBar.querySelector(".loading-bar-fill");
        if (fill) {
            fill.style.width = "0%";
            setTimeout(() => {
                fill.style.width = "30%";
            }, 100);
            setTimeout(() => {
                fill.style.width = "60%";
            }, 300);
            setTimeout(() => {
                fill.style.width = "90%";
            }, 600);
        }
    }
};

const processInput = () => {
    if (!els.input) return;
    const raw = els.input.value;
    
    if (!raw || !raw.trim()) {
        renderTimeline(els.timeline, []);
        if (els.status) els.status.innerHTML = `<span class="status-dot"></span><span>Ready - Auto-Analyzing</span>`;
        // Show hint and hide loading bar when input is empty
        if (els.outputHint) els.outputHint.style.display = "flex";
        if (els.loadingBar) els.loadingBar.style.display = "none";
        return;
    }

    // Show loading state
    showLoading();

    // Use requestIdleCallback for better performance on heavy operations
    const processHeavy = () => {
        try {
            const events = parseLog(raw);
            
            // Analyze booking changes
            const analysis = analyzeBookingChanges(events);
            
            // Complete loading bar
            if (els.loadingBar) {
                const fill = els.loadingBar.querySelector(".loading-bar-fill");
                if (fill) {
                    fill.style.width = "100%";
                }
            }
            
            // Render with summary and change details
            renderTimeline(els.timeline, {
                events: analysis.events,
                summary: analysis.summary,
                changes: analysis.changes
            });
            
            const count = analysis.events.length;
            const changeCount = analysis.changes.length;
            
            // Hide loading bar and show hint if no events
            setTimeout(() => {
                if (els.loadingBar) els.loadingBar.style.display = "none";
                if (els.outputHint && count === 0) {
                    els.outputHint.style.display = "flex";
                } else if (els.outputHint && count > 0) {
                    els.outputHint.style.display = "none";
                }
            }, 200);
            
            if (els.status) {
                els.status.innerHTML = changeCount > 0 
                    ? `<span class="status-dot" style="background:var(--warning-amber);"></span><span>Analyzed ${count} events, ${changeCount} change(s) detected</span>`
                    : `<span class="status-dot" style="background:var(--success-green);"></span><span>Analyzed ${count} events</span>`;
            }
        } catch (e) {
            // Better error handling without console.error in production
            const errorMessage = e.message || "Unknown error occurred";
            if (els.status) {
                els.status.innerHTML = `<span class="status-dot" style="background:var(--error-red);"></span><span style="color:var(--error-red);">⚠️ Error: ${errorMessage}</span>`;
            }
            // Hide loading bar on error
            if (els.loadingBar) els.loadingBar.style.display = "none";
            if (els.outputHint) els.outputHint.style.display = "flex";
            if (els.timeline) {
                renderTimeline(els.timeline, []);
                els.timeline.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon" style="color:var(--error-red);">⚠️</div>
                        <h3>Parsing Error</h3>
                        <p style="color:var(--text-muted); margin-top:10px;">${errorMessage}</p>
                        <p style="color:var(--text-dim); font-size:12px; margin-top:8px;">Please check your input and try again.</p>
                    </div>`;
            }
        }
    };

    // Use requestIdleCallback if available, otherwise setTimeout
    if (window.requestIdleCallback) {
        requestIdleCallback(processHeavy, { timeout: 1000 });
    } else {
        setTimeout(processHeavy, 0);
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
        
        // Lazy load excess baggage calculator
        if (els.excessBaggageContainer && els.excessBaggageContainer.children.length === 0) {
            // Show loading state
            els.excessBaggageContainer.innerHTML = `
                <div class="empty-state">
                    <div class="loading-spinner"></div>
                    <h3>Loading Calculator...</h3>
                </div>`;
            
            // Load calculator asynchronously
            if (window.requestIdleCallback) {
                requestIdleCallback(() => {
                    renderExcessBaggageCalculator(els.excessBaggageContainer);
                }, { timeout: 500 });
            } else {
                setTimeout(() => {
                    renderExcessBaggageCalculator(els.excessBaggageContainer);
                }, 100);
            }
        }
    });
} else {
    // Silent error handling - tabs will work if elements exist
    if (els.tabDecoder && !els.tabExcessBaggage) {
        // Only show error if one tab exists but not the other (configuration issue)
        if (els.status) {
            els.status.textContent = "⚠️ Navigation configuration issue";
        }
    }
}

processInput();
