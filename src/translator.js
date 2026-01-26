export const translateStatus = (code) => {
    const c = (code || "").substring(0, 2).toUpperCase();
    const map = {
        HK: { label: "Confirmed", class: "status-hk", icon: "✓" },
        KK: { label: "Confirmed", class: "status-hk", icon: "✓" },
        KL: { label: "Confirmed", class: "status-hk", icon: "✓" },
        TK: { label: "Schedule Change", class: "status-tk", icon: "⚠" },
        CH: { label: "Change/Hold", class: "status-tk", icon: "🔄" },
        CS: { label: "Change Status", class: "status-tk", icon: "🔄" },
        UN: { label: "Cancelled (Airline)", class: "status-hx", icon: "✕" },
        UC: { label: "Unable Confirm", class: "status-hx", icon: "✕" },
        HX: { label: "Cancelled", class: "status-hx", icon: "✕" },
        XX: { label: "Cancelled", class: "status-hx", icon: "✕" },
        NO: { label: "No Action Taken", class: "status-hx", icon: "−" },
        US: { label: "Unable to Sell", class: "status-hx", icon: "✕" },
        SS: { label: "Sold", class: "status-hk", icon: "✓" },
        DK: { label: "Holding", class: "status-tk", icon: "⧖" }
    };
    return map[c] || { label: code, class: "", icon: "•" };
};

const AIRLINES = {
    // --- Major Systems ---
    "1A": "Amadeus", "1G": "Galileo", "1B": "Abacus", "1S": "Sabre", "1P": "Worldspan", "1F": "Infini",

    // --- Middle East & Africa ---
    FZ: "Flydubai", EK: "Emirates", QR: "Qatar Airways", EY: "Etihad Airways",
    TK: "Turkish Airlines", MS: "EgyptAir", SV: "Saudia", XY: "Flynas",
    G9: "Air Arabia", J9: "Jazeera Airways", KU: "Kuwait Airways", WY: "Oman Air",
    GF: "Gulf Air", ME: "Middle East Airlines", RJ: "Royal Jordanian",
    AT: "Royal Air Maroc", AH: "Air Algerie", TU: "Tunisair", LN: "Libyan Airlines",
    IY: "Yemenia", IA: "Iraqi Airways", IR: "Iran Air", W5: "Mahan Air",
    ET: "Ethiopian Airlines", KQ: "Kenya Airways", SA: "South African Airways",
    DT: "TAAG Angola", TM: "LAM Mozambique", VR: "Cabo Verde Airlines",
    MD: "Air Madagascar", UU: "Air Austral", HM: "Air Seychelles",
    WB: "RwandAir", TC: "Air Tanzania", HF: "Air Cote d'Ivoire",
    KP: "ASKY Airlines", UG: "Tunisair Express", RB: "Syrian Air",
    MK: "Air Mauritius", P4: "Air Peace", "8M": "Myanmar Airways Int", ID: "Batik Air Indonesia", OD: "Batik Air Malaysia",
    PG: "Bangkok Airways", Z5: "GMG Airlines", "4M": "LATAM Argentina", "4C": "LATAM Colombia",
    
    // --- Europe ---
    LH: "Lufthansa", AF: "Air France", KL: "KLM", BA: "British Airways",
    IB: "Iberia", TP: "TAP Air Portugal", AZ: "ITA Airways", LX: "Swiss Int. Air Lines",
    OS: "Austrian Airlines", SN: "Brussels Airlines", EI: "Aer Lingus",
    SK: "SAS Scandinavian", AY: "Finnair", SU: "Aeroflot", LO: "LOT Polish Airlines",
    MA: "Malev", RO: "Tarom", FB: "Bulgaria Air", JU: "Air Serbia",
    OU: "Croatia Airlines", A3: "Aegean Airlines", KM: "Air Malta",
    VS: "Virgin Atlantic", DY: "Norwegian", D8: "Norwegian Air Int",
    FR: "Ryanair", U2: "easyJet", W6: "Wizz Air", TO: "Transavia",
    HV: "Transavia", VY: "Vueling", PC: "Pegasus Airlines", XQ: "SunExpress",
    BT: "airBaltic", PS: "Ukraine Int. Airlines", B2: "Belavia",
    J2: "Azerbaijan Airlines", A9: "Georgian Airways", HY: "Uzbekistan Airways",
    KC: "Air Astana", DV: "SCAT Airlines", 

    // --- Americas ---
    UA: "United Airlines", AA: "American Airlines", DL: "Delta Air Lines",
    AC: "Air Canada", TS: "Air Transat", WS: "WestJet", AS: "Alaska Airlines",
    B6: "JetBlue", NK: "Spirit Airlines", F9: "Frontier Airlines", WN: "Southwest",
    HA: "Hawaiian Airlines", AM: "Aeromexico", CM: "Copa Airlines",
    AV: "Avianca", LA: "LATAM Airlines", JJ: "LATAM Brasil", XL: "LATAM Ecuador",
    AR: "Aerolineas Argentinas", G3: "Gol", AD: "Azul", H2: "Sky Airline",

    // --- Asia Pacific ---
    SQ: "Singapore Airlines", MH: "Malaysia Airlines", TG: "Thai Airways",
    VN: "Vietnam Airlines", GA: "Garuda Indonesia", PR: "Philippine Airlines",
    CX: "Cathay Pacific", BR: "EVA Air", CI: "China Airlines", HX: "Hong Kong Airlines",
    CA: "Air China", MU: "China Eastern", CZ: "China Southern", HU: "Hainan Airlines",
    MF: "XiamenAir", "3U": "Sichuan Airlines", ZH: "Shenzhen Airlines",
    NH: "All Nippon Airways", JL: "Japan Airlines", KE: "Korean Air", OZ: "Asiana Airlines",
    AI: "Air India", IX: "Air India Express", UK: "Vistara", "6E": "IndiGo",
    SG: "SpiceJet", G8: "Go First", PK: "Pakistan Int. Airlines", PA: "Airblue",
    BG: "Biman Bangladesh", BS: "US-Bangla Airlines", RX: "Regent Airways",
    UL: "SriLankan Airlines", KB: "Druk Air", RA: "Nepal Airlines",
    QF: "Qantas", VA: "Virgin Australia", NZ: "Air New Zealand", FJ: "Fiji Airways",
    JQ: "Jetstar", TR: "Scoot", AK: "AirAsia", D7: "AirAsia X",
    "5J": "Cebu Pacific", Z2: "AirAsia Zest", I5: "AirAsia India", QZ: "Indonesia AirAsia",
    FD: "Thai AirAsia", XJ: "Thai AirAsia X", ZG: "AirAsia Zest",
    "9C": "Spring Airlines", HO: "Juneyao Airlines", "9H": "Air Changan", "3Q": "China Yunnan Airlines"
};

export const translateAirline = (code) => {
    if (!code) return "";
    return AIRLINES[code.toUpperCase()] || code;
};

const CITIES = {
    // --- Middle East ---
    DXB: "Dubai (Intl)", DWC: "Dubai (World Central)", SHJ: "Sharjah", AUH: "Abu Dhabi",
    DOH: "Doha", BAH: "Bahrain", MCT: "Muscat", KWI: "Kuwait",
    RUH: "Riyadh", JED: "Jeddah", DMM: "Dammam", MED: "Madinah",
    GIZ: "Gizan", AHB: "Abha", TUU: "Tabuk", TIF: "Taif", ELQ: "Gassim",
    HAS: "Hail", YNB: "Yanbu", URY: "Gurayat", AJF: "Al Jouf",
    AMM: "Amman", BEY: "Beirut", DAM: "Damascus", BGW: "Baghdad", EBL: "Erbil",
    NJF: "Najaf", BSR: "Basra", KWI: "Kuwait", TLV: "Tel Aviv",
    IKA: "Tehran (Imam Khomeini)", THR: "Tehran (Mehrabad)", MHD: "Mashhad", SYZ: "Shiraz",
    
    // --- Africa ---
    CAI: "Cairo", HBE: "Alexandria", LXR: "Luxor", SSH: "Sharm El Sheikh", HRG: "Hurghada",
    KRT: "Khartoum", JUB: "Juba", ADD: "Addis Ababa", JIB: "Djibouti",
    NBO: "Nairobi", MBA: "Mombasa", DAR: "Dar Es Salaam", JRO: "Kilimanjaro", ZNZ: "Zanzibar",
    EBB: "Entebbe", KGL: "Kigali", BJM: "Bujumbura", FIH: "Kinshasa",
    LOS: "Lagos", ABV: "Abuja", ACC: "Accra", DKR: "Dakar", CMN: "Casablanca",
    TUN: "Tunis", ALG: "Algiers", TIP: "Tripoli", JNB: "Johannesburg", CPT: "Cape Town",
    
    // --- Europe ---
    LHR: "London (Heathrow)", LGW: "London (Gatwick)", STN: "London (Stansted)", LTN: "Luton",
    MAN: "Manchester", BHX: "Birmingham", GLA: "Glasgow", EDI: "Edinburgh", DUB: "Dublin",
    CDG: "Paris (CDG)", ORY: "Paris (Orly)", NCE: "Nice", LYS: "Lyon", MRS: "Marseille",
    FRA: "Frankfurt", MUC: "Munich", BER: "Berlin", DUS: "Dusseldorf", HAM: "Hamburg",
    AMS: "Amsterdam", BRU: "Brussels", ZRH: "Zurich", GVA: "Geneva", VIE: "Vienna",
    FCO: "Rome (Fiumicino)", MXP: "Milan (Malpensa)", LIN: "Milan (Linate)", VCE: "Venice",
    MAD: "Madrid", BCN: "Barcelona", AGP: "Malaga", PMI: "Palma de Mallorca",
    LIS: "Lisbon", OPO: "Porto", ATH: "Athens", SKG: "Thessaloniki",
    IST: "Istanbul (IST)", SAW: "Istanbul (Sabiha)", ESB: "Ankara", AYT: "Antalya", ADB: "Izmir",
    SVO: "Moscow (Sheremetyevo)", DME: "Moscow (Domodedovo)", VKO: "Moscow (Vnukovo)", LED: "St. Petersburg",
    KBP: "Kyiv (Boryspil)", IEV: "Kyiv (Zhuliany)", WAW: "Warsaw", PRG: "Prague", BUD: "Budapest",
    OTP: "Bucharest", SOF: "Sofia", BEG: "Belgrade", ZAG: "Zagreb", SJJ: "Sarajevo",
    TIA: "Tirana", SKP: "Skopje", PRN: "Pristina", VNO: "Vilnius", RIX: "Riga", TLL: "Tallinn",

    // --- Asia ---
    DEL: "Delhi", BOM: "Mumbai", BLR: "Bangalore", MAA: "Chennai", HYD: "Hyderabad",
    COK: "Kochi", CCJ: "Kozhikode", TRV: "Thiruvananthapuram", CCU: "Kolkata", AMD: "Ahmedabad",
    KHI: "Karachi", LHE: "Lahore", ISB: "Islamabad", PEW: "Peshawar", SKT: "Sialkot", Multan: "MUX",
    DAC: "Dhaka", CGP: "Chittagong", ZYL: "Sylhet", KTM: "Kathmandu", CMB: "Colombo", MLE: "Male",
    BKK: "Bangkok (Suvarnabhumi)", DMK: "Bangkok (Don Mueang)", HKT: "Phuket", CNX: "Chiang Mai",
    SIN: "Singapore", KUL: "Kuala Lumpur", CGK: "Jakarta", DPS: "Bali",
    MNL: "Manila", SGN: "Ho Chi Minh City", HAN: "Hanoi", PNH: "Phnom Penh",
    HKG: "Hong Kong", PVG: "Shanghai (Pudong)", SHA: "Shanghai (Hongqiao)", PEK: "Beijing (Capital)",
    PKX: "Beijing (Daxing)", CAN: "Guangzhou", CTU: "Chengdu", SZX: "Shenzhen",
    NRT: "Tokyo (Narita)", HND: "Tokyo (Haneda)", KIX: "Osaka", ICN: "Seoul (Incheon)",
    KBL: "Kabul", TAS: "Tashkent", ALA: "Almaty", NQZ: "Astana", DYU: "Dushanbe", ASB: "Ashgabat",
    GYD: "Baku", EVN: "Yerevan", TBS: "Tbilisi",

    // --- Americas ---
    JFK: "New York (JFK)", EWR: "Newark", LGA: "LaGuardia", BOS: "Boston", IAD: "Washington (Dulles)",
    DCA: "Washington (Reagan)", ATL: "Atlanta", MCO: "Orlando", MIA: "Miami", FLL: "Fort Lauderdale",
    ORD: "Chicago (O'Hare)", DFW: "Dallas Fort Worth", IAH: "Houston", DEN: "Denver",
    LAX: "Los Angeles", SFO: "San Francisco", SEA: "Seattle", LAS: "Las Vegas",
    YYZ: "Toronto", YVR: "Vancouver", YUL: "Montreal", YYC: "Calgary",
    MEX: "Mexico City", CUN: "Cancun", PTY: "Panama City", BOG: "Bogota",
    GRU: "Sao Paulo", GIG: "Rio de Janeiro", EZE: "Buenos Aires", SCL: "Santiago", LIM: "Lima",

    // --- Oceania ---
    SYD: "Sydney", MEL: "Melbourne", BNE: "Brisbane", PER: "Perth", AKL: "Auckland"
};

export const translateCity = (code) => {
    if (!code) return "";
    return CITIES[code.toUpperCase()] || code;
};

// Comprehensive SSR Code explanations - All SSR codes used in GDS systems
const SSR_EXPLANATIONS = {
    // Ticket & Document Related
    'TKNE': { title: 'E-Ticket Number', desc: 'Electronic ticket number issued for this booking.' },
    'TKNM': { title: 'Ticket Number (Manual)', desc: 'Manual ticket number entry.' },
    'DOCS': { title: 'Travel Documents', desc: 'Passport/ID document information for APIS (Advanced Passenger Information System).' },
    'DOCO': { title: 'Other Documents', desc: 'Visa, redress number, or other travel document details.' },
    'DOCA': { title: 'Address Information', desc: 'Passenger destination or residence address for US/Canada APIS.' },
    'FOID': { title: 'Frequent Flyer ID', desc: 'Frequent flyer program identification number.' },
    'FQTV': { title: 'Frequent Flyer', desc: 'Frequent flyer program membership information.' },
    'FQTU': { title: 'Frequent Flyer Update', desc: 'Update to frequent flyer information.' },
    'FQTR': { title: 'Frequent Flyer Request', desc: 'Request for frequent flyer credit.' },
    
    // Contact Information
    'CTCE': { title: 'Contact Email', desc: 'Passenger contact email address.' },
    'CTCM': { title: 'Contact Mobile', desc: 'Passenger contact mobile phone number.' },
    'CTCH': { title: 'Contact Home', desc: 'Passenger contact home phone number.' },
    'CTCT': { title: 'Contact Telephone', desc: 'Passenger contact telephone number.' },
    'CTCP': { title: 'Contact Phone (Primary)', desc: 'Primary phone contact number.' },
    'CTCF': { title: 'Contact Fax', desc: 'Passenger contact fax number.' },
    
    // Wheelchair & Mobility Assistance
    'WCHR': { title: 'Wheelchair (Ramp)', desc: 'Passenger needs wheelchair but can walk to seat.' },
    'WCHS': { title: 'Wheelchair (Steps)', desc: 'Passenger needs wheelchair and cannot ascend stairs.' },
    'WCHC': { title: 'Wheelchair (Cabin)', desc: 'Passenger is completely immobile and needs wheelchair in cabin.' },
    'WCHP': { title: 'Wheelchair (Power)', desc: 'Passenger needs powered wheelchair.' },
    'WCMP': { title: 'Wheelchair (Manual)', desc: 'Passenger needs manual wheelchair.' },
    'WCBD': { title: 'Wheelchair (Battery)', desc: 'Passenger traveling with battery-powered wheelchair.' },
    'WCBW': { title: 'Wheelchair (Wet Cell)', desc: 'Wet cell battery wheelchair.' },
    'WCCO': { title: 'Wheelchair (Collapsible)', desc: 'Collapsible wheelchair.' },
    
    // Special Meals
    'VGML': { title: 'Vegetarian Meal', desc: 'Request for vegetarian meal.' },
    'AVML': { title: 'Asian Vegetarian Meal', desc: 'Request for Asian vegetarian meal.' },
    'VLML': { title: 'Vegetarian Lacto-Ovo Meal', desc: 'Vegetarian meal with dairy and eggs.' },
    'VJML': { title: 'Vegetarian Jain Meal', desc: 'Jain vegetarian meal (no root vegetables).' },
    'KSML': { title: 'Kosher Meal', desc: 'Request for kosher meal.' },
    'MOML': { title: 'Muslim Meal', desc: 'Request for Muslim/halal meal.' },
    'HNML': { title: 'Hindu Meal', desc: 'Request for Hindu vegetarian meal.' },
    'DBML': { title: 'Diabetic Meal', desc: 'Request for diabetic meal.' },
    'BLML': { title: 'Bland Meal', desc: 'Request for bland/soft meal.' },
    'CHML': { title: 'Child Meal', desc: 'Request for child meal.' },
    'BBML': { title: 'Baby Meal', desc: 'Request for baby meal.' },
    'LCML': { title: 'Low Calorie Meal', desc: 'Request for low calorie meal.' },
    'LFML': { title: 'Low Fat Meal', desc: 'Request for low fat meal.' },
    'LSML': { title: 'Low Salt Meal', desc: 'Request for low salt meal.' },
    'NLML': { title: 'Non-Lactose Meal', desc: 'Request for non-lactose meal.' },
    'ORML': { title: 'Oriental Meal', desc: 'Request for oriental meal.' },
    'PFML': { title: 'Peanut Free Meal', desc: 'Request for peanut-free meal.' },
    'RFML': { title: 'Raw Fish Meal', desc: 'Request for raw fish meal (sushi).' },
    'SFML': { title: 'Seafood Meal', desc: 'Request for seafood meal.' },
    'SPML': { title: 'Special Meal', desc: 'Request for special meal (unspecified).' },
    'VGML': { title: 'Vegan Meal', desc: 'Request for vegan meal (no animal products).' },
    'GFML': { title: 'Gluten Free Meal', desc: 'Request for gluten-free meal.' },
    'HFML': { title: 'High Fiber Meal', desc: 'Request for high fiber meal.' },
    'PRML': { title: 'Low Purine Meal', desc: 'Request for low purine meal.' },
    'RVML': { title: 'Raw Vegetarian Meal', desc: 'Request for raw vegetarian meal.' },
    
    // Special Services
    'BSCT': { title: 'Bassinet', desc: 'Request for baby bassinet seat.' },
    'UMNR': { title: 'Unaccompanied Minor', desc: 'Child traveling alone without adult supervision.' },
    'UMNL': { title: 'Unaccompanied Minor (Local)', desc: 'Unaccompanied minor for local travel.' },
    'UMNE': { title: 'Unaccompanied Minor (Escort)', desc: 'Unaccompanied minor with escort required.' },
    'DPNA': { title: 'Deaf Passenger', desc: 'Deaf passenger requiring special assistance.' },
    'BLND': { title: 'Blind Passenger', desc: 'Blind passenger requiring special assistance.' },
    'DEAF': { title: 'Hearing Impaired', desc: 'Hearing impaired passenger requiring special assistance.' },
    'MAAS': { title: 'Meet and Assist', desc: 'Request for meet and assist service at airport.' },
    'SPEQ': { title: 'Special Equipment', desc: 'Special equipment required for passenger.' },
    'OXYG': { title: 'Oxygen', desc: 'Passenger requires oxygen during flight.' },
    'MEDA': { title: 'Medical Assistance', desc: 'Medical assistance required.' },
    'STCR': { title: 'Stretcher', desc: 'Passenger requires stretcher.' },
    'EXST': { title: 'Extra Seat', desc: 'Request for extra seat (e.g., for comfort or medical).' },
    'PETC': { title: 'Pet in Cabin', desc: 'Pet traveling in cabin.' },
    'AVIH': { title: 'Live Animal in Hold', desc: 'Live animal traveling in cargo hold.' },
    'WEAP': { title: 'Weapon', desc: 'Weapon authorization (law enforcement).' },
    'DEPU': { title: 'Deportee', desc: 'Deportee under escort.' },
    'INAD': { title: 'Inadmissible Passenger', desc: 'Inadmissible passenger information.' },
    'PAXL': { title: 'Pax Locator', desc: 'Passenger locator information.' },
    
    // Seat & Cabin Services
    'NSST': { title: 'Seat Status', desc: 'Seat assignment status transmitted to airline.' },
    'SEAT': { title: 'Seat Request', desc: 'Specific seat request.' },
    'SMOK': { title: 'Smoking Seat', desc: 'Smoking seat preference (rarely used).' },
    'NSSA': { title: 'No Smoking Seat Aisle', desc: 'Non-smoking aisle seat preference.' },
    'NSSW': { title: 'No Smoking Seat Window', desc: 'Non-smoking window seat preference.' },
    'NSSM': { title: 'No Smoking Seat Middle', desc: 'Non-smoking middle seat preference.' },
    
    // Other Service Information
    'OTHS': { title: 'Other Service Information', desc: 'Additional service information or special instructions.' },
    'ADTK': { title: 'Advise Ticketing', desc: 'Ticket deadline warning - issue ticket by deadline or booking cancels.' },
    'TKTL': { title: 'Ticket Time Limit', desc: 'Ticket time limit information.' },
    'TKTN': { title: 'Ticket Number', desc: 'Ticket number information.' },
    'TKTT': { title: 'Ticket Type', desc: 'Ticket type information.' },
    
    // India GST Related
    'GSTN': { title: 'GST Number', desc: 'Goods and Services Tax identification number (India).' },
    'GSTE': { title: 'GST Email', desc: 'GST email address for invoice.' },
    'GSTP': { title: 'GST Phone', desc: 'GST phone number for invoice.' },
    'GSTC': { title: 'GST Company', desc: 'GST company name for invoice.' },
    
    // Security & Immigration
    'REDS': { title: 'Redress Number', desc: 'TSA Redress Number (US security).' },
    'APIS': { title: 'APIS Data', desc: 'Advanced Passenger Information System data.' },
    'SSSS': { title: 'Secondary Security Screening', desc: 'Passenger selected for secondary security screening.' },
    'DHSG': { title: 'DHS Global Entry', desc: 'DHS Global Entry program member.' },
    'TSAP': { title: 'TSA PreCheck', desc: 'TSA PreCheck program member.' },
    'NEXU': { title: 'NEXUS', desc: 'NEXUS program member (US/Canada border).' },
    'SENT': { title: 'SENTRI', desc: 'SENTRI program member (US/Mexico border).' },
    
    // Special Requests
    'VALG': { title: 'Valuable Baggage', desc: 'Valuable baggage declaration.' },
    'AUTH': { title: 'Authorization', desc: 'Special authorization required.' },
    'INFT': { title: 'Infant', desc: 'Infant traveling with adult.' },
    'CHLD': { title: 'Child', desc: 'Child passenger information.' },
    'YTH': { title: 'Youth', desc: 'Youth passenger information.' },
    'STUD': { title: 'Student', desc: 'Student passenger information.' },
    'MILT': { title: 'Military', desc: 'Military personnel information.' },
    'DIPL': { title: 'Diplomatic', desc: 'Diplomatic passenger information.' },
    
    // Payment & Financial
    'FOPC': { title: 'Form of Payment Cash', desc: 'Cash payment form.' },
    'FOPD': { title: 'Form of Payment Credit', desc: 'Credit card payment form.' },
    'FOPK': { title: 'Form of Payment Check', desc: 'Check payment form.' },
    'FOPO': { title: 'Form of Payment Other', desc: 'Other payment form.' }
};

// Parse SSR status
const parseSSRStatus = (status) => {
    if (!status) return { label: 'Pending', class: 'status-tk', icon: '⧖' };
    const s = status.substring(0, 2).toUpperCase();
    const map = {
        'HK': { label: 'Confirmed', class: 'status-hk', icon: '✓' },
        'KK': { label: 'Confirmed', class: 'status-hk', icon: '✓' },
        'XX': { label: 'Cancelled', class: 'status-hx', icon: '✕' },
        'UN': { label: 'Unable', class: 'status-hx', icon: '✕' },
        'NN': { label: 'Not Requested', class: 'status-tk', icon: '−' }
    };
    return map[s] || { label: status, class: '', icon: '•' };
};

export const translateSSR = (text) => {
    const t = (text || "").toUpperCase();
    
    // Critical messages
    if (t.includes("NOSHO")) return { title: "No Show", msg: "Passenger missed flight.", type: "critical" };
    if (t.includes("CANCELLED") || t.includes("CANCELED") || t.includes("XLD")) return { title: "Cancellation", msg: "Booking/Segment cancelled.", type: "critical" };
    if (t.includes("UNABLE")) return { title: "Request Failed", msg: "System rejected request.", type: "critical" };
    
    // Warnings
    if (t.includes("ADTK") || t.includes("TIME LIMIT")) {
        const timeMatch = t.match(/ADTK\s+BY\s+(\d{2}[A-Z]{3}\d{2})\s+(\d{4})/);
        if (timeMatch) {
            return { title: "Ticket Deadline", msg: `Issue ticket by ${timeMatch[1]} ${timeMatch[2]} GMT or booking will be cancelled.`, type: "warning" };
        }
        return { title: "Ticket Deadline", msg: "Issue ticket by deadline or booking cancels.", type: "warning" };
    }
    
    // Parse specific SSR codes
    for (const [code, info] of Object.entries(SSR_EXPLANATIONS)) {
        const ssrPattern = new RegExp(`SSR\\s*${code}(?:\\s+[A-Z0-9]{2})?\\s+([A-Z]{2}\\d+)?`, 'i');
        if (t.match(ssrPattern) || t.includes(`SSR ${code}`) || t.includes(`SSR${code}`)) {
            const statusMatch = t.match(ssrPattern);
            const status = statusMatch && statusMatch[1] ? parseSSRStatus(statusMatch[1]) : null;
            
            // Special handling for TKNE (ticket numbers)
            if (code === 'TKNE') {
                const ticketMatch = t.match(/(\d{13})/);
                if (ticketMatch) {
                    // Extract flight info if available
                    const flightMatch = t.match(/([A-Z]{3})([A-Z]{3})(\d{1,4}[A-Z]?)(\d{2}[A-Z]{3})/);
                    const flightInfo = flightMatch ? ` for ${flightMatch[1]}-${flightMatch[2]} ${flightMatch[3]} on ${flightMatch[4]}` : '';
                    return { 
                        title: "E-Ticket Issued", 
                        msg: `E-Ticket number ${ticketMatch[1]} has been issued${flightInfo}.`, 
                        type: "info",
                        ssrCode: code,
                        details: info.desc
                    };
                }
            }
            
            // Special handling for DOCS
            if (code === 'DOCS') {
                const docMatch = t.match(/DOCS[^\/]+\/P\/([A-Z]{3})\/([A-Z0-9]+)\/([A-Z]{3})\/(\d{2}[A-Z]{3}\d{2})\/([MF])\/(\d{2}[A-Z]{3}\d{2})/);
                if (docMatch) {
                    return {
                        title: "Passport Information",
                        msg: `Passport ${docMatch[2]} issued in ${docMatch[1]}, expires ${docMatch[6]}.`,
                        type: "info",
                        ssrCode: code,
                        details: info.desc
                    };
                }
            }
            
            // Special handling for OTHS (other service information)
            if (code === 'OTHS') {
                const othsText = t.substring(t.indexOf('OTHS') + 4).replace(/^[A-Z0-9\s]+\s+/, '');
                return {
                    title: "Special Instructions",
                    msg: othsText.substring(0, 150) + (othsText.length > 150 ? '...' : ''),
                    type: "info",
                    ssrCode: code,
                    details: info.desc
                };
            }
            
            return {
                title: info.title,
                msg: info.desc + (status ? ` Status: ${status.label}` : ''),
                type: status && status.class === 'status-hx' ? 'warning' : 'info',
                ssrCode: code,
                details: info.desc
            };
        }
    }
    
    return null;
};

// OSI Type explanations
const OSI_TYPES = {
    'CTCE': { title: 'Contact Email', desc: 'Email contact information.' },
    'CTCM': { title: 'Contact Mobile', desc: 'Mobile phone contact information.' },
    'CTCH': { title: 'Contact Home', desc: 'Home phone contact information.' },
    'CTCT': { title: 'Contact Telephone', desc: 'Contact telephone number. Often includes travel agency or company name along with the phone number.' },
    'CTCP': { title: 'Contact Phone (Primary)', desc: 'Primary phone contact information. Usually the main contact number for the booking or travel agency.' },
    'CTCF': { title: 'Contact Fax', desc: 'Fax contact information.' },
    'RLOC': { title: 'Related Record Locator', desc: 'Related booking reference (PNR).' },
    'RMKS': { title: 'Remarks', desc: 'General remarks or notes.' },
    'HIST': { title: 'History', desc: 'Historical information or notes.' },
    'CUST': { title: 'Customer', desc: 'Customer information or notes.' },
    'AGNT': { title: 'Agent', desc: 'Travel agent information or notes.' },
    'CORP': { title: 'Corporate', desc: 'Corporate account information.' },
    'GRPN': { title: 'Group Name', desc: 'Group name or identifier.' },
    'TOUR': { title: 'Tour', desc: 'Tour operator or package information.' },
    'PKGE': { title: 'Package', desc: 'Package tour information.' },
    'INVO': { title: 'Invoice', desc: 'Invoice or billing information.' },
    'PAYM': { title: 'Payment', desc: 'Payment information or notes.' },
    'REFD': { title: 'Refund', desc: 'Refund information or notes.' },
    'EXCH': { title: 'Exchange', desc: 'Exchange information or notes.' },
    'VOID': { title: 'Void', desc: 'Void transaction information.' },
    'CANC': { title: 'Cancel', desc: 'Cancellation information or notes.' },
    'CONF': { title: 'Confirmation', desc: 'Confirmation information or notes.' },
    'WAIT': { title: 'Waitlist', desc: 'Waitlist information or notes.' },
    'UPGD': { title: 'Upgrade', desc: 'Upgrade information or notes.' },
    'STND': { title: 'Standby', desc: 'Standby passenger information.' },
    'NOSH': { title: 'No Show', desc: 'No show passenger information.' },
    'BAGG': { title: 'Baggage', desc: 'Baggage information or notes.' },
    'SEAT': { title: 'Seat', desc: 'Seat assignment information.' },
    'MEAL': { title: 'Meal', desc: 'Meal preference information.' },
    'SPEC': { title: 'Special', desc: 'Special service information.' },
    'MEDI': { title: 'Medical', desc: 'Medical information or notes.' },
    'IMMI': { title: 'Immigration', desc: 'Immigration information or notes.' },
    'CUST': { title: 'Customs', desc: 'Customs information or notes.' },
    'SECU': { title: 'Security', desc: 'Security information or notes.' },
    'VISA': { title: 'Visa', desc: 'Visa information or notes.' },
    'PASS': { title: 'Passport', desc: 'Passport information or notes.' },
    'DOCU': { title: 'Document', desc: 'Document information or notes.' },
    'APIS': { title: 'APIS', desc: 'Advanced Passenger Information System data.' },
    'PNR': { title: 'PNR', desc: 'PNR or booking reference information.' },
    'TICK': { title: 'Ticket', desc: 'Ticket information or notes.' },
    'FARE': { title: 'Fare', desc: 'Fare information or notes.' },
    'TAXE': { title: 'Tax', desc: 'Tax information or notes.' },
    'FEE': { title: 'Fee', desc: 'Fee information or notes.' },
    'COMM': { title: 'Commission', desc: 'Commission information or notes.' },
    'DISC': { title: 'Discount', desc: 'Discount information or notes.' },
    'PROM': { title: 'Promotion', desc: 'Promotion or promotional code information.' },
    'MILT': { title: 'Military', desc: 'Military personnel information.' },
    'DIPL': { title: 'Diplomatic', desc: 'Diplomatic passenger information.' },
    'STUD': { title: 'Student', desc: 'Student passenger information.' },
    'YOUT': { title: 'Youth', desc: 'Youth passenger information.' },
    'SENI': { title: 'Senior', desc: 'Senior passenger information.' },
    'CHLD': { title: 'Child', desc: 'Child passenger information.' },
    'INFT': { title: 'Infant', desc: 'Infant passenger information.' },
    'UMNR': { title: 'Unaccompanied Minor', desc: 'Unaccompanied minor information.' },
    'WCHR': { title: 'Wheelchair Ramp', desc: 'Wheelchair ramp assistance information.' },
    'WCHS': { title: 'Wheelchair Steps', desc: 'Wheelchair steps assistance information.' },
    'WCHC': { title: 'Wheelchair Cabin', desc: 'Wheelchair cabin assistance information.' },
    'BLND': { title: 'Blind', desc: 'Blind passenger assistance information.' },
    'DEAF': { title: 'Deaf', desc: 'Deaf passenger assistance information.' },
    'MAAS': { title: 'Meet and Assist', desc: 'Meet and assist service information.' },
    'OXYG': { title: 'Oxygen', desc: 'Oxygen requirement information.' },
    'STCR': { title: 'Stretcher', desc: 'Stretcher requirement information.' },
    'MEDA': { title: 'Medical Assistance', desc: 'Medical assistance information.' },
    'PETC': { title: 'Pet in Cabin', desc: 'Pet in cabin information.' },
    'AVIH': { title: 'Live Animal in Hold', desc: 'Live animal in hold information.' },
    'EXST': { title: 'Extra Seat', desc: 'Extra seat information.' },
    'FRAG': { title: 'Fragile Baggage', desc: 'Fragile baggage information.' },
    'VALG': { title: 'Valuable Baggage', desc: 'Valuable baggage information.' },
    'EXBG': { title: 'Excess Baggage', desc: 'Excess baggage information.' },
    'CBBG': { title: 'Carry-On Baggage', desc: 'Carry-on baggage information.' },
    'WEAP': { title: 'Weapon', desc: 'Weapon authorization information.' },
    'DEPU': { title: 'Deportee', desc: 'Deportee information.' },
    'INAD': { title: 'Inadmissible Passenger', desc: 'Inadmissible passenger information.' },
    'PAXL': { title: 'Pax Locator', desc: 'Passenger locator information.' },
    'REDS': { title: 'Redress Number', desc: 'TSA Redress Number information.' },
    'SSSS': { title: 'Secondary Security Screening', desc: 'Secondary security screening information.' },
    'DHSG': { title: 'DHS Global Entry', desc: 'DHS Global Entry program information.' },
    'TSAP': { title: 'TSA PreCheck', desc: 'TSA PreCheck program information.' },
    'NEXU': { title: 'NEXUS', desc: 'NEXUS program information.' },
    'SENT': { title: 'SENTRI', desc: 'SENTRI program information.' },
    'GSTN': { title: 'GST Number', desc: 'GST number information (India).' },
    'GSTE': { title: 'GST Email', desc: 'GST email information (India).' },
    'GSTP': { title: 'GST Phone', desc: 'GST phone information (India).' },
    'GSTC': { title: 'GST Company', desc: 'GST company information (India).' },
    'ADTK': { title: 'Advise Ticketing', desc: 'Ticket deadline warning information.' },
    'TKTL': { title: 'Ticket Time Limit', desc: 'Ticket time limit information.' },
    'TKTN': { title: 'Ticket Number', desc: 'Ticket number information.' },
    'TKTT': { title: 'Ticket Type', desc: 'Ticket type information.' },
    'FQTV': { title: 'Frequent Flyer', desc: 'Frequent flyer program information.' },
    'FQTU': { title: 'Frequent Flyer Update', desc: 'Frequent flyer update information.' },
    'FQTR': { title: 'Frequent Flyer Request', desc: 'Frequent flyer request information.' },
    'FOID': { title: 'Frequent Flyer ID', desc: 'Frequent flyer ID information.' },
    'DOCS': { title: 'Travel Documents', desc: 'Travel document information.' },
    'DOCO': { title: 'Other Documents', desc: 'Other document information.' },
    'DOCA': { title: 'Address Information', desc: 'Address information.' },
    'OTHS': { title: 'Other Service Information', desc: 'Other service information or special instructions.' }
};

export const translateOSI = (text) => {
    const t = (text || "").toUpperCase();
    if (!t.startsWith("OSI")) return null;
    
    const osiMatch = t.match(/^OSI\s+([A-Z0-9]{2})\s+(.+)/);
    if (!osiMatch) return null;
    
    const carrier = osiMatch[1];
    const message = osiMatch[2];
    
    // Explain YY carrier code
    let carrierExplanation = "";
    if (carrier === "YY") {
        carrierExplanation = " (YY = System/Any Carrier - applies to all airlines)";
    } else {
        const carrierName = translateAirline(carrier);
        if (carrierName !== carrier) {
            carrierExplanation = ` (${carrierName})`;
        }
    }
    
    // Parse CTCP (Contact Phone Primary)
    if (message.includes("CTCP")) {
        const ctcpMatch = message.match(/CTCP\s*(.+)/i);
        const contactInfo = ctcpMatch ? ctcpMatch[1].trim() : message.replace(/CTCP\s*/i, '');
        // Try to extract phone number and company name
        const phoneMatch = contactInfo.match(/([\d\s\-\(\)]+)/);
        const phone = phoneMatch ? phoneMatch[1].trim() : '';
        const company = contactInfo.replace(phone, '').replace(/^[\s\-]+|[\s\-]+$/g, '').trim();
        
        return {
            title: "Contact Phone (Primary)",
            msg: `Primary contact phone number${phone ? `: ${phone}` : ''}${company ? ` - ${company}` : ''}`,
            type: "info",
            carrier: carrier + carrierExplanation,
            details: contactInfo
        };
    }
    
    // Parse CTCT (Contact Telephone)
    if (message.includes("CTCT")) {
        const ctctMatch = message.match(/CTCT\s*(.+)/i);
        const contactInfo = ctctMatch ? ctctMatch[1].trim() : message.replace(/CTCT\s*/i, '');
        // Try to extract phone number and company name
        const phoneMatch = contactInfo.match(/([\d\s\-\(\)]+)/);
        const phone = phoneMatch ? phoneMatch[1].trim() : '';
        const company = contactInfo.replace(phone, '').replace(/^[\s\-]+|[\s\-]+$/g, '').trim();
        
        return {
            title: "Contact Telephone",
            msg: `Contact telephone${phone ? `: ${phone}` : ''}${company ? ` - ${company}` : ''}`,
            type: "info",
            carrier: carrier + carrierExplanation,
            details: contactInfo
        };
    }
    
    // Check for known OSI types
    for (const [code, info] of Object.entries(OSI_TYPES)) {
        if (message.includes(code)) {
            return {
                title: info.title,
                msg: `${info.desc} ${message}`,
                type: "info",
                carrier: carrier + carrierExplanation
            };
        }
    }
    
    // Categorize by content
    if (message.includes("CTCE") || message.includes("EMAIL") || message.includes("@")) {
        return {
            title: "Contact Email",
            msg: `Email contact information: ${message}`,
            type: "info",
            carrier: carrier + carrierExplanation
        };
    }
    
    if (message.includes("CTCM") || message.includes("MOBILE") || /^\d+/.test(message)) {
        return {
            title: "Contact Phone",
            msg: `Phone contact information: ${message}`,
            type: "info",
            carrier: carrier + carrierExplanation
        };
    }
    
    if (message.includes("RLOC")) {
        return {
            title: "Related Record Locator",
            msg: `Related booking reference: ${message}`,
            type: "info",
            carrier: carrier + carrierExplanation
        };
    }
    
    return {
        title: "Other Service Information",
        msg: message,
        type: "info",
        carrier: carrier + carrierExplanation
    };
};

// Comprehensive Envelope Type explanations
export const translateEnvelope = (code) => {
    const map = {
        'QP': { title: 'Response (Output)', desc: 'System response or output message from the GDS. This is a response to a previous request.' },
        'QK': { title: 'Request (Input)', desc: 'Request or input message sent to the GDS. This is an action or query being sent to the system.' },
        'QD': { title: 'Delta (Change)', desc: 'Change or update message indicating a modification to the booking. This shows what changed in the PNR.' },
        'QR': { title: 'Query Request', desc: 'Query request message asking for information from the GDS.' },
        'QS': { title: 'Query Response', desc: 'Query response message with requested information.' },
        'QT': { title: 'Query Timeout', desc: 'Query timeout message when a request takes too long.' },
        'QU': { title: 'Query Update', desc: 'Query update message with updated information.' },
        'QV': { title: 'Query Verify', desc: 'Query verify message to confirm information.' },
        'QW': { title: 'Query Wait', desc: 'Query wait message indicating system is processing.' },
        'QX': { title: 'Query Cancel', desc: 'Query cancel message to cancel a pending query.' },
        'QY': { title: 'Query Yes', desc: 'Query yes response confirming an action.' },
        'QZ': { title: 'Query No', desc: 'Query no response denying an action.' },
        'SYS': { title: 'SYS', desc: 'System message from the GDS host. This is a system-generated message or notification.' },
        'UNK': { title: 'Unknown', desc: 'Unknown or unrecognized message format.' }
    };
    return map[code] || { title: code || 'Unknown', desc: 'Unknown message envelope type.' };
};

// Comprehensive Header Type explanations - Actual GDS header types used in practice
export const translateHeaderType = (code) => {
    const map = {
        'TRL': { title: 'Trailer', desc: 'End of message or transaction trailer. Indicates the end of a message block.' },
        'AKA': { title: 'Acknowledge', desc: 'Acknowledgment message confirming receipt or action. The system is acknowledging a previous request.' },
        'ASC': { title: 'Automatic Schedule Change', desc: 'Automatic schedule change notification from airline. The airline has automatically changed the flight schedule.' },
        'NAR': { title: 'Narrative', desc: 'Narrative or informational message. Contains text information or instructions.' },
        'DVD': { title: 'Divide', desc: 'PNR division or split operation. The booking is being split into separate PNRs.' },
        'NCO': { title: 'Name Change Only', desc: 'Name correction or change operation. Only the passenger name is being modified.' },
        'HDQ': { title: 'Host Data Queue', desc: 'Host Data Queue message. Standard GDS message format for Amadeus and other systems.' },
        'SWI': { title: 'Switch', desc: 'Switch message for inter-GDS communication (Galileo). Used when routing messages between different GDS systems.' }
    };
    return map[code] || null;
};
