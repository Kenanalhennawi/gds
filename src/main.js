import { parseLog } from "./parser.js";
import { renderTimeline } from "./ui.js";

const els = {
    input: document.getElementById("gdsInput"),
    timeline: document.getElementById("timeline"),
    status: document.getElementById("inputStatus"),
    clear: document.getElementById("btnClear")
};

const processInput = () => {
    const raw = els.input.value;
    if (!raw.trim()) {
        renderTimeline(els.timeline, []);
        els.status.textContent = "Waiting for input...";
        return;
    }

    const events = parseLog(raw);
    renderTimeline(els.timeline, events);
    els.status.textContent = `Analyzed ${events.length} event blocks`;
};

els.input.addEventListener("input", processInput);
els.clear.addEventListener("click", () => {
    els.input.value = "";
    processInput();
});

processInput();
