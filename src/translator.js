export const translateStatus = (code) => {
    const c = (code || "").substring(0, 2).toUpperCase();
    const map = {
        HK: { label: "Confirmed", class: "status-hk", icon: "✓" },
        KK: { label: "Confirmed", class: "status-hk", icon: "✓" },
        TK: { label: "Schedule Change", class: "status-tk", icon: "⚠" },
        UN: { label: "Cancelled (Airline)", class: "status-hx", icon: "✕" },
        UC: { label: "Unable Confirm", class: "status-hx", icon: "✕" },
        HX: { label: "Cancelled", class: "status-hx", icon: "✕" },
        XX: { label: "Cancelled (Admin)", class: "status-hx", icon: "✕" },
        SS: { label: "Sold", class: "status-hk", icon: "✓" },
        DK: { label: "Holding", class: "status-tk", icon: "⧖" }
    };
    return map[c] || { label: code, class: "", icon: "•" };
};

export const translateAirline = (code) => {
    const map = {
        FZ: "Flydubai", EK: "Emirates", QR: "Qatar Airways", TK: "Turkish Airlines",
        MS: "EgyptAir", SV: "Saudia", XY: "Flynas", G9: "Air Arabia",
        J9: "Jazeera", KU: "Kuwait Airways", WY: "Oman Air", GF: "Gulf Air",
        EY: "Etihad", AI: "Air India", BA: "British Airways", LH: "Lufthansa",
        AF: "Air France", KL: "KLM", DL: "Delta", UA: "United",
        ET: "Ethiopian", CA: "Air China", "1G": "Galileo", "1A": "Amadeus"
    };
    return map[code?.toUpperCase()] || code;
};

export const translateCity = (code) => {
    const map = {
        DXB: "Dubai", DOH: "Doha", RUH: "Riyadh", JED: "Jeddah",
        LHR: "London", CDG: "Paris", AMS: "Amsterdam", FRA: "Frankfurt",
        BKK: "Bangkok", SIN: "Singapore", BOM: "Mumbai", DEL: "Delhi",
        TLV: "Tel Aviv", MCT: "Muscat", KBL: "Kabul", PEK: "Beijing",
        YYZ: "Toronto", JFK: "New York", TIA: "Tirana", BJM: "Bujumbura",
        ADD: "Addis Ababa", DYU: "Dushanbe", VNO: "Vilnius"
    };
    return map[code?.toUpperCase()] || code;
};

export const translateSSR = (text) => {
    const t = (text || "").toUpperCase();
    if (t.includes("NOSHO")) return { title: "No Show", msg: "Passenger missed flight.", type: "critical" };
    if (t.includes("ADTK") || t.includes("TIME LIMIT")) return { title: "Ticket Deadline", msg: "Issue ticket by deadline or booking cancels.", type: "warning" };
    if (t.includes("UNABLE")) return { title: "Request Failed", msg: "System rejected request.", type: "critical" };
    if (t.includes("CANCELLED") || t.includes("CANCELED") || t.includes("XLD")) return { title: "Cancellation", msg: "Booking/Segment cancelled.", type: "critical" };
    if (t.includes("HK1") && t.includes("TKNE")) return { title: "Ticket Issued", msg: "E-Ticket attached.", type: "info" };
    if (t.includes("NSST")) return { title: "Seat Data", msg: "Seat status transmitted.", type: "info" };
    return null;
};
