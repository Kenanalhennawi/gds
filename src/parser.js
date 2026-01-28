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
    
    // NEW: Split glued segments (e.g. "FZ010W24JAN DOHDXB HK2 .3. FZ777W24JAN..." -> separate lines)
    // Pattern: Carrier + Flight + Date + Route + Status + dots, repeated
    clean = clean.replace(/([A-Z]{2}\d{1,4}[A-Z]?[MTWFS]?\d{2}[A-Z]{3}\s+[A-Z]{3}[A-Z]{3}\s+[A-Z]{2}\d+\s*\.\d+\.)\s+(?=[A-Z]{2}\d)/g, "$1\n");
    
    // NEW: Split glued SSRs when they start with SSR (e.g. "SSRTKNEFZ... SSRTKNEFZ...")
    clean = clean.replace(/(SSR[A-Z]{4}[A-Z0-9]{2}[A-Z]{2}\d+[A-Z0-9]+)\s+(?=SSR[A-Z]{4})/g, "$1\n");
    
    // NEW: Split passenger lines that are glued (e.g. "1SAAD/ALI MR 1AARIF/MARYAM MS")
    clean = clean.replace(/(\d+[A-Z]+\/[A-Z\s]+[A-Z]{0,6})\s+(?=\d+[A-Z]+\/)/g, "$1\n");

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
            context: { airline: null, recordLocator: null, office: null },
            segments: [],
            messages: [],
            ssrs: [],
            osis: [],
            passengers: [],
            ticketNumbers: [], // NEW: Store all e-ticket numbers found
            rawLines: []
        };
        parseContextFromHeader(currentBlock, header, rawLine);
        
        const timeMatch = rawLine.match(/\s+(\d{6})\s*$/);
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
        // Enhanced regex to handle leading numbers like "1SAAD/ALI MR" or "SAAD/ALI MR"
        // Also handles cases where title might be before the slash
        const regex = /(\d+)?([A-Z\s]+)\/([A-Z\s]+)(?:\s+([A-Z]{1,6}))?/g;
        let match;
        while ((match = regex.exec(line)) !== null) {
            // Skip if this looks like a flight segment (has 3-letter codes that look like airports)
            if (match[0].match(/[A-Z]{3}[A-Z]{3}/)) continue;
            
            let surname = match[2].trim();
            let given = match[3].trim();
            let title = match[4] ? match[4].trim() : "";
            
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

        // NEW: Handle segments with day-of-week prefix and dots: "FZ010W24JAN DOHDXB HK2 .3."
        const segWithDayPrefixMatch = line.match(/([A-Z0-9]{2})(\d{1,4})([A-Z]?)([MTWFS][0-9]{2}[A-Z]{3})\s+([A-Z]{3})([A-Z]{3})\s+([A-Z]{2}\d+)(?:\s*\.\d+\.)?/);
        if (segWithDayPrefixMatch) {
            currentBlock.segments.push({
                carrier: segWithDayPrefixMatch[1],
                flight: segWithDayPrefixMatch[2],
                fareClass: segWithDayPrefixMatch[3] || '',
                date: segWithDayPrefixMatch[4].substring(1), // Remove day prefix (W, M, T, etc.)
                from: segWithDayPrefixMatch[5],
                to: segWithDayPrefixMatch[6],
                status: segWithDayPrefixMatch[7]
            });
            return;
        }

        // NEW: Handle segments without day prefix but with dots: "FZ010 24JAN DOHDXB HK2 .3."
        const segWithDotsMatch = line.match(/([A-Z0-9]{2})(\d{1,4})([A-Z]?)\s+(\d{2}[A-Z]{3})\s+([A-Z]{3})([A-Z]{3})\s+([A-Z]{2}\d+)(?:\s*\.\d+\.)?/);
        if (segWithDotsMatch) {
            currentBlock.segments.push({
                carrier: segWithDotsMatch[1],
                flight: segWithDotsMatch[2],
                fareClass: segWithDotsMatch[3] || '',
                date: segWithDotsMatch[4],
                from: segWithDotsMatch[5],
                to: segWithDotsMatch[6],
                status: segWithDotsMatch[7]
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

        // NEW: Handle glued SSR with ticket numbers: "SSRTKNEFZHK1DOHDXB0010W24JAN-1SAAD/ALI MR.1412998508237C1"
        // Enhanced to capture 13-digit e-ticket numbers (like 1412998508237)
        const ssrTicketGluedMatch = line.match(/SSR([A-Z]{4})([A-Z0-9]{2})([A-Z]{2}\d+)([A-Z]{3})([A-Z]{3})(\d{4})([MTWFS]?\d{2}[A-Z]{3})-(\d+[A-Z\s]+\/[A-Z\s]+[A-Z]{0,6})\.(\d{13})([A-Z]\d+)?/i);
        if (ssrTicketGluedMatch) {
            const ssrCode = ssrTicketGluedMatch[1];
            const carrier = ssrTicketGluedMatch[2];
            const status = ssrTicketGluedMatch[3];
            const from = ssrTicketGluedMatch[4];
            const to = ssrTicketGluedMatch[5];
            const flight = ssrTicketGluedMatch[6];
            const date = ssrTicketGluedMatch[7].replace(/^[MTWFS]/, ''); // Remove day prefix if present
            const passenger = ssrTicketGluedMatch[8].replace(/^\d+/, ''); // Remove leading number
            const ticketNum = ssrTicketGluedMatch[9]; // 13-digit e-ticket number
            const ticketSuffix = ssrTicketGluedMatch[10] || ''; // Optional suffix like C1, C2, etc.
            
            currentBlock.ssrs.push({
                code: ssrCode,
                carrier: carrier,
                status: status,
                raw: line,
                ticketNumber: ticketNum, // Store ticket number separately for easy access
                details: `Flight ${carrier}${flight} ${from}-${to} ${date}, Passenger: ${passenger}, E-Ticket: ${ticketNum}${ticketSuffix ? ' (' + ticketSuffix + ')' : ''}`
            });
            
            // Add ticket number to the block's ticketNumbers array
            if (ticketNum && !currentBlock.ticketNumbers.includes(ticketNum)) {
                currentBlock.ticketNumbers.push(ticketNum);
            }
            
            const ssrInfo = translateSSR(line);
            if (ssrInfo) currentBlock.messages.push(ssrInfo);
            return;
        }

        // NEW: Handle SSR TKNE with 13-digit ticket numbers in various formats
        // Pattern: SSRTKNE... followed by 13-digit number
        const ssrTicketNumberMatch = line.match(/SSR\s*TKNE[^0-9]*(\d{13})/i);
        if (ssrTicketNumberMatch && !ssrTicketGluedMatch) {
            const ticketNum = ssrTicketNumberMatch[1];
            const carrierMatch = line.match(/SSR\s*TKNE\s*([A-Z0-9]{2})/i);
            const carrier = carrierMatch ? carrierMatch[1] : '';
            
            currentBlock.ssrs.push({
                code: 'TKNE',
                carrier: carrier,
                status: '',
                raw: line,
                ticketNumber: ticketNum,
                details: `E-Ticket Number: ${ticketNum}`
            });
            
            // Add ticket number to the block's ticketNumbers array
            if (ticketNum && !currentBlock.ticketNumbers.includes(ticketNum)) {
                currentBlock.ticketNumbers.push(ticketNum);
            }
            
            const ssrInfo = translateSSR(line);
            if (ssrInfo) currentBlock.messages.push(ssrInfo);
            return;
        }

        // NEW: Extract 13-digit ticket numbers from any line (standalone pattern)
        const standaloneTicketMatch = line.match(/(\d{13})/);
        if (standaloneTicketMatch && !ssrTicketGluedMatch && !ssrTicketNumberMatch) {
            const ticketNum = standaloneTicketMatch[1];
            // Only add if it's in a context that suggests it's a ticket number (near SSR, TKNE, etc.)
            if (line.match(/SSR|TKNE|TICKET|TKT/i)) {
                if (!currentBlock.ticketNumbers.includes(ticketNum)) {
                    currentBlock.ticketNumbers.push(ticketNum);
                }
                // Also create an SSR entry if we found TKNE
                if (line.match(/TKNE/i)) {
                    const carrierMatch = line.match(/TKNE\s*([A-Z0-9]{2})/i);
                    currentBlock.ssrs.push({
                        code: 'TKNE',
                        carrier: carrierMatch ? carrierMatch[1] : '',
                        status: '',
                        raw: line,
                        ticketNumber: ticketNum,
                        details: `E-Ticket Number: ${ticketNum}`
                    });
                }
            }
        }

        // NEW: Handle simpler glued SSR format: "SSRTKNEFZHK1..."
        const ssrSimpleGluedMatch = line.match(/SSR([A-Z]{4})([A-Z0-9]{2})([A-Z]{2}\d+)([A-Z0-9]+)/i);
        if (ssrSimpleGluedMatch && !ssrTicketGluedMatch && !ssrTicketNumberMatch) {
            const ssrCode = ssrSimpleGluedMatch[1];
            const carrier = ssrSimpleGluedMatch[2];
            const status = ssrSimpleGluedMatch[3];
            const details = ssrSimpleGluedMatch[4];
            
            // Check if there's a 13-digit number in the details
            const ticketInDetails = details.match(/(\d{13})/);
            const ticketNum = ticketInDetails ? ticketInDetails[1] : null;
            
            currentBlock.ssrs.push({
                code: ssrCode,
                carrier: carrier,
                status: status,
                raw: line,
                ticketNumber: ticketNum,
                details: details
            });
            
            if (ticketNum && !currentBlock.ticketNumbers.includes(ticketNum)) {
                currentBlock.ticketNumbers.push(ticketNum);
            }
            
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
