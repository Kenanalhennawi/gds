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
    XX: { label: "Cancelled (Admin)", color: "var(--muted)", icon: "✕" },
    NO: { label: "No Action Taken", color: "var(--muted)", icon: "−" },
    US: { label: "Unable to Sell", color: "var(--accent)", icon: "✕" },
    SS: { label: "Sold", color: "var(--ok)", icon: "✓" },
    DK: { label: "Holding / Link", color: "var(--warn)", icon: "⧖" }
  };

  return map[key] || { label: code, color: "var(--text)", icon: "?" };
};

export const translateSSR = (text) => {
  const t = (text || "").toUpperCase();

  if (t.includes("NOSHO")) {
    return { title: "No Show", msg: "Passenger missed the flight or did not show up at the airport.", type: "critical" };
  }
  if (t.includes("ADTK") || t.includes("TIME LIMIT")) {
    return { title: "Ticket Time Limit", msg: "Tickets must be issued by the deadline or the booking will be cancelled.", type: "warning" };
  }
  if (t.includes("UNABLE")) {
    return { title: "Request Failed", msg: "The system could not process the request.", type: "critical" };
  }
  if (t.includes("MINIMUM 6 MONTHS") || t.includes("PASSPORT")) {
    return { title: "Passport Rule", msg: "Passport must be valid for at least 6 months before departure.", type: "info" };
  }
  if (t.includes("VISA")) {
    return { title: "Visa Requirement", msg: "Check visa requirements for the destination.", type: "info" };
  }
  if (t.includes("CANCELLED") || t.includes("CANCELED") || t.includes("XLD")) {
    return { title: "Cancellation", msg: "Booking or segment was cancelled.", type: "critical" };
  }
  if (t.includes("SCHEDULE CHANGE")) {
    return { title: "Schedule Change", msg: "Flight times or numbers have changed.", type: "warning" };
  }
  if (t.includes("SPLIT") || t.includes("DIVIDE")) {
    return { title: "PNR Split", msg: "Passengers were moved to a new reservation record.", type: "info" };
  }

  return null;
};
