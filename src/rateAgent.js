import { QA_PAIRS, SYNONYMS } from "./rateAgentData.js";
import { calculateExcessBaggageRate, getZoneForAirport, getZoneName, getUpgradeRate, getGoShowFare } from "./excessBaggage.js";
import { getAirportByCode } from "./airportSearch.js";

function parseRouteQuery(qNorm) {
    const codes = (qNorm.match(/\b[a-z]{3}\b/g) || []).map(c => c.toUpperCase());
    if (codes.length >= 2 && codes[0] !== codes[1]) {
        return { origin: codes[0], destination: codes[1] };
    }
    return null;
}

function formatRouteAnswer(origin, destination, fzResult, ekResult, upgradeResult, goShowResult) {
    const oCity = getAirportByCode(origin)?.city || origin;
    const dCity = getAirportByCode(destination)?.city || destination;
    const lines = [];
    lines.push(`**${origin} (${oCity}) to ${destination} (${dCity})**\n`);

    if (fzResult.error) {
        lines.push(`**FZ excess:** ${fzResult.error}`);
    } else if (fzResult.originZone != null && fzResult.destZone != null) {
        const oz = fzResult.originZone;
        const dz = fzResult.destZone;
        const zoneNames = `${getZoneName(oz)} × ${getZoneName(dz)}`;
        lines.push(`**FZ excess:** Zone ${oz} × Zone ${dz} (${zoneNames}). **${fzResult.rateDescription}**`);
        if (fzResult.indiaNote) lines.push(`\n${fzResult.indiaNote}`);
    }

    if (ekResult) {
        if (ekResult.error) {
            lines.push(`\n**EK/OAL excess:** ${ekResult.error}`);
        } else if (ekResult.originRegion && ekResult.destRegion) {
            let ekLine = `\n**EK/OAL excess:** ${ekResult.originRegion} → ${ekResult.destRegion}. **${ekResult.rateDescription}**`;
            if (ekResult.ratePerPiece != null) ekLine += ` Per piece: ${ekResult.ratePerPiece} ${ekResult.pieceCurrency || 'USD'}.`;
            if (ekResult.referToFSSUP) ekLine += ' Refer to FS/SUP if rate missing.';
            lines.push(ekLine);
        }
    }

    lines.push(`\n**UA/AC** (FZ–UA / FZ–AC interline only): 1st bag $75, 2nd $100, 3+ $200; oversize/overweight $200 each.`);

    if (upgradeResult && !upgradeResult.error) {
        lines.push(`\n**Upgrade from ${origin}:** Zone ${upgradeResult.zone} (at airport, on board, infant – use **Upgrade to Business** tab).`);
    }
    if (goShowResult && (goShowResult.economy != null || goShowResult.business != null)) {
        const parts = [];
        if (goShowResult.economy != null) parts.push(`Economy ${goShowResult.economy} ${goShowResult.currency || ''}`);
        if (goShowResult.business != null) parts.push(`Business ${goShowResult.business} ${goShowResult.currency || ''}`);
        lines.push(`\n**Go-Show from ${origin}:** ${parts.join('; ')}. Use **Go-Show Fares** tab for infant.`);
    }
    if (destination === 'DXB' || destination === 'DWC') {
        lines.push(`\n**Transfer at DXB:** AED 50 + GHA 50.`);
    }
    lines.push(`\n**By currency only:** **Extra Legroom**, **Sports Equipment**, **Reporting Fees** – use their tabs.`);
    lines.push(`\n**All tabs:** Excess Baggage · Go-Show Fares · Sports Equipment · Reporting Fees · Transfer Baggage · Upgrade to Business · Extra Legroom · Reference · Ask Agent. Use the tab that matches your need for exact amounts and currency.`);
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
        const ekResult = calculateExcessBaggageRate(origin, destination, 'EK', null);
        const upgradeResult = getUpgradeRate(origin, 'AED');
        const goShowEco = getGoShowFare(origin, 'ECONOMY', null);
        const goShowBus = getGoShowFare(origin, 'BUSINESS', null);
        const goShowResult = !goShowEco.error && !goShowBus.error
            ? { economy: goShowEco.adult, business: goShowBus.adult, currency: goShowEco.currency }
            : !goShowEco.error ? { economy: goShowEco.adult, business: null, currency: goShowEco.currency } : null;
        const hasFZ = fzResult.originZone != null && fzResult.destZone != null;
        const hasEK = ekResult && (ekResult.originRegion && ekResult.destRegion);
        if (hasFZ || hasEK) {
            return formatRouteAnswer(origin, destination, fzResult, ekResult, upgradeResult, goShowResult);
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
