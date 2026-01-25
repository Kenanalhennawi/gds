export const translateStatus = (code) => {
    const c = (code || "").substring(0, 2).toUpperCase();
    const map = {
        HK: { label: "Confirmed", class: "status-hk", icon: "✓" },
        KK: { label: "Confirmed", class: "status-hk", icon: "✓" },
        KL: { label: "Confirmed", class: "status-hk", icon: "✓" },
        TK: { label: "Schedule Change", class: "status-tk", icon: "⚠" },
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
    "1A": "Amadeus System", "1G": "Galileo System", "1B": "Abacus System", "1S": "Sabre System",
    "1P": "Worldspan System", "1F": "Infini System",
    FZ: "Flydubai", EK: "Emirates", QR: "Qatar Airways", EY: "Etihad Airways",
    TK: "Turkish Airlines", MS: "EgyptAir", SV: "Saudia", XY: "Flynas",
    G9: "Air Arabia", J9: "Jazeera Airways", KU: "Kuwait Airways", WY: "Oman Air",
    GF: "Gulf Air", ME: "Middle East Airlines", RJ: "Royal Jordanian",
    AT: "Royal Air Maroc", AH: "Air Algerie", TU: "Tunisair", LN: "Libyan Airlines",
    IY: "Yemenia", IA: "Iraqi Airways", IR: "Iran Air", W5: "Mahan Air",
    RB: "Syrian Air", TL: "Air North", UG: "Tunisair Express",
    AI: "Air India", IX: "Air India Express", UK: "Vistara", 6E: "IndiGo",
    SG: "SpiceJet", G8: "Go First", PK: "Pakistan Int. Airlines", PA: "Airblue",
    BG: "Biman Bangladesh", BS: "US-Bangla Airlines", RX: "Regent Airways",
    UL: "SriLankan Airlines", KB: "Druk Air", RA: "Nepal Airlines",
    SQ: "Singapore Airlines", MH: "Malaysia Airlines", TG: "Thai Airways",
    VN: "Vietnam Airlines", GA: "Garuda Indonesia", PR: "Philippine Airlines",
    CX: "Cathay Pacific", BR: "EVA Air", CI: "China Airlines",
    CA: "Air China", MU: "China Eastern", CZ: "China Southern", HU: "Hainan Airlines",
    NH: "All Nippon Airways", JL: "Japan Airlines", KE: "Korean Air", OZ: "Asiana Airlines",
    QF: "Qantas", VA: "Virgin Australia", NZ: "Air New Zealand", FJ: "Fiji Airways",
    LH: "Lufthansa", AF: "Air France", KL: "KLM", BA: "British Airways",
    IB: "Iberia", TP: "TAP Air Portugal", AZ: "ITA Airways", LX: "Swiss Int. Air Lines",
    OS: "Austrian Airlines", SN: "Brussels Airlines", EI: "Aer Lingus",
    SK: "SAS Scandinavian", AY: "Finnair", SU: "Aeroflot", LO: "LOT Polish Airlines",
    MA: "Malev", RO: "Tarom", FB: "Bulgaria Air", JU: "Air Serbia",
    OU: "Croatia Airlines", A3: "Aegean Airlines", KM: "Air Malta",
    UA: "United Airlines", AA: "American Airlines", DL: "Delta Air Lines",
    AC: "Air Canada", TS: "Air Transat", WS: "WestJet",
    AM: "Aeromexico", CM: "Copa Airlines", AV: "Avianca", LA: "LATAM Airlines",
    AR: "Aerolineas Argentinas", G3: "Gol Transportes Aereos",
    ET: "Ethiopian Airlines", KQ: "Kenya Airways", SA: "South African Airways",
    DT: "TAAG Angola", TM: "LAM Mozambique", VR: "Cabo Verde Airlines",
    MD: "Air Madagascar", UU: "Air Austral", HM: "Air Seychelles",
    LY: "El Al Israel Airlines", IZ: "Arkia", 6H: "Israir",
    PC: "Pegasus Airlines", KK: "AtlasGlobal", XQ: "SunExpress",
    HY: "Uzbekistan Airways", KC: "Air Astana", DV: "SCAT Airlines",
    J2: "Azerbaijan Airlines", A9: "Georgian Airways", B2: "Belavia",
    PS: "Ukraine Int. Airlines", BT: "airBaltic",
    W6: "Wizz Air", FR: "Ryanair", U2: "easyJet", DY: "Norwegian"
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
    AMM: "Amman", BEY: "Beirut", DAM: "Damascus", BGW: "Baghdad", EBL: "Erbil",
    TLV: "Tel Aviv", CAI: "Cairo", HBE: "Alexandria", LXR: "Luxor", SSH: "Sharm El Sheikh",
    KRT: "Khartoum", JUB: "Juba", ADD: "Addis Ababa", JIB: "Djibouti",
    IST: "Istanbul (IST)", SAW: "Istanbul (Sabiha)", ESB: "Ankara", AYT: "Antalya",
    LHR: "London (Heathrow)", LGW: "London (Gatwick)", STN: "London (Stansted)",
    MAN: "Manchester", BHX: "Birmingham", GLA: "Glasgow", EDI: "Edinburgh",
    CDG: "Paris (CDG)", ORY: "Paris (Orly)", NCE: "Nice", LYS: "Lyon",
    FRA: "Frankfurt", MUC: "Munich", BER: "Berlin", DUS: "Dusseldorf", HAM: "Hamburg",
    AMS: "Amsterdam", BRU: "Brussels", ZRH: "Zurich", GVA: "Geneva", VIE: "Vienna",
    FCO: "Rome (Fiumicino)", MXP: "Milan (Malpensa)", LIN: "Milan (Linate)", VCE: "Venice",
    MAD: "Madrid", BCN: "Barcelona", AGP: "Malaga", PMI: "Palma de Mallorca",
    LIS: "Lisbon", OPO: "Porto", ATH: "Athens", SKG: "Thessaloniki",
    SVO: "Moscow (Sheremetyevo)", DME: "Moscow (Domodedovo)", VKO: "Moscow (Vnukovo)", LED: "St. Petersburg",
    KBP: "Kyiv (Boryspil)", IEV: "Kyiv (Zhuliany)", ODS: "Odessa",
    DEL: "Delhi", BOM: "Mumbai", BLR: "Bangalore", MAA: "Chennai", HYD: "Hyderabad",
    COK: "Kochi", CCJ: "Kozhikode", TRV: "Thiruvananthapuram", CCU: "Kolkata",
    KHI: "Karachi", LHE: "Lahore", ISB: "Islamabad", PEW: "Peshawar", SKT: "Sialkot",
    DAC: "Dhaka", CGP: "Chittagong", ZYL: "Sylhet", KTM: "Kathmandu", CMB: "Colombo",
    BKK: "Bangkok (Suvarnabhumi)", DMK: "Bangkok (Don Mueang)", HKT: "Phuket",
    SIN: "Singapore", KUL: "Kuala Lumpur", CGK: "Jakarta", DPS: "Bali",
    MNL: "Manila", SGN: "Ho Chi Minh City", HAN: "Hanoi", PNH: "Phnom Penh",
    HKG: "Hong Kong", PVG: "Shanghai (Pudong)", SHA: "Shanghai (Hongqiao)", PEK: "Beijing (Capital)",
    PKX: "Beijing (Daxing)", CAN: "Guangzhou", CTU: "Chengdu",
    NRT: "Tokyo (Narita)", HND: "Tokyo (Haneda)", KIX: "Osaka", ICN: "Seoul (Incheon)",
    SYD: "Sydney", MEL: "Melbourne", BNE: "Brisbane", PER: "Perth", AKL: "Auckland",
    JFK: "New York (JFK)", EWR: "Newark", LGA: "LaGuardia",
    LAX: "Los Angeles", SFO: "San Francisco", ORD: "Chicago", MIA: "Miami",
    DFW: "Dallas Fort Worth", ATL: "Atlanta", IAD: "Washington (Dulles)",
    YYZ: "Toronto", YVR: "Vancouver", YUL: "Montreal",
    GRU: "Sao Paulo", GIG: "Rio de Janeiro", EZE: "Buenos Aires", BOG: "Bogota",
    JNB: "Johannesburg", CPT: "Cape Town", LOS: "Lagos", ACC: "Accra",
    KBL: "Kabul", TAS: "Tashkent", ALA: "Almaty", DYU: "Dushanbe", ASB: "Ashgabat",
    GYD: "Baku", EVN: "Yerevan", TBS: "Tbilisi", VNO: "Vilnius", RIX: "Riga", TLL: "Tallinn",
    TIA: "Tirana", PRN: "Pristina", SKP: "Skopje", TGD: "Podgorica", SJJ: "Sarajevo",
    BEG: "Belgrade", ZAG: "Zagreb", LJU: "Ljubljana", BUD: "Budapest", PRG: "Prague", WAW: "Warsaw"
};

export const translateCity = (code) => {
    if (!code) return "";
    return CITIES[code.toUpperCase()] || code;
};

export const translateSSR = (text) => {
    const t = (text || "").toUpperCase();
    if (t.includes("NOSHO")) return { title: "No Show", msg: "Passenger missed flight.", type: "critical" };
    if (t.includes("ADTK") || t.includes("TIME LIMIT")) return { title: "Ticket Deadline", msg: "Issue ticket by deadline or booking cancels.", type: "warning" };
    if (t.includes("UNABLE")) return { title: "Request Failed", msg: "System rejected request.", type: "critical" };
    if (t.includes("CANCELLED") || t.includes("CANCELED") || t.includes("XLD")) return { title: "Cancellation", msg: "Booking/Segment cancelled.", type: "critical" };
    
    if (t.includes("HK1") && t.includes("TKNE")) {
        const ticketMatch = t.match(/.*?(\d{13}).*/);
        if (ticketMatch) {
            return { title: "Ticket Issued", msg: `E-Ticket ${ticketMatch[1]}`, type: "info" };
        }
        return null;
    }
    
    if (t.includes("NSST")) return { title: "Seat Data", msg: "Seat status transmitted.", type: "info" };
    return null;
};
