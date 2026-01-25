import { translateSSR } from "./translator.js";

const cleanText = (text) => {
    if (!text) return [];
    let clean = text.toString();
    
    clean = clean.replace(/[\u0001\u0002\u0003\u0004]/g, "\n");
    clean = clean.replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, "\n");
    
    clean = clean.replace(/([^\n])\s*(QP|QK|QD|HDQ|SWI|TRL|AKA|NAR|DVD)/g, "$1\n$2");
    
    clean = clean.replace(/(\d{6})\s*(\.?[A-Z]{2,3})/g, "$1\n$2");

    return clean
        .split(/\r\n|\r|\n/)
        .map(l => l.trim())
        .filter(l => l.length > 0);
};

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

    const extractPassengers = (line) => {
        const paxes = [];
        const regex = /\d+([A-Z]+)\/([A-Z]+)(?:\s+([A-Z]{1,4}))?/g;
        let match;
        while ((match = regex.exec(line)) !== null) {
            paxes.push({
                raw: match[0],
                surname: match[1],
                given: match[2],
                title: match[3] || ""
            });
        }
        return paxes;
    };

    lines.forEach(line => {
        const envMatch = line.match(/^(QP|QK|QD)\s*(\S*)/);
        if (envMatch) {
            startNewBlock(envMatch[1], envMatch[2], line);
            return;
        }

        if (line.includes("HDQ") || line.includes("SWI")) {
            if (!currentBlock) startNewBlock("SYS", "Context", line);
            parseContextFromHeader(currentBlock, null, line);
        }

        if (!currentBlock) {
            if (line.length > 4) startNewBlock('UNK', 'FRAGMENT', line);
            else return; 
        }

        const foundPaxes = extractPassengers(line);
        if (foundPaxes.length > 0) {
            currentBlock.passengers.push(...foundPaxes);
            return;
        }

        const segMatch = line.match(/([A-Z0-9]{2})\s*(\d{1,4}[A-Z]?)\s*([0-9]{2}[A-Z]{3})\s+([A-Z]{3})([A-Z]{3})\s+([A-Z]{2}\d+)/);
        if (segMatch) {
            currentBlock.segments.push({
                carrier: segMatch[1],
                flight: segMatch[2],
                date: segMatch[3],
                from: segMatch[4],
                to: segMatch[5],
                status: segMatch[6]
            });
            return;
        }

        const ssrInfo = translateSSR(line);
        if (ssrInfo) {
            currentBlock.messages.push(ssrInfo);
        }
    });

    finalizeBlock();
    return { events, summary: generateSummary(events) };
};
