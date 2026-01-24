export const TOKEN_GROUPS = [
  {
    id: "envelopes",
    title: "Envelope / Transport",
    items: [
      { key: "QP", label: "QP", desc: "Passenger Name Record update/response wrapper" },
      { key: "QK", label: "QK", desc: "Passenger Name Record update/response wrapper" },
      { key: "QD", label: "QD", desc: "Passenger Name Record update/response wrapper" },
      { key: "HDQRMFZ", label: "HDQRMFZ", desc: "Host/queue routing header (format varies by host)" }
    ]
  },
  {
    id: "actions",
    title: "Action blocks",
    items: [
      { key: "TRL", label: "TRL", desc: "Transaction reply list / host response block" },
      { key: "AKA", label: "AKA", desc: "Acknowledgement / accepted transaction" },
      { key: "NAR", label: "NAR", desc: "Availability reply block" },
      { key: "DVD", label: "DVD", desc: "Divide/split record related block" },
      { key: "ASC", label: "ASC", desc: "Schedule change / re-accommodation block" },
      { key: "NCO", label: "NCO", desc: "Updated connection/order block" }
    ]
  },
  {
    id: "pnr",
    title: "PNR / Service lines",
    items: [
      { key: "SSR", label: "SSR", desc: "Special Service Request" },
      { key: "OSI", label: "OSI", desc: "Other Service Information" },
      { key: "DOCS", label: "DOCS", desc: "Travel document details" },
      { key: "DOCO", label: "DOCO", desc: "Other document details (visas, residence etc.)" },
      { key: "FOID", label: "FOID", desc: "Form of identification" },
      { key: "TKNE", label: "TKNE", desc: "Ticket number element" },
      { key: "ADTK", label: "ADTK", desc: "Auto ticketing time limit" },
      { key: "CTCE", label: "CTCE", desc: "Contact email" },
      { key: "CTCM", label: "CTCM", desc: "Contact mobile" },
      { key: "CTCH", label: "CTCH", desc: "Contact home phone" },
      { key: "CTCT", label: "CTCT", desc: "Contact ticketing office" },
      { key: "FQTV", label: "FQTV", desc: "Frequent flyer number" },
      { key: "WCHR", label: "WCHR", desc: "Wheelchair request" },
      { key: "AVML", label: "AVML", desc: "Asian Vegetarian Meal" },
      { key: "MOML", label: "MOML", desc: "Misc order/meal/host marker (host dependent)" },
      { key: "GSTN", label: "GSTN", desc: "Tax/GST number element (host/market dependent)" }
    ]
  },
  {
    id: "status",
    title: "Segment status",
    items: [
      { key: "HK", label: "HK", desc: "Confirmed" },
      { key: "SS", label: "SS", desc: "Sold/requested (host dependent)" },
      { key: "UC", label: "UC", desc: "Unable confirm" },
      { key: "UN", label: "UN", desc: "Unable/waitlist (host dependent)" },
      { key: "HX", label: "HX", desc: "Cancelled by airline" },
      { key: "XX", label: "XX", desc: "Cancelled" },
      { key: "DK", label: "DK", desc: "Holding / request (host dependent)" },
      { key: "CS", label: "CS", desc: "Codeshare confirmed (host dependent)" },
      { key: "CH", label: "CH", desc: "Codeshare confirmed (host dependent)" },
      { key: "TK", label: "TK", desc: "Schedule change / times changed (host dependent)" },
      { key: "LK", label: "LK", desc: "Waitlist/holding (host dependent)" }
    ]
  },
  {
    id: "diagnostics",
    title: "Diagnostics",
    items: [
      { key: "SEATS NOT AVAILABLE", label: "SEATS NOT AVAILABLE", desc: "Availability failure block from host" }
    ]
  }
];

export const TOKEN_PATTERNS = [
  { id: "envelopes", rx: /\b(QP|QK|QD)\b/g },
  { id: "actions", rx: /\b(TRL|AKA|NAR|DVD|ASC|NCO)\b/g },
  { id: "pnr", rx: /\b(SSR|OSI|DOCS|DOCO|FOID|TKNE|ADTK|CTCE|CTCM|CTCH|CTCT|FQTV|WCHR|AVML|MOML|GSTN)\b/g },
  { id: "status", rx: /\b(HK|SS|UC|UN|HX|XX|DK|CS|CH|TK|LK)\d+\b/g },
  { id: "diagnostics", rx: /\bSEATS\s+NOT\s+AVAILABLE\b/g }
];
