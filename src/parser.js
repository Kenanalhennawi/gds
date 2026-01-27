import { translateSSR, translateOSI } from "./translator.js";

const cleanText = (text) => {
    if (!text) return [];
    let clean = text.toString();
    
    // Remove control characters
    clean = clean.replace(/[\u0001\u0002\u0003\u0004]/g, "\n");
    clean = clean.replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, "\n");
    
    // Fix glued PNR headers (e.g. 231737.DXB)
    clean = clean.replace(/(\d{6})\s*(\.?[A-Z]{2,3})/g, "$1\n$2");
    
    // Fix glued SSR lines (e.g. SSRTKNE -> SSR TKNE)
    clean = clean.replace(/(SSR)([A-Z]{4})/g, "$1 $2");
    
    // Fix glued headers (e.g. TRLHDQ)
    clean = clean.replace(/([A-Z0-9])(QP|QK|QD|HDQ|SWI|TRL|AKA|NAR|DVD)/g, "$1\n$2");

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
            headerType: null,
            timestamp: null,
            context: { airline: null, recordLocator: null, office: null, gdsSystem: null },
            segments: [],
            messages: [],
            ssrs: [],
            osis: [],
            passengers: [],
            rawLines: []
        };
        parseContextFromHeader(currentBlock, header, rawLine);
        
        // Extract timestamp from header line (can be at end or in middle)
        const timeMatch = rawLine.match(/\s+(\d{6})(?:\s|$)/) || rawLine.match(/(\d{6})\s*$/);
        if (timeMatch) {
            currentBlock.timestamp = timeMatch[1];
        }
    };

    const parseContextFromHeader = (block, header, line) => {
        const mHdqRm = line.match(/HDQRM([A-Z0-9]{2})/);
        if (mHdqRm) {
            block.context.airline = mHdqRm[1];
            const mHdqPnr = line.match(/HDQRM([A-Z0-9]{2})([A-Z0-9]{6})/);
            if (mHdqPnr) block.context.recordLocator = mHdqPnr[2];
            return;
        }
        
        const mHdqDirect = line.match(/HDQ([A-Z0-9]{2})(?:\s|$|[^A-Z0-9])/);
        if (mHdqDirect) {
            block.context.airline = mHdqDirect[1];
            const mHdqPnr = line.match(/HDQ([A-Z0-9]{2})([A-Z0-9]{6})/);
            if (mHdqPnr) block.context.recordLocator = mHdqPnr[2];
            return;
        }
        
        const mHdqSpace = line.match(/HDQ\s+(?:RM\s+)?([A-Z0-9]{2})/);
        if (mHdqSpace) {
            block.context.airline = mHdqSpace[1];
            return;
        }

        const mComp = line.match(/HDQ([A-Z0-9]{2})([A-Z0-9]{6})/);
        if (mComp) {
            block.context.airline = mComp[1];
            block.context.recordLocator = mComp[2];
            return;
        }

        const mSwi = line.match(/SWI([A-Z0-9]{2})\s+([A-Z0-9]{6})/);
        if (mSwi) {
            block.context.airline = mSwi[1];
            block.context.recordLocator = mSwi[2];
            return;
        }

        const mCity = line.match(/^([A-Z]{3})([A-Z0-9]{2})\s+([A-Z0-9]{6})$/);
        if (mCity) {
            block.context.office = mCity[1];
            block.context.airline = mCity[2];
            block.context.recordLocator = mCity[3];
            return;
        }
        
        const mCityOffice = line.match(/([A-Z]{3})([A-Z0-9]{2})\s+([A-Z0-9]{6})\/([A-Z]{3})\/(\d+)\/([A-Z]{3})\/([A-Z0-9]{2})/);
        if (mCityOffice) {
            block.context.office = mCityOffice[1];
            block.context.airline = mCityOffice[2];
            block.context.recordLocator = mCityOffice[3];
            return;
        }
        
        const mSimple = line.match(/([A-Z]{3})([A-Z0-9]{2})\s+([A-Z0-9]{6})/);
        if (mSimple && !block.context.recordLocator) {
            block.context.office = mSimple[1];
            block.context.airline = mSimple[2];
            block.context.recordLocator = mSimple[3];
            return;
        }
        
        const mOfficeRm = line.match(/^([A-Z]{3})RM([A-Z0-9]{2})$/);
        if (mOfficeRm) {
            block.context.office = mOfficeRm[1];
            block.context.airline = mOfficeRm[2];
            return;
        }
    };

    const extractPassengers = (line) => {
        const paxes = [];
        const titles = ['MASTER', 'MSTR', 'MISS', 'MRS', 'MR', 'MS', 'DR', 'PROF', 'REV', 'HON'];
        const regex = /\d+([A-Z\s]+)\/([A-Z\s]+)(?:\s+([A-Z]{1,6}))?/g;
        let match;
        while ((match = regex.exec(line)) !== null) {
            let surname = match[1].trim();
            let given = match[2].trim();
            let title = match[3] ? match[3].trim() : "";
            
            if (!title) {
                for (const t of titles) {
                    if (given.toUpperCase().endsWith(t)) {
                        title = t;
                        given = given.substring(0, given.length - t.length).trim();
                        break;
                    }
                }
            }
            if (!title) {
                for (const t of titles) {
                    if (surname.toUpperCase().endsWith(t)) {
                        title = t;
                        surname = surname.substring(0, surname.length - t.length).trim();
                        break;
                    }
                }
            }
            
            surname = surname.replace(/\s+/g, ' ');
            given = given.replace(/\s+/g, ' ');
            
            paxes.push({
                raw: match[0],
                surname: surname,
                given: given,
                title: title
            });
        }
        return paxes;
    };

    lines.forEach(line => {
        if (currentBlock) {
            currentBlock.rawLines.push(line);
        }
        
        // Detect GDS System type (1A=Amadeus, 1G=Galileo, 1S=Sabre, etc.)
        const gdsSystemMatch = line.match(/\b(1[ABFGPS])\b/);
        if (gdsSystemMatch && currentBlock) {
            if (!currentBlock.context.gdsSystem) {
                currentBlock.context.gdsSystem = gdsSystemMatch[1];
            }
        }
        
        const envMatch = line.match(/^(QP|QK|QD)\s+(\S+)/);
        if (envMatch) {
            startNewBlock(envMatch[1], envMatch[2], line);
            return;
        }

        const headerTypeMatch = line.match(/^(TRL|AKA|ASC|NAR|DVD|NCO)\s*/);
        if (headerTypeMatch && currentBlock) {
            currentBlock.headerType = headerTypeMatch[1];
        }

        if (line.startsWith("HDQ") || line.match(/^[.\s]*HDQ/)) {
            // FIX: Finalize previous block if it has content, preventing lines from being eaten
            if (currentBlock && (currentBlock.segments.length > 0 || currentBlock.passengers.length > 0)) {
                finalizeBlock();
            }
            if (!currentBlock) startNewBlock("SYS", "HDQ", line);
            parseContextFromHeader(currentBlock, null, line);
            return;
        }

        if (line.startsWith("SWI")) {
            if (!currentBlock) startNewBlock("SYS", line.split(' ')[0], line);
            parseContextFromHeader(currentBlock, null, line);
            return;
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

        // --- ENHANCED SEGMENT PARSING (Fix for "HK1/0035" and similar formats) ---
        const segSlashStatusMatch = line.match(/([A-Z0-9]{2})\s*(\d{1,4})([A-Z]?)\s*(\d{2}[A-Z]{3})\s+([A-Z]{3})([A-Z]{3})\s+([A-Z]{2}\d{1,2})(?:\/|$|\s)/);
        if (segSlashStatusMatch) {
            currentBlock.segments.push({
                carrier: segSlashStatusMatch[1],
                flight: segSlashStatusMatch[2],
                fareClass: segSlashStatusMatch[3] || '',
                date: segSlashStatusMatch[4],
                from: segSlashStatusMatch[5],
                to: segSlashStatusMatch[6],
                status: segSlashStatusMatch[7]
            });
            return;
        }

        const segMatch = line.match(/([A-Z0-9]{2})\s*(\d{1,4})([A-Z]?)\s*([0-9]{2}[A-Z]{3})\s+([A-Z]{3})([A-Z]{3})\s+([A-Z]{2}\d+)/);
        if (segMatch) {
            currentBlock.segments.push({
                carrier: segMatch[1],
                flight: segMatch[2],
                fareClass: segMatch[3] || '',
                date: segMatch[4],
                from: segMatch[5],
                to: segMatch[6],
                status: segMatch[7]
            });
            return;
        }
        
        const segSlashMatch = line.match(/^([A-Z0-9]{2})(\d{1,4})([A-Z]?)\/([A-Z0-9]{2})(\d{1,4}[A-Z]?)(\d{2}[A-Z]{3})\s+([A-Z]{6})\s+([A-Z]{2}\d+)$/);
        if (segSlashMatch) {
            const route = segSlashMatch[7];
            currentBlock.segments.push({
                carrier: segSlashMatch[1],
                flight: segSlashMatch[2],
                fareClass: segSlashMatch[3] || '',
                date: segSlashMatch[6],
                from: route.substring(0, 3),
                to: route.substring(3, 6),
                status: segSlashMatch[8],
                marketingCarrier: segSlashMatch[4],
                marketingFlight: segSlashMatch[5],
                codeshare: `${segSlashMatch[3] || ''}/${segSlashMatch[4]}`
            });
            return;
        }
        
        const segSlashSeparatedMatch = line.match(/^([A-Z0-9]{2})(\d{1,4}[A-Z]?)\/([A-Z0-9]{2})(\d{1,4}[A-Z]?)(\d{2}[A-Z]{3})\s+([A-Z]{3})\s+([A-Z]{3})\s+([A-Z]{2}\d+)$/);
        if (segSlashSeparatedMatch) {
            currentBlock.segments.push({
                carrier: segSlashSeparatedMatch[1],
                flight: segSlashSeparatedMatch[2],
                date: segSlashSeparatedMatch[5],
                from: segSlashSeparatedMatch[6],
                to: segSlashSeparatedMatch[7],
                status: segSlashSeparatedMatch[8]
            });
            return;
        }

        const ssrMatch = line.match(/^SSR\s+([A-Z]{4})\s+([A-Z0-9]{2})\s+([A-Z]{2}\d+)?/i);
        if (ssrMatch) {
            const ssrCode = ssrMatch[1];
            const carrier = ssrMatch[2];
            const status = ssrMatch[3] || '';
            const rest = line.substring(line.indexOf(ssrMatch[0]) + ssrMatch[0].length).trim();
            
            currentBlock.ssrs.push({
                code: ssrCode,
                carrier: carrier,
                status: status,
                raw: line,
                details: rest
            });
            
            const ssrInfo = translateSSR(line);
            if (ssrInfo) currentBlock.messages.push(ssrInfo);
            return;
        }

        const continuationMatch = line.match(/^(HK\d+|[A-Z]{2}\d+)\//) || line.startsWith('/');
        if (continuationMatch && currentBlock.ssrs.length > 0) {
            const lastSSR = currentBlock.ssrs[currentBlock.ssrs.length - 1];
            if (['DOCS', 'DOCO', 'DOCA'].includes(lastSSR.code)) {
                lastSSR.details += (lastSSR.details ? ' ' : '') + line;
                lastSSR.raw += '\n' + line;
                
                const fullSSRInfo = translateSSR(lastSSR.code + ' ' + lastSSR.details);
                if (fullSSRInfo) {
                    const existingMsgIndex = currentBlock.messages.findIndex(m => m.ssrCode === lastSSR.code);
                    if (existingMsgIndex >= 0) {
                        currentBlock.messages[existingMsgIndex] = fullSSRInfo;
                    } else {
                        currentBlock.messages.push(fullSSRInfo);
                    }
                }
                return;
            }
        }
        
        const ssrGluedMatch = line.match(/^SSR([A-Z]{4})([A-Z0-9]{2})([A-Z]{2}\d+)?/i);
        if (ssrGluedMatch) {
            const ssrCode = ssrGluedMatch[1];
            const carrier = ssrGluedMatch[2];
            const status = ssrGluedMatch[3] || '';
            const rest = line.substring(line.indexOf(ssrGluedMatch[0]) + ssrGluedMatch[0].length).trim();
            
            currentBlock.ssrs.push({
                code: ssrCode,
                carrier: carrier,
                status: status,
                raw: line,
                details: rest
            });
            
            const ssrInfo = translateSSR(line);
            if (ssrInfo) currentBlock.messages.push(ssrInfo);
            return;
        }
        
        const ssrSlashMatch = line.match(/^SSR([A-Z]{4})([A-Z0-9]{2})([A-Z]{2}\d+)?\/([^\s-]+)(?:-([^\s]+))?/i);
        if (ssrSlashMatch) {
            const ssrCode = ssrSlashMatch[1];
            const carrier = ssrSlashMatch[2];
            const status = ssrSlashMatch[3] || '';
            const value = ssrSlashMatch[4] || '';
            const passenger = ssrSlashMatch[5] || '';
            
            currentBlock.ssrs.push({
                code: ssrCode,
                carrier: carrier,
                status: status,
                raw: line,
                details: `${value}${passenger ? ' - ' + passenger : ''}`
            });
            
            const ssrInfo = translateSSR(line);
            if (ssrInfo) currentBlock.messages.push(ssrInfo);
            return;
        }

        const osiMatch = line.match(/^OSI\s+([A-Z0-9]{2})\s+(.+)/i);
        if (osiMatch) {
            const carrier = osiMatch[1];
            const message = osiMatch[2];
            currentBlock.osis.push({
                carrier: carrier,
                message: message,
                raw: line
            });
            const osiInfo = translateOSI(line);
            if (osiInfo) currentBlock.messages.push(osiInfo);
            return;
        }
    });

    finalizeBlock();
    return events;
};
