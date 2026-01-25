export const translateStatus = (code) => {
  const c = (code || "").toUpperCase();
  const key = c.substring(0, 2);

  const map = {
    HK: { label: "Confirmed", color: "var(--ok)", icon: "✓" },
    KK: { label: "Confirmed", color: "var(--ok)", icon: "✓" },
    KL: { label: "Confirmed (Waitlist Cleared)", color: "var(--ok)", icon: "✓" },
    TK: { label: "Schedule Change", color: "var(--warn)", icon: "⚠" },
    UN: { label: "Cancelled by Airline", color: "var(--accent)", icon: "✕" },
    UC: { label: "Unable to Confirm", color: "var(--accent)", icon: "✕" },
    HX: { label: "Cancelled (Airline Action)", color: "var(--accent)", icon: "✕" },
    XX: { label: "Cancelled", color: "var(--muted)", icon: "✕" },
    NO: { label: "No Action Taken", color: "var(--muted)", icon: "−" },
    US: { label: "Unable to Sell", color: "var(--accent)", icon: "✕" },
    SS: { label: "Sold", color: "var(--ok)", icon: "✓" },
    DK: { label: "Holding", color: "var(--warn)", icon: "⧖" }
  };

  return map[key] || { label: code, color: "var(--text)", icon: "?" };
};

export const translateAirline = (code) => {
  const map = {
    FZ: "Flydubai",
    EK: "Emirates",
    QR: "Qatar Airways",
    TK: "Turkish Airlines",
    MS: "EgyptAir",
    SV: "Saudia",
    XY: "Flynas",
    G9: "Air Arabia",
    J9: "Jazeera Airways",
    KU: "Kuwait Airways",
    WY: "Oman Air",
    GF: "Gulf Air",
    EY: "Etihad",
    AI: "Air India",
    IX: "Air India Express",
    BA: "British Airways",
    LH: "Lufthansa",
    AF: "Air France",
    KL: "KLM",
    DL: "Delta",
    UA: "United",
    AA: "American Airlines"
  };
  return map[code.toUpperCase()] || code;
};

export const translateCity = (code) => {
    // Basic list of common hubs to make it readable
    const map = {
        DXB: "Dubai",
        DWC: "Dubai World Central",
        AUH: "Abu Dhabi",
        SHJ: "Sharjah",
        DOH: "Doha",
        RUH: "Riyadh",
        JED: "Jeddah",
        LHR: "London Heathrow",
        LGW: "London Gatwick",
        CDG: "Paris",
        AMS: "Amsterdam",
        FRA: "Frankfurt",
        BKK: "Bangkok",
        SIN: "Singapore",
        BOM: "Mumbai",
        DEL: "Delhi",
        KHI: "Karachi",
        CAI: "Cairo",
        IST: "Istanbul",
        TLV: "Tel Aviv"
    };
    return map[code.toUpperCase()] || code;
}

export const translateSSR = (text) => {
  const t = (text || "").toUpperCase();

  if (t.includes("NOSHO")) {
    return { title: "No Show", msg: "Passenger did not show up for the flight.", type: "critical" };
  }
  if (t.includes("ADTK") || t.includes("TIME LIMIT") || t.includes("TKT BY")) {
    return { title: "Ticket Deadline", msg: "Tickets must be issued by this time or the booking will be cancelled.", type: "warning" };
  }
  if (t.includes("UNABLE")) {
    return { title: "Request Failed", msg: "System could not process the request.", type: "critical" };
  }
  if (t.includes("MINIMUM 6 MONTHS") || t.includes("PASSPORT")) {
    return { title: "Passport Rule", msg: "Passport must be valid for at least 6 months.", type: "info" };
  }
  if (t.includes("VISA")) {
    return { title: "Visa Requirement", msg: "Check visa requirements.", type: "info" };
  }
  if (t.includes("CANCELLED") || t.includes("CANCELED") || t.includes("XLD") || t.includes("XXLD")) {
    return { title: "Cancellation", msg: "Booking was cancelled.", type: "critical" };
  }
  if (t.includes("SCHEDULE CHANGE") || t.includes("FLT NUMBERS")) {
    return { title: "Schedule Change", msg: "Flight details have changed.", type: "warning" };
  }
  if (t.includes("SPLIT") || t.includes("DIVIDE") || t.includes("DVD")) {
    return { title: "Passenger Split", msg: "Passengers were moved to a separate reservation.", type: "info" };
  }
  if (t.includes("HK1") && t.includes("TKNE")) {
      return { title: "Ticket Issued", msg: "E-ticket number attached.", type: "success" };
  }

  return null;
};
