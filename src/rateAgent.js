/**
 * Q&A Agent for Flydubai Rate Calculator
 * Answers questions using reference data (rates, interline, regional classification, etc.)
 */

import { REFERENCE_TEXTS, INTERLINE_JOURNEY_RULES, EXCESS_BAGGAGE_DISCLAIMER } from "./excessBaggage.js";

// Q&A pairs: keywords (lowercase) and answer text
const QA_PAIRS = [
    {
        keywords: ['interline', 'which carrier', 'which rate', 'fz ek', 'fz ac', 'fz ua', 'fz oal', 'whose rate', 'carrier rate'],
        answer: `**Interline – which carrier's rates apply:**\n\n• FZ – EK → EK rates\n• FZ – EK – AC (EK is the Transatlantic carrier) → EK rates\n• FZ – OAL → EK rates\n• FZ – AC (AC is the Transatlantic carrier) → AC rates\n• FZ – UA (UA is the Transatlantic carrier) → UA rates\n\nDocument: GO-SHOW/UPGRADE/EXCESS BAGGAGE RATES Version 2025.112(A) Outstation, Effective 17 May 2025.`
    },
    {
        keywords: ['disclaimer', 'approximate', 'exact rate', 'airport team', 'departure'],
        answer: `**Customer disclaimer:**\n\n${EXCESS_BAGGAGE_DISCLAIMER}\n\nIn case excess baggage rate is missing for a specific destination, please refer to FS/SUP in charge.`
    },
    {
        keywords: ['ek rate', 'emirates rate', 'oal rate', 'per kg', 'per kilogram', 'usd kg', 'buying weight', 'additional weight'],
        answer: `**EK / OAL Excess Baggage (per kg, USD):**\n\n${REFERENCE_TEXTS.EK_OAL_EXCESS}\n\nUse the **Excess Baggage** tab, select airline EK or OAL, and enter origin/destination to get the exact rate for your route.`
    },
    {
        keywords: ['per piece', 'additional piece', 'buying piece', 'cad', 'from africa', 'from americas', 'from canada'],
        answer: `**Buying additional pieces at the airport (USD / CAD):**\n\n• From/to **Africa**: USD 200–250 per piece depending on destination region.\n• From/to **Americas**: USD 100–250 per piece.\n• From/to **Canada**: CAD 125–300 per piece.\n\nUse the **Excess Baggage** tab with airline EK or OAL to see per-kg and per-piece rates for your route.`
    },
    {
        keywords: ['larnaca', 'malta', 'lca', 'mla', 'cyprus'],
        answer: `**Larnaca – Malta:**\n\n$15 USD per kilogram for travel between Larnaca (LCA) and Malta (MLA). This exception applies for EK and OAL excess baggage. Use the **Excess Baggage** tab with origin LCA and destination MLA (or vice versa) to see it.`
    },
    {
        keywords: ['ua rate', 'united rate', 'ac rate', 'air canada', 'free allowance', '75', '100', '200', 'oversize', 'overweight'],
        answer: `**United Airlines (UA) / Air Canada (AC) Excess Baggage:**\n\n${REFERENCE_TEXTS.UA_AC_EXCESS}\n\nUse the **Excess Baggage** tab and select airline UA or AC to see the full breakdown.`
    },
    {
        keywords: ['region', 'regional', 'classification', 'middle east', 'south asia', 'africa', 'europe', 'far east', 'anz', 'americas', 'country list', 'which country'],
        answer: `**Regional classification (EK/OAL):**\n\n${REFERENCE_TEXTS.REGIONAL_CLASSIFICATION}\n\nYou can also open the **Reference** tab for the full list.`
    },
    {
        keywords: ['upgrade', 'business class', 'infant upgrade', 'on board upgrade'],
        answer: `**Upgrade to Business Class:**\n\nRates depend on origin zone (1, 2, or 3) and currency. There are also **exception rates** for specific origins (e.g. KWI, BAH, MCT, Saudi, India). Infant upgrade rates are available.\n\nUse the **Upgrade to Business** tab, enter origin airport and currency, then click Calculate to get at-airport and on-board rates (including infant where applicable).`
    },
    {
        keywords: ['extra legroom', 'xlgr', 'legroom', 'airport rate', 'on board rate'],
        answer: `**Extra Legroom (XLGR):**\n\nRates are available in many currencies. There is an **Airport rate** (at check-in) and an **On Board rate** (when purchased on board). Use the **Extra Legroom** tab and select your currency to see both.`
    },
    {
        keywords: ['go-show', 'goshow', 'fare', 'economy', 'business fare'],
        answer: `**Go-Show Fares:**\n\nGo-show fares are available for Economy and Business, by origin airport. Adult and infant fares are shown. Use the **Go-Show Fares** tab, enter origin and class, then click Calculate.`
    },
    {
        keywords: ['sports', 'sport equipment', 'speq', 'spex'],
        answer: `**Sports Equipment:**\n\nRates depend on currency and type: Standard (SPEQ) or Oversized (SPEX). Use the **Sports Equipment** tab to get the rate.`
    },
    {
        keywords: ['reporting', 'late report', 'early report', 'lrtp', 'ertp'],
        answer: `**Late / Early Reporting:**\n\nFees depend on currency and type: Late Reporting (LRTP) or Early Reporting (ERTP). Use the **Reporting Fees** tab to get the rate.`
    },
    {
        keywords: ['transfer', 'transfer baggage', 'dxb', 'outstation'],
        answer: `**Transfer Baggage Fee:**\n\n• At DXB: AED 50 + GHA fee AED 50.\n• Outstation: USD 30 + GHA fee as applicable.\n\nUse the **Transfer Baggage** tab to see details.`
    },
    {
        keywords: ['fs/sup', 'fs sup', 'missing rate', 'rate missing'],
        answer: `If the excess baggage rate is missing for a specific destination, please refer to **FS/SUP in charge**. The rates quoted are approximate; for the exact rate, check with the airport team at the time of departure.`
    },
    {
        keywords: ['hello', 'hi', 'hey', 'help', 'what can you', 'how does'],
        answer: `I'm the Rate Calculator Agent. You can ask me about:\n\n• **Interline** – which carrier's rates apply (FZ–EK, FZ–AC, FZ–UA, FZ–OAL)\n• **Excess baggage** – per kg and per piece (EK, OAL, UA, AC), Larnaca–Malta, regional classification\n• **Disclaimer** – approximate rates, FS/SUP, airport team\n• **Upgrade** – to Business (at airport and on board), infant, exceptions\n• **Extra legroom**, **Go-show fares**, **Sports equipment**, **Reporting**, **Transfer baggage**\n\nType your question above and I’ll answer from the official reference (GO-SHOW/UPGRADE/EXCESS BAGGAGE RATES Version 2025.112(A) Outstation).`
    }
];

/**
 * Answer a question using keyword matching against Q&A pairs and reference texts.
 * @param {string} query - User question (any language)
 * @returns {string} - Answer text (markdown-style for line breaks)
 */
export function answerAgentQuestion(query) {
    const q = (query || '').trim().toLowerCase();
    if (!q) {
        return "Please type a question (e.g. interline rates, excess baggage EK, Larnaca Malta, upgrade, disclaimer).";
    }

    let bestMatch = null;
    let bestScore = 0;

    for (const pair of QA_PAIRS) {
        let score = 0;
        for (const kw of pair.keywords) {
            if (q.includes(kw)) {
                score += kw.length;
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

    return `I didn't find a specific answer for that. Here's general information:\n\n**Interline:** FZ–EK and FZ–OAL use EK rates; FZ–AC uses AC rates; FZ–UA uses UA rates.\n\n**Rates:** Use the tabs above to calculate exact rates (Excess Baggage, Upgrade, Go-Show, Extra Legroom, etc.).\n\n**Reference:** Open the **Reference** tab for full interline rules, regional classification, and document details. You can also try asking about "interline", "excess baggage", "Larnaca Malta", "upgrade", or "disclaimer".`;
}
