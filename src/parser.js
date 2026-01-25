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
            headerType: null, // TRL, AKA, ASC, NAR, DVD, NCO
            context: { airline: null, recordLocator: null, office: null },
            segments: [],
            messages: [],
            ssrs: [], // Store SSR details
            osis: [], // Store OSI messages
            passengers: []
        };
        parseContextFromHeader(currentBlock, header, rawLine);
    };

    const parseContextFromHeader = (block, header, line) => {
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
        
        // Handle DXBEK QYHRKF/DXB/86491845/DXB/EK/A/AE format
        const mCityOffice = line.match(/([A-Z]{3})([A-Z0-9]{2})\s+([A-Z0-9]{6})\/([A-Z]{3})\/(\d+)\/([A-Z]{3})\/([A-Z0-9]{2})/);
        if (mCityOffice) {
            block.context.office = mCityOffice[1];
            block.context.airline = mCityOffice[2];
            block.context.recordLocator = mCityOffice[3];
            return;
        }
        
        // Handle DXBEK QYHRKF (simpler format)
        const mSimple = line.match(/([A-Z]{3})([A-Z0-9]{2})\s+([A-Z0-9]{6})/);
        if (mSimple && !block.context.recordLocator) {
            block.context.office = mSimple[1];
            block.context.airline = mSimple[2];
            block.context.recordLocator = mSimple[3];
            return;
        }
    };

    const extractPassengers = (line) => {
        const paxes = [];
        // Common titles that might appear at the end of names (sorted by length, longest first)
        const titles = ['MASTER', 'MSTR', 'MISS', 'MRS', 'MR', 'MS', 'DR', 'PROF', 'REV', 'HON'];
        
        // Pattern: 1SURNAME/GIVEN or 1SURNAME/GIVENTITLE or 1SURNAME/GIVEN TITLE
        // Also handle: 1AL FAHD/SHAMSA MUJALLI F A MS (with spaces in name)
        const regex = /\d+([A-Z\s]+)\/([A-Z\s]+)(?:\s+([A-Z]{1,6}))?/g;
        let match;
        while ((match = regex.exec(line)) !== null) {
            let surname = match[1].trim();
            let given = match[2].trim();
            let title = match[3] ? match[3].trim() : "";
            
            // Check if title is at the end of given name (e.g., SAUDMR -> SAUD + MR)
            // Check longest titles first to avoid partial matches
            if (!title) {
                for (const t of titles) {
                    const upperGiven = given.toUpperCase();
                    if (upperGiven.endsWith(t)) {
                        title = t;
                        given = given.substring(0, given.length - t.length).trim();
                        break;
                    }
                }
            }
            
            // Also check surname for titles (less common but possible)
            if (!title) {
                for (const t of titles) {
                    const upperSurname = surname.toUpperCase();
                    if (upperSurname.endsWith(t)) {
                        title = t;
                        surname = surname.substring(0, surname.length - t.length).trim();
                        break;
                    }
                }
            }
            
            // Clean up any extra spaces
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
        const envMatch = line.match(/^(QP|QK|QD)\s+(\S+)/);
        if (envMatch) {
            startNewBlock(envMatch[1], envMatch[2], line);
            return;
        }

        // Detect header types (must be at start of line or after certain patterns)
        const headerTypeMatch = line.match(/^(TRL|AKA|ASC|NAR|DVD|NCO)\s*/);
        if (headerTypeMatch && currentBlock) {
            currentBlock.headerType = headerTypeMatch[1];
        }

        if (line.startsWith("SWI") || line.startsWith("HDQ")) {
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

        // Try standard segment format: FZ123 24JAN DXBADD HK1
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
        
        // Try format with slash: FZ1263M/EK2474B24JAN DXBVNO CH1
        // Pattern: OperatingCarrierFlight/MarketingCarrierMarketingFlightDate Route(6chars) Status
        // Example: FZ1263M/EK2474B24JAN DXBVNO CH1 or FZ1264O/EK2475X31JAN VNODXB CH1
        const segSlashMatch = line.match(/^([A-Z0-9]{2})(\d{1,4})([A-Z]?)\/([A-Z0-9]{2})(\d{1,4}[A-Z]?)(\d{2}[A-Z]{3})\s+([A-Z]{6})\s+([A-Z]{2}\d+)$/);
        if (segSlashMatch) {
            const route = segSlashMatch[7]; // DXBVNO or VNODXB
            const from = route.substring(0, 3); // DXB or VNO
            const to = route.substring(3, 6); // VNO or DXB
            const operatingFareClass = segSlashMatch[3] || ''; // M or O
            const marketingCarrier = segSlashMatch[4]; // EK
            currentBlock.segments.push({
                carrier: segSlashMatch[1], // FZ
                flight: segSlashMatch[2], // 1263
                fareClass: operatingFareClass, // M or O
                date: segSlashMatch[6], // 24JAN
                from: from, // DXB
                to: to, // VNO
                status: segSlashMatch[8], // CH1
                marketingCarrier: marketingCarrier, // EK
                marketingFlight: segSlashMatch[5], // 2474B or 2475X
                codeshare: `${operatingFareClass}/${marketingCarrier}` // M/EK or O/EK
            });
            return;
        }
        
        // Try format with separated route: FZ1263M/EK2474B24JAN DXB VNO CH1
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

        // Parse SSR lines - handle various formats
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
            
            // Also add to messages for display
            const ssrInfo = translateSSR(line);
            if (ssrInfo) {
                currentBlock.messages.push(ssrInfo);
            }
            return;
        }
        
        // Also handle SSR without space (SSRTKNE or SSRFQTVFZHK/EK107126574)
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
            if (ssrInfo) {
                currentBlock.messages.push(ssrInfo);
            }
            return;
        }
        
        // Handle SSR with slash format: SSRFQTVFZHK/EK107126574-ALYASSI/SAUDMR
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
            if (ssrInfo) {
                currentBlock.messages.push(ssrInfo);
            }
            return;
        }

        // Parse OSI lines
        const osiMatch = line.match(/^OSI\s+([A-Z0-9]{2})\s+(.+)/i);
        if (osiMatch) {
            const carrier = osiMatch[1];
            const message = osiMatch[2];
            currentBlock.osis.push({
                carrier: carrier,
                message: message,
                raw: line
            });
            
            // Add OSI explanation to messages
            const osiInfo = translateOSI(line);
            if (osiInfo) {
                currentBlock.messages.push(osiInfo);
            }
            return;
        }

        // Generic message parsing (for other important messages)
        const ssrInfo = translateSSR(line);
        if (ssrInfo) {
            currentBlock.messages.push(ssrInfo);
        }
    });

    finalizeBlock();
    return events;
};
