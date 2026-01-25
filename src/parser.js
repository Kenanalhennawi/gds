import { translateSSR } from "./translator.js";

const cleanText = (text) => {
    if (!text) return [];
    let clean = text.toString();
    
    // 1. Force-break specific control characters (Blue Boxes)
    clean = clean.replace(/[\u0001\u0002\u0003\u0004]/g, "\n");
    clean = clean.replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, "\n");
    
    // 2. Unglue Envelopes from Headers (Critical Fix)
    // Turns "QKHDQ" into "QK HDQ"
    clean = clean.replace(/(QP|QK|QD)(HDQ)/g, "$1 $2");
    // Turns "TRLHDQ" into "TRL HDQ"
    clean = clean.replace(/(TRL|AKA|NAR|DVD)(HDQ)/g, "$1 $2");
    
    // 3. Force split headers onto new lines if glued to previous text
    clean = clean.replace(/([A-Z0-9])(QP|QK|QD|HDQ|SWI|TRL)/g, "$1\n$2");
    
    // 4. Fix PNR headers
    clean = clean.replace(/(\d{6})\s*(\.?[A-Z]{2,3})/g, "$1\n$2");

    return clean
        .split(/\r\n|\r|\n/)
        .map(l => l.trim())
        .filter(l => l.length > 0);
};

// NEW: Summary Logic
const generateSummary = (events) => {
    const summary = { status: "Unknown", description: "No significant events detected.", alertLevel: "info" };
    let hasCancel = false, hasTkt = false, isConf = false;

    events.forEach(evt => {
        evt.segments.forEach(s => {
            if (["HX","UC","UN","XX","NO"].includes(s.status)) hasCancel = true;
            if (["HK","KK","KL","SS"].includes(s.status)) isConf = true;
        });
        evt.messages.forEach(m => {
            if (m.title === "Ticket Issued") hasTkt = true;
        });
    });

    if (hasCancel && !isConf) { summary.status = "Booking Cancelled"; summary.description = "Reservation was cancelled."; summary.alertLevel = "critical"; }
    else if (hasTkt && isConf) { summary.status = "Ticketed & Confirmed"; summary.description = "Flight is confirmed and ticket is issued."; summary.alertLevel = "success"; }
    else if (isConf) { summary.status = "Confirmed (Un-Ticketed)"; summary.description = "Seats held but no ticket number found."; summary.alertLevel = "warning"; }
    
    return summary;
};

export const parseLog = (input) => {
    const lines = cleanText(input);
    const events = [];
    let currentBlock = null;

    const finalizeBlock = () => {
        if (currentBlock) {
            events.push(currentBlock);
            currentBlock = null;
        }
    };

    const startNewBlock = (envelope, header, rawLine) => {
        finalizeBlock();
        currentBlock = {
            id: Math.random().toString(36).substr(2, 9),
            envelope: envelope,
            header: header,
            rawHeader: rawLine,
            context: { airline: null, recordLocator: null, office: null },
            segments: [],
            messages: [],
            passengers: []
        };
        parseContextFromHeader(currentBlock, header, rawLine);
    };

    const parseContextFromHeader = (block, header, line) => {
        const mComp = line.match(/HDQ([A-Z0-9]{2})([A-Z0-9]{6})/);
        if (mComp) { block.context.airline = mComp[1]; block.context.recordLocator = mComp[2]; return; }
        
        const mSwi = line.match(/SWI([A-Z0-9]{2})\s+([A-Z0-9]{6})/);
        if (mSwi) { block.context.airline = mSwi[1]; block.context.recordLocator = mSwi[2]; return; }
        
        const mCity = line.match(/^([A-Z]{3})([A-Z0-9]{2})\s+([A-Z0-9]{6})$/);
        if (mCity) { block.context.office = mCity[1]; block.context.airline = mCity[2]; block.context.recordLocator = mCity[3]; }
    };

    lines.forEach(line => {
        // Loose Match for Envelopes (fixes "Ruined" state)
        const envMatch = line.match(/(?:^|\s)(QP|QK|QD)\s+(\S+)/);
        if (envMatch) { startNewBlock(envMatch[1], envMatch[2], line); return; }

        if (line.startsWith("SWI") || line.startsWith("HDQ")) {
            if (!currentBlock) startNewBlock("SYS", line.split(' ')[0], line);
            parseContextFromHeader(currentBlock, null, line);
            return;
        }

        if (!currentBlock) {
            if (line.length > 4) startNewBlock('UNK', 'FRAGMENT', line);
            else return; 
        }

        // Passenger Detection
        if (/^\d+[A-Z]+\/[A-Z]+/.test(line)) {
            const paxes = line.match(/\d+[A-Z]+\/[A-Z]+(?:\s+[A-Z]+)?(?:\s+[A-Z]{1,3})?/g);
            if (paxes) currentBlock.passengers.push(...paxes.map(p => {
                const parts = p.match(/^\d+([A-Z]+)\/([A-Z]+)\s*(.*)/);
                return { surname: parts[1], given: parts[2], title: parts[3] };
            }));
            return;
        }

        // Segment Detection
        const segMatch = line.match(/([A-Z0-9]{2})\s*(\d{1,4}[A-Z]?)\s*([0-9]{2}[A-Z]{3})\s+([A-Z]{3})([A-Z]{3})\s+([A-Z]{2}\d+)/);
        if (segMatch) {
            currentBlock.segments.push({
                carrier: segMatch[1], flight: segMatch[2], date: segMatch[3],
                from: segMatch[4], to: segMatch[5], status: segMatch[6]
            });
            return;
        }

        // SSR Detection
        const ssrInfo = translateSSR(line);
        if (ssrInfo) currentBlock.messages.push(ssrInfo);
    });

    finalizeBlock();
    return { events, summary: generateSummary(events) };
};
