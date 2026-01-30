import { QA_PAIRS, SYNONYMS } from "./rateAgentData.js";
import { calculateExcessBaggageRate, getZoneForAirport, getZoneName, getUpgradeRate } from "./excessBaggage.js";
import { getAirportByCode } from "./airportSearch.js";

function parseRouteQuery(qNorm) {
    const codes = (qNorm.match(/\b[a-z]{3}\b/g) || []).map(c => c.toUpperCase());
    if (codes.length >= 2 && codes[0] !== codes[1]) {
        return { origin: codes[0], destination: codes[1] };
    }
    return null;
}

function formatRouteAnswer(origin, destination, fzResult, upgradeResult) {
    const oCity = getAirportByCode(origin)?.city || origin;
    const dCity = getAirportByCode(destination)?.city || destination;
    const lines = [];
    lines.push(`**${origin} (${oCity}) to ${destination} (${dCity})**\n`);
    if (fzResult.error) {
        lines.push(`FZ excess: ${fzResult.error}`);
    } else {
        const oz = fzResult.originZone;
        const dz = fzResult.destZone;
        const zoneNames = `${getZoneName(oz)} × ${getZoneName(dz)}`;
        lines.push(`**FZ excess:** Zone ${oz} × Zone ${dz} (${zoneNames}). **${fzResult.rateDescription}**`);
        if (fzResult.indiaNote) lines.push(`\n${fzResult.indiaNote}`);
    }
    if (upgradeResult && !upgradeResult.error) {
        lines.push(`\n**Upgrade from ${origin}:** Zone ${upgradeResult.zone} (use **Upgrade to Business** tab for rate).`);
    }
    if (destination === 'DXB' || destination === 'DWC') {
        lines.push(`\n**Transfer at DXB:** AED 50 + GHA 50.`);
    }
    lines.push(`\nUse **Excess Baggage** tab (origin ${origin}, destination ${destination}) for exact rate in your currency.`);
    return lines.join('');
}

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
    const qNorm = q.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
    const route = parseRouteQuery(qNorm);
    if (route) {
        const { origin, destination } = route;
        const fzResult = calculateExcessBaggageRate(origin, destination, 'FZ', null);
        const upgradeResult = getUpgradeRate(origin, 'AED');
        if (fzResult.originZone != null || fzResult.destZone != null || (!fzResult.error && fzResult.ratePerKg != null)) {
            return formatRouteAnswer(origin, destination, fzResult, upgradeResult);
        }
    }

    const qExpanded = normalizeQuery(q);
    const qWords = new Set(qNorm.split(/\s+/).filter(Boolean));
    const qExpandedNorm = qExpanded.replace(/\s+/g, ' ').trim();
    const qExpandedWords = new Set(qExpandedNorm.split(/\s+/).filter(Boolean));

    function queryMatchesKeyword(textNorm, wordsSet, kw) {
        if (kw.includes(' ')) {
            return textNorm.includes(kw);
        }
        return wordsSet.has(kw);
    }

    let bestMatch = null;
    let bestScore = 0;

    for (const pair of QA_PAIRS) {
        let hasMatchInQuery = false;
        let score = 0;
        for (const kw of pair.keywords) {
            if (queryMatchesKeyword(qNorm, qWords, kw)) {
                hasMatchInQuery = true;
                score += kw.length + 2;
            } else if (queryMatchesKeyword(qExpandedNorm, qExpandedWords, kw)) {
                score += kw.length;
            }
        }
        if (hasMatchInQuery && score > bestScore) {
            bestScore = score;
            bestMatch = pair;
        }
    }

    if (!bestMatch) {
        for (const pair of QA_PAIRS) {
            let score = 0;
            for (const kw of pair.keywords) {
                const inExpanded = queryMatchesKeyword(qExpandedNorm, qExpandedWords, kw);
                const inQuery = queryMatchesKeyword(qNorm, qWords, kw);
                if (inExpanded || inQuery) {
                    score += kw.length;
                    if (inQuery) score += 2;
                }
            }
            if (score > bestScore) {
                bestScore = score;
                bestMatch = pair;
            }
        }
    }

    if (bestMatch && bestScore > 0) {
        return bestMatch.answer;
    }

    return `I didn't find a direct answer for that. Here's useful information:\n\n**Interline:** FZ–EK and FZ–OAL use EK rates; FZ–AC uses AC rates; FZ–UA uses UA rates.\n\n**Rates:** Use the tabs above to calculate exact rates (Excess Baggage, Upgrade, Go-Show, Extra Legroom, Sports, Reporting, Transfer).\n\n**Try asking about:** "what is excess baggage", "how do I get upgrade rate", "interline", "excess baggage EK", "Larnaca Malta", "upgrade from Kuwait", "disclaimer", "India", "Saudi", "UA AC rates", "per piece", "75 100 200", "document version", "which tab", or just "baggage", "upgrade", "emirates".\n\nOpen the **Reference** tab for full interline rules, regional classification, and document details.`;
}
