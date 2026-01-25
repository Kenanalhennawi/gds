import { translateSSR } from "./translator.js";

const cleanText = (text) => {
    if (!text) return [];
    let clean = text.toString();
    clean = clean.replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, "\n");
    clean = clean.replace(/(\d{6})\s+(\.?[A-Z]{2,3})/g, "$1\n$2");
    clean = clean.replace(/([A-Z]{2})\s*(\d+[A-Z])([0-9]{2}[A-Z]{3})/g, "$1$2 $3");
    return clean.split(/\r\n|\r|\n/).map(l => l.trim()).filter(l => l.length > 0);
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
        parseContextFromHeader(currentBlock, header);
    };

    const parseContextFromHeader = (block, header) => {
        if (!header) return;
        
        const mCompressed = header.match(/^HDQ([A-Z0-9]{2})\s*([A-Z0-9]{6})\/([A-Z0-9]{3,4})\//);
        if (mCompressed) {
            block.context.airline = mCompressed[1];
            block.context.recordLocator = mCompressed[2];
            block.context.office = mCompressed[3];
            return;
        }

        if (header.startsWith('HDQRM')) {
            block.context.airline = header.substring(5, 7);
        } else if (header.startsWith('HDQ')) {
            block.context.airline = header.substring(3, 5);
        }
    };

    lines.forEach(line => {
        const envMatch = line.match(/^(QP|QK|QD)\s+(.*)$/);
        if (envMatch) {
            startNewBlock(envMatch[1], envMatch[2].split(' ')[0], line);
            return;
        }

        const swiMatch = line.match(/^\.?SWI([A-Z0-9]{2})\s+([A-Z0-9]{6})/);
        if (swiMatch) {
            if (!currentBlock) startNewBlock('SYS', 'SWI_LOG', line);
            currentBlock.context.airline = swiMatch[1];
            currentBlock.context.recordLocator = swiMatch[2];
            return;
        }

        if (!currentBlock) startNewBlock('UNK', 'FRAGMENT', line);

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

        const segMatch = line.match(/^([A-Z0-9]{2})\s*(\d{1,4}[A-Z]?)\s*([0-9]{2}[A-Z]{3})\s+([A-Z]{3})([A-Z]{3})\s+([A-Z]{2}\d+)/);
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
