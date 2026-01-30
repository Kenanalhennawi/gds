/**
 * Q&A Agent for Flydubai Rate Calculator
 * Answers questions using reference data (rates, interline, regional classification, etc.)
 * Smarter matching with synonyms and more answers.
 */

import { REFERENCE_TEXTS, EXCESS_BAGGAGE_DISCLAIMER } from "./excessBaggage.js";

// Synonyms: normalize user query for better matching (query word -> list of equivalents)
const SYNONYMS = {
    'ek': ['emirates', 'ek'],
    'emirates': ['ek', 'emirates'],
    'ua': ['united', 'ua', 'united airlines'],
    'united': ['ua', 'united'],
    'ac': ['air canada', 'ac'],
    'oal': ['other airlines', 'oal', 'other'],
    'fz': ['flydubai', 'fz', 'fly dubai'],
    'flydubai': ['fz', 'flydubai'],
    'kg': ['kilogram', 'kilo', 'kg', 'weight'],
    'piece': ['bag', 'piece', 'baggage', 'bags'],
    'rate': ['price', 'rate', 'cost', 'fee', 'charge'],
    'excess': ['extra', 'excess', 'additional', 'overweight'],
    'upgrade': ['upgrade', 'business', 'upgrading'],
    'zone': ['zone', 'zones', 'region', 'regions'],
    'currency': ['currency', 'currencies', 'aed', 'usd', 'money']
};

/** Normalize and expand query with synonyms for better matching */
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

// Q&A pairs: keywords (lowercase) and answer text – expanded set
const QA_PAIRS = [
    {
        keywords: ['interline', 'which carrier', 'which rate', 'fz ek', 'fz ac', 'fz ua', 'fz oal', 'whose rate', 'carrier rate', 'transatlantic', 'apply'],
        answer: `**Interline – which carrier's rates apply:**\n\n• **FZ – EK** → EK rates\n• **FZ – EK – AC** (EK is the Transatlantic carrier) → EK rates\n• **FZ – OAL** → EK rates\n• **FZ – AC** (AC is the Transatlantic carrier) → AC rates\n• **FZ – UA** (UA is the Transatlantic carrier) → UA rates\n\nDocument: GO-SHOW/UPGRADE/EXCESS BAGGAGE RATES Version 2025.112(A) Outstation, Effective 17 May 2025.`
    },
    {
        keywords: ['disclaimer', 'approximate', 'exact rate', 'airport team', 'departure', 'quote', 'quoted'],
        answer: `**Customer disclaimer:**\n\n${EXCESS_BAGGAGE_DISCLAIMER}\n\nIn case excess baggage rate is missing for a specific destination, please refer to **FS/SUP in charge**.`
    },
    {
        keywords: ['ek rate', 'emirates rate', 'oal rate', 'per kg', 'per kilogram', 'usd kg', 'buying weight', 'additional weight', 'emirates baggage', 'ek baggage'],
        answer: `**EK / OAL Excess Baggage (per kg, USD):**\n\n${REFERENCE_TEXTS.EK_OAL_EXCESS}\n\n**Tip:** Use the **Excess Baggage** tab, select airline EK or OAL, and enter origin/destination to get the exact rate for your route.`
    },
    {
        keywords: ['per piece', 'additional piece', 'buying piece', 'cad', 'from africa', 'from americas', 'from canada', 'piece rate', 'per bag'],
        answer: `**Buying additional pieces at the airport (USD / CAD):**\n\n• **From/to Africa:** USD 200 per piece (most routes), USD 250 to Far East / ANZ.\n• **From/to Americas:** USD 100 (Europe/Americas), USD 225–250 (ME/SA, Africa, Far East, ANZ).\n• **From/to Canada (CAD):** CAD 125 (Europe/Americas), CAD 250–300 (ME/SA, Africa, Far East, ANZ).\n\nUse the **Excess Baggage** tab with airline EK or OAL to see per-kg and per-piece for your route.`
    },
    {
        keywords: ['larnaca', 'malta', 'lca', 'mla', 'cyprus malta'],
        answer: `**Larnaca – Malta exception:**\n\n**$15 USD per kilogram** for travel between Larnaca (LCA) and Malta (MLA). This applies for **EK** and **OAL** excess baggage only.\n\nUse the **Excess Baggage** tab with origin LCA and destination MLA (or vice versa) to see it. *$15 per kg for travel between Larnaca and Malta (document Page 4).*`
    },
    {
        keywords: ['ua rate', 'united rate', 'ac rate', 'air canada', 'free allowance', '75', '100', '200', 'oversize', 'overweight', 'united baggage', 'air canada baggage'],
        answer: `**United Airlines (UA) / Air Canada (AC) Excess Baggage:**\n\n${REFERENCE_TEXTS.UA_AC_EXCESS}\n\n**Summary:** Free allowance Economy 0–23 kg, Business 0–32 kg. 1st excess bag $75, 2nd $100, 3 or more $200. Oversize $200, Overweight $200. Use the **Excess Baggage** tab and select UA or AC.`
    },
    {
        keywords: ['region', 'regional', 'classification', 'middle east', 'south asia', 'africa', 'europe', 'far east', 'anz', 'americas', 'country list', 'which country', 'countries'],
        answer: `**Regional classification (EK/OAL):**\n\n${REFERENCE_TEXTS.REGIONAL_CLASSIFICATION}\n\nOpen the **Reference** tab for the full list in one place.`
    },
    {
        keywords: ['upgrade', 'business class', 'infant upgrade', 'on board upgrade', 'upgrade zone', 'zone 1', 'zone 2', 'zone 3'],
        answer: `**Upgrade to Business Class:**\n\nRates depend on **origin zone** (1, 2, or 3) and **currency**. There are **exception rates** for: Kuwait (KWI), Bahrain (BAH), Muscat (MCT), Saudi (all KSA points), India (all India points), Iraq BGW, Israel TLV, Nepal KTM.\n\n**Infant upgrade** rates are available (at airport and on board). Use the **Upgrade to Business** tab, enter origin airport and currency, then click Calculate.`
    },
    {
        keywords: ['extra legroom', 'xlgr', 'legroom', 'airport rate', 'on board rate', 'xlgr rate'],
        answer: `**Extra Legroom (XLGR):**\n\nRates are in many **currencies**. There is an **Airport rate** (at check-in) and an **On Board rate** (when purchased on board). **Currency exchange** to USD is shown where available. Use the **Extra Legroom** tab and select your currency.`
    },
    {
        keywords: ['go-show', 'goshow', 'fare', 'economy', 'business fare', 'go show'],
        answer: `**Go-Show Fares:**\n\nAvailable for **Economy** and **Business**, by **origin airport**. **Adult** and **infant** fares are shown. Use the **Go-Show Fares** tab, enter origin and class (Economy/Business), then click Calculate.`
    },
    {
        keywords: ['sports', 'sport equipment', 'speq', 'spex', 'sport bag'],
        answer: `**Sports Equipment:**\n\nRates depend on **currency** and type: **SPEQ** (Standard) or **SPEX** (Oversized). Use the **Sports Equipment** tab, choose currency and type, then click Calculate.`
    },
    {
        keywords: ['reporting', 'late report', 'early report', 'lrtp', 'ertp', 'late reporting', 'early reporting'],
        answer: `**Late / Early Reporting:**\n\nFees depend on **currency** and type: **LRTP** (Late Reporting) or **ERTP** (Early Reporting). Use the **Reporting Fees** tab to get the rate.`
    },
    {
        keywords: ['transfer', 'transfer baggage', 'dxb', 'outstation', 'trbf'],
        answer: `**Transfer Baggage Fee:**\n\n• **At DXB:** AED 50 + GHA fee AED 50.\n• **Outstation:** USD 30 + GHA fee as applicable.\n\nUse the **Transfer Baggage** tab (SSR code TRBF).`
    },
    {
        keywords: ['fs/sup', 'fs sup', 'missing rate', 'rate missing', 'no rate', 'not available'],
        answer: `If the excess baggage **rate is missing** for a specific destination, please refer to **FS/SUP in charge**. The rates quoted are approximate; for the exact rate, check with the **airport team at the time of departure**.`
    },
    {
        keywords: ['india', 'indian', 'without pre-purchase', 'pre-purchased', 'inr 900'],
        answer: `**India – excess baggage:**\n\n**Without pre-purchased baggage:** INR 900 plus taxes for baggage up to 20 kg. Excess above 20 kg at normal rates.\n\nUse the **Excess Baggage** tab with FZ and an India route to see the note when applicable.`
    },
    {
        keywords: ['saudi', 'ksa', 'riyadh', 'jeddah', 'dammam', 'saudi exception'],
        answer: `**Saudi (KSA) – upgrade exception:**\n\nFrom **all KSA points**: Upgrade to Business exception rates apply – e.g. AED 1175, SAR 1200 (instead of standard zone rate). Use the **Upgrade to Business** tab with a Saudi origin to see the exception.`
    },
    {
        keywords: ['kuwait', 'kwi', 'bahrain', 'bah', 'muscat', 'mct', 'gulf exception'],
        answer: `**Gulf – upgrade exceptions:**\n\n• **Kuwait (KWI):** AED 660, KWD 55\n• **Bahrain (BAH):** AED 535, BHD 55\n• **Muscat (MCT):** AED 715, OMR 75\n\nUse the **Upgrade to Business** tab with that origin and currency to see the exception rate.`
    },
    {
        keywords: ['zone 1', 'zone 2', 'zone 3', 'zones', 'eight zone', '8 zone', 'excess zone'],
        answer: `**Excess baggage zones (FZ):**\n\n**8 zones:** 1 UAE | 2 Gulf (Kuwait, Bahrain, Oman) | 3 KSA | 4 Middle East | 5 Africa | 6 Sub-Continent | 7 SEA | 8 Europe/CIS.\n\n**Upgrade zones:** 3 zones (1, 2, 3) by origin airport. Use the **Excess Baggage** or **Upgrade** tab; zone is shown in the result.`
    },
    {
        keywords: ['document', 'version', 'effective', '2025', 'page 4', 'reference document'],
        answer: `**Document reference:**\n\n**GO-SHOW / UPGRADE / EXCESS BAGGAGE RATES**\nVersion 2025.112(A) ***Outstation***\nIssue Date: 13 May 2025\nEffective Date: 17 May 2025\n\nAll rates and rules in this app are from this document. Open the **Reference** tab for full text.`
    },
    {
        keywords: ['aircraft', 'xlgr seat', 'extra legroom seat', '737', 'seat row', 'capacity'],
        answer: `**Aircraft & Extra Legroom (XLGR) seats:**\n\nReference: flydubai document Page 26. Aircraft types (e.g. 737-800NG, 737-8, 737-9, 737 MAX 8/9) with cabin, capacity, and **XLGR seat rows** (e.g. 1ABC, 2DEF, 15 & 16). Open the **Reference** tab to see the full Aircraft & XLGR table.`
    },
    {
        keywords: ['currency', 'currencies', 'aed', 'usd', 'which currency'],
        answer: `**Currencies:**\n\nRates are available in many currencies (AED, USD, EUR, GBP, SAR, INR, PKR, etc.). **Excess baggage (FZ)** and **Extra Legroom** support multiple currencies; **EK/OAL** per kg and per piece are in **USD** (or **CAD** for Canada-origin per piece). Use the tabs and select your currency where offered.`
    },
    {
        keywords: ['flydubai', 'fz rate', 'fz baggage', 'flydubai excess'],
        answer: `**Flydubai (FZ) excess baggage:**\n\nFZ uses **8 zones** and **per-kg rates** in the **destination currency** (or selected currency). Route exceptions: CMB–MLE, MLE–CMB. India note applies when route involves India (without pre-purchased baggage). Use the **Excess Baggage** tab, select airline FZ, enter origin/destination and currency.`
    },
    {
        keywords: ['hello', 'hi', 'hey', 'help', 'what can you', 'how does', 'intro', 'start'],
        answer: `I'm the **Rate Calculator Agent**. You can ask me about:\n\n• **Interline** – which carrier's rates apply (FZ–EK, FZ–AC, FZ–UA, FZ–OAL)\n• **Excess baggage** – per kg and per piece (EK, OAL, UA, AC), Larnaca–Malta, zones, India note\n• **Disclaimer** – approximate rates, FS/SUP, airport team\n• **Upgrade** – to Business (at airport and on board), infant, exceptions (KWI, BAH, MCT, Saudi, India)\n• **Extra legroom**, **Go-show fares**, **Sports equipment**, **Reporting**, **Transfer baggage**\n• **Regional classification**, **document version**, **aircraft XLGR**\n\nType your question above. Answers are from GO-SHOW/UPGRADE/EXCESS BAGGAGE RATES Version 2025.112(A) Outstation.`
    },
    {
        keywords: ['cmb', 'mle', 'colombo', 'maldives', 'sri lanka', 'exception route'],
        answer: `**CMB–MLE / MLE–CMB (Sri Lanka–Maldives):**\n\n**Excess baggage (FZ):** Route exceptions apply – different rate/currency for CMB–MLE and MLE–CMB. Use the **Excess Baggage** tab with FZ and these routes to see the exception.\n\n**Upgrade:** Exception rates for Sri Lanka–Maldives and Maldives–Sri Lanka (e.g. AED, LKR, USD). Use the **Upgrade** tab.`
    },
    {
        keywords: ['infant', 'baby', 'child', 'infant rate', 'infant fare'],
        answer: `**Infant rates:**\n\n• **Go-Show:** Adult and infant fares by origin; use **Go-Show Fares** tab.\n• **Upgrade to Business:** Infant upgrade (at airport and on board) by zone/currency; use **Upgrade to Business** tab – infant is shown when available.\n• **Excess baggage:** Per-kg/per-piece apply per bag; no separate infant excess rate in the document.`
    },
    {
        keywords: ['how much', 'how to calculate', 'calculate rate', 'get rate'],
        answer: `**How to get a rate:**\n\n1. Open the tab that matches your need: **Excess Baggage**, **Go-Show Fares**, **Upgrade to Business**, **Extra Legroom**, **Sports Equipment**, **Reporting Fees**, or **Transfer Baggage**.\n2. Enter the required fields (e.g. origin, destination, airline, currency).\n3. Click **Calculate**.\n\nThe result and any exception or disclaimer will be shown. For full reference text, use the **Reference** tab.`
    },
    {
        keywords: ['thank', 'thanks', 'bye', 'good'],
        answer: `You're welcome. If you have another question about rates, interline, or the document, just ask.`
    }
];

/**
 * Answer a question using keyword matching (with synonym expansion) and return best answer.
 * @param {string} query - User question (any language)
 * @returns {string} - Answer text (markdown-style for line breaks)
 */
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

    return `I didn't find a direct answer for that. Here's useful information:\n\n**Interline:** FZ–EK and FZ–OAL use EK rates; FZ–AC uses AC rates; FZ–UA uses UA rates.\n\n**Rates:** Use the tabs above to calculate exact rates (Excess Baggage, Upgrade, Go-Show, Extra Legroom, etc.).\n\n**Try asking about:** "interline", "excess baggage EK", "Larnaca Malta", "upgrade", "disclaimer", "India", "Saudi", "UA AC rates", "per piece", or "document version".\n\nOpen the **Reference** tab for full interline rules, regional classification, and document details.`;
}
