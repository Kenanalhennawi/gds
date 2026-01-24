export const TOKEN_GROUPS = [
  {
    id: "envelopes",
    title: "Envelope / Transport",
    items: [
      { key: "QP", label: "QP", desc: "Passenger Name Record update/response wrapper" },
      { key: "QK", label: "QK", desc: "Passenger Name Record update/response wrapper" },
      { key: "QD", label: "QD", desc: "Passenger Name Record update/response wrapper" },
      { key: "HDQRM", label: "HDQRM*", desc: "Host/queue PNR message label" },
    ],
    patterns: [/\bQP\b/, /\bQK\b/, /\bQD\b/, /\bHDQRM[A-Z0-9]{1,4}\b/],
  },
  {
    id: "actions",
    title: "Transaction Types",
    items: [
      { key: "AKA", label: "AKA", desc: "Acknowledgement / accepted" },
      { key: "TRL", label: "TRL", desc: "Transaction reply / log" },
      { key: "NAR", label: "NAR", desc: "New arrangement / rebook response" },
      { key: "DVD", label: "DVD", desc: "Divide PNR / passenger split" },
      { key: "ASC", label: "ASC", desc: "Air schedule change" },
      { key: "NCO", label: "NCO", desc: "New connection / onward changes" },
      { key: "AKA", label: "AKA", desc: "Acknowledgement" },
    ],
    patterns: [/\bAKA\b/, /\bTRL\b/, /\bNAR\b/, /\bDVD\b/, /\bASC\b/, /\bNCO\b/],
  },
  {
    id: "segmentStatus",
    title: "Segment Status",
    items: [
      { key: "HK", label: "HK", desc: "Confirmed" },
      { key: "SS", label: "SS", desc: "Sold" },
      { key: "UC", label: "UC", desc: "Unable to confirm" },
      { key: "UN", label: "UN", desc: "Unable" },
      { key: "DK", label: "DK", desc: "Need action / ticketing time limit used by some hosts" },
      { key: "CS", label: "CS", desc: "Codeshare segment (status)" },
      { key: "CH", label: "CH", desc: "Checked in / operational use (status)" },
      { key: "TK", label: "TK", desc: "Schedule change, contact needed" },
      { key: "HX", label: "HX", desc: "Cancelled by airline" },
      { key: "XX", label: "XX", desc: "Cancelled" },
      { key: "LK", label: "LK", desc: "Waitlist/Request (host-dependent)" },
    ],
    patterns: [/\bHK\d+\b/, /\bSS\d+\b/, /\bUC\d+\b/, /\bUN\d+\b/, /\bDK\d+\b/, /\bCS\d+\b/, /\bCH\d+\b/, /\bTK\d+\b/, /\bHX\d+\b/, /\bXX\d+\b/, /\bLK\d+\b/],
  },
  {
    id: "ssrOsi",
    title: "SSR / OSI",
    items: [
      { key: "SSR", label: "SSR", desc: "Special Service Request" },
      { key: "OSI", label: "OSI", desc: "Other Service Information" },
      { key: "DOCS", label: "SSR DOCS", desc: "Passport details" },
      { key: "DOCO", label: "SSR DOCO", desc: "Other document/visa" },
      { key: "FOID", label: "SSR FOID", desc: "Form of identification" },
      { key: "TKNE", label: "SSR TKNE", desc: "Ticket number element" },
      { key: "FQTV", label: "SSR FQTV", desc: "Frequent flyer" },
      { key: "ADTK", label: "SSR ADTK", desc: "Ticketing time limit" },
      { key: "CTCE", label: "CTCE", desc: "Email contact" },
      { key: "CTCM", label: "CTCM", desc: "Mobile contact" },
      { key: "CTCH", label: "CTCH", desc: "Home contact" },
      { key: "CTCA", label: "CTCA", desc: "Address contact" },
      { key: "WCHR", label: "WCHR", desc: "Wheelchair request" },
      { key: "AVML", label: "AVML", desc: "Asian vegetarian meal" },
      { key: "MOML", label: "MOML", desc: "Mother/infant message (host-dependent)" },
      { key: "OTHS", label: "OTHS", desc: "Other service info (free text)" },
    ],
    patterns: [/\bSSR\b/, /\bOSI\b/, /\bDOCS\b/, /\bDOCO\b/, /\bFOID\b/, /\bTKNE\b/, /\bFQTV\b/, /\bADTK\b/, /\bCTCE\b/, /\bCTCM\b/, /\bCTCH\b/, /\bCTCA\b/, /\bWCHR\b/, /\bAVML\b/, /\bMOML\b/, /\bOTHS\b/],
  },
  {
    id: "diagnostics",
    title: "Diagnostics",
    items: [
      { key: "SEATS_NOT_AVAILABLE", label: "SEATS NOT AVAILABLE", desc: "Sell failed because requested seats are not available" },
      { key: "SCHEDULE_CHANGE", label: "SCHEDULE CHANGE", desc: "Airline modified timing/flight; re-accommodation may be required" },
      { key: "NOSHO", label: "NOSHO", desc: "No show at airport" },
      { key: "XLD", label: "XLD", desc: "Cancelled" },
      { key: "MCNX", label: "MCNX", desc: "Minor schedule change / contact needed" },
    ],
    patterns: [/SEATS\s+NOT\s+AVAILABLE/i, /SCHEDULE\s+CHANGE/i, /\bNOSHO\b/i, /\bXLD\b/i, /\bMCNX\b/i],
  },
];

export const tokenizeText = (text) => {
  const t = (text || "").toString();
  const hits = [];
  TOKEN_GROUPS.forEach((g) => {
    g.patterns.forEach((p) => {
      if (p.test(t)) hits.push(g.id);
    });
  });
  return Array.from(new Set(hits));
};

export const explainTokenGroups = (groupIds) => {
  const ids = new Set(groupIds || []);
  return TOKEN_GROUPS.filter((g) => ids.has(g.id));
};
