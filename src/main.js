import { parseLog } from "./parser.js";
import { renderTimeline } from "./ui.js";
import { analyzeBookingChanges } from "./analyzer.js";
import { renderExcessBaggageCalculator } from "./excessBaggageUI.js";
import { detectSystem, getKnownSystems } from "./systemDetector.js";

if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
}

const els = {
    input: document.getElementById("gdsInput"),
    timeline: document.getElementById("timeline"),
    status: document.getElementById("inputStatus"),
    clear: document.getElementById("btnClear"),
    outputHint: document.getElementById("outputHint"),
    loadingBar: document.getElementById("loadingBar"),
    detectedSystemPill: document.getElementById("detectedSystemPill"),
    detectedConfidencePill: document.getElementById("detectedConfidencePill"),
    systemsList: document.getElementById("systemsList"),
    tabDecoder: document.getElementById("tabDecoder"),
    tabExcessBaggage: document.getElementById("tabExcessBaggage"),
    decoderSection: document.getElementById("decoderSection"),
    decoderOutput: document.getElementById("decoderOutput"),
    excessBaggageSection: document.getElementById("excessBaggageSection"),
    excessBaggageContainer: document.getElementById("excessBaggageContainer")
};

const showLoading = () => {
    if (els.status) {
        els.status.innerHTML = `<span class="status-dot" style="animation:pulse 1.5s infinite;"></span><span>Analyzing...</span>`;
    }
    if (els.outputHint) els.outputHint.style.display = "none";
    if (els.loadingBar) {
        els.loadingBar.style.display = "block";
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
        if (els.outputHint) els.outputHint.style.display = "flex";
        if (els.loadingBar) els.loadingBar.style.display = "none";
        if (els.detectedSystemPill) {
            els.detectedSystemPill.textContent = "Unknown / Generic";
            els.detectedSystemPill.className = "system-pill system-unknown";
        }
        if (els.detectedConfidencePill) {
            els.detectedConfidencePill.textContent = "low confidence";
            els.detectedConfidencePill.className = "confidence-pill confidence-low";
        }
        return;
    }

    showLoading();

    const processHeavy = () => {
        try {
            const systemDetection = detectSystem(raw);
            if (els.detectedSystemPill) {
                els.detectedSystemPill.textContent = systemDetection.label;
                els.detectedSystemPill.className = `system-pill system-${systemDetection.id}`;
            }
            if (els.detectedConfidencePill) {
                els.detectedConfidencePill.textContent = `${systemDetection.confidence} confidence`;
                els.detectedConfidencePill.className = `confidence-pill confidence-${systemDetection.confidence}`;
            }
            
            const events = parseLog(raw);
            const analysis = analyzeBookingChanges(events);
            if (els.loadingBar) {
                const fill = els.loadingBar.querySelector(".loading-bar-fill");
                if (fill) {
                    fill.style.width = "100%";
                }
            }
            renderTimeline(els.timeline, {
                events: analysis.events,
                summary: analysis.summary,
                changes: analysis.changes
            });
            
            const count = analysis.events.length;
            const changeCount = analysis.changes.length;
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
            const rawMsg = e.message || "Unknown error occurred";
            const errorMessage = String(rawMsg)
                .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
            if (els.status) {
                els.status.innerHTML = `<span class="status-dot" style="background:var(--error-red);"></span><span style="color:var(--error-red);">⚠️ Error: ${errorMessage}</span>`;
            }
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

    if (window.requestIdleCallback) {
        requestIdleCallback(processHeavy, { timeout: 1000 });
    } else {
        setTimeout(processHeavy, 0);
    }
};

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

if (els.tabDecoder && els.tabExcessBaggage) {
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
        if (els.excessBaggageContainer && els.excessBaggageContainer.children.length === 0) {
            els.excessBaggageContainer.innerHTML = `
                <div class="empty-state">
                    <div class="loading-spinner"></div>
                    <h3>Loading Calculator...</h3>
                </div>`;
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
    if (els.tabDecoder && !els.tabExcessBaggage) {
        if (els.status) {
            els.status.textContent = "⚠️ Navigation configuration issue";
        }
    }
}

if (els.systemsList) {
    const systems = getKnownSystems();
    const systemsText = systems.map(s => s.label).join(", ");
    els.systemsList.textContent = systemsText;
}

processInput();
