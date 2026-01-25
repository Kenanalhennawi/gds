export const translateStatus = (code) => {
    const c = (code || "").substring(0, 2).toUpperCase();
    const map = {
        HK: { label: "Confirmed", class: "status-hk", icon: "✓" },
        KK: { label: "Confirmed", class: "status-hk", icon: "✓" },
        KL: { label: "Confirmed", class: "status-hk", icon: "✓" },
        TK: { label: "Schedule Change", class: "status-tk", icon: "⚠" },
        UN: { label: "Cancelled", class: "status-hx", icon: "✕" },
        UC: { label: "Unable", class: "status-hx", icon: "✕" },
        HX: { label: "Cancelled", class: "status-hx", icon: "✕" },
        SS: { label: "Sold", class: "status-hk", icon: "✓" },
        DK: { label: "Holding", class: "status-tk", icon: "⧖" }
    };
    return map[c] || { label: code, class: "", icon: "•" };
};

const AIRLINES = {
    "1A": "Amadeus", "1G": "Galileo", "1B": "Abacus", "1S": "Sabre", "1P": "Worldspan", "1F": "Infini",
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
    UA: "United Airlines", AA: "American Airlines", DL: "Delta Air Lines",
    AC: "Air Canada", TS: "Air Transat", WS: "WestJet", AS: "Alaska Airlines",
    B6: "JetBlue", NK: "Spirit Airlines", F9: "Frontier Airlines", WN: "Southwest",
    HA: "Hawaiian Airlines", AM: "Aeromexico", CM: "Copa Airlines",
    AV: "Avianca", LA: "LATAM Airlines", JJ: "LATAM Brasil", XL: "LATAM Ecuador",
    AR: "Aerolineas Argentinas", G3: "Gol", AD: "Azul", H2: "Sky Airline",
    SQ: "Singapore Airlines", MH: "Malaysia Airlines", TG: "Thai Airways",
    VN: "Vietnam Airlines", GA: "Garuda Indonesia", PR: "Philippine Airlines",
    CX: "Cathay Pacific", BR: "EVA Air", CI: "China Airlines", HX: "Hong Kong Airlines",
    CA: "Air China", MU: "China Eastern", CZ: "China Southern", HU: "Hainan Airlines",
    MF: "XiamenAir", 3U: "Sichuan Airlines", ZH: "Shenzhen Airlines",
    NH: "All Nippon Airways", JL: "Japan Airlines", KE: "Korean Air", OZ: "Asiana Airlines",
    AI: "Air India", IX: "Air India Express", UK: "Vistara", 6E: "IndiGo",
    SG: "SpiceJet", G8: "Go First", PK: "Pakistan Int. Airlines", PA: "Airblue",
    BG: "Biman Bangladesh", BS: "US-Bangla Airlines", RX: "Regent Airways",
    UL: "SriLankan Airlines", KB: "Druk Air", RA: "Nepal Airlines",
    QF: "Qantas", VA: "Virgin Australia", NZ: "Air New Zealand", FJ: "Fiji Airways",
    JQ: "Jetstar", TR: "Scoot", AK: "AirAsia", D7: "AirAsia X"
};

export const translateAirline = (code) => {
    if (!code) return "";
    return AIRLINES[code.toUpperCase()] || code;
};

const CITIES = {
    DXB: "Dubai (Intl)", DWC: "Dubai (World Central)", SHJ: "Sharjah", AUH: "Abu Dhabi",
    DOH: "Doha", BAH: "Bahrain", MCT: "Muscat", KWI: "Kuwait",
    RUH: "Riyadh", JED: "Jeddah", DMM: "Dammam", MED: "Madinah",
    GIZ: "Gizan", AHB: "Abha", TUU: "Tabuk", TIF: "Taif", ELQ: "Gassim",
    HAS: "Hail", YNB: "Yanbu", URY: "Gurayat", AJF: "Al Jouf",
    AMM: "Amman", BEY: "Beirut", DAM: "Damascus", BGW: "Baghdad", EBL: "Erbil",
    NJF: "Najaf", BSR: "Basra", KWI: "Kuwait", TLV: "Tel Aviv",
    IKA: "Tehran (Imam Khomeini)", THR: "Tehran (Mehrabad)", MHD: "Mashhad", SYZ: "Shiraz",
    CAI: "Cairo", HBE: "Alexandria", LXR: "Luxor", SSH: "Sharm El Sheikh", HRG: "Hurghada",
    KRT: "Khartoum", JUB: "Juba", ADD: "Addis Ababa", JIB: "Djibouti",
    NBO: "Nairobi", MBA: "Mombasa", DAR: "Dar Es Salaam", JRO: "Kilimanjaro", ZNZ: "Zanzibar",
    EBB: "Entebbe", KGL: "Kigali", BJM: "Bujumbura", FIH: "Kinshasa",
    LOS: "Lagos", ABV: "Abuja", ACC: "Accra", DKR: "Dakar", CMN: "Casablanca",
    TUN: "Tunis", ALG: "Algiers", TIP: "Tripoli", JNB: "Johannesburg", CPT: "Cape Town",
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
    JFK: "New York (JFK)", EWR: "Newark", LGA: "LaGuardia", BOS: "Boston", IAD: "Washington (Dulles)",
    DCA: "Washington (Reagan)", ATL: "Atlanta", MCO: "Orlando", MIA: "Miami", FLL: "Fort Lauderdale",
    ORD: "Chicago (O'Hare)", DFW: "Dallas Fort Worth", IAH: "Houston", DEN: "Denver",
    LAX: "Los Angeles", SFO: "San Francisco", SEA: "Seattle", LAS: "Las Vegas",
    YYZ: "Toronto", YVR: "Vancouver", YUL: "Montreal", YYC: "Calgary",
    MEX: "Mexico City", CUN: "Cancun", PTY: "Panama City", BOG: "Bogota",
    GRU: "Sao Paulo", GIG: "Rio de Janeiro", EZE: "Buenos Aires", SCL: "Santiago", LIM: "Lima",
    SYD: "Sydney", MEL: "Melbourne", BNE: "Brisbane", PER: "Perth", AKL: "Auckland"
};

export const translateCity = (code) => {
    if (!code) return "";
    return CITIES[code.toUpperCase()] || code;
};

export const translateSSR = (text) => {
    const t = (text || "").toUpperCase();
    
    if (t.includes("NOSHO")) return { title: "No Show", msg: "Passenger missed flight.", type: "critical" };
    if (t.includes("UNABLE")) return { title: "Request Failed", msg: "System rejected request.", type: "critical" };
    if (t.includes("CANCELLED") || t.includes("CANCELED")) return { title: "Cancellation", msg: "Segment cancelled.", type: "critical" };
    
    if (t.includes("TKNE")) {
        const ticketMatch = t.match(/[.\-\s](\d{13})/);
        if (ticketMatch) {
            return { title: "Ticket Issued", msg: `E-Ticket ${ticketMatch[1]}`, type: "success" };
        }
        return null; 
    }
    
    return null;
};
