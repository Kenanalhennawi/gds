/**
 * Excess Baggage Policy Calculator for Interline Bookings
 * Determines which airline's excess baggage rates apply based on itinerary
 */

import { translateAirline, translateCity } from "./translator.js";

// Transatlantic carriers (carriers that operate transatlantic routes)
const TRANSATLANTIC_CARRIERS = ['AC', 'UA', 'DL', 'AA', 'BA', 'AF', 'LH', 'KL', 'VS', 'EI', 'SN', 'OS', 'LX', 'IB', 'TP', 'AZ'];

// Excess Baggage Policy Rules
const EXCESS_BAGGAGE_RULES = {
    // Rule 1: FZ - EK → EK rates apply
    'FZ_EK': {
        condition: (segments) => {
            const carriers = segments.map(s => s.carrier);
            return carriers.includes('FZ') && carriers.includes('EK') && !hasTransatlanticCarrier(segments, ['AC', 'UA']);
        },
        applicableCarrier: 'EK',
        description: 'FZ - EK: EK rates apply'
    },
    
    // Rule 2: FZ - EK - AC (EK is Transatlantic) → EK rates apply
    'FZ_EK_AC_EK_TRANSATLANTIC': {
        condition: (segments) => {
            const carriers = segments.map(s => s.carrier);
            const hasEK = carriers.includes('EK');
            const hasAC = carriers.includes('AC');
            const hasFZ = carriers.includes('FZ');
            if (hasFZ && hasEK && hasAC) {
                // Check if EK operates the transatlantic segment
                const transatlanticSeg = findTransatlanticSegment(segments);
                return transatlanticSeg && transatlanticSeg.carrier === 'EK';
            }
            return false;
        },
        applicableCarrier: 'EK',
        description: 'FZ - EK - AC (EK is Transatlantic carrier): EK rates apply'
    },
    
    // Rule 3: FZ - OAL (Other Airlines) → EK rates apply
    'FZ_OAL': {
        condition: (segments) => {
            const carriers = segments.map(s => s.carrier);
            const hasFZ = carriers.includes('FZ');
            const hasOtherAirlines = carriers.some(c => c !== 'FZ' && c !== 'EK' && c !== 'AC' && c !== 'UA');
            return hasFZ && hasOtherAirlines && !carriers.includes('EK') && !hasTransatlanticCarrier(segments, ['AC', 'UA']);
        },
        applicableCarrier: 'EK',
        description: 'FZ - OAL (Other Airlines): EK configured rates apply'
    },
    
    // Rule 4: FZ - AC (AC is Transatlantic) → AC rates apply
    'FZ_AC_TRANSATLANTIC': {
        condition: (segments) => {
            const carriers = segments.map(s => s.carrier);
            const hasFZ = carriers.includes('FZ');
            const hasAC = carriers.includes('AC');
            if (hasFZ && hasAC) {
                const transatlanticSeg = findTransatlanticSegment(segments);
                return transatlanticSeg && transatlanticSeg.carrier === 'AC';
            }
            return false;
        },
        applicableCarrier: 'AC',
        description: 'FZ - AC (AC is Transatlantic carrier): AC rates apply'
    },
    
    // Rule 5: FZ - UA (UA is Transatlantic) → UA rates apply
    'FZ_UA_TRANSATLANTIC': {
        condition: (segments) => {
            const carriers = segments.map(s => s.carrier);
            const hasFZ = carriers.includes('FZ');
            const hasUA = carriers.includes('UA');
            if (hasFZ && hasUA) {
                const transatlanticSeg = findTransatlanticSegment(segments);
                return transatlanticSeg && transatlanticSeg.carrier === 'UA';
            }
            return false;
        },
        applicableCarrier: 'UA',
        description: 'FZ - UA (UA is Transatlantic carrier): UA rates apply'
    }
};

// Helper function to check if segments have transatlantic carriers
function hasTransatlanticCarrier(segments, excludeCarriers = []) {
    return segments.some(seg => 
        TRANSATLANTIC_CARRIERS.includes(seg.carrier) && 
        !excludeCarriers.includes(seg.carrier)
    );
}

// Helper function to find transatlantic segment
function findTransatlanticSegment(segments) {
    // Common transatlantic routes: US/Canada to/from Europe/Middle East
    const transatlanticRoutes = [
        // North America to Europe/Middle East
        { from: ['US', 'CA', 'MX'], to: ['GB', 'FR', 'DE', 'IT', 'ES', 'NL', 'BE', 'CH', 'AT', 'IE', 'PT', 'GR', 'AE', 'SA', 'QA', 'KW', 'BH', 'OM'] },
        // Europe/Middle East to North America
        { from: ['GB', 'FR', 'DE', 'IT', 'ES', 'NL', 'BE', 'CH', 'AT', 'IE', 'PT', 'GR', 'AE', 'SA', 'QA', 'KW', 'BH', 'OM'], to: ['US', 'CA', 'MX'] }
    ];
    
    // Check for transatlantic routes
    for (const seg of segments) {
        const fromCountry = getCountryFromAirport(seg.from);
        const toCountry = getCountryFromAirport(seg.to);
        
        for (const route of transatlanticRoutes) {
            if (route.from.includes(fromCountry) && route.to.includes(toCountry)) {
                return seg;
            }
        }
    }
    
    // If no clear transatlantic route, check if carrier is transatlantic
    return segments.find(seg => TRANSATLANTIC_CARRIERS.includes(seg.carrier));
}

// Helper to get country from airport code (simplified)
function getCountryFromAirport(code) {
    // Major airport to country mapping
    const airportCountries = {
        // US
        'JFK': 'US', 'LAX': 'US', 'MIA': 'US', 'ORD': 'US', 'DFW': 'US', 'ATL': 'US', 'SEA': 'US', 'SFO': 'US',
        'EWR': 'US', 'LGA': 'US', 'BOS': 'US', 'IAD': 'US', 'DCA': 'US', 'MCO': 'US', 'FLL': 'US', 'DEN': 'US',
        'IAH': 'US', 'LAS': 'US', 'PHX': 'US', 'CLT': 'US', 'MSP': 'US', 'DTW': 'US', 'PHL': 'US', 'BWI': 'US',
        // Canada
        'YYZ': 'CA', 'YVR': 'CA', 'YUL': 'CA', 'YYC': 'CA', 'YOW': 'CA', 'YHZ': 'CA', 'YEG': 'CA',
        // UK
        'LHR': 'GB', 'LGW': 'GB', 'MAN': 'GB', 'STN': 'GB', 'LTN': 'GB', 'EDI': 'GB', 'GLA': 'GB', 'BRS': 'GB',
        // France
        'CDG': 'FR', 'ORY': 'FR', 'NCE': 'FR', 'LYS': 'FR', 'MRS': 'FR', 'BOD': 'FR', 'TLS': 'FR',
        // Germany
        'FRA': 'DE', 'MUC': 'DE', 'BER': 'DE', 'DUS': 'DE', 'HAM': 'DE', 'STR': 'DE', 'CGN': 'DE',
        // Italy
        'FCO': 'IT', 'MXP': 'IT', 'LIN': 'IT', 'VCE': 'IT', 'BLQ': 'IT', 'NAP': 'IT', 'PMO': 'IT',
        // Spain
        'MAD': 'ES', 'BCN': 'ES', 'AGP': 'ES', 'PMI': 'ES', 'VLC': 'ES', 'SVQ': 'ES', 'BIO': 'ES',
        // Netherlands
        'AMS': 'NL', 'EIN': 'NL', 'RTM': 'NL',
        // Belgium
        'BRU': 'BE', 'CRL': 'BE',
        // Switzerland
        'ZRH': 'CH', 'GVA': 'CH', 'BSL': 'CH',
        // Austria
        'VIE': 'AT', 'SZG': 'AT', 'INN': 'AT',
        // Ireland
        'DUB': 'IE', 'SNN': 'IE', 'ORK': 'IE',
        // Portugal
        'LIS': 'PT', 'OPO': 'PT', 'FAO': 'PT',
        // Greece
        'ATH': 'GR', 'SKG': 'GR', 'HER': 'GR', 'RHO': 'GR',
        // UAE
        'DXB': 'AE', 'AUH': 'AE', 'DWC': 'AE', 'SHJ': 'AE',
        // Saudi Arabia
        'RUH': 'SA', 'JED': 'SA', 'DMM': 'SA', 'MED': 'SA', 'AHB': 'SA', 'TIF': 'SA', 'ELQ': 'SA',
        // Qatar
        'DOH': 'QA',
        // Kuwait
        'KWI': 'KW',
        // Bahrain
        'BAH': 'BH',
        // Oman
        'MCT': 'OM', 'SLL': 'OM',
        // Turkey
        'IST': 'TR', 'SAW': 'TR', 'ESB': 'TR', 'AYT': 'TR', 'ADB': 'TR',
        // Egypt
        'CAI': 'EG', 'HBE': 'EG', 'LXR': 'EG', 'SSH': 'EG', 'HRG': 'EG',
        // Jordan
        'AMM': 'JO', 'AQJ': 'JO',
        // Lebanon
        'BEY': 'LB',
        // Morocco
        'CMN': 'MA', 'RBA': 'MA', 'AGA': 'MA',
        // Tunisia
        'TUN': 'TN', 'DJE': 'TN',
        // Algeria
        'ALG': 'DZ',
        // Russia
        'SVO': 'RU', 'DME': 'RU', 'VKO': 'RU', 'LED': 'RU',
        // India
        'DEL': 'IN', 'BOM': 'IN', 'BLR': 'IN', 'MAA': 'IN', 'HYD': 'IN', 'CCU': 'IN', 'AMD': 'IN',
        // Pakistan
        'KHI': 'PK', 'LHE': 'PK', 'ISB': 'PK',
        // Bangladesh
        'DAC': 'BD', 'CGP': 'BD',
        // Sri Lanka
        'CMB': 'LK',
        // Thailand
        'BKK': 'TH', 'DMK': 'TH', 'HKT': 'TH', 'CNX': 'TH',
        // Singapore
        'SIN': 'SG',
        // Malaysia
        'KUL': 'MY', 'PEN': 'MY',
        // Indonesia
        'CGK': 'ID', 'DPS': 'ID',
        // Philippines
        'MNL': 'PH', 'CEB': 'PH',
        // Vietnam
        'SGN': 'VN', 'HAN': 'VN',
        // China
        'PEK': 'CN', 'PKX': 'CN', 'PVG': 'CN', 'SHA': 'CN', 'CAN': 'CN', 'CTU': 'CN', 'SZX': 'CN',
        // Japan
        'NRT': 'JP', 'HND': 'JP', 'KIX': 'JP', 'NGO': 'JP',
        // South Korea
        'ICN': 'KR', 'GMP': 'KR',
        // Australia
        'SYD': 'AU', 'MEL': 'AU', 'BNE': 'AU', 'PER': 'AU',
        // New Zealand
        'AKL': 'NZ', 'WLG': 'NZ',
        // Mexico
        'MEX': 'MX', 'CUN': 'MX', 'GDL': 'MX',
        // Brazil
        'GRU': 'BR', 'GIG': 'BR', 'BSB': 'BR',
        // Argentina
        'EZE': 'AR', 'AEP': 'AR',
        // Chile
        'SCL': 'CL',
        // Colombia
        'BOG': 'CO', 'MDE': 'CO',
        // Central Asia
        'TAS': 'UZ', 'ALA': 'KZ', 'NQZ': 'KZ', 'DYU': 'TJ', 'ASB': 'TM', 'GYD': 'AZ', 'EVN': 'AM', 'TBS': 'GE',
        'VNO': 'LT', 'RIX': 'LV', 'TLL': 'EE'
    };
    
    return airportCountries[code] || 'UNKNOWN';
}

// Parse itinerary from text input
export function parseItinerary(input) {
    const lines = input.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const segments = [];
    
    lines.forEach(line => {
        // Try to parse segment format: FZ: TAS-DXB or FZ746L05JAN TIADXB HK1
        // Format 1: CARRIER: FROM-TO
        const format1 = line.match(/^([A-Z0-9]{2}):\s*([A-Z]{3})-([A-Z]{3})/i);
        if (format1) {
            segments.push({
                carrier: format1[1].toUpperCase(),
                from: format1[2].toUpperCase(),
                to: format1[3].toUpperCase(),
                raw: line
            });
            return;
        }
        
        // Format 2: Standard GDS format: FZ746L05JAN TIADXB HK1
        const format2 = line.match(/^([A-Z0-9]{2})(\d{1,4}[A-Z]?)\s*([0-9]{2}[A-Z]{3})?\s+([A-Z]{3})([A-Z]{3})/i);
        if (format2) {
            segments.push({
                carrier: format2[1].toUpperCase(),
                from: format2[4].toUpperCase(),
                to: format2[5].toUpperCase(),
                raw: line
            });
            return;
        }
        
        // Format 3: Simple route: FZ TAS DXB
        const format3 = line.match(/^([A-Z0-9]{2})\s+([A-Z]{3})\s+([A-Z]{3})/i);
        if (format3) {
            segments.push({
                carrier: format3[1].toUpperCase(),
                from: format3[2].toUpperCase(),
                to: format3[3].toUpperCase(),
                raw: line
            });
        }
    });
    
    return segments;
}

// Determine which carrier's rates apply
export function determineApplicableCarrier(segments) {
    if (!segments || segments.length === 0) {
        return {
            applicableCarrier: null,
            rule: null,
            description: 'No segments found',
            segments: []
        };
    }
    
    // Check each rule in order
    for (const [ruleName, rule] of Object.entries(EXCESS_BAGGAGE_RULES)) {
        if (rule.condition(segments)) {
            return {
                applicableCarrier: rule.applicableCarrier,
                rule: ruleName,
                description: rule.description,
                segments: segments,
                carrierName: translateAirline(rule.applicableCarrier)
            };
        }
    }
    
    // Default: If only FZ segments, FZ rates apply
    const allFZ = segments.every(s => s.carrier === 'FZ');
    if (allFZ) {
        return {
            applicableCarrier: 'FZ',
            rule: 'FZ_ONLY',
            description: 'FZ only itinerary: FZ rates apply',
            segments: segments,
            carrierName: translateAirline('FZ')
        };
    }
    
    // Fallback: Use first non-FZ carrier
    const firstNonFZ = segments.find(s => s.carrier !== 'FZ');
    if (firstNonFZ) {
        return {
            applicableCarrier: firstNonFZ.carrier,
            rule: 'DEFAULT',
            description: `Default: ${firstNonFZ.carrier} rates apply (first non-FZ carrier)`,
            segments: segments,
            carrierName: translateAirline(firstNonFZ.carrier)
        };
    }
    
    return {
        applicableCarrier: null,
        rule: null,
        description: 'Unable to determine applicable carrier',
        segments: segments
    };
}

// Get policy explanation
export function getPolicyExplanation(result) {
    if (!result || !result.applicableCarrier) {
        return 'Unable to determine excess baggage policy. Please check your itinerary.';
    }
    
    const carrier = result.carrierName || result.applicableCarrier;
    let explanation = `**Applicable Carrier:** ${carrier} (${result.applicableCarrier})\n\n`;
    explanation += `**Policy:** ${result.description}\n\n`;
    
    explanation += `**Itinerary:**\n`;
    result.segments.forEach((seg, idx) => {
        const carrierName = translateAirline(seg.carrier);
        const fromCity = translateCity(seg.from);
        const toCity = translateCity(seg.to);
        explanation += `${idx + 1}. ${seg.carrier} (${carrierName}): ${seg.from} (${fromCity}) → ${seg.to} (${toCity})\n`;
    });
    
    explanation += `\n**Note:** Excess baggage rates for ${carrier} will apply to this interline booking. `;
    explanation += `Please refer to the carrier's excess baggage rate table for specific charges based on destination and weight.`;
    
    return explanation;
}
