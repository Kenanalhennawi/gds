/**
 * Q&A Agent data: synonyms and all Q&A pairs.
 * Kept in a separate file so content can grow beyond 1000+ lines without
 * cluttering the agent logic. Add new QA arrays here and register them in QA_PAIRS.
 */

import { REFERENCE_TEXTS, EXCESS_BAGGAGE_DISCLAIMER } from "./excessBaggage.js";

// =============================================================================
// SYNONYMS – normalize user query for better matching
// =============================================================================

export const SYNONYMS = {
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
    'currency': ['currency', 'currencies', 'aed', 'usd', 'money'],
    'me': ['middle east', 'me', 'gulf'],
    'sa': ['south asia', 'sa'],
    'anz': ['australia', 'new zealand', 'anz'],
    'dxb': ['dubai', 'dxb'],
    'lca': ['larnaca', 'lca'],
    'mla': ['malta', 'mla'],
    'cmb': ['colombo', 'cmb', 'sri lanka'],
    'mle': ['maldives', 'mle', 'male'],
    'kwi': ['kuwait', 'kwi'],
    'bah': ['bahrain', 'bah'],
    'mct': ['muscat', 'mct', 'oman'],
    'bom': ['mumbai', 'bom'],
    'del': ['delhi', 'del'],
    'amd': ['ahmedabad', 'amd'],
    'what': ['what', 'which', 'explain', 'meaning'],
    'how': ['how', 'way', 'method', 'steps'],
    'can': ['can', 'could', 'able', 'possible'],
    'tell': ['tell', 'show', 'give', 'find', 'get', 'check', 'look up'],
    'need': ['need', 'want', 'looking for', 'searching'],
    'rate': ['rate', 'price', 'cost', 'fee', 'charge', 'amount'],
    'excess bag': ['excess bag', 'excess baggage', 'extra bag', 'overweight'],
    'bussiness': ['business', 'bussiness', 'upgrading'],
    'ruh': ['riyadh', 'ruh'], 'jed': ['jeddah', 'jed'], 'dmm': ['dammam', 'dmm'],
    'maa': ['chennai', 'maa'], 'hyd': ['hyderabad', 'hyd'], 'blr': ['bangalore', 'blr'],
    'doh': ['doha', 'doh'], 'ist': ['istanbul', 'ist'], 'bkk': ['bangkok', 'bkk'],
    'tas': ['tashkent', 'tas'],
    'svo': ['moscow', 'svo'], 'led': ['st petersburg', 'led'], 'prg': ['prague', 'prg'],
    'exces': ['excess'], 'bagage': ['baggage'], 'upgrad': ['upgrade'], 'bussiness': ['business'],
    'legrom': ['legroom'], 'trasfer': ['transfer'], 'interlinee': ['interline'],
    'emirate': ['emirates'], 'flydubaii': ['flydubai'], 'unitedd': ['united'],
    'calulate': ['calculate'], 'calculte': ['calculate'], 'ratee': ['rate'],
    'possibility': ['possibilities'], 'possibilities': ['possibility', 'possibilities'],
    'answer': ['answers'], 'answers': ['answer']
};

// =============================================================================
// Q&A PAIRS – Interline & which carrier
// =============================================================================

const INTERLINE_QA = [
    {
        keywords: ['interline', 'which carrier', 'which rate', 'whose rate', 'carrier rate', 'apply', 'transatlantic'],
        answer: `**Interline – which carrier's rates apply:**\n\n• **FZ – EK** → EK rates\n• **FZ – EK – AC** (EK is the Transatlantic carrier) → EK rates\n• **FZ – OAL** → EK rates\n• **FZ – AC** (AC is the Transatlantic carrier) → AC rates\n• **FZ – UA** (UA is the Transatlantic carrier) → UA rates\n\nDocument: GO-SHOW/UPGRADE/EXCESS BAGGAGE RATES Version 2025.112(A) Outstation, Effective 17 May 2025.`
    },
    {
        keywords: ['fz ek', 'flydubai emirates', 'fz emirates'],
        answer: `**FZ – EK (Flydubai – Emirates):**\n\n**EK rates will apply** for excess baggage on interline journeys FZ–EK. Use the **Excess Baggage** tab and select airline **EK** to get EK per-kg and per-piece rates by region.`
    },
    {
        keywords: ['fz ac', 'flydubai air canada', 'fz air canada'],
        answer: `**FZ – AC (Flydubai – Air Canada):**\n\n**AC rates will apply** when AC is the Transatlantic carrier. **EK rates** apply when EK is the Transatlantic carrier (FZ–EK–AC). Use the **Excess Baggage** tab and select **AC** for Air Canada flat fees (free allowance 23/32 kg, 1st $75, 2nd $100, 3+ $200, oversize/overweight $200).`
    },
    {
        keywords: ['fz ua', 'flydubai united', 'fz united'],
        answer: `**FZ – UA (Flydubai – United):**\n\n**UA rates will apply** when UA is the Transatlantic carrier. Use the **Excess Baggage** tab and select **UA** for United flat fees (same as AC: free 23/32 kg, 1st $75, 2nd $100, 3+ $200, oversize/overweight $200).`
    },
    {
        keywords: ['fz oal', 'flydubai other airlines', 'oal rate apply'],
        answer: `**FZ – OAL (Flydubai – Other Airlines):**\n\n**EK rates will apply** for excess baggage. Use the **Excess Baggage** tab and select **OAL** to get the same EK per-kg and per-piece rates by region.`
    }
];

// =============================================================================
// Q&A PAIRS – Disclaimer & FS/SUP
// =============================================================================

const DISCLAIMER_QA = [
    {
        keywords: ['disclaimer', 'approximate', 'exact rate', 'airport team', 'departure', 'quote', 'quoted', 'communicate', 'customer'],
        answer: `**Customer disclaimer:**\n\n${EXCESS_BAGGAGE_DISCLAIMER}\n\nIn case excess baggage rate is missing for a specific destination, please refer to **FS/SUP in charge**. This should be communicated to the customer when providing rates.`
    },
    {
        keywords: ['fs/sup', 'fs sup', 'missing rate', 'rate missing', 'no rate', 'not available', 'refer to'],
        answer: `If the excess baggage **rate is missing** for a specific destination, please refer to **FS/SUP in charge**. The rates quoted are approximate; for the exact rate, check with the **airport team at the time of departure**.`
    }
];

// =============================================================================
// Q&A PAIRS – EK / OAL excess baggage (per kg, per piece)
// =============================================================================

const EK_OAL_QA = [
    {
        keywords: ['ek rate', 'emirates rate', 'oal rate', 'per kg', 'per kilogram', 'usd kg', 'buying weight', 'additional weight', 'emirates baggage', 'ek baggage', 'ek excess'],
        answer: `**EK / OAL Excess Baggage (per kg, USD):**\n\n${REFERENCE_TEXTS.EK_OAL_EXCESS}\n\n**Tip:** Use the **Excess Baggage** tab, select airline EK or OAL, and enter origin/destination to get the exact rate for your route.`
    },
    {
        keywords: ['per piece', 'additional piece', 'buying piece', 'piece rate', 'per bag', 'buying additional pieces'],
        answer: `**Buying additional pieces at the airport (USD / CAD):**\n\n• **From/to Africa:** USD 200 per piece (ME/SA, Africa, Europe), USD 250 to Far East / ANZ / Americas.\n• **From/to Americas:** USD 100 (Europe, Americas), USD 225 (ME/SA), USD 200 (Africa), USD 250 (Far East, ANZ).\n• **From/to Canada (CAD):** CAD 125 (Europe, Americas), CAD 280 (ME/SA), CAD 250 (Africa), CAD 300 (Far East, ANZ).\n\nUse the **Excess Baggage** tab with airline EK or OAL; per-piece is shown when origin is Africa, Americas, or Canada.`
    },
    {
        keywords: ['from africa', 'from americas', 'from canada', 'cad', 'canada piece'],
        answer: `**Per-piece rates by origin:**\n\n• **From Africa:** USD 200–250 per piece depending on destination region.\n• **From Americas:** USD 100–250 per piece.\n• **From Canada:** **CAD** 125–300 per piece (not USD). Use the **Excess Baggage** tab with EK or OAL and a Canada origin to see CAD per-piece.`
    },
    {
        keywords: ['middle east south asia', 'me sa', 'me/sa', '15 usd', '25 usd', '40 usd'],
        answer: `**Middle East / South Asia (ME/SA) – per kg (USD):**\n\nFrom ME/SA to: ME/SA $15, Africa $25, Far East $25, Europe $25, Australia & New Zealand $40. Use **Excess Baggage** tab with EK or OAL and ME/SA airports.`
    },
    {
        keywords: ['far east rate', 'far east per kg', '30 usd', '15 usd far east'],
        answer: `**Far East – per kg (USD):**\n\nFrom Far East to: ME/SA $25, Africa $30, Far East $15, Europe $30, ANZ $30. Use **Excess Baggage** tab with EK or OAL.`
    },
    {
        keywords: ['europe per kg', 'europe rate', '40 usd', '50 usd'],
        answer: `**Europe – per kg (USD):**\n\nFrom Europe to: ME/SA $25, Africa $30, Far East $30, Europe $40, ANZ $50. *$15 per kg for Larnaca–Malta.* Use **Excess Baggage** tab with EK or OAL.`
    },
    {
        keywords: ['australia new zealand', 'anz rate', 'anz per kg'],
        answer: `**Australia & New Zealand (ANZ) – per kg (USD):**\n\nFrom ANZ to: ME/SA $40, Africa $50, Far East $30, Europe $50, ANZ $15. Use **Excess Baggage** tab with EK or OAL.`
    }
];

// =============================================================================
// Q&A PAIRS – Route-style excess (excess from X to Y, to Dubai, from TAS, etc.)
// Placed before UA/AC so "excess from TAS to Dubai" matches FZ/EK guidance, not UA/AC.
// =============================================================================

const ROUTE_EXCESS_QA = [
    {
        keywords: ['excess from', 'excess to', 'to dubai', 'to dxb', 'from tas', 'from dxb', 'excess tas', 'excess dubai', 'excess dxb', 'rate from', 'rate to', 'baggage from', 'baggage to'],
        answer: `**Excess baggage for a specific route (e.g. from TAS to Dubai):**\n\nFor **Flydubai (FZ)** or **Emirates (EK)** routes to/from Dubai (DXB), use the **Excess Baggage** tab:\n1. Enter **origin** (e.g. TAS for Tashkent) and **destination** (e.g. DXB for Dubai).\n2. Select airline **FZ** (Flydubai – per kg by zone) or **EK** (Emirates – per kg USD by region).\n3. Choose **currency** and click **Calculate**.\n\n**UA/AC** flat fees ($75/$100/$200) apply only on **interline** journeys when United or Air Canada is the long-haul carrier (e.g. FZ–UA, FZ–AC), not for FZ-only or FZ–EK routes to Dubai.`
    },
    {
        keywords: ['to dxb', 'from dxb', 'dubai excess', 'dxb excess'],
        answer: `**Excess baggage to/from Dubai (DXB):** Use **Excess Baggage** tab – enter origin and destination DXB, select **FZ** (Flydubai) or **EK** (Emirates), choose currency, click **Calculate**. FZ uses per-kg by zone; EK uses per-kg USD by region. UA/AC rates apply only on FZ–UA or FZ–AC interline, not for Dubai-only routes.`
    }
];

// =============================================================================
// Q&A PAIRS – Larnaca Malta, UA/AC
// =============================================================================

const LCA_MLA_UA_AC_QA = [
    {
        keywords: ['larnaca', 'malta', 'lca', 'mla', 'cyprus malta', '15 per kg'],
        answer: `**Larnaca – Malta exception:**\n\n**$15 USD per kilogram** for travel between Larnaca (LCA) and Malta (MLA). This applies for **EK** and **OAL** excess baggage only (document Page 4). Use the **Excess Baggage** tab with origin LCA and destination MLA (or vice versa).`
    },
    {
        keywords: ['ua rate', 'united rate', 'ac rate', 'air canada', 'free allowance', '75', '100', '200', 'oversize', 'overweight', 'united baggage', 'air canada baggage'],
        answer: `**United Airlines (UA) / Air Canada (AC) Excess Baggage – Flat USD fees:**\n\n**"Flat USD fees"** = fixed charges in US dollars **per bag** (not per kg). Same price regardless of weight (within limits): 1st bag $75, 2nd $100, 3+ $200; oversize/overweight $200 each.\n\n${REFERENCE_TEXTS.UA_AC_EXCESS}\n\n**Summary:** Free allowance Economy 0–23 kg, Business 0–32 kg. 1st excess bag $75, 2nd $100, 3 or more $200. Oversize $200, Overweight $200. Use the **Excess Baggage** tab and select **UA or AC** only when your journey is FZ–UA or FZ–AC interline. For FZ or EK routes (e.g. to Dubai), use airline **FZ** or **EK** in the tab.`
    },
    {
        keywords: ['free allowance', '23 kg', '32 kg', 'economy business allowance'],
        answer: `**UA/AC Free Baggage Allowance:**\n\n• **Economy:** 0–23 kg (free allowance)\n• **Business:** 0–32 kg (free allowance)\n\nExcess above that: 1st bag $75, 2nd $100, 3 or more $200. Oversize $200, Overweight $200. Use **Excess Baggage** tab, airline UA or AC.`
    },
    {
        keywords: ['flat usd', 'flat fee', 'flat fees', 'what is flat', 'flat rate'],
        answer: `**Flat USD fees** = **fixed charges in US dollars per bag** (not per kilogram). Used for **UA** and **AC** excess baggage: 1st bag $75, 2nd $100, 3 or more $200; oversize $200, overweight $200. Same dollar amount per bag regardless of weight (within limits). **FZ** and **EK** use **per-kg** rates (or per piece from some regions), not flat fees. UA/AC flat fees apply only on FZ–UA or FZ–AC interline journeys.`
    }
];

// =============================================================================
// Q&A PAIRS – Regional classification
// =============================================================================

const REGIONAL_QA = [
    {
        keywords: ['region', 'regional', 'classification', 'country list', 'which country', 'countries', 'middle east', 'south asia', 'africa', 'europe', 'far east', 'anz', 'americas'],
        answer: `**Regional classification (EK/OAL):**\n\n${REFERENCE_TEXTS.REGIONAL_CLASSIFICATION}\n\nOpen the **Reference** tab for the full list.`
    },
    {
        keywords: ['middle east countries', 'me countries', 'gulf countries'],
        answer: `**Middle East (EK/OAL region):**\n\nBahrain, Iran, Iraq, Jordan, Kuwait, Lebanon, Oman, Qatar, Saudi Arabia, UAE, Israel. Use **Reference** tab for full regional classification.`
    },
    {
        keywords: ['south asia countries', 'india pakistan', 'subcontinent'],
        answer: `**South Asia (EK/OAL region):**\n\nAfghanistan, Bangladesh, India, Maldives, Pakistan, Sri Lanka, Nepal, Kazakhstan, Kyrgyzstan, Tajikistan, Turkmenistan. Use **Reference** tab for full list.`
    },
    {
        keywords: ['africa countries', 'african'],
        answer: `**Africa (EK/OAL region):**\n\nAlgeria, Angola, Côte d'Ivoire, Egypt, Ethiopia, Ghana, Guinea, Kenya, Libya, Madagascar, Mauritius, Morocco, Nigeria, Senegal, Seychelles, South Africa, Sudan, Tanzania, Tunisia, Uganda, Zambia, Zimbabwe, Congo, Djibouti, Eritrea, Somalia, South Sudan. Use **Reference** tab for full list.`
    },
    {
        keywords: ['europe countries', 'european'],
        answer: `**Europe (EK/OAL region):**\n\nAustria, Belgium, Croatia, Cyprus, Czech Republic, Denmark, France, Germany, Greece, Hungary, Ireland, Italy, Malta, Netherlands, Norway, Poland, Portugal, Russia, Spain, Sweden, Switzerland, Türkiye, Ukraine, United Kingdom, Armenia, Azerbaijan, Bosnia, Bulgaria, Georgia, Macedonia, Montenegro, Romania, Serbia, Slovakia, Finland. Use **Reference** tab for full list.`
    },
    {
        keywords: ['far east countries', 'asia pacific'],
        answer: `**Far East (EK/OAL region):**\n\nCambodia, China, Hong Kong, Indonesia, Japan, Malaysia, Myanmar, Philippines, Singapore, South Korea, Taiwan, Thailand, Vietnam. Use **Reference** tab for full list.`
    },
    {
        keywords: ['americas countries', 'usa canada', 'north america'],
        answer: `**Americas (EK/OAL region):**\n\nArgentina, Brazil, Canada, Chile, Colombia, USA. Use **Reference** tab for full list.`
    }
];

// =============================================================================
// Q&A PAIRS – Upgrade to Business
// =============================================================================

const UPGRADE_QA = [
    {
        keywords: ['upgrade', 'business class', 'infant upgrade', 'on board upgrade', 'upgrade zone', 'zone 1', 'zone 2', 'zone 3'],
        answer: `**Upgrade to Business Class:**\n\nRates depend on **origin zone** (1, 2, or 3) and **currency**. **Exception rates** apply for: Kuwait (KWI), Bahrain (BAH), Muscat (MCT), Saudi (all KSA points), India (all India points), Iraq BGW, Israel TLV, Nepal KTM.\n\n**Infant upgrade** (at airport and on board) is available. Use the **Upgrade to Business** tab, enter origin airport and currency, then click Calculate.`
    },
    {
        keywords: ['upgrade at airport', 'upgrade on board', 'on board upgrade rate'],
        answer: `**Upgrade to Business – at airport vs on board:**\n\n• **At airport:** Rate by zone and currency (e.g. Zone 1 AED 1300, Zone 2 AED 2100, Zone 3 AED 2500). Exception rates for KWI, BAH, MCT, Saudi, India, etc.\n• **On board:** Higher rate (e.g. AED 1400/2100/2300 for zones 1–3). Exception: AED from PKR airport uses 1500/2400/2700.\n\nUse **Upgrade to Business** tab to see both and infant.`
    },
    {
        keywords: ['kuwait', 'kwi', 'bahrain', 'bah', 'muscat', 'mct', 'gulf exception', 'upgrade exception'],
        answer: `**Gulf – upgrade exceptions (at airport):**\n\n• **Kuwait (KWI):** AED 660, KWD 55\n• **Bahrain (BAH):** AED 535, BHD 55\n• **Muscat (MCT):** AED 715, OMR 75\n\nUse the **Upgrade to Business** tab with that origin and currency to see the exception rate.`
    },
    {
        keywords: ['saudi', 'ksa', 'riyadh', 'jeddah', 'dammam', 'saudi exception'],
        answer: `**Saudi (KSA) – upgrade exception:**\n\nFrom **all KSA points**: AED 1175, SAR 1200 (instead of standard zone rate). Use **Upgrade to Business** tab with a Saudi origin (e.g. RUH, JED, DMM) to see the exception.`
    },
    {
        keywords: ['india', 'indian', 'upgrade india', 'india upgrade exception'],
        answer: `**India – upgrade exception:**\n\nFrom **all India points**: AED 1315, INR 30640. Use **Upgrade to Business** tab with an India origin (e.g. DEL, BOM, MAA) to see the exception.`
    },
    {
        keywords: ['bgw', 'iraq', 'tlv', 'israel', 'ktm', 'nepal', 'upgrade exception route'],
        answer: `**Other upgrade exceptions (at airport):**\n\n• **Iraq BGW:** AED 1650, USD 450\n• **Israel TLV:** AED 2185, USD 595\n• **Nepal KTM:** AED 2185, NPR 81350\n• **Sri Lanka–Maldives (CMB–MLE):** AED 745, LKR 60080\n• **Maldives–Sri Lanka (MLE–CMB):** AED 920, USD 250\n\nUse **Upgrade to Business** tab with that origin.`
    }
];

// =============================================================================
// Q&A PAIRS – Extra legroom, Go-show, Sports, Reporting, Transfer
// =============================================================================

const OTHER_SERVICES_QA = [
    {
        keywords: ['extra legroom', 'xlgr', 'legroom', 'airport rate', 'on board rate', 'xlgr rate'],
        answer: `**Extra Legroom (XLGR):**\n\nRates in many **currencies**. **Airport rate** (at check-in) and **On Board rate** (when purchased on board). **Currency exchange** to USD shown where available. Use **Extra Legroom** tab and select currency.`
    },
    {
        keywords: ['go-show', 'goshow', 'fare', 'economy', 'business fare', 'go show'],
        answer: `**Go-Show Fares:**\n\nAvailable for **Economy** and **Business** by **origin airport**. **Adult** and **infant** fares shown. Use **Go-Show Fares** tab, enter origin and class (Economy/Business), then click Calculate.`
    },
    {
        keywords: ['sports', 'sport equipment', 'speq', 'spex', 'sport bag'],
        answer: `**Sports Equipment:**\n\nRates by **currency** and type: **SPEQ** (Standard) or **SPEX** (Oversized). Use **Sports Equipment** tab, choose currency and type, then click Calculate.`
    },
    {
        keywords: ['reporting', 'late report', 'early report', 'lrtp', 'ertp', 'late reporting', 'early reporting'],
        answer: `**Late / Early Reporting:**\n\nFees by **currency** and type: **LRTP** (Late Reporting) or **ERTP** (Early Reporting). Use **Reporting Fees** tab to get the rate.`
    },
    {
        keywords: ['transfer', 'transfer baggage', 'dxb', 'outstation', 'trbf'],
        answer: `**Transfer Baggage Fee:**\n\n• **At DXB:** AED 50 + GHA fee AED 50.\n• **Outstation:** USD 30 + GHA fee as applicable.\n\nUse **Transfer Baggage** tab (SSR code TRBF).`
    }
];

// =============================================================================
// Q&A PAIRS – India excess, CMB-MLE, Flydubai FZ, Zones, Document
// =============================================================================

const INDIA_CMB_FZ_QA = [
    {
        keywords: ['india excess', 'indian baggage', 'without pre-purchase', 'pre-purchased', 'inr 900', 'india note'],
        answer: `**India – excess baggage (without pre-purchased baggage):**\n\n**INR 900 plus taxes** for baggage up to 20 kg. Excess above 20 kg at normal rates. Use **Excess Baggage** tab with FZ and an India route to see the note when applicable.`
    },
    {
        keywords: ['cmb', 'mle', 'colombo', 'maldives', 'sri lanka', 'exception route', 'cmb mle', 'mle cmb'],
        answer: `**CMB–MLE / MLE–CMB (Sri Lanka–Maldives):**\n\n**Excess baggage (FZ):** Route exceptions – different rate/currency for CMB–MLE and MLE–CMB. **Upgrade:** Exception rates for Sri Lanka–Maldives and Maldives–Sri Lanka. Use **Excess Baggage** or **Upgrade** tab with these routes.`
    },
    {
        keywords: ['flydubai', 'fz rate', 'fz baggage', 'flydubai excess', 'fz excess'],
        answer: `**Flydubai (FZ) excess baggage:**\n\nFZ uses **8 zones** and **per-kg rates** in the **destination currency** (or selected currency). Route exceptions: CMB–MLE, MLE–CMB. India note when route involves India. Use **Excess Baggage** tab, airline FZ, enter origin/destination and currency.`
    },
    {
        keywords: ['zone 1', 'zone 2', 'zone 3', 'zones', 'eight zone', '8 zone', 'excess zone', 'upgrade zone'],
        answer: `**Zones:**\n\n**Excess baggage (FZ) – 8 zones:** 1 UAE | 2 Gulf (Kuwait, Bahrain, Oman) | 3 KSA | 4 Middle East | 5 Africa | 6 Sub-Continent | 7 SEA | 8 Europe/CIS.\n\n**Upgrade – 3 zones:** Zone 1, 2, 3 by origin airport. Use **Excess Baggage** or **Upgrade** tab; zone is shown in the result.`
    },
    {
        keywords: ['document', 'version', 'effective', '2025', 'page 4', 'reference document', 'outstation'],
        answer: `**Document reference:**\n\n**GO-SHOW / UPGRADE / EXCESS BAGGAGE RATES**\nVersion 2025.112(A) ***Outstation***\nIssue Date: 13 May 2025\nEffective Date: 17 May 2025\n\nAll rates and rules in this app are from this document. Open **Reference** tab for full text.`
    },
    {
        keywords: ['aircraft', 'xlgr seat', 'extra legroom seat', '737', 'seat row', 'capacity', 'aircraft type'],
        answer: `**Aircraft & Extra Legroom (XLGR) seats:**\n\nReference: flydubai document Page 26. Aircraft types (e.g. 737-800NG, 737-8, 737-9, 737 MAX 8/9) with cabin, capacity, and **XLGR seat rows** (e.g. 1ABC, 2DEF, 15 & 16). Open **Reference** tab for full Aircraft & XLGR table.`
    },
    {
        keywords: ['currency', 'currencies', 'aed', 'usd', 'which currency', 'eur', 'gbp'],
        answer: `**Currencies:**\n\nRates in many currencies (AED, USD, EUR, GBP, SAR, INR, PKR, etc.). **FZ excess baggage** and **Extra Legroom** support multiple currencies; **EK/OAL** per kg and per piece are **USD** (or **CAD** for Canada-origin per piece). Use the tabs and select your currency where offered.`
    }
];

// =============================================================================
// Q&A PAIRS – Other sections (Go-Show, Sports, Reporting, Transfer, Extra Legroom, Reference)
// Covers fields, labels, and options in each tab so nothing is missing.
// =============================================================================

const OTHER_SECTIONS_QA = [
    // --- Go-Show section ---
    {
        keywords: ['go show origin', 'goshow origin', 'origin airport go show', 'go show class', 'class economy business', 'go show economy', 'go show business', 'adult infant go show', 'go show result', 'goshow result'],
        answer: `**Go-Show Fares section:**\n\n**Tab:** **Go-Show Fares**\n**Fields:** 1) **Origin Airport** – search by code, city, or country. 2) **Class** – Economy or Business.\n**Action:** Click **Calculate**.\n**Result:** One-way fare by origin; **Adult** and **Infant** fares shown for the selected class. Use for show-up-at-airport (standby) fares.`
    },
    // --- Sports Equipment section ---
    {
        keywords: ['sports equipment type', 'equipment type', 'speq spex', 'standard oversized', 'sports section', 'sports result', 'sports currency'],
        answer: `**Sports Equipment section:**\n\n**Tab:** **Sports Equipment**\n**Fields:** 1) **Currency** – e.g. AED, USD. 2) **Equipment Type** – **SPEQ** (Standard) or **SPEX** (Oversized).\n**Action:** Click **Calculate**.\n**Result:** Rate for the selected currency and type. SPEQ = standard sports item; SPEX = oversized.`
    },
    // --- Reporting Fees section ---
    {
        keywords: ['reporting fee type', 'fee type', 'lrtp ertp', 'late early reporting', 'reporting section', 'reporting result', 'reporting currency'],
        answer: `**Reporting Fees section:**\n\n**Tab:** **Reporting Fees**\n**Fields:** 1) **Currency** – e.g. AED, USD. 2) **Fee Type** – **LRTP** (Late Reporting) or **ERTP** (Early Reporting).\n**Action:** Click **Calculate**.\n**Result:** Fee for the selected currency and type. LRTP = Late Reporting; ERTP = Early Reporting.`
    },
    // --- Transfer Baggage section ---
    {
        keywords: ['transfer location', 'transfer section', 'location dxb', 'location outstation', 'gha', 'gha fee', 'dxb or outstation', 'transfer result', 'where transfer'],
        answer: `**Transfer Baggage section:**\n\n**Tab:** **Transfer Baggage**\n**Field:** **Location** – **DXB** (Dubai) or **Outstation**.\n**Result:** • **DXB:** AED 50 + **GHA fee** AED 50. • **Outstation:** USD 30 + GHA fee as applicable. SSR code **TRBF**. GHA = Ground Handling Agent fee.`
    },
    // --- Extra Legroom section ---
    {
        keywords: ['extra legroom section', 'extralegroom', 'xlgr section', 'legroom currency', 'legroom result', 'airport on board legroom', 'xlgr airport', 'xlgr on board'],
        answer: `**Extra Legroom (XLGR) section:**\n\n**Tab:** **Extra Legroom**\n**Field:** **Currency** – e.g. AED, USD, EUR.\n**Action:** Select currency (rate may display automatically or click **Calculate**).\n**Result:** **Airport rate** (at check-in) and **On Board rate** (when purchased on board); **Currency exchange** to USD shown where available.`
    },
    // --- Reference section ---
    {
        keywords: ['reference section', 'reference content', 'interline table', 'journey condition', 'which carrier table', 'aircraft table', 'a/c type', 'ac type', 'capacity xlgr', 'xlgr rows', 'page 26', 'reference tab content', 'regional classification list', 'ek oal text', 'ua ac text'],
        answer: `**Reference section:**\n\n**Tab:** **Reference**\n**Content:**\n• **Interline Excess Baggage – Which Carrier's Rates Apply:** Table with **Journey** and **Condition** (e.g. FZ–EK → EK rates).\n• **Customer disclaimer** and FS/SUP note.\n• **Aircraft Type & Extra Legroom (XLGR) Seats:** Table with **A/C Type**, **Cabin**, **Capacity**, **XLGR Rows** (document Page 26).\n• **EK/OAL Excess Baggage** text.\n• **UA/AC Excess Baggage** text.\n• **Regional Classification (EK/OAL)** – full country list by region.`
    },
    // --- Excess Baggage section (fields) ---
    {
        keywords: ['excess section', 'excess origin', 'excess destination', 'excess airline', 'select airline', 'origin destination excess', 'excess currency'],
        answer: `**Excess Baggage section:**\n\n**Tab:** **Excess Baggage**\n**Fields:** 1) **Origin** – airport code. 2) **Destination** – airport code. 3) **Airline** – FZ, EK, OAL, UA, or AC. 4) **Currency** – or leave default (destination/origin currency).\n**Action:** Click **Calculate**.\n**Result:** Per-kg or flat rate, zone(s), any route exception (CMB–MLE, India note, LCA–MLA), or disclaimer.`
    },
    // --- Upgrade section (fields) ---
    {
        keywords: ['upgrade section', 'upgrade origin', 'upgrade currency', 'upgrade result', 'origin airport upgrade'],
        answer: `**Upgrade to Business section:**\n\n**Tab:** **Upgrade to Business**\n**Fields:** 1) **Origin Airport** – search by code, city, or country. 2) **Currency** – e.g. AED, USD, SAR.\n**Action:** Click **Calculate**.\n**Result:** At-airport rate, on-board rate, infant rate (when available), zone; exception rate and label if origin has an exception (KWI, BAH, MCT, Saudi, India, etc.).`
    }
];

// =============================================================================
// Q&A PAIRS – Infant, How to calculate, Greetings, Thanks
// =============================================================================

const GENERAL_QA = [
    {
        keywords: ['infant', 'baby', 'child', 'infant rate', 'infant fare'],
        answer: `**Infant rates:**\n\n• **Go-Show:** Adult and infant fares by origin; use **Go-Show Fares** tab.\n• **Upgrade to Business:** Infant upgrade (at airport and on board) by zone/currency; use **Upgrade to Business** tab – infant shown when available.\n• **Excess baggage:** Per-kg/per-piece apply per bag; no separate infant excess rate in the document.`
    },
    {
        keywords: ['how much', 'how to calculate', 'calculate rate', 'get rate', 'how to get'],
        answer: `**How to get a rate:**\n\n1. Open the tab that matches your need: **Excess Baggage**, **Go-Show Fares**, **Upgrade to Business**, **Extra Legroom**, **Sports Equipment**, **Reporting Fees**, or **Transfer Baggage**.\n2. Enter the required fields (e.g. origin, destination, airline, currency).\n3. Click **Calculate**.\n\nThe result and any exception or disclaimer will be shown. For full reference, use **Reference** tab.`
    },
    {
        keywords: ['hello', 'hi', 'hey', 'help', 'what can you', 'how does', 'intro', 'start'],
        answer: `I'm the **Rate Calculator Agent**. You can ask about:\n\n• **Interline** – which carrier's rates apply (FZ–EK, FZ–AC, FZ–UA, FZ–OAL)\n• **Excess baggage** – per kg and per piece (EK, OAL, UA, AC), Larnaca–Malta, zones, India note\n• **Disclaimer** – approximate rates, FS/SUP, airport team\n• **Upgrade** – to Business (at airport and on board), infant, exceptions (KWI, BAH, MCT, Saudi, India)\n• **Extra legroom**, **Go-show fares**, **Sports equipment**, **Reporting**, **Transfer baggage**\n• **Regional classification**, **document version**, **aircraft XLGR**\n\nType your question above. Answers are from GO-SHOW/UPGRADE/EXCESS BAGGAGE RATES Version 2025.112(A) Outstation.`
    },
    {
        keywords: ['thank', 'thanks', 'bye', 'good', 'appreciate'],
        answer: `You're welcome. If you have another question about rates, interline, or the document, just ask.`
    }
];

// =============================================================================
// Q&A PAIRS – More variations and phrasings (expanded coverage)
// =============================================================================

const EXPANDED_QA = [
    { keywords: ['what is interline', 'explain interline', 'interline meaning'], answer: `**Interline** means a journey involving more than one airline (e.g. Flydubai + Emirates). For **excess baggage**, the rate that applies depends on which carrier operates the long-haul leg: FZ–EK and FZ–OAL use **EK rates**; FZ–AC (AC transatlantic) uses **AC rates**; FZ–UA (UA transatlantic) uses **UA rates**. Use the **Excess Baggage** tab and select the correct airline to get the right rate.` },
    { keywords: ['who applies', 'whose rate', 'which airline rate'], answer: `**Which airline's rate applies:** FZ–EK → EK. FZ–EK–AC (EK transatlantic) → EK. FZ–OAL → EK. FZ–AC (AC transatlantic) → AC. FZ–UA (UA transatlantic) → UA. Use **Excess Baggage** tab and choose EK, OAL, AC, or UA accordingly.` },
    { keywords: ['approximate rate', 'rates approximate', 'exact rate check'], answer: `**Disclaimer:** ${EXCESS_BAGGAGE_DISCLAIMER} In case rate is missing for a destination, refer to **FS/SUP in charge**.` },
    { keywords: ['emirates baggage', 'ek baggage rate', 'emirates excess'], answer: `**Emirates (EK) excess baggage:** Per kg in **USD** by region (ME/SA, Africa, Far East, Europe, ANZ). Per piece in **USD** or **CAD** when origin is Africa, Americas, or Canada. Larnaca–Malta $15/kg. Use **Excess Baggage** tab, airline **EK**.` },
    { keywords: ['other airlines', 'oal baggage', 'oal excess'], answer: `**Other Airlines (OAL) excess baggage:** Same as **EK** – per kg USD by region, per piece USD/CAD from Africa/Americas/Canada. Larnaca–Malta $15/kg. Use **Excess Baggage** tab, airline **OAL**.` },
    { keywords: ['usd per kg', 'dollars per kg', 'price per kilogram'], answer: `**USD per kg (EK/OAL):** All EK and OAL excess baggage per-kg rates are in **US dollars**. Matrix by origin/destination region: ME/SA $15–40, Far East $15–30, Europe $25–50, ANZ $15–50. Use **Excess Baggage** tab, EK or OAL.` },
    { keywords: ['cad rate', 'canada cad', 'canadian dollars'], answer: `**CAD (Canadian dollars):** Used only for **per-piece** excess baggage when **origin is Canada** (EK/OAL). Per-kg rates remain USD. Use **Excess Baggage** tab with EK or OAL and a Canada origin to see CAD per-piece.` },
    { keywords: ['lca mla', 'mla lca', 'larnaca malta rate'], answer: `**Larnaca (LCA) – Malta (MLA):** **$15 USD per kg** for EK and OAL excess baggage (document Page 4). Enter LCA and MLA in **Excess Baggage** tab with airline EK or OAL.` },
    { keywords: ['united airlines', 'ua baggage', 'united excess'], answer: `**United Airlines (UA):** Free allowance Eco 0–23 kg, Bus 0–32 kg. 1st excess $75, 2nd $100, 3+ $200. Oversize $200, Overweight $200. Use **Excess Baggage** tab, airline **UA**.` },
    { keywords: ['air canada', 'ac baggage', 'ac excess'], answer: `**Air Canada (AC):** Same as UA – free 23/32 kg, 1st $75, 2nd $100, 3+ $200, oversize/overweight $200. Use **Excess Baggage** tab, airline **AC**.` },
    { keywords: ['me to africa', 'middle east to africa', 'africa from me'], answer: `**ME/SA to Africa (per kg):** $25 USD. Use **Excess Baggage** tab, EK or OAL, and ME/SA origin with Africa destination.` },
    { keywords: ['europe to anz', 'europe to australia', 'anz from europe'], answer: `**Europe to Australia & New Zealand (per kg):** $50 USD. Use **Excess Baggage** tab, EK or OAL.` },
    { keywords: ['anz to me', 'australia to middle east', 'me from anz'], answer: `**ANZ to ME/SA (per kg):** $40 USD. Use **Excess Baggage** tab, EK or OAL.` },
    { keywords: ['far east to europe', 'asia to europe rate'], answer: `**Far East to Europe (per kg):** $30 USD. Use **Excess Baggage** tab, EK or OAL.` },
    { keywords: ['africa to far east', 'africa to asia'], answer: `**Africa to Far East (per kg):** $25–30 USD depending on direction. Use **Excess Baggage** tab, EK or OAL.` },
    { keywords: ['upgrade kuwait', 'kuwait upgrade', 'kwi upgrade'], answer: `**Upgrade from Kuwait (KWI):** Exception rate AED 660, KWD 55 (at airport). Use **Upgrade to Business** tab, origin KWI.` },
    { keywords: ['upgrade bahrain', 'bahrain upgrade', 'bah upgrade'], answer: `**Upgrade from Bahrain (BAH):** Exception rate AED 535, BHD 55 (at airport). Use **Upgrade to Business** tab, origin BAH.` },
    { keywords: ['upgrade oman', 'muscat upgrade', 'mct upgrade'], answer: `**Upgrade from Muscat (MCT):** Exception rate AED 715, OMR 75 (at airport). Use **Upgrade to Business** tab, origin MCT.` },
    { keywords: ['upgrade saudi', 'saudi upgrade', 'ksa upgrade', 'ruh jed'], answer: `**Upgrade from Saudi (KSA):** Exception rate AED 1175, SAR 1200 for all KSA points (at airport). Use **Upgrade to Business** tab with Saudi origin.` },
    { keywords: ['upgrade india', 'india upgrade', 'del bom upgrade'], answer: `**Upgrade from India:** Exception rate AED 1315, INR 30640 for all India points (at airport). Use **Upgrade to Business** tab with India origin.` },
    { keywords: ['upgrade on board', 'onboard upgrade', 'upgrade onboard'], answer: `**Upgrade on board:** Higher than at-airport rate (e.g. AED 1400/2100/2300 for zones 1–3). Exception: AED from Pakistan airport uses 1500/2400/2700. Infant on-board upgrade available. Use **Upgrade to Business** tab.` },
    { keywords: ['infant upgrade', 'baby upgrade', 'infant business'], answer: `**Infant upgrade to Business:** Infant rates available at airport and on board by zone/currency. Use **Upgrade to Business** tab – infant is shown when you calculate.` },
    { keywords: ['go show fare', 'goshow fare', 'go-show'], answer: `**Go-Show Fares:** One-way fares by origin for Economy and Business. Adult and infant. Use **Go-Show Fares** tab, enter origin and class, click Calculate.` },
    { keywords: ['xlgr', 'extra legroom seat', 'legroom seat'], answer: `**Extra Legroom (XLGR):** Pay for extra legroom seats. Airport rate and On Board rate in many currencies. Use **Extra Legroom** tab and select currency.` },
    { keywords: ['sport equipment', 'sports bag', 'golf', 'ski'], answer: `**Sports Equipment:** SPEQ (standard) or SPEX (oversized). Rate by currency. Use **Sports Equipment** tab.` },
    { keywords: ['late reporting', 'early reporting', 'lrtp', 'ertp'], answer: `**Late/Early Reporting:** LRTP (late) or ERTP (early). Fee by currency. Use **Reporting Fees** tab.` },
    { keywords: ['transfer bag', 'trbf', 'transfer fee'], answer: `**Transfer Baggage:** DXB AED 50 + GHA 50. Outstation USD 30 + GHA. Use **Transfer Baggage** tab.` },
    { keywords: ['india without prepurchase', 'india 900', 'inr 900'], answer: `**India without pre-purchased baggage:** INR 900 plus taxes for baggage up to 20 kg. Excess above 20 kg at normal rates. Shown in **Excess Baggage** result when route involves India (FZ).` },
    { keywords: ['colombo maldives', 'sri lanka maldives', 'cmb mle rate'], answer: `**Colombo–Maldives (CMB–MLE):** FZ excess baggage has route exception (e.g. LKR 3025). Upgrade has exception (AED 745, LKR 60080). Use **Excess Baggage** or **Upgrade** tab.` },
    { keywords: ['maldives colombo', 'mle cmb', 'maldives sri lanka'], answer: `**Maldives–Colombo (MLE–CMB):** FZ excess baggage route exception (e.g. USD 10). Upgrade exception AED 920, USD 250. Use **Excess Baggage** or **Upgrade** tab.` },
    { keywords: ['flydubai zone', 'fz zone', '8 zones'], answer: `**Flydubai (FZ) – 8 zones:** 1 UAE, 2 Gulf, 3 KSA, 4 ME, 5 Africa, 6 Sub-Continent, 7 SEA, 8 Europe/CIS. Rate depends on origin zone and destination zone. Use **Excess Baggage** tab, airline FZ.` },
    { keywords: ['version 2025', '2025.112', 'effective 17 may'], answer: `**Document:** GO-SHOW/UPGRADE/EXCESS BAGGAGE RATES Version **2025.112(A)** Outstation. Issue 13 May 2025, Effective **17 May 2025**. See **Reference** tab.` },
    { keywords: ['reference tab', 'where is reference', 'full reference'], answer: `**Reference tab:** In the Rate Calculator, click the **Reference** tab to see: Interline table, customer disclaimer, FS/SUP note, Aircraft & XLGR table, EK/OAL text, UA/AC text, full regional classification.` },
    { keywords: ['calculate', 'how calculate', 'get rate'], answer: `**To get a rate:** 1) Choose the right tab (Excess Baggage, Upgrade, Go-Show, etc.). 2) Fill origin/destination/airline/currency as needed. 3) Click **Calculate**. Result and any exception or disclaimer will show.` },
    { keywords: ['what tabs', 'which tab', 'tabs available'], answer: `**Tabs:** Excess Baggage, Go-Show Fares, Sports Equipment, Reporting Fees, Transfer Baggage, Upgrade to Business, Extra Legroom, Reference, Ask Agent. Use the one that matches your need.` },
    { keywords: ['baggage allowance', 'free baggage', 'allowance'], answer: `**Free baggage allowance:** For **UA/AC** – Economy 0–23 kg, Business 0–32 kg. For **FZ/EK/OAL** excess rates apply per kg or per piece above the included allowance; see **Excess Baggage** tab.` },
    { keywords: ['oversize', 'overweight', 'oversized bag'], answer: `**Oversize / Overweight (UA/AC):** $200 USD each. Use **Excess Baggage** tab, airline UA or AC. For FZ/EK/OAL, rates are per kg or per piece.` },
    { keywords: ['first bag', 'second bag', 'third bag', '1st bag', '2nd bag'], answer: `**UA/AC excess bags:** 1st excess bag $75, 2nd $100, 3 or more $200. Use **Excess Baggage** tab, UA or AC.` },
    { keywords: ['currency exchange', 'exchange rate', 'usd equivalent'], answer: `**Currency exchange:** Shown in **Extra Legroom** tab for many currencies (e.g. 1 USD = X AED). EK/OAL per-kg and per-piece are in USD (or CAD for Canada per-piece). FZ rates in local/selected currency.` },
    { keywords: ['pakistan', 'pkr', 'pakistan airport', 'pkr exception'], answer: `**Pakistan (PKR) airports:** Upgrade on board in AED from PKR airport uses exception 1500/2400/2700 (zones 1–3) instead of 1400/2100/2300. Use **Upgrade to Business** tab with Pakistan origin, currency AED.` },
    { keywords: ['iraq', 'bgw', 'baghdad'], answer: `**Iraq (BGW):** Upgrade exception AED 1650, USD 450 (at airport). Use **Upgrade to Business** tab, origin BGW.` },
    { keywords: ['israel', 'tlv', 'tel aviv'], answer: `**Israel (TLV):** Upgrade exception AED 2185, USD 595 (at airport). Use **Upgrade to Business** tab, origin TLV.` },
    { keywords: ['nepal', 'ktm', 'kathmandu'], answer: `**Nepal (KTM):** Upgrade exception AED 2185, NPR 81350 (at airport). Use **Upgrade to Business** tab, origin KTM.` },
    { keywords: ['zone 1 airport', 'zone 1 list', 'which airport zone 1'], answer: `**Zone 1 (FZ excess):** UAE (DXB, DWC), plus some Gulf/ME. **Upgrade zone 1:** e.g. DXB, DOH, DMM, KWI, MCT, RUH, etc. Use calculator to see zone for a specific airport.` },
    { keywords: ['zone 2 airport', 'zone 2 list'], answer: `**Zone 2 (FZ excess):** Gulf – Kuwait, Bahrain, Oman. **Upgrade zone 2:** Many ME/SC airports. Use **Excess Baggage** or **Upgrade** tab to see zone for your airport.` },
    { keywords: ['zone 3 airport', 'zone 3 list'], answer: `**Zone 3 (FZ excess):** KSA. **Upgrade zone 3:** Long-haul (Europe, Africa, Asia, etc.). Use calculator with airport code to see zone.` },
    { keywords: ['subcontinent', 'sub continent', 'zone 6'], answer: `**Sub-Continent (FZ zone 6):** India, Pakistan, Bangladesh, Sri Lanka, Nepal, etc. EK/OAL region "South Asia" includes these. Use **Excess Baggage** or **Reference** tab.` },
    { keywords: ['sea zone', 'south east asia', 'zone 7'], answer: `**SEA (FZ zone 7):** South East Asia – e.g. Maldives, Myanmar, Thailand. Use **Excess Baggage** tab, FZ, to see zone for airport.` },
    { keywords: ['europe cis', 'zone 8', 'europe zone'], answer: `**Europe/CIS (FZ zone 8):** Europe and CIS countries. Use **Excess Baggage** tab, FZ. For EK/OAL, "Europe" is a separate region in the per-kg/per-piece matrix.` },
    { keywords: ['aircraft type', '737', 'boeing', 'xlgr rows'], answer: `**Aircraft & XLGR rows:** Document Page 26 lists aircraft types (e.g. 737-800NG, 737-8, 737-9) with capacity and XLGR seat rows (e.g. 1ABC, 2DEF, 15 & 16). Open **Reference** tab for full table.` },
    { keywords: ['outstation', 'out station'], answer: `**Outstation:** Term in document for non-DXB stations. Version 2025.112(A) ***Outstation***. Transfer baggage outstation: USD 30 + GHA.` },
    { keywords: ['ssr', 'ssr code', 'trbf', 'speq', 'spex', 'lrtp', 'ertp'], answer: `**SSR codes:** TRBF = Transfer baggage. SPEQ/SPEX = Sports equipment. LRTP/ERTP = Late/Early reporting. Use the corresponding tabs for rates.` },
    { keywords: ['missing destination', 'rate not available', 'no rate for'], answer: `If **rate is missing** for a destination: refer to **FS/SUP in charge**. Rates quoted are approximate; for exact rate, check with **airport team at departure**.` },
    { keywords: ['communicate', 'tell customer', 'customer message'], answer: `**Communicate to customer:** "${EXCESS_BAGGAGE_DISCLAIMER}" If rate is missing for a destination, refer to FS/SUP in charge.` },
    { keywords: ['per kilo', 'per kilogram', 'price per kg'], answer: `**Per kilogram (per kg):** EK/OAL excess baggage per-kg rates are in **USD** by origin/destination region. FZ excess is per kg in selected currency by zone. Use **Excess Baggage** tab.` },
    { keywords: ['additional bag', 'extra bag', 'extra baggage'], answer: `**Additional/extra bag:** For **UA/AC** – 1st $75, 2nd $100, 3+ $200. For **EK/OAL** – per-piece USD/CAD when origin is Africa/Americas/Canada. For **FZ** – per kg by zone. Use **Excess Baggage** tab.` },
    { keywords: ['transatlantic', 'trans atlantic', 'atlantic'], answer: `**Transatlantic:** When the long-haul carrier is EK, **EK rates** apply (FZ–EK–AC). When it is AC, **AC rates** apply (FZ–AC). When it is UA, **UA rates** apply (FZ–UA). Use **Excess Baggage** tab and select EK, AC, or UA.` },
];

// =============================================================================
// Q&A PAIRS – Question phrasings (what is, how do I, can you, tell me, etc.)
// =============================================================================

const PHRASING_QA = [
    { keywords: ['what is excess', 'what is extra baggage', 'what is excess baggage'], answer: `**Excess baggage** is baggage above your free allowance. Rates depend on airline: **FZ** uses 8 zones and per-kg; **EK/OAL** use per-kg USD by region and per-piece from Africa/Americas/Canada; **UA/AC** use flat fees ($75 / $100 / $200). Use **Excess Baggage** tab.` },
    { keywords: ['what is interline', 'what does interline mean'], answer: `**Interline** = journey on more than one airline (e.g. Flydubai + Emirates). For excess baggage, **which carrier's rate** applies: FZ–EK and FZ–OAL → EK; FZ–AC (AC transatlantic) → AC; FZ–UA (UA transatlantic) → UA. Use **Excess Baggage** tab and select the correct airline.` },
    { keywords: ['what is go show', 'what is go-show', 'what is goshow'], answer: `**Go-Show** = one-way fare when showing up at airport (Economy or Business). Adult and infant fares by origin. Use **Go-Show Fares** tab, enter origin and class, click Calculate.` },
    { keywords: ['what is upgrade', 'what is business upgrade'], answer: `**Upgrade to Business** = paying to move from Economy to Business. Rate by origin zone (1–3) and currency. Exceptions for KWI, BAH, MCT, Saudi, India, BGW, TLV, KTM, CMB–MLE, MLE–CMB. Use **Upgrade to Business** tab.` },
    { keywords: ['what is extra legroom', 'what is xlgr', 'what is legroom'], answer: `**Extra Legroom (XLGR)** = paid seat with more legroom. Airport rate and On Board rate in many currencies. Use **Extra Legroom** tab and select currency.` },
    { keywords: ['what is trbf', 'what is transfer baggage', 'what is transfer fee'], answer: `**Transfer Baggage (TRBF):** DXB AED 50 + GHA AED 50; Outstation USD 30 + GHA. Use **Transfer Baggage** tab.` },
    { keywords: ['what is speq', 'what is spex', 'what is sports equipment'], answer: `**Sports equipment:** SPEQ (standard) or SPEX (oversized). Rate by currency. Use **Sports Equipment** tab.` },
    { keywords: ['what is lrtp', 'what is ertp', 'what is late reporting', 'what is early reporting'], answer: `**LRTP** = Late Reporting fee. **ERTP** = Early Reporting fee. Both by currency. Use **Reporting Fees** tab.` },
    { keywords: ['how do i get', 'how do i calculate', 'how do i find', 'how to get rate', 'how to find rate'], answer: `**How to get a rate:** 1) Open the tab for your need (Excess Baggage, Upgrade, Go-Show, Extra Legroom, etc.). 2) Enter origin/destination/airline/currency as required. 3) Click **Calculate**. Result and any exception or disclaimer will show.` },
    { keywords: ['how much is', 'how much does', 'how much for', 'how much excess', 'how much upgrade'], answer: `Rates depend on route, airline, and currency. Use the right tab: **Excess Baggage** (origin, destination, airline, currency), **Upgrade to Business** (origin, currency), **Go-Show** (origin, class), **Extra Legroom** (currency), etc. Click **Calculate** to see the exact amount.` },
    { keywords: ['can you tell me', 'can you show me', 'can you give me', 'can you find', 'tell me about', 'show me rate', 'give me rate'], answer: `Use the **tabs** above: **Excess Baggage**, **Upgrade to Business**, **Go-Show Fares**, **Extra Legroom**, **Sports Equipment**, **Reporting Fees**, **Transfer Baggage**. Enter the required fields and click **Calculate** to get the rate. You can also ask me in words (e.g. "interline rates", "upgrade from Kuwait").` },
    { keywords: ['i need rate', 'i want rate', 'i need to know', 'i want to know', 'looking for rate', 'need excess', 'want upgrade'], answer: `Choose the tab that matches: **Excess Baggage**, **Upgrade to Business**, **Go-Show**, **Extra Legroom**, etc. Enter the details and click **Calculate**. Or ask in words (e.g. "excess baggage EK", "upgrade from Dubai").` },
    { keywords: ['rate for excess', 'rate for upgrade', 'rate for baggage', 'cost of excess', 'cost of upgrade', 'price for baggage', 'fee for excess', 'charge for upgrade'], answer: `Rates are in the calculator. **Excess Baggage** tab: enter origin, destination, airline, currency. **Upgrade to Business** tab: enter origin, currency. **Go-Show**: origin, class. Click **Calculate** for the exact rate.` },
    { keywords: ['does fz have', 'does flydubai have', 'does emirates have', 'does ua have', 'does ac have'], answer: `**FZ (Flydubai):** Excess baggage (8 zones, per kg), upgrade, go-show, extra legroom, sports, reporting, transfer. **EK (Emirates):** Excess baggage (per kg/per piece by region) applies on FZ–EK interline. **UA/AC:** Flat excess bag fees ($75/$100/$200). Use the **Excess Baggage** or other tabs and select the airline.` },
    { keywords: ['is there exception', 'are there exceptions', 'any exception', 'exception for'], answer: `Yes. **Excess baggage:** CMB–MLE, MLE–CMB, India (INR 900 note), Larnaca–Malta $15/kg (EK/OAL). **Upgrade:** KWI, BAH, MCT, Saudi, India, BGW, TLV, KTM, CMB–MLE, MLE–CMB; Pakistan AED on-board 1500/2400/2700. Use the tabs to see when an exception applies.` },
    { keywords: ['where do i find', 'where can i find', 'where to find rate', 'where is rate'], answer: `**In this app:** Use the tab that matches (Excess Baggage, Upgrade, Go-Show, Extra Legroom, etc.), enter the details, click **Calculate**. **Reference** tab has interline rules, regional lists, disclaimer. **Ask Agent** (this tab) answers questions in words.` },
    { keywords: ['when does', 'when do i', 'when to pay', 'when to buy'], answer: `**At airport** (check-in) or **on board** for upgrade and extra legroom; rates may differ. Excess baggage is typically paid at check-in. For exact rate at departure, check with **airport team**; quoted rates are approximate.` },
    { keywords: ['why ek rate', 'why ac rate', 'why ua rate', 'why different rate'], answer: `On **interline** journeys, the rate depends on **which carrier** operates the long-haul leg. FZ–EK and FZ–OAL use **EK rates**; FZ–AC (AC transatlantic) uses **AC rates**; FZ–UA (UA transatlantic) uses **UA rates**. Use **Excess Baggage** tab and select the correct airline.` },
    { keywords: ['which airline', 'which carrier', 'which rate apply', 'which tab'], answer: `**Which airline's rate:** FZ–EK and FZ–OAL → **EK**. FZ–AC (AC transatlantic) → **AC**. FZ–UA (UA transatlantic) → **UA**. Use **Excess Baggage** tab and select EK, OAL, AC, or UA. **Which tab:** Excess Baggage, Upgrade to Business, Go-Show Fares, Extra Legroom, Sports Equipment, Reporting Fees, Transfer Baggage, Reference, Ask Agent.` },
    { keywords: ['difference between', 'difference of', 'at airport vs on board'], answer: `**At airport vs on board:** **Upgrade** and **Extra Legroom** have different rates at check-in (at airport) vs when bought on board; on-board is often higher. Use **Upgrade to Business** or **Extra Legroom** tab to see both.` },
    { keywords: ['at airport', 'on board', 'onboard', 'check in'], answer: `**At airport** = at check-in. **On board** = during flight. Upgrade and Extra Legroom have separate at-airport and on-board rates. Use **Upgrade to Business** or **Extra Legroom** tab.` },
    { keywords: ['dubai', 'dxb', 'dwc'], answer: `**Dubai (DXB/DWC):** Zone 1 for FZ excess. Upgrade zone 1. Transfer baggage at DXB: AED 50 + GHA 50. Use **Excess Baggage**, **Upgrade**, or **Transfer Baggage** tab.` },
    { keywords: ['mumbai', 'bom', 'delhi', 'del', 'chennai', 'maa'], answer: `**India airports (BOM, DEL, MAA, etc.):** FZ excess – India note (INR 900 without pre-purchase). **Upgrade** exception from all India: AED 1315, INR 30640. Use **Excess Baggage** or **Upgrade** tab with that origin.` },
    { keywords: ['colombo', 'cmb', 'maldives', 'mle', 'male'], answer: `**CMB (Colombo/Sri Lanka) – MLE (Maldives):** FZ excess exception (e.g. LKR 3025 CMB–MLE, USD 10 MLE–CMB). Upgrade exceptions AED 745/AED 920. Use **Excess Baggage** or **Upgrade** tab.` },
    { keywords: ['riyadh', 'ruh', 'jeddah', 'jed', 'dammam', 'dmm', 'doha', 'doh'], answer: `**Saudi (RUH, JED, DMM, etc.):** Upgrade exception from all KSA – AED 1175, SAR 1200. **Doha (DOH):** Upgrade zone 1. Use **Upgrade to Business** tab with that origin.` },
];

// =============================================================================
// Q&A PAIRS – Single/few keyword catch-all (baggage, upgrade, interline, etc.)
// =============================================================================

const CATCH_ALL_QA = [
    { keywords: ['baggage'], answer: `**Baggage:** For **excess/extra baggage** use **Excess Baggage** tab (FZ, EK, OAL, UA, AC). For **free allowance** (UA/AC: 23 kg Economy, 32 kg Business) ask "free allowance" or "UA AC rates". For **transfer baggage** use **Transfer Baggage** tab (TRBF).` },
    { keywords: ['upgrade'], answer: `**Upgrade to Business:** Rate by origin zone and currency. Exceptions: KWI, BAH, MCT, Saudi, India, BGW, TLV, KTM, CMB–MLE, MLE–CMB. Use **Upgrade to Business** tab, enter origin and currency, click Calculate.` },
    { keywords: ['interline'], answer: `**Interline:** FZ–EK and FZ–OAL → **EK rates**. FZ–AC (AC transatlantic) → **AC rates**. FZ–UA (UA transatlantic) → **UA rates**. Use **Excess Baggage** tab and select EK, OAL, AC, or UA.` },
    { keywords: ['emirates'], answer: `**Emirates (EK):** On FZ–EK interline, **EK excess baggage rates** apply (per kg USD by region, per piece from Africa/Americas/Canada). Use **Excess Baggage** tab, airline **EK**.` },
    { keywords: ['flydubai'], answer: `**Flydubai (FZ):** Excess baggage (8 zones, per kg), upgrade, go-show, extra legroom, sports, reporting, transfer. Use **Excess Baggage** (airline FZ), **Upgrade to Business**, **Go-Show Fares**, or other tabs.` },
    { keywords: ['excess'], answer: `**Excess baggage:** FZ (8 zones, per kg), EK/OAL (per kg USD + per piece from Africa/Americas/Canada), UA/AC (flat $75/$100/$200). Use **Excess Baggage** tab, choose airline, enter origin/destination and currency.` },
    { keywords: ['business'], answer: `**Business:** **Upgrade to Business** (at airport / on board) – use **Upgrade to Business** tab. **Business fare** (Go-Show) – use **Go-Show Fares** tab, class Business.` },
    { keywords: ['go show'], answer: `**Go-Show Fares:** One-way Economy or Business by origin. Adult and infant. Use **Go-Show Fares** tab, enter origin and class, click Calculate.` },
    { keywords: ['legroom'], answer: `**Extra Legroom (XLGR):** Airport and On Board rates in many currencies. Use **Extra Legroom** tab and select currency.` },
    { keywords: ['sports'], answer: `**Sports equipment:** SPEQ (standard) or SPEX (oversized). Rate by currency. Use **Sports Equipment** tab.` },
    { keywords: ['reporting'], answer: `**Late/Early Reporting:** LRTP and ERTP fees by currency. Use **Reporting Fees** tab.` },
    { keywords: ['transfer'], answer: `**Transfer Baggage (TRBF):** DXB AED 50 + GHA 50; Outstation USD 30 + GHA. Use **Transfer Baggage** tab.` },
    { keywords: ['disclaimer'], answer: `**Disclaimer:** ${EXCESS_BAGGAGE_DISCLAIMER} If rate is missing for a destination, refer to **FS/SUP in charge**.` },
    { keywords: ['zone'], answer: `**FZ excess – 8 zones:** 1 UAE, 2 Gulf, 3 KSA, 4 ME, 5 Africa, 6 Sub-Continent, 7 SEA, 8 Europe/CIS. **Upgrade – 3 zones** by origin. Use **Excess Baggage** or **Upgrade** tab to see zone for an airport.` },
    { keywords: ['region'], answer: `**Regional classification** (EK/OAL): Middle East, South Asia, Africa, Europe, Far East, Americas, ANZ. Full list in **Reference** tab. Use **Excess Baggage** with EK or OAL for per-kg rates by region.` },
    { keywords: ['currency'], answer: `Rates in many **currencies** (AED, USD, EUR, GBP, SAR, INR, PKR, etc.). FZ excess and Extra Legroom: select currency in the tab. EK/OAL per-kg: USD (CAD for Canada per-piece). Use the tabs and choose currency where offered.` },
    { keywords: ['india'], answer: `**India:** **Excess (FZ):** Note when no pre-purchased baggage – INR 900 + taxes up to 20 kg. **Upgrade:** Exception AED 1315, INR 30640 from all India points. Use **Excess Baggage** or **Upgrade** tab with India origin.` },
    { keywords: ['saudi'], answer: `**Saudi (KSA):** **Upgrade** exception from all KSA points: AED 1175, SAR 1200. Use **Upgrade to Business** tab with Saudi origin (e.g. RUH, JED, DMM).` },
    { keywords: ['kuwait'], answer: `**Kuwait (KWI):** **Upgrade** exception AED 660, KWD 55 (at airport). Use **Upgrade to Business** tab, origin KWI.` },
    { keywords: ['malta'], answer: `**Malta (MLA):** With **Larnaca (LCA)** – **$15 USD per kg** for EK/OAL excess baggage. Use **Excess Baggage** tab, EK or OAL, origin LCA destination MLA (or vice versa).` },
    { keywords: ['larnaca'], answer: `**Larnaca (LCA) – Malta (MLA):** $15 USD per kg for EK and OAL excess baggage. Use **Excess Baggage** tab, airline EK or OAL, route LCA–MLA.` },
    { keywords: ['united'], answer: `**United (UA):** Free 23/32 kg, 1st excess $75, 2nd $100, 3+ $200, oversize/overweight $200. Applies when UA is Transatlantic carrier on FZ–UA. Use **Excess Baggage** tab, airline **UA**.` },
    { keywords: ['air canada'], answer: `**Air Canada (AC):** Same as UA – 23/32 kg free, 1st $75, 2nd $100, 3+ $200. Applies when AC is Transatlantic on FZ–AC. Use **Excess Baggage** tab, airline **AC**.` },
    { keywords: ['other airlines'], answer: `**Other Airlines (OAL):** Same **EK** excess baggage rates (per kg and per piece). Use **Excess Baggage** tab, airline **OAL**.` },
    { keywords: ['document'], answer: `**Document:** GO-SHOW/UPGRADE/EXCESS BAGGAGE RATES Version **2025.112(A)** Outstation. Issue 13 May 2025, Effective 17 May 2025. Full text and tables in **Reference** tab.` },
    { keywords: ['reference'], answer: `**Reference tab:** Interline table, customer disclaimer, FS/SUP note, Aircraft & XLGR table, EK/OAL and UA/AC text, full regional classification. Open the **Reference** tab in the calculator.` },
    { keywords: ['fs sup'], answer: `If **rate is missing** for a destination, refer to **FS/SUP in charge**. Rates are approximate; for exact rate, check with **airport team at departure**.` },
    { keywords: ['missing'], answer: `If rate is **missing** for a destination: refer to **FS/SUP in charge**. Communicate to customer that rates are approximate; exact rate at **airport team at time of departure**.` },
    { keywords: ['ek'], answer: `**EK (Emirates):** On FZ–EK interline, **EK excess baggage rates** apply (per kg USD by region, per piece from Africa/Americas/Canada). Use **Excess Baggage** tab, airline **EK**.` },
    { keywords: ['fz'], answer: `**FZ (Flydubai):** Excess baggage (8 zones), upgrade, go-show, extra legroom, sports, reporting, transfer. Use **Excess Baggage** (airline FZ), **Upgrade to Business**, **Go-Show Fares**, or other tabs.` },
    { keywords: ['ua'], answer: `**UA (United):** Free 23/32 kg, 1st $75, 2nd $100, 3+ $200. Applies when UA is Transatlantic on FZ–UA. Use **Excess Baggage** tab, airline **UA**.` },
    { keywords: ['ac'], answer: `**AC (Air Canada):** Same as UA – 23/32 kg free, 1st $75, 2nd $100, 3+ $200. Applies when AC is Transatlantic on FZ–AC. Use **Excess Baggage** tab, airline **AC**.` },
    { keywords: ['oal'], answer: `**OAL (Other Airlines):** Same **EK** excess baggage rates. Use **Excess Baggage** tab, airline **OAL**.` },
    { keywords: ['rate'], answer: `**Rates** are in the calculator. Use **Excess Baggage** (origin, destination, airline, currency), **Upgrade to Business** (origin, currency), **Go-Show** (origin, class), **Extra Legroom** (currency), etc. Click **Calculate** for the exact rate.` },
    { keywords: ['cost'], answer: `**Cost/rate** depends on service. Use **Excess Baggage**, **Upgrade to Business**, **Go-Show Fares**, **Extra Legroom**, **Sports Equipment**, **Reporting Fees**, or **Transfer Baggage** tab; enter details and click **Calculate**.` },
    { keywords: ['fee'], answer: `**Fees:** Excess baggage (per kg or flat), upgrade, extra legroom, sports, reporting (LRTP/ERTP), transfer (TRBF). Use the tab that matches and click **Calculate**.` },
    { keywords: ['allowance'], answer: `**Free baggage allowance:** **UA/AC** – Economy 0–23 kg, Business 0–32 kg. FZ/EK/OAL: excess rates apply above included allowance; use **Excess Baggage** tab.` },
    { keywords: ['exception'], answer: `**Exceptions:** Excess – CMB–MLE, MLE–CMB, India (INR 900), LCA–MLA $15/kg (EK/OAL). Upgrade – KWI, BAH, MCT, Saudi, India, BGW, TLV, KTM, CMB–MLE, MLE–CMB; Pakistan on-board AED. Use tabs to see when they apply.` },
];

// =============================================================================
// Q&A PAIRS – Numbers (75, 100, 200, 23, 32, 15, etc.)
// =============================================================================

const NUMBERS_QA = [
    { keywords: ['75', '75 usd', '75 dollar', 'first bag 75'], answer: `**$75 USD:** First excess bag for **UA** and **AC** (after free 23 kg Economy / 32 kg Business). Use **Excess Baggage** tab, airline UA or AC.` },
    { keywords: ['100', '100 usd', '100 dollar', 'second bag 100'], answer: `**$100 USD:** Second excess bag for **UA** and **AC**. Use **Excess Baggage** tab, airline UA or AC.` },
    { keywords: ['200', '200 usd', '200 dollar', 'third bag 200', 'oversize 200', 'overweight 200'], answer: `**$200 USD:** Third (and more) excess bag, and **oversize** or **overweight** bag for **UA** and **AC**. Use **Excess Baggage** tab, airline UA or AC.` },
    { keywords: ['23 kg', '23 kilo', '23 kilogram'], answer: `**23 kg:** **UA/AC** free baggage allowance in **Economy**. Excess above that: 1st $75, 2nd $100, 3+ $200. Use **Excess Baggage** tab, UA or AC.` },
    { keywords: ['32 kg', '32 kilo', '32 kilogram'], answer: `**32 kg:** **UA/AC** free baggage allowance in **Business**. Excess above that: 1st $75, 2nd $100, 3+ $200. Use **Excess Baggage** tab, UA or AC.` },
    { keywords: ['15 per kg', '15 usd per kg', '15 dollar per kg', 'lca mla 15'], answer: `**$15 USD per kg:** **Larnaca (LCA) – Malta (MLA)** excess baggage for **EK** and **OAL**. Other EK/OAL per-kg rates vary by region ($15–50). Use **Excess Baggage** tab, EK or OAL.` },
    { keywords: ['1300', '2100', '2500', 'zone 1 1300', 'zone 2 2100', 'zone 3 2500'], answer: `**Upgrade to Business (at airport, AED):** Zone 1 AED 1300, Zone 2 AED 2100, Zone 3 AED 2500. Exceptions apply for KWI, BAH, MCT, Saudi, India, etc. Use **Upgrade to Business** tab.` },
    { keywords: ['1400', '2100', '2300', 'on board aed'], answer: `**Upgrade on board (AED):** Zone 1 AED 1400, Zone 2 AED 2100, Zone 3 AED 2300. Exception: from Pakistan (PKR) airport in AED use 1500/2400/2700. Use **Upgrade to Business** tab.` },
    { keywords: ['660', '535', '715', 'kwi 660', 'bah 535', 'mct 715'], answer: `**Gulf upgrade exceptions (at airport):** Kuwait (KWI) AED 660 / KWD 55; Bahrain (BAH) AED 535 / BHD 55; Muscat (MCT) AED 715 / OMR 75. Use **Upgrade to Business** tab.` },
    { keywords: ['1175', '1200', 'saudi 1175', 'sar 1200'], answer: `**Saudi upgrade exception:** From all KSA points – AED 1175, SAR 1200 (at airport). Use **Upgrade to Business** tab with Saudi origin.` },
    { keywords: ['1315', '30640', 'india 1315', 'inr 30640'], answer: `**India upgrade exception:** From all India points – AED 1315, INR 30640 (at airport). Use **Upgrade to Business** tab with India origin.` },
    { keywords: ['3025', 'cmb mle 3025', 'lkr 3025'], answer: `**CMB–MLE (Sri Lanka–Maldives) FZ excess:** Route exception LKR 3025 per kg. Use **Excess Baggage** tab, airline FZ, route CMB–MLE.` },
    { keywords: ['60080', '745', 'cmb mle upgrade'], answer: `**CMB–MLE upgrade exception:** Sri Lanka–Maldives AED 745, LKR 60080 (at airport). Use **Upgrade to Business** tab with CMB or MLE origin.` },
    { keywords: ['920', '250', 'mle cmb'], answer: `**MLE–CMB (Maldives–Sri Lanka):** FZ excess exception USD 10; **Upgrade** exception AED 920, USD 250. Use **Excess Baggage** or **Upgrade** tab.` },
    { keywords: ['900', 'inr 900', 'india 900'], answer: `**India (FZ, no pre-purchased baggage):** INR 900 plus taxes for baggage up to 20 kg. Excess above 20 kg at normal rates. Shown in **Excess Baggage** when route involves India.` },
    { keywords: ['50 aed', '50 usd', 'transfer 50', 'dxb 50'], answer: `**Transfer Baggage:** At **DXB** AED 50 + GHA AED 50. **Outstation** USD 30 + GHA. Use **Transfer Baggage** tab.` },
    { keywords: ['8 zone', 'eight zone', '8 zones'], answer: `**FZ excess baggage – 8 zones:** 1 UAE, 2 Gulf, 3 KSA, 4 ME, 5 Africa, 6 Sub-Continent, 7 SEA, 8 Europe/CIS. Rate = origin zone × destination zone. Use **Excess Baggage** tab, airline FZ.` },
];

// =============================================================================
// FULL POSSIBILITIES – ALL keyword phrasings with FULL answers (exhaustive coverage)
// Every possible way to ask, each with complete answer text.
// =============================================================================

const FULL_POSSIBILITIES_QA = [
    // --- EXCESS BAGGAGE (all phrasings → full answer) ---
    { keywords: ['excess', 'excess bag', 'excess luggage', 'extra bag', 'overweight', 'additional bag', 'baggage rate', 'baggage cost', 'baggage fee', 'baggage charge', 'baggage price'], answer: `**Excess Baggage – Full answer**\n\n**Tab:** **Excess Baggage**\n**Steps:** 1) Enter **origin** and **destination** (airport codes). 2) Select **airline**: **FZ** (Flydubai – 8 zones, per kg in selected currency), **EK** (Emirates – per kg USD by region, per piece from Africa/Americas/Canada), **OAL** (same as EK), **UA** (flat $75/$100/$200 – only for FZ–UA interline), **AC** (same as UA – only for FZ–AC interline). 3) Select **currency**. 4) Click **Calculate**.\n\n**All possibilities:**\n• **FZ:** Per kg by zone (1–8); route exceptions CMB–MLE (LKR 3025), MLE–CMB (USD 10); India note (INR 900 without pre-purchase).\n• **EK/OAL:** Per kg USD by region (ME/SA, Africa, Far East, Europe, ANZ); per piece USD/CAD when origin Africa/Americas/Canada; LCA–MLA $15/kg.\n• **UA/AC:** Free 23 kg (Eco) / 32 kg (Bus); 1st $75, 2nd $100, 3+ $200; oversize/overweight $200. Use UA/AC only when journey is FZ–UA or FZ–AC.` },
    { keywords: ['excess baggage', 'excess baggage rate', 'excess baggage cost', 'excess baggage fee', 'excess baggage price', 'calculate excess', 'get excess rate', 'how much excess'], answer: `**Excess Baggage – Full answer**\n\n**Tab:** **Excess Baggage**\n**Steps:** 1) Enter **origin** and **destination**. 2) Select **airline** (FZ, EK, OAL, UA, AC). 3) Select **currency**. 4) Click **Calculate**.\n\n**All answers:** **FZ** = per kg by 8 zones; **EK/OAL** = per kg USD by region + per piece from Africa/Americas/Canada; **UA/AC** = flat $75/$100/$200 (only on FZ–UA/FZ–AC interline). Exceptions: CMB–MLE, MLE–CMB, India (INR 900 note), LCA–MLA $15/kg (EK/OAL).` },
    // --- UPGRADE (all phrasings → full answer) ---
    { keywords: ['upgrade', 'upgrade business', 'business upgrade', 'upgrade rate', 'upgrade cost', 'upgrade fee', 'upgrade price', 'calculate upgrade', 'get upgrade rate', 'how much upgrade'], answer: `**Upgrade to Business – Full answer**\n\n**Tab:** **Upgrade to Business**\n**Steps:** 1) Enter **origin** airport. 2) Select **currency** (AED, USD, SAR, etc.). 3) Click **Calculate**.\n\n**All answers:** At-airport rate by zone (1–3) and currency (e.g. Zone 1 AED 1300, Zone 2 AED 2100, Zone 3 AED 2500). On-board rate (e.g. AED 1400/2100/2300). Infant rate shown when available.\n\n**All exceptions:** KWI AED 660/KWD 55; BAH AED 535/BHD 55; MCT AED 715/OMR 75; Saudi (all KSA) AED 1175/SAR 1200; India (all India) AED 1315/INR 30640; BGW AED 1650/USD 450; TLV AED 2185/USD 595; KTM AED 2185/NPR 81350; CMB–MLE AED 745/LKR 60080; MLE–CMB AED 920/USD 250. Pakistan on-board AED: 1500/2400/2700.` },
    // --- GO-SHOW (all phrasings → full answer) ---
    { keywords: ['go show', 'goshow', 'go-show', 'go show fare', 'go show rate', 'go show cost', 'standby', 'standby fare', 'economy fare', 'business fare', 'one way fare', 'adult fare', 'infant fare'], answer: `**Go-Show Fares – Full answer**\n\n**Tab:** **Go-Show Fares**\n**Steps:** 1) Enter **origin** airport code. 2) Select **class**: Economy or Business. 3) Click **Calculate**.\n\n**All answers:** One-way fare by origin. Adult and Infant fares shown. Use for show-up-at-airport (standby) fares.` },
    // --- EXTRA LEGROOM (all phrasings → full answer) ---
    { keywords: ['legroom', 'extra legroom', 'xlgr', 'legroom rate', 'legroom cost', 'legroom fee', 'xlgr rate', 'stretch seat', 'more legroom'], answer: `**Extra Legroom (XLGR) – Full answer**\n\n**Tab:** **Extra Legroom**\n**Steps:** 1) Select **currency** (AED, USD, EUR, etc.). 2) View or calculate rate.\n\n**All answers:** **Airport rate** (at check-in) and **On Board rate** (on board) in many currencies. Currency exchange to USD shown where available.` },
    // --- SPORTS (all phrasings → full answer) ---
    { keywords: ['sports', 'sports equipment', 'sport equipment', 'speq', 'spex', 'sports rate', 'golf', 'ski', 'oversized sports', 'standard sports'], answer: `**Sports Equipment – Full answer**\n\n**Tab:** **Sports Equipment**\n**Steps:** 1) Select **currency**. 2) Select **type**: SPEQ (Standard) or SPEX (Oversized). 3) Click **Calculate**.\n\n**All answers:** Rate by currency and type. SPEQ = standard sports item; SPEX = oversized.` },
    // --- REPORTING (all phrasings → full answer) ---
    { keywords: ['reporting', 'reporting fee', 'reporting fees', 'lrtp', 'ertp', 'late reporting', 'early reporting', 'late report', 'early report'], answer: `**Reporting Fees – Full answer**\n\n**Tab:** **Reporting Fees**\n**Steps:** 1) Select **currency**. 2) Select **type**: LRTP (Late Reporting) or ERTP (Early Reporting). 3) Click **Calculate**.\n\n**All answers:** Fee by currency. LRTP = Late Reporting; ERTP = Early Reporting.` },
    // --- TRANSFER (all phrasings → full answer) ---
    { keywords: ['transfer', 'transfer baggage', 'transfer bag', 'trbf', 'transfer fee', 'transfer rate', 'dxb transfer', 'outstation transfer'], answer: `**Transfer Baggage (TRBF) – Full answer**\n\n**Tab:** **Transfer Baggage**\n\n**All answers:** **At DXB:** AED 50 + GHA fee AED 50. **Outstation:** USD 30 + GHA fee as applicable. SSR code TRBF.` },
    // --- INTERLINE (all phrasings → full answer) ---
    { keywords: ['interline', 'which carrier', 'whose rate', 'which rate', 'which airline', 'carrier rate', 'rate apply', 'transatlantic'], answer: `**Interline – Full answer**\n\n**Which carrier's rate applies:**\n• **FZ – EK** → **EK rates**\n• **FZ – EK – AC** (EK transatlantic) → **EK rates**\n• **FZ – OAL** → **EK rates**\n• **FZ – AC** (AC transatlantic) → **AC rates**\n• **FZ – UA** (UA transatlantic) → **UA rates**\n\n**Tab:** **Excess Baggage** – select airline **EK**, **OAL**, **AC**, or **UA** according to the rule. **Reference** tab has full interline table. Document: GO-SHOW/UPGRADE/EXCESS BAGGAGE RATES Version 2025.112(A) Outstation, Effective 17 May 2025.` },
    // --- UA / AC (all phrasings → full answer) ---
    { keywords: ['ua', 'ac', 'united', 'air canada', 'ua rate', 'ac rate', 'united rate', 'air canada rate', 'flat fee', 'flat usd', '75 100 200'], answer: `**UA / AC – Full answer**\n\n**When:** Use **UA** or **AC** only when journey is **FZ–UA** or **FZ–AC** interline (United or Air Canada is the long-haul carrier). For FZ or EK routes (e.g. to Dubai), use **FZ** or **EK** in Excess Baggage tab.\n\n**Flat USD fees** = fixed $ per bag (not per kg): **Free allowance** Economy 0–23 kg, Business 0–32 kg. **1st excess bag** $75, **2nd** $100, **3 or more** $200. **Oversize** $200, **Overweight** $200.\n\n**Tab:** **Excess Baggage** – select **UA** or **AC**.` },
    // --- EK / OAL (all phrasings → full answer) ---
    { keywords: ['ek', 'oal', 'emirates', 'other airlines', 'ek rate', 'oal rate', 'emirates rate', 'per kg', 'per kilogram', 'usd per kg'], answer: `**EK / OAL – Full answer**\n\n**When:** Use **EK** or **OAL** for FZ–EK or FZ–OAL interline (or EK/OAL routes).\n\n**All answers:** **Per kg** in **USD** by region (ME/SA, Africa, Far East, Europe, ANZ). **Per piece** in **USD** or **CAD** when origin is Africa, Americas, or Canada. **Larnaca–Malta** $15/kg. If rate missing for destination, refer to FS/SUP in charge.\n\n**Tab:** **Excess Baggage** – select **EK** or **OAL**, enter origin/destination, click **Calculate**.` },
    // --- FZ / FLYDUBAI (all phrasings → full answer) ---
    { keywords: ['fz', 'flydubai', 'fz rate', 'flydubai rate', 'fz excess', 'flydubai excess'], answer: `**FZ (Flydubai) – Full answer**\n\n**Excess baggage:** 8 zones, **per kg** in selected/destination currency. **Tab:** **Excess Baggage** – airline **FZ**, origin, destination, currency.\n\n**Other actions:** **Upgrade to Business** (Upgrade tab), **Go-Show Fares** (Go-Show tab), **Extra Legroom** (Extra Legroom tab), **Sports Equipment**, **Reporting Fees**, **Transfer Baggage** – each has its own tab.\n\n**Route exceptions:** CMB–MLE (LKR 3025), MLE–CMB (USD 10); India note (INR 900 without pre-purchase).` },
    // --- REFERENCE / DOCUMENT (all phrasings → full answer) ---
    { keywords: ['reference', 'document', 'reference tab', 'document version', 'full reference', 'interline table', 'regional list', 'disclaimer', 'fs sup', 'aircraft', '2025.112'], answer: `**Reference / Document – Full answer**\n\n**Tab:** **Reference**\n\n**All content:** Interline table (which carrier's rates apply), customer disclaimer (rates approximate; exact rate at airport at departure; if rate missing refer to FS/SUP in charge), FS/SUP note, Aircraft & XLGR seats table, EK/OAL excess text, UA/AC text, full regional classification (countries by region).\n\n**Document:** GO-SHOW/UPGRADE/EXCESS BAGGAGE RATES Version **2025.112(A)** Outstation. Issue 13 May 2025, Effective **17 May 2025**.` },
    // --- ROUTE (from X to Y) (all phrasings → full answer) ---
    { keywords: ['from to', 'excess from', 'excess to', 'to dubai', 'to dxb', 'from tas', 'rate from', 'rate to', 'baggage from', 'baggage to'], answer: `**Excess for a route (e.g. from TAS to Dubai) – Full answer**\n\n**Tab:** **Excess Baggage**\n**Steps:** 1) Enter **origin** (e.g. TAS) and **destination** (e.g. DXB). 2) Select **FZ** (Flydubai – per kg by zone) or **EK** (Emirates – per kg USD by region). 3) Currency, click **Calculate**.\n\n**All answers:** FZ and EK rates for that route will show. UA/AC flat fees apply only on FZ–UA or FZ–AC interline, not for FZ/EK-only routes to Dubai.` },
    // --- LCA MLA (all phrasings → full answer) ---
    { keywords: ['larnaca', 'malta', 'lca', 'mla', '15 per kg', 'cyprus malta'], answer: `**Larnaca–Malta – Full answer**\n\n**$15 USD per kilogram** for EK and OAL excess baggage between Larnaca (LCA) and Malta (MLA). Document Page 4.\n\n**Tab:** **Excess Baggage** – airline **EK** or **OAL**, origin LCA destination MLA (or vice versa), click **Calculate**.` },
    // --- DISCLAIMER (all phrasings → full answer) ---
    { keywords: ['disclaimer', 'approximate', 'exact rate', 'airport team', 'departure', 'quote', 'communicate', 'customer', 'fs sup', 'missing rate', 'refer to'], answer: `**Disclaimer – Full answer**\n\n**Customer disclaimer:**\n\n${EXCESS_BAGGAGE_DISCLAIMER}\n\nIf excess baggage rate is **missing** for a destination, refer to **FS/SUP in charge**. Communicate to customer that rates are approximate; for exact rate, check with **airport team at time of departure**.` },
    // --- ZONES (all phrasings → full answer) ---
    { keywords: ['zone', 'zones', '8 zone', 'eight zone', 'zone 1', 'zone 2', 'zone 3', 'fz zone', 'excess zone', 'upgrade zone'], answer: `**Zones – Full answer**\n\n**FZ excess baggage – 8 zones:** 1 UAE | 2 Gulf (Kuwait, Bahrain, Oman) | 3 KSA | 4 Middle East | 5 Africa | 6 Sub-Continent | 7 SEA | 8 Europe/CIS. Rate = origin zone × destination zone (per kg). **Tab:** Excess Baggage, airline FZ.\n\n**Upgrade – 3 zones:** Zone 1, 2, 3 by origin airport. **Tab:** Upgrade to Business. Zone shown when you calculate.` },
    // --- REGIONS (all phrasings → full answer) ---
    { keywords: ['region', 'regions', 'regional', 'classification', 'country list', 'middle east', 'south asia', 'africa', 'europe', 'far east', 'anz', 'americas'], answer: `**Regional classification (EK/OAL) – Full answer**\n\n${REFERENCE_TEXTS.REGIONAL_CLASSIFICATION}\n\n**Tab:** **Reference** for full country list by region (Middle East, South Asia, Africa, Europe, Far East, Americas, ANZ). Use **Excess Baggage** with EK or OAL for per-kg rates by region.` },
    // --- EXCEPTIONS (all phrasings → full answer) ---
    { keywords: ['exception', 'exceptions', 'exception rate', 'route exception', 'upgrade exception', 'excess exception'], answer: `**All exceptions – Full answer**\n\n**Excess baggage:** CMB–MLE (FZ LKR 3025); MLE–CMB (FZ USD 10); India without pre-purchase (INR 900 + taxes up to 20 kg); LCA–MLA $15/kg (EK/OAL).\n\n**Upgrade:** KWI AED 660/KWD 55; BAH AED 535/BHD 55; MCT AED 715/OMR 75; Saudi (all KSA) AED 1175/SAR 1200; India (all India) AED 1315/INR 30640; BGW AED 1650/USD 450; TLV AED 2185/USD 595; KTM AED 2185/NPR 81350; CMB–MLE AED 745/LKR 60080; MLE–CMB AED 920/USD 250; Pakistan on-board AED 1500/2400/2700.\n\nUse the relevant tab (Excess Baggage or Upgrade) with that origin/route to see the exception.` },
    // --- NUMBERS (all phrasings → full answer) ---
    { keywords: ['75', '100', '200', 'first bag', 'second bag', 'third bag', '1st bag', '2nd bag', '75 usd', '100 usd', '200 usd'], answer: `**UA/AC excess bag fees – Full answer**\n\n**$75** = 1st excess bag. **$100** = 2nd excess bag. **$200** = 3rd and more excess bags; also **oversize** $200 and **overweight** $200. Free allowance: Economy 0–23 kg, Business 0–32 kg.\n\n**Tab:** **Excess Baggage** – select **UA** or **AC** (only for FZ–UA or FZ–AC interline).` },
    { keywords: ['23 kg', '32 kg', '23 kilo', '32 kilo', 'free allowance', 'economy allowance', 'business allowance'], answer: `**Free baggage allowance (UA/AC) – Full answer**\n\n**Economy:** 0–23 kg free. **Business:** 0–32 kg free. Above that: 1st bag $75, 2nd $100, 3+ $200; oversize $200, overweight $200.\n\n**Tab:** **Excess Baggage** – airline **UA** or **AC**.` },
    { keywords: ['1300', '2100', '2500', '1400', '2300', 'zone 1 aed', 'zone 2 aed', 'zone 3 aed'], answer: `**Upgrade to Business (AED) – Full answer**\n\n**At airport:** Zone 1 AED 1300, Zone 2 AED 2100, Zone 3 AED 2500. **On board:** Zone 1 AED 1400, Zone 2 AED 2100, Zone 3 AED 2300. Exceptions apply for KWI, BAH, MCT, Saudi, India, BGW, TLV, KTM, CMB–MLE, MLE–CMB; Pakistan on-board AED 1500/2400/2700.\n\n**Tab:** **Upgrade to Business** – enter origin, currency, click **Calculate**.` },
    { keywords: ['660', '535', '715', '1175', '1200', '1315', '30640', 'kwi bah mct', 'saudi india upgrade'], answer: `**Upgrade exceptions (amounts) – Full answer**\n\n**Gulf:** KWI AED 660 / KWD 55; BAH AED 535 / BHD 55; MCT AED 715 / OMR 75.\n**Saudi:** All KSA AED 1175 / SAR 1200.\n**India:** All India AED 1315 / INR 30640.\n**Other:** BGW AED 1650/USD 450; TLV AED 2185/USD 595; KTM AED 2185/NPR 81350; CMB–MLE AED 745/LKR 60080; MLE–CMB AED 920/USD 250.\n\n**Tab:** **Upgrade to Business** with that origin.` },
    { keywords: ['3025', '60080', '745', '920', '250', '900', 'cmb mle', 'mle cmb', 'india 900'], answer: `**Route exceptions – Full answer**\n\n**CMB–MLE (FZ excess):** LKR 3025 per kg. **MLE–CMB (FZ excess):** USD 10. **CMB–MLE upgrade:** AED 745, LKR 60080. **MLE–CMB upgrade:** AED 920, USD 250. **India (FZ, no pre-purchase):** INR 900 + taxes up to 20 kg.\n\n**Tab:** **Excess Baggage** or **Upgrade to Business** with that route/origin.` },
    { keywords: ['50', '30', 'transfer 50', 'dxb 50', 'outstation 30'], answer: `**Transfer Baggage – Full answer**\n\n**At DXB:** AED 50 + GHA fee AED 50. **Outstation:** USD 30 + GHA fee as applicable. SSR code TRBF.\n\n**Tab:** **Transfer Baggage**.` },
    // --- CALCULATE / HOW (all phrasings → full answer) ---
    { keywords: ['calculate', 'get rate', 'get cost', 'get price', 'find rate', 'check rate', 'how much', 'how to calculate', 'how to get rate', 'rate calculator', 'price calculator'], answer: `**How to get a rate – Full answer**\n\n**All possibilities:**\n1. **Excess Baggage** → origin, destination, airline, currency → **Calculate**.\n2. **Upgrade to Business** → origin, currency → **Calculate**.\n3. **Go-Show Fares** → origin, class (Eco/Bus) → **Calculate**.\n4. **Extra Legroom** → currency → view/calculate.\n5. **Sports Equipment** → currency, SPEQ/SPEX → **Calculate**.\n6. **Reporting Fees** → currency, LRTP/ERTP → **Calculate**.\n7. **Transfer Baggage** → open tab for rate.\n\nResult and any exception or disclaimer will show. **Reference** tab for full rules.` },
    // --- HELP / HELLO / TABS (all phrasings → full answer) ---
    { keywords: ['hello', 'hi', 'hey', 'help', 'what can you', 'how does', 'intro', 'start', 'what can i do', 'which tab', 'what tab', 'tabs', 'menu', 'options'], answer: `**Help – Full answer**\n\nI'm the **Rate Calculator Agent**. You can ask about:\n\n**All actions/tabs:** 1) **Excess Baggage** (FZ, EK, OAL, UA, AC) 2) **Upgrade to Business** 3) **Go-Show Fares** 4) **Extra Legroom** 5) **Sports Equipment** 6) **Reporting Fees** 7) **Transfer Baggage** 8) **Reference** (interline, disclaimer, regions, aircraft) 9) **Ask Agent** (this tab).\n\n**Topics:** Interline (which carrier's rate), excess per kg/per piece, UA/AC flat fees ($75/$100/$200), Larnaca–Malta $15/kg, exceptions (KWI, BAH, MCT, Saudi, India, CMB–MLE, etc.), zones, regions, document version.\n\nType your question above. Answers from GO-SHOW/UPGRADE/EXCESS BAGGAGE RATES Version 2025.112(A) Outstation.` },
    { keywords: ['thank', 'thanks', 'bye', 'good', 'appreciate'], answer: `You're welcome. If you have another question about rates, interline, excess baggage, upgrade, or the document, just ask.` },
];

// =============================================================================
// ALL POSSIBILITIES FOR ALL ACTIONS – exhaustive keywords per action
// So any phrasing (calculate, get rate, how much, price, cost, etc.) maps to the right tab.
// =============================================================================

const ALL_ACTIONS_QA = [
    // ----- EXCESS BAGGAGE -----
    {
        keywords: ['excess baggage', 'excess bag', 'extra baggage', 'extra bag', 'overweight baggage', 'additional baggage', 'excess luggage', 'baggage rate', 'baggage cost', 'baggage fee', 'baggage charge', 'baggage price', 'excess rate', 'excess cost', 'excess fee', 'excess charge', 'excess price', 'calculate excess', 'get excess rate', 'excess baggage rate', 'excess baggage cost', 'excess baggage fee', 'excess baggage price', 'how much excess', 'excess baggage fz', 'excess baggage ek', 'excess baggage ua', 'excess baggage ac', 'excess baggage oal', 'per kg excess', 'per kilogram excess', 'excess by zone', 'excess by region', 'excess origin destination', 'excess from to'],
        answer: `**Action: Excess Baggage**\n\n**Tab:** **Excess Baggage**\n**Steps:** 1) Enter **origin** and **destination** (airport codes). 2) Select **airline**: FZ (Flydubai – per kg by zone), EK (Emirates – per kg USD by region), OAL (same as EK), UA (flat $75/$100/$200), AC (same as UA). 3) Select **currency** (or leave default). 4) Click **Calculate**.\n\n**Possibilities:** FZ = 8 zones, per kg; EK/OAL = per kg USD + per piece from Africa/Americas/Canada; UA/AC = flat fees. Route exceptions: CMB–MLE, MLE–CMB, India note, LCA–MLA $15/kg (EK/OAL).`
    },
    // ----- UPGRADE TO BUSINESS -----
    {
        keywords: ['upgrade to business', 'upgrade business', 'business upgrade', 'upgrade at airport', 'upgrade on board', 'upgrade onboard', 'upgrade rate', 'upgrade cost', 'upgrade fee', 'upgrade price', 'upgrade charge', 'calculate upgrade', 'get upgrade rate', 'how much upgrade', 'upgrade by zone', 'upgrade by currency', 'upgrade infant', 'upgrade exception', 'upgrade kwi', 'upgrade bah', 'upgrade mct', 'upgrade saudi', 'upgrade india', 'upgrade zone 1', 'upgrade zone 2', 'upgrade zone 3', 'business class upgrade', 'upgrading to business'],
        answer: `**Action: Upgrade to Business**\n\n**Tab:** **Upgrade to Business**\n**Steps:** 1) Enter **origin** airport code. 2) Select **currency** (AED, USD, SAR, etc.). 3) Click **Calculate**.\n\n**Possibilities:** At-airport rate by zone (1–3) and currency; on-board rate (often higher); infant rate when available. **Exceptions:** KWI (AED 660, KWD 55), BAH (AED 535, BHD 55), MCT (AED 715, OMR 75), Saudi (AED 1175, SAR 1200), India (AED 1315, INR 30640), BGW, TLV, KTM, CMB–MLE, MLE–CMB. Pakistan on-board AED: 1500/2400/2700.`
    },
    // ----- GO-SHOW FARES -----
    {
        keywords: ['go show', 'goshow', 'go-show fare', 'go show fare', 'go show rate', 'go show cost', 'go show price', 'go show fee', 'go-show rate', 'goshow rate', 'calculate go show', 'get go show', 'how much go show', 'standby fare', 'standby rate', 'economy fare', 'business fare', 'one way fare', 'fare by origin', 'adult fare', 'infant fare', 'go show economy', 'go show business', 'go show adult', 'go show infant'],
        answer: `**Action: Go-Show Fares**\n\n**Tab:** **Go-Show Fares**\n**Steps:** 1) Enter **origin** airport code. 2) Select **class**: Economy or Business. 3) Click **Calculate**.\n\n**Possibilities:** One-way fare by origin; Adult and Infant fares shown. Use for standby / show-up-at-airport fares.`
    },
    // ----- EXTRA LEGROOM (XLGR) -----
    {
        keywords: ['extra legroom', 'xlgr', 'legroom', 'legroom seat', 'extra legroom rate', 'extra legroom cost', 'extra legroom fee', 'extra legroom price', 'xlgr rate', 'xlgr cost', 'xlgr fee', 'calculate legroom', 'get legroom rate', 'how much legroom', 'legroom airport', 'legroom on board', 'legroom onboard', 'legroom by currency', 'stretch seat', 'more legroom'],
        answer: `**Action: Extra Legroom (XLGR)**\n\n**Tab:** **Extra Legroom**\n**Steps:** 1) Select **currency** (AED, USD, EUR, etc.). 2) Click **Calculate** (or view rates).\n\n**Possibilities:** **Airport rate** (at check-in) and **On Board rate** (purchased on board); currency exchange to USD shown where available.`
    },
    // ----- SPORTS EQUIPMENT -----
    {
        keywords: ['sports equipment', 'sport equipment', 'speq', 'spex', 'sports rate', 'sports cost', 'sports fee', 'sports price', 'calculate sports', 'get sports rate', 'how much sports', 'golf bag', 'ski equipment', 'oversized sports', 'standard sports', 'speq rate', 'spex rate'],
        answer: `**Action: Sports Equipment**\n\n**Tab:** **Sports Equipment**\n**Steps:** 1) Select **currency**. 2) Select **type**: SPEQ (Standard) or SPEX (Oversized). 3) Click **Calculate**.\n\n**Possibilities:** Rate by currency and type. SPEQ = standard sports item; SPEX = oversized.`
    },
    // ----- REPORTING FEES -----
    {
        keywords: ['reporting fee', 'reporting fees', 'late reporting', 'early reporting', 'lrtp', 'ertp', 'lrtp rate', 'ertp rate', 'late report', 'early report', 'calculate reporting', 'get reporting fee', 'how much reporting', 'reporting cost', 'reporting price', 'late report fee', 'early report fee'],
        answer: `**Action: Reporting Fees**\n\n**Tab:** **Reporting Fees**\n**Steps:** 1) Select **currency**. 2) Select **type**: LRTP (Late Reporting) or ERTP (Early Reporting). 3) Click **Calculate**.\n\n**Possibilities:** Fee by currency. LRTP = Late Reporting; ERTP = Early Reporting.`
    },
    // ----- TRANSFER BAGGAGE -----
    {
        keywords: ['transfer baggage', 'transfer bag', 'trbf', 'transfer fee', 'transfer rate', 'transfer cost', 'transfer price', 'calculate transfer', 'get transfer fee', 'how much transfer', 'dxb transfer', 'outstation transfer', 'transfer at dxb', 'transfer outstation', 'baggage transfer', 'ssr trbf'],
        answer: `**Action: Transfer Baggage (TRBF)**\n\n**Tab:** **Transfer Baggage**\n**Steps:** Open tab to see rate (or enter origin if applicable).\n\n**Possibilities:** **At DXB:** AED 50 + GHA fee AED 50. **Outstation:** USD 30 + GHA fee as applicable. SSR code TRBF.`
    },
    // ----- INTERLINE (which carrier / which rate) -----
    {
        keywords: ['interline', 'which carrier', 'which rate', 'whose rate', 'which airline', 'carrier rate', 'rate apply', 'interline rate', 'interline excess', 'fz ek rate', 'fz ac rate', 'fz ua rate', 'fz oal rate', 'transatlantic carrier', 'which carrier apply'],
        answer: `**Action: Interline – Which carrier's rate applies**\n\n**Rule:** FZ–EK → **EK**. FZ–EK–AC (EK transatlantic) → **EK**. FZ–OAL → **EK**. FZ–AC (AC transatlantic) → **AC**. FZ–UA (UA transatlantic) → **UA**.\n\n**Tab:** **Excess Baggage** – then select airline **EK**, **OAL**, **AC**, or **UA** according to the rule above. **Reference** tab has full interline table.`
    },
    // ----- REFERENCE / DOCUMENT -----
    {
        keywords: ['reference', 'reference tab', 'document', 'document version', 'full reference', 'interline table', 'regional list', 'disclaimer', 'fs sup', 'aircraft xlgr', 'aircraft table', 'regional classification', 'reference document', 'official document', 'rate document', '2025.112', 'outstation document'],
        answer: `**Action: Reference / Document**\n\n**Tab:** **Reference**\n\n**Possibilities:** Interline table (which carrier's rates apply), customer disclaimer, FS/SUP note, Aircraft & XLGR seats table, EK/OAL excess text, UA/AC text, full regional classification (countries by region). Document: GO-SHOW/UPGRADE/EXCESS BAGGAGE RATES Version 2025.112(A) Outstation, Effective 17 May 2025.`
    },
    // ----- CALCULATE / GET RATE (generic) -----
    {
        keywords: ['calculate', 'get rate', 'get cost', 'get price', 'get fee', 'find rate', 'find cost', 'check rate', 'look up rate', 'calculate rate', 'how much', 'how to calculate', 'how to get rate', 'where to calculate', 'where to get rate', 'rate calculator', 'price calculator', 'cost calculator'],
        answer: `**Action: Calculate / Get a rate**\n\n**Possibilities by need:**\n• **Excess baggage** → **Excess Baggage** tab (origin, destination, airline, currency).\n• **Upgrade to Business** → **Upgrade to Business** tab (origin, currency).\n• **Go-Show fare** → **Go-Show Fares** tab (origin, class).\n• **Extra Legroom** → **Extra Legroom** tab (currency).\n• **Sports equipment** → **Sports Equipment** tab (currency, type).\n• **Reporting fee** → **Reporting Fees** tab (currency, LRTP/ERTP).\n• **Transfer baggage** → **Transfer Baggage** tab.\n\nEnter the required fields and click **Calculate**.`
    },
    // ----- TABS / WHAT CAN I DO -----
    {
        keywords: ['what can i do', 'what can i calculate', 'which tab', 'what tab', 'tabs', 'all tabs', 'list of tabs', 'available actions', 'available tabs', 'menu', 'options', 'services', 'what services', 'rate calculator tabs'],
        answer: `**All actions / All tabs:**\n\n1. **Excess Baggage** – FZ, EK, OAL, UA, AC; origin, destination, currency.\n2. **Go-Show Fares** – Economy/Business by origin; adult/infant.\n3. **Sports Equipment** – SPEQ/SPEX by currency.\n4. **Reporting Fees** – LRTP/ERTP by currency.\n5. **Transfer Baggage** – TRBF; DXB or outstation.\n6. **Upgrade to Business** – at airport / on board; origin, currency.\n7. **Extra Legroom** – XLGR; airport/on board by currency.\n8. **Reference** – interline table, disclaimer, regions, aircraft XLGR.\n9. **Ask Agent** – ask in words (this tab).\n\nUse the tab that matches your need, fill fields, click **Calculate**.`
    }
];

// =============================================================================
// COMBINE ALL QA PAIRS (order matters: more specific first; ALL_ACTIONS_QA early)
// Add new QA arrays above and spread them here to scale beyond 1000+ lines.
// =============================================================================

export const QA_PAIRS = [
    ...INTERLINE_QA,
    ...DISCLAIMER_QA,
    ...EK_OAL_QA,
    ...ROUTE_EXCESS_QA,
    ...LCA_MLA_UA_AC_QA,
    ...REGIONAL_QA,
    ...UPGRADE_QA,
    ...OTHER_SERVICES_QA,
    ...INDIA_CMB_FZ_QA,
    ...OTHER_SECTIONS_QA,
    ...GENERAL_QA,
    ...FULL_POSSIBILITIES_QA,
    ...ALL_ACTIONS_QA,
    ...PHRASING_QA,
    ...EXPANDED_QA,
    ...CATCH_ALL_QA,
    ...NUMBERS_QA
];
