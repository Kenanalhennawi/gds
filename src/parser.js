import { translateSSR } from "./translator.js";

const cleanText = (text) => {
    if (!text) return [];
    let clean = text.toString();
    
    clean = clean.replace(/[\u0001\u0002\u0003\u0004]/g, "\n");
    clean = clean.replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, "\n");
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
        const mCompressed = line.match(/HDQ([A-Z0-9]{2})[A-Z0-9]*[\/\s]([A-Z0-9]{6})/);
        if (mCompressed) {
            block.context.airline = mCompressed[1];
            block.context.recordLocator = mCompressed[2];
            return;
        }

        const mSwi = line.match(/\.?SWI([A-Z0-9]{2})\s+([A-Z0-9]{6})/);
        if (mSwi) {
            block.context.airline = mSwi[1];
            block.context.recordLocator = mSwi[2];
            return;
        }

        if (header && header.startsWith('HDQ')) {
            block.context.airline = header.substring(3, 5);
        }
    };

    lines.forEach(line => {
        const envMatch = line.match(/(?:^|\s)(QP|QK|QD)\s+(\S+)/);
        if (envMatch) {
            startNewBlock(envMatch[1], envMatch[2], line);
            return;
        }

        const swiMatch = line.match(/(?:^|\s)\.?SWI([A-Z0-9]{2})\s+/);
        if (swiMatch) {
            if (!currentBlock) startNewBlock('SYS', 'SWI_LOG', line);
            currentBlock.context.airline = swiMatch[1];
            const pnr = line.match(/\/([A-Z0-9]{6})\//);
            if (pnr) currentBlock.context.recordLocator = pnr[1];
            return;
        }

        if (!currentBlock) {
            if (line.length > 4) startNewBlock('UNK', 'FRAGMENT', line);
            else return; 
        }

        const officeMatch = line.match(/^([A-Z]{3})([A-Z0-9]{2})\s+([A-Z0-9]{6})$/);
        if (officeMatch) {
            currentBlock.context.office = officeMatch[1];
            currentBlock.context.airline = officeMatch[2];
            currentBlock.context.recordLocator = officeMatch[3];
            return;
        }

        const paxMatch = line.match(/^\d+([A-Z]+)\/([A-Z]+)(\s+[A-Z]+)?$/);
        if (paxMatch) {
            currentBlock.pax = `${paxMatch[1]}/${paxMatch[2]}`;
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
    return events;
};
