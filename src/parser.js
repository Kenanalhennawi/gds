import { translateSSR } from "./translator.js";

const cleanText = (text) => {
    if (!text) return [];
    let clean = text.toString();
    
    clean = clean.replace(/[\u0001\u0002\u0003\u0004]/g, "\n");
    clean = clean.replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, "\n");
    
    // Force split if headers are glued (e.g. TRLHDQ...)
    clean = clean.replace(/([A-Z0-9])(QP|QK|QD|HDQ|SWI|TRL|AKA|NAR|DVD)/g, "$1\n$2");
    
    // Fix glued PNR headers (e.g. 231737.DXB)
    clean = clean.replace(/(\d{6})\s*(\.?[A-Z]{2,3})/g, "$1\n$2");
    
    // Fix glued segment dates/destinations in rare cases
    clean = clean.replace(/([0-9A-Z]{2}\d{3,4}[A-Z]?\d{2}[A-Z]{3})([A-Z]{3})/g, "$1 $2");

    return clean
        .split(/\r\n|\r|\n/)
        .map(l => l.trim())
        .filter(l => l.length > 0);
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
            pax: null
        };
        parseContextFromHeader(currentBlock, header, rawLine);
    };

    const parseContextFromHeader = (block, header, line) => {
        // Pattern: HDQFZ9PVL96 (Compressed)
        const mComp = line.match(/HDQ([A-Z0-9]{2})([A-Z0-9]{6})/);
        if (mComp) {
            block.context.airline = mComp[1];
            block.context.recordLocator = mComp[2];
            return;
        }

        // Pattern: SWI1G FPLJHX (Galileo)
        const mSwi = line.match(/SWI([A-Z0-9]{2})\s+([A-Z0-9]{6})/);
        if (mSwi) {
            block.context.airline = mSwi[1];
            block.context.recordLocator = mSwi[2];
            return;
        }

        // Pattern: DXBEK DTZMGS (City+Airline + PNR)
        const mCity = line.match(/^([A-Z]{3})([A-Z0-9]{2})\s+([A-Z0-9]{6})$/);
        if (mCity) {
            block.context.office = mCity[1];
            block.context.airline = mCity[2];
            block.context.recordLocator = mCity[3];
            return;
        }
    };

    lines.forEach(line => {
        // Envelope Detection
        const envMatch = line.match(/^(QP|QK|QD)\s+(\S+)/);
        if (envMatch) {
            startNewBlock(envMatch[1], envMatch[2], line);
            return;
        }

        // Start block if we see SWI or HDQ at start of line
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
        // 1SAAD/ALI MR 1AARIF/MARYAM MS
        if (/^\d+[A-Z]+\/[A-Z]+/.test(line)) {
            const paxes = line.match(/\d+[A-Z]+\/[A-Z]+(?:\s+[A-Z]+)?(?:\s+[A-Z]{1,3})?/g);
            if (paxes) {
                currentBlock.pax = paxes.join(", ");
            }
            return;
        }

        // Segment Detection
        // FZ010W24JAN DOHDXB HK2
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

        // Message/SSR Detection
        const ssrInfo = translateSSR(line);
        if (ssrInfo) {
            currentBlock.messages.push(ssrInfo);
        }
    });

    finalizeBlock();
    return events;
};
