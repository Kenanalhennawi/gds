import { QA_PAIRS, SYNONYMS } from "./rateAgentData.js";

function normalizeQuery(q) {
    let normalized = q.toLowerCase().trim();
    normalized = normalized.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ');
    const words = normalized.split(' ');
    const expanded = new Set(words);
    for (const word of words) {
        for (const [key, equivalents] of Object.entries(SYNONYMS)) {
            if (equivalents.some(eq => word.includes(eq) || eq.includes(word))) {
                equivalents.forEach(eq => expanded.add(eq));
            }
        }
    }
    return normalized + ' ' + [...expanded].join(' ');
}

export function answerAgentQuestion(query) {
    const raw = (query || '').trim();
    if (!raw) {
        return "Please type a question (e.g. interline rates, excess baggage EK, Larnaca Malta, upgrade, disclaimer).";
    }

    const q = raw.toLowerCase();
    const qExpanded = normalizeQuery(q);

    let bestMatch = null;
    let bestScore = 0;

    for (const pair of QA_PAIRS) {
        let score = 0;
        for (const kw of pair.keywords) {
            if (qExpanded.includes(kw) || q.includes(kw)) {
                score += kw.length;
                if (q.includes(kw)) score += 2;
            }
        }
        if (score > bestScore) {
            bestScore = score;
            bestMatch = pair;
        }
    }

    if (bestMatch && bestScore > 0) {
        return bestMatch.answer;
    }

    return `I didn't find a direct answer for that. Here's useful information:\n\n**Interline:** FZ–EK and FZ–OAL use EK rates; FZ–AC uses AC rates; FZ–UA uses UA rates.\n\n**Rates:** Use the tabs above to calculate exact rates (Excess Baggage, Upgrade, Go-Show, Extra Legroom, Sports, Reporting, Transfer).\n\n**Try asking about:** "what is excess baggage", "how do I get upgrade rate", "interline", "excess baggage EK", "Larnaca Malta", "upgrade from Kuwait", "disclaimer", "India", "Saudi", "UA AC rates", "per piece", "75 100 200", "document version", "which tab", or just "baggage", "upgrade", "emirates".\n\nOpen the **Reference** tab for full interline rules, regional classification, and document details.`;
}
