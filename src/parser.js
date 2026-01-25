import { translateSSR } from "./translator.js";

const cleanText = (text) => {
    if (!text) return [];
    let clean = text.toString();
    
    // CRITICAL FIX: Replace specific GDS control characters (boxes) with newlines
    // \x01 = SOH, \x02 = STX, \x03 = ETX, \x04 = EOT
    clean = clean.replace(/[\u0001\u0002\u0003\u0004]/g, "\n");
    
    // Replace standard hidden control chars
    clean = clean.replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, "\n");
    
    // Fix "glued" PNR headers (e.g. 231737.DXB -> 231737\n.DXB)
    clean = clean.replace(/(\d{6})\s+(\.?[A-Z]{2,3})/g, "$1\n$2");
    
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
        // Try to find Airline/PNR in compressed HDQ line (e.g., HDQRMFZ...)
        const mCompressed = line.match(/HDQ([A-Z0-9]{2})[A-Z0-9]*[\/\s]([A-Z0-9]{6})/);
        if (mCompressed) {
            block.context.airline = mCompressed[1];
            block.context.recordLocator = mCompressed[2];
            return;
        }

        // Try to find Galileo context (e.g. SWI1G)
        const mSwi = line.match(/\.?SWI([A-Z0-9]{2})\s+([A-Z0-9]{6})/);
        if (mSwi) {
            block.context.airline = mSwi[1]; // e.g. 1G
            block.context.recordLocator = mSwi[2];
            return;
        }

        // Fallback for simple headers
        if (header && header.startsWith('HDQ')) {
            block.context.airline = header.substring(3, 5); // Take chars 3-4 as airline
        }
    };

    lines.forEach(line => {
        // 1. Detect Envelope Headers (QP, QK, QD)
        // Allow for loose matching (doesn't have to be start of string)
        const envMatch = line.match(/(?:^|\s)(QP|QK|QD)\s+(\S+)/);
        if (envMatch) {
            startNewBlock(envMatch[1], envMatch[2], line);
            return;
        }

        // 2. Detect Galileo/Travelport Headers (SWI1G)
        const swiMatch = line.match(/(?:^|\s)\.?SWI([A-Z0-9]{2})\s+/);
        if (swiMatch) {
            // If we are already in a block, just update context, otherwise start new
            if (!currentBlock) startNewBlock('SYS', 'SWI_LOG', line);
            currentBlock.context.airline = swiMatch[1];
            // Try to find PNR in same line
            const pnr = line.match(/\/([A-Z0-9]{6})\//);
            if (pnr) currentBlock.context.recordLocator = pnr[1];
            return;
        }

        // 3. Detect "Orphan" lines (start a block if none exists)
        if (!currentBlock) {
            // Don't start a block for tiny garbage lines
            if (line.length > 4) startNewBlock('UNK', 'FRAGMENT', line);
            else return; 
        }

        // 4. Detect Passengers (1SURNAME/NAME)
        const paxMatch = line.match(/^\d+([A-Z]+)\/([A-Z]+)(\s+[A-Z]+)?$/);
        if (paxMatch) {
            currentBlock.pax = `${paxMatch[1]}/${paxMatch[2]}`;
            return;
        }

        // 5. Detect Flight Segments
        // Matches: FZ010C 24JAN ...
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

        // 6. Detect SSR/OSI/Remarks
        const ssrInfo = translateSSR(line);
        if (ssrInfo) {
            currentBlock.messages.push(ssrInfo);
        }
    });

    finalizeBlock();
    return events;
};
