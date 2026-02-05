import { translateSSR, translateOSI } from "./translator.js";

const cleanText = (text) => {
    if (!text) return [];
    let clean = text.toString();

    clean = clean.replace(/[\u0001\u0002\u0003\u0004]/g, "\n");
    clean = clean.replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, "\n");

    clean = clean.replace(/(\d{6})\s*(\.?[A-Z]{2,3})/g, "$1\n$2");

    clean = clean.replace(/(SSR)([A-Z]{4})/g, "$1 $2");




    clean = clean.replace(/(SSR\s+TKNE[^S]*\.\d{13}[A-Z]\d+)\s+(?=SSR)/gi, "$1\n");

    clean = clean.replace(/([A-Z0-9])(QP|QK|QD|HDQ|SWI|TRL|AKA|ASC|NAR|DVD|NCO)/g, "$1\n$2");


    clean = clean.replace(/([A-Z]{2}\d{1,4}[A-Z]?[MTWFS]?\d{2}[A-Z]{3}\s+[A-Z]{3}[A-Z]{3}\s+[A-Z]{2}\d+\s*\.\d+\.)\s+(?=[A-Z]{2}\d)/g, "$1\n");

    clean = clean.replace(/([A-Z]{2}\d{1,4}[A-Z]?[MTWFS]?\d{2}[A-Z]{3}\s+[A-Z]{3}[A-Z]{3}\s+DK\d+\/\d+(?:\/\d+)?\s*\.\d+\.)\s+(?=[A-Z]{2}\d)/g, "$1\n");

    clean = clean.replace(/([A-Z]{2}\d{1,4}[A-Z]?[MTWFS]?\d{2}[A-Z]{3}\s+[A-Z]{3}[A-Z]{3}\s+[A-Z]{2}\d+)\s+(?=[A-Z]{2}\d{1,4}[A-Z]?[MTWFS]?\d{2}[A-Z]{3})/g, "$1\n");

    clean = clean.replace(/(SSR[A-Z]{4}[A-Z0-9]{2}[A-Z]{2}\d+[A-Z0-9]+)\s+(?=SSR[A-Z]{4})/g, "$1\n");

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
            ticketNumbers: [],
            rawLines: []
        };
        parseContextFromHeader(currentBlock, header, rawLine);
        
        let timeMatch = rawLine.match(/\s+(\d{6})\s*$/);
        if (timeMatch) {
            currentBlock.timestamp = timeMatch[1];
        } else {
            const anyTime = rawLine.match(/\s(\d{6})\s/);
            if (anyTime && /^([0-1]\d|2[0-3])[0-5]\d[0-5]\d$/.test(anyTime[1])) {
                currentBlock.timestamp = anyTime[1];
            }
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

        const nonPassengerPatterns = [
            /^[A-Z]{2,3}\/[A-Z]{2,3}$/,  // EN/TNR, TNR/EK, DXB/SLL (city/airline/route)
            /^[A-Z]\/(MG|MDG|MSTR|MISS|MRS|MR|MS|DR)$/i,  // A/MG, P/MDG (agent/title-like context)
            /^P\/MG$/i,
            /^[A-Z]{3}\/EK$/i,   // TNR/EK
            /^EN\/TNR$/i,
            /^TNR\/EK$/i,
            /^A\/MG$/i,
            /^Y\/EK$/i,          // Y/EK (fare class / airline context)
            /^[A-Z]\/[A-Z]{2}$/, // single letter / 2 letters (e.g. Y/EK, fare/airline codes)
            /^[A-Z]{2}\/[A-Z]$/  // 2 letters / single letter (e.g. EK/Y)
        ];
        const isLikelyNotPassenger = (raw, surname, given) => {
            const u = raw.trim().toUpperCase().replace(/^\d+/, '').trim();
            if (u.match(/[A-Z]{3}[A-Z]{3}/)) return true;
            if (nonPassengerPatterns.some(re => re.test(u))) return true;
            return false;
        };

        const regex = /(\d+)?([A-Z\s]+)\/([A-Z\s]+)(?:\s+([A-Z]{1,6}))?/g;
        let match;
        const knownAirlineSuffix = /\s+(FZ|EK|QR|EY|TK|MS|SV|UA|AA|DL|AC|BA|LH|AF|KL|WY|GF|RJ|B6|NK|FR|U2|W6|SQ|MH|CX|NH|JL|KE|OZ|AI|QF|NZ)$/i;
        while ((match = regex.exec(line)) !== null) {
            if (!match[1] && match[0].match(/[A-Z]{3}[A-Z]{3}/)) continue;
            let surname = match[2].trim();
            let given = match[3].trim();
            given = given.replace(knownAirlineSuffix, '').trim();
            const leadingNum = match[1] ? parseInt(match[1], 10) : null;
            const looksLikePaxIndex = match[1] && match[1].length <= 2 && leadingNum >= 1 && leadingNum <= 99;
            if (looksLikePaxIndex && surname.length >= 2 && given.length >= 2) {
                if (nonPassengerPatterns.some(re => re.test((surname + '/' + given).toUpperCase()))) continue;
            } else if (isLikelyNotPassenger(match[0], surname, given)) continue;
            let title = match[4] ? match[4].trim() : "";
            if (title && /^(FZ|EK|QR|EY|TK|MS|SV|UA|AA|DL|AC)$/i.test(title)) title = "";
            
            if (!title) {
                for (const t of titles) {
                    if (given.toUpperCase().endsWith(t)) {
                        const remainder = given.substring(0, given.length - t.length).trim();
                        if ((t === 'MS' || t === 'MR') && remainder.length < 6) continue;
                        title = t;
                        given = remainder;
                        break;
                    }
                }
            }
            if (!title) {
                for (const t of titles) {
                    if (surname.toUpperCase().endsWith(t)) {
                        const remainder = surname.substring(0, surname.length - t.length).trim();
                        if ((t === 'MS' || t === 'MR') && remainder.length < 6) continue;
                        title = t;
                        surname = remainder;
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


        if (line.includes('TKNE') || (line.includes('SSR') && line.match(/\d{13}/))) {
            const ticketMatches = line.match(/(\d{13})/g);
            if (ticketMatches && currentBlock) {
                ticketMatches.forEach(ticketNum => {
                    if (!currentBlock.ticketNumbers.includes(ticketNum)) {
                        currentBlock.ticketNumbers.push(ticketNum);
                    }
                });
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
            if (line.length > 4) {
                startNewBlock('UNK', 'FRAGMENT', line);
                const ht = line.match(/^(TRL|AKA|ASC|NAR|DVD|NCO)\s*/);
                if (ht) currentBlock.headerType = ht[1];
            }
            else return; 
        }

        const foundPaxes = extractPassengers(line);
        if (foundPaxes.length > 0) {
            currentBlock.passengers.push(...foundPaxes);
        }

        const segGluedRouteMatch = line.match(/([A-Z0-9]{2})(\d{1,4})([A-Z]?)([0-9]{2}[A-Z]{3})\s+([A-Z]{6})(?:\s+([A-Z]{2,3}\d*))?(?:\s|$|\/)/);
        if (segGluedRouteMatch) {
            currentBlock.segments.push({
                carrier: segGluedRouteMatch[1],
                flight: segGluedRouteMatch[2],
                fareClass: segGluedRouteMatch[3] || '',
                date: segGluedRouteMatch[4],
                from: segGluedRouteMatch[5].substring(0, 3),
                to: segGluedRouteMatch[5].substring(3, 6),
                status: segGluedRouteMatch[6] || ''
            });
            return;
        }

        const segSlashStatusMatch = line.match(/([A-Z0-9]{2})\s*(\d{1,4})([A-Z]?)\s*(\d{2}[A-Z]{3})\s+([A-Z]{3})([A-Z]{3})\s+([A-Z]{2,3}\d{0,2})(?:\/|$|\s)/);
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

        const segMatch = line.match(/([A-Z0-9]{2})\s*(\d{1,4})([A-Z]?)\s*([0-9]{2}[A-Z]{3})\s+([A-Z]{3})([A-Z]{3})\s+([A-Z]{2,3}\d*)/);
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
        
        const segSlashMatch = line.match(/^([A-Z0-9]{2})(\d{1,4})([A-Z]?)\/([A-Z0-9]{2})(\d{1,4}[A-Z]?)(\d{2}[A-Z]{3})\s+([A-Z]{6})\s+([A-Z]{2,3}\d*)$/);
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
        
        const segSlashSeparatedMatch = line.match(/^([A-Z0-9]{2})(\d{1,4}[A-Z]?)\/([A-Z0-9]{2})(\d{1,4}[A-Z]?)(\d{2}[A-Z]{3})\s+([A-Z]{3})\s+([A-Z]{3})\s+([A-Z]{2,3}\d*)$/);
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


        const segWithDayPrefixMatch = line.match(/([A-Z0-9]{2})(\d{1,4})([A-Z]?)([MTWFS][0-9]{2}[A-Z]{3})\s+([A-Z]{3})([A-Z]{3})\s+([A-Z]{2,3}\d*)(?:\s*\.\d+\.)?/);
        if (segWithDayPrefixMatch) {
            currentBlock.segments.push({
                carrier: segWithDayPrefixMatch[1],
                flight: segWithDayPrefixMatch[2],
                fareClass: segWithDayPrefixMatch[3] || '',
                date: segWithDayPrefixMatch[4].substring(1),
                from: segWithDayPrefixMatch[5],
                to: segWithDayPrefixMatch[6],
                status: segWithDayPrefixMatch[7]
            });
            return;
        }

        const segWithDKTicketMatch = line.match(/([A-Z0-9]{2})(\d{1,4})([A-Z]?)([MTWFS]?)(\d{2}[A-Z]{3})\s+([A-Z]{3})([A-Z]{3})\s+DK(\d+)\/(\d+)(?:\/(\d+))?(?:\s*\.\d+\.)?/);
        if (segWithDKTicketMatch) {

            const date = segWithDKTicketMatch[5];
            const ticketNum = segWithDKTicketMatch[9];
            const ticketSuffix = segWithDKTicketMatch[10] || '';
            const fullTicketNum = ticketSuffix ? `${ticketNum}/${ticketSuffix}` : ticketNum;
            
            currentBlock.segments.push({
                carrier: segWithDKTicketMatch[1],
                flight: segWithDKTicketMatch[2],
                fareClass: segWithDKTicketMatch[3] || '',
                date: date,
                from: segWithDKTicketMatch[6],
                to: segWithDKTicketMatch[7],
                status: `DK${segWithDKTicketMatch[8]}`,
                ticketNumber: fullTicketNum
            });

            if (fullTicketNum && !currentBlock.ticketNumbers.includes(fullTicketNum)) {
                currentBlock.ticketNumbers.push(fullTicketNum);
            }
            
            return;
        }


        const segWithDotsMatch = line.match(/([A-Z0-9]{2})(\d{1,4})([A-Z]?)\s+(\d{2}[A-Z]{3})\s+([A-Z]{3})([A-Z]{3})\s+([A-Z]{2,3}\d*)(?:\s*\.\d+\.)?/);
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




        const ssrTicketGluedMatch = line.match(/SSR\s+TKNE\s+([A-Z0-9]{2})([A-Z]{2}\d+)([A-Z]{3})([A-Z]{3})(\d{4})([MTWFS]?\d{2}[A-Z]{3})-(\d+[A-Z\s]+\/[A-Z\s]+[A-Z]{0,6}\s*[A-Z]{0,2})\.(\d{13})([A-Z]\d+)?/i);
        if (ssrTicketGluedMatch) {
            const ssrCode = 'TKNE';
            const carrier = ssrTicketGluedMatch[1];
            const status = ssrTicketGluedMatch[2];
            const from = ssrTicketGluedMatch[3];
            const to = ssrTicketGluedMatch[4];
            const flight = ssrTicketGluedMatch[5];
            const date = ssrTicketGluedMatch[6].replace(/^[MTWFS]/, '');
            const passenger = ssrTicketGluedMatch[7].replace(/^\d+/, '').trim();
            const ticketNum = ssrTicketGluedMatch[8];
            const ticketSuffix = ssrTicketGluedMatch[9] || '';
            currentBlock.ssrs.push({
                code: ssrCode,
                carrier: carrier,
                status: status,
                raw: line,
                ticketNumber: ticketNum,
                details: `Flight ${carrier}${flight} ${from}-${to} ${date}, Passenger: ${passenger}, E-Ticket: ${ticketNum}${ticketSuffix ? ' (' + ticketSuffix + ')' : ''}`
            });

            if (ticketNum && !currentBlock.ticketNumbers.includes(ticketNum)) {
                currentBlock.ticketNumbers.push(ticketNum);
            }
            
            const ssrInfo = translateSSR(line);
            if (ssrInfo) currentBlock.messages.push(ssrInfo);
            return;
        }


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

            if (ticketNum && !currentBlock.ticketNumbers.includes(ticketNum)) {
                currentBlock.ticketNumbers.push(ticketNum);
            }
            
            const ssrInfo = translateSSR(line);
            if (ssrInfo) currentBlock.messages.push(ssrInfo);
            return;
        }



        if (line.includes('TKNE') || line.includes('SSR')) {
            const ticketMatches = line.match(/(\d{13})/g);
            if (ticketMatches && !ssrTicketGluedMatch && !ssrTicketNumberMatch) {
                ticketMatches.forEach(ticketNum => {
                    if (!currentBlock.ticketNumbers.includes(ticketNum)) {
                        currentBlock.ticketNumbers.push(ticketNum);
                    }

                    if (line.match(/TKNE/i) && !currentBlock.ssrs.some(s => s.ticketNumber === ticketNum)) {
                        const carrierMatch = line.match(/TKNE\s+([A-Z0-9]{2})/i);
                        const passengerMatch = line.match(/(\d+[A-Z\s]+\/[A-Z\s]+[A-Z]{0,6})/i);
                        const passenger = passengerMatch ? passengerMatch[1].replace(/^\d+/, '').trim() : '';
                        
                        currentBlock.ssrs.push({
                            code: 'TKNE',
                            carrier: carrierMatch ? carrierMatch[1] : '',
                            status: '',
                            raw: line,
                            ticketNumber: ticketNum,
                            details: passenger ? `Passenger: ${passenger}, E-Ticket: ${ticketNum}` : `E-Ticket Number: ${ticketNum}`
                        });
                    }
                });
            }
        }

        const ssrSimpleGluedMatch = line.match(/SSR([A-Z]{4})([A-Z0-9]{2})([A-Z]{2}\d+)([A-Z0-9]+)/i);
        if (ssrSimpleGluedMatch && !ssrTicketGluedMatch && !ssrTicketNumberMatch) {
            const ssrCode = ssrSimpleGluedMatch[1];
            const carrier = ssrSimpleGluedMatch[2];
            const status = ssrSimpleGluedMatch[3];
            const details = ssrSimpleGluedMatch[4];

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
