/**
 * Excess Baggage Rate Calculator
 * Calculates excess baggage rates based on origin, destination, and airline
 */

import { translateAirline, translateCity } from "./translator.js";

// Zone mapping for airports (from PDF page 13-14)
const ZONE_MAPPING = {
    // Zone 1: UAE
    'DXB': 1, 'DWC': 1,
    
    // Zone 2: Gulf Countries (GCC)
    'KWI': 2, 'BAH': 2, 'MCT': 2, 'SLL': 2, 'OHS': 2,
    
    // Zone 3: Saudi Arabia (KSA)
    'AHB': 3, 'AQI': 3, 'AJF': 3, 'DMM': 3, 'ELQ': 3, 'EAM': 3, 'GIZ': 3, 'HAS': 3, 'HOF': 3,
    'JED': 3, 'NUM': 3, 'MED': 3, 'RUH': 3, 'RSI': 3, 'TUU': 3, 'TIF': 3, 'ULH': 3, 'YNB': 3,
    
    // Zone 4: Middle East (ME)
    'BUZ': 4, 'GSM': 4, 'IFN': 4, 'IKA': 4, 'LRR': 4, 'MHD': 4, 'SYZ': 4, 'TBZ': 4, 'KIH': 4, 'KER': 4,
    'BGW': 4, 'BSR': 4, 'EBL': 4, 'ISU': 4, 'NJF': 4, 'TLV': 4, 'AMM': 4, 'BEY': 4,
    
    // Zone 5: Africa (AF)
    'JIB': 5, 'ASM': 5, 'ADD': 5, 'MBA': 5, 'HGA': 5, 'MGQ': 5, 'JUB': 5, 'KRT': 5, 'PZU': 5,
    'DAR': 5, 'JRO': 5, 'ZNZ': 5, 'EBB': 5, 'HBE': 5, 'SSH': 5, 'HMB': 5, 'SPX': 5, 'DBB': 5,
    
    // Zone 6: Sub-Continent (SC)
    'AMD': 6, 'BOM': 6, 'BLR': 6, 'CCJ': 6, 'CCU': 6, 'COK': 6, 'DEL': 6, 'HYD': 6, 'LKO': 6, 'MAA': 6, 'TRV': 6,
    'KBL': 6, 'CGP': 6, 'DAC': 6, 'KTM': 6, 'BWA': 6,
    'ISB': 6, 'KHI': 6, 'MUX': 6, 'LYP': 6, 'SKT': 6, 'UET': 6, 'LHE': 6, 'PEW': 6,
    'CMB': 6, 'LGK': 6, 'PEN': 6,
    
    // Zone 7: South East Asia (SEA)
    'MLE': 7, 'GAN': 7, 'RGN': 7, 'KBV': 7, 'UTP': 7,
    
    // Zone 8: Europe/CIS
    'GYD': 8, 'MSQ': 8, 'BUS': 8, 'TBS': 8, 'GRV': 8, 'EVN': 8, 'ALA': 8, 'CIT': 8, 'TSE': 8,
    'FRU': 8, 'OSS': 8, 'DYU': 8, 'ASB': 8, 'TAS': 8,
    'SZG': 8, 'TIA': 8, 'SJJ': 8, 'SOF': 8, 'DBV': 8, 'ZAG': 8, 'PRG': 8, 'JMK': 8, 'JTR': 8, 'CFU': 8,
    'TLL': 8, 'HEL': 8, 'CTA': 8, 'NAP': 8, 'PSA': 8, 'BGY': 8, 'CAG': 8, 'OLB': 8,
    'RIX': 8, 'VNO': 8, 'MLA': 8, 'TIV': 8, 'SKP': 8, 'KRK': 8, 'WAW': 8, 'POZ': 8,
    'OTP': 8, 'CLJ': 8, 'AER': 8, 'KUF': 8, 'KRR': 8, 'KZN': 8, 'MCX': 8, 'MRV': 8, 'OVB': 8,
    'PEE': 8, 'ROV': 8, 'SVO': 8, 'SVX': 8, 'UFA': 8, 'VKO': 8, 'VOG': 8, 'ZIA': 8, 'LED': 8,
    'BEG': 8, 'BTS': 8, 'LJU': 8, 'BSL': 8, 'ADB': 8, 'AYT': 8, 'SAW': 8, 'IST': 8, 'BJV': 8, 'TZX': 8,
    'IEV': 8, 'KBP': 8, 'ODS': 8, 'SKD': 8, 'NMA': 8
};

// Currency mapping by destination (from PDF page 23)
const CURRENCY_MAPPING = {
    'AED': ['DXB', 'KRT', 'PZU'],
    'BHD': ['BAH'],
    'CHF': ['BSL'],
    'CZK': ['PRG'],
    'EGP': ['HBE', 'SSH', 'SPX', 'DBB'],
    'EUR': ['BEG', 'BGY', 'BTS', 'CAG', 'CFU', 'CLJ', 'CTA', 'DBV', 'JMK', 'JTR', 'HEL', 'LJU', 'KIV', 'MLA', 'NAP', 'OTP', 'OLB', 'PSA', 'SJJ', 'SKP', 'SOF', 'SZG', 'TIA', 'TIV', 'ZAG'],
    'HUF': ['BUD'],
    'INR': ['AMD', 'BOM', 'BLR', 'CCU', 'CCJ', 'COK', 'DEL', 'HYD', 'LKO', 'MAA', 'TRV'],
    'JOD': ['AMM', 'AQJ'],
    'KWD': ['KWI'],
    'KZT': ['ALA', 'CIT', 'TSE', 'NQZ'],
    'LKR': ['CMB', 'HRI'],
    'MYR': ['LGK', 'PEN'],
    'NPR': ['KTM', 'BWA'],
    'OMR': ['MCT', 'SLL', 'OHS'],
    'PKR': ['ISB', 'KHI', 'LYP', 'MUX', 'SKT', 'UET', 'LHE', 'PEW'],
    'PLN': ['KRK', 'WAW', 'POZ'],
    'QAR': ['DOH'],
    'RUB': ['AER', 'GOJ', 'GRV', 'KRR', 'KUF', 'KZN', 'LED', 'MCX', 'MRV', 'OVB', 'PEE', 'ROV', 'SVO', 'SVX', 'UFA', 'VKO', 'VOG', 'VOZ', 'ZIA'],
    'SAR': ['AHB', 'AJF', 'AQI', 'DMM', 'EAM', 'ELQ', 'GIZ', 'HAS', 'HOF', 'JED', 'NUM', 'MED', 'RUH', 'RSI', 'TIF', 'TUU', 'ULH', 'YNB'],
    'THB': ['KBV', 'UTP'],
    'USD': ['ADB', 'ADD', 'ADE', 'ASB', 'ASM', 'AYT', 'AWZ', 'BGW', 'BJM', 'BJV', 'BND', 'BUS', 'BUZ', 'BSR', 'CGP', 'DAC', 'DAR', 'DOK', 'DYU', 'EBB', 'EBL', 'ESB', 'EVN', 'FIH', 'FRU', 'GAN', 'GBB', 'GSM', 'GYD', 'HDM', 'HGA', 'HRK', 'IEV', 'IFN', 'IKA', 'ISU', 'JIB', 'JRO', 'JUB', 'KBL', 'KBP', 'KDH', 'KER', 'KGL', 'KIH', 'KUT', 'LRR', 'MBA', 'MGQ', 'MHD', 'MLE', 'MSQ', 'NJF', 'NMA', 'ODS', 'OSS', 'RGN', 'SAH', 'SAW', 'SKD', 'SKG', 'TBS', 'TBZ', 'TGD', 'TLV', 'TZX', 'ZNZ', 'ZYL'],
    'UZS': ['TAS']
};

// Get zone for airport
export function getZoneForAirport(airport) {
    if (!airport) return null;
    return ZONE_MAPPING[airport.toUpperCase()] || null;
}

// Get currency for destination
export function getCurrencyForDestination(destination) {
    if (!destination) return 'USD';
    const dest = destination.toUpperCase();
    for (const [currency, airports] of Object.entries(CURRENCY_MAPPING)) {
        if (airports.includes(dest)) {
            return currency;
        }
    }
    return 'USD'; // Default
}

// Excess Baggage Rates Table (from PDF pages 15-22)
// Format: [From Zone][To Zone] = rate in base currency
const EXCESS_BAGGAGE_RATES = {
    'AED': {
        1: { 1: 0, 2: 40, 3: 40, 4: 60, 5: 40, 6: 40, 7: 60, 8: 60 },
        2: { 1: 40, 2: 60, 3: 60, 4: 60, 5: 60, 6: 60, 7: 80, 8: 80 },
        3: { 1: 40, 2: 60, 3: 60, 4: 60, 5: 60, 6: 60, 7: 80, 8: 80 },
        4: { 1: 60, 2: 60, 3: 60, 4: 60, 5: 60, 6: 60, 7: 60, 8: 60 },
        5: { 1: 40, 2: 60, 3: 60, 4: 60, 5: 60, 6: 60, 7: 60, 8: 60 },
        6: { 1: 40, 2: 60, 3: 60, 4: 60, 5: 60, 6: 60, 7: 80, 8: 80 },
        7: { 1: 60, 2: 80, 3: 80, 4: 60, 5: 60, 6: 80, 7: 80, 8: 80 },
        8: { 1: 60, 2: 80, 3: 80, 4: 60, 5: 60, 6: 80, 7: 80, 8: 80 }
    },
    'USD': {
        1: { 1: 0, 2: 11, 3: 11, 4: 17, 5: 11, 6: 11, 7: 17, 8: 17 },
        2: { 1: 11, 2: 17, 3: 17, 4: 17, 5: 17, 6: 17, 7: 22, 8: 22 },
        3: { 1: 11, 2: 17, 3: 17, 4: 17, 5: 17, 6: 17, 7: 22, 8: 22 },
        4: { 1: 17, 2: 17, 3: 17, 4: 17, 5: 17, 6: 17, 7: 17, 8: 17 },
        5: { 1: 11, 2: 17, 3: 17, 4: 17, 5: 17, 6: 17, 7: 17, 8: 17 },
        6: { 1: 11, 2: 17, 3: 17, 4: 17, 5: 17, 6: 17, 7: 22, 8: 22 },
        7: { 1: 17, 2: 22, 3: 22, 4: 17, 5: 17, 6: 22, 7: 22, 8: 22 },
        8: { 1: 17, 2: 22, 3: 22, 4: 17, 5: 17, 6: 22, 7: 22, 8: 22 }
    },
    'EUR': {
        1: { 1: 0, 2: 10, 3: 10, 4: 15, 5: 10, 6: 10, 7: 15, 8: 15 },
        2: { 1: 10, 2: 15, 3: 15, 4: 15, 5: 15, 6: 15, 7: 20, 8: 20 },
        3: { 1: 10, 2: 15, 3: 15, 4: 15, 5: 15, 6: 15, 7: 20, 8: 20 },
        4: { 1: 15, 2: 15, 3: 15, 4: 15, 5: 15, 6: 15, 7: 15, 8: 15 },
        5: { 1: 10, 2: 15, 3: 15, 4: 15, 5: 15, 6: 15, 7: 15, 8: 15 },
        6: { 1: 10, 2: 15, 3: 15, 4: 15, 5: 15, 6: 15, 7: 20, 8: 20 },
        7: { 1: 15, 2: 20, 3: 20, 4: 15, 5: 15, 6: 20, 7: 20, 8: 20 },
        8: { 1: 15, 2: 20, 3: 20, 4: 15, 5: 15, 6: 20, 7: 20, 8: 20 }
    },
    'SAR': {
        1: { 1: 0, 2: 40, 3: 40, 4: 65, 5: 40, 6: 40, 7: 65, 8: 65 },
        2: { 1: 40, 2: 65, 3: 65, 4: 65, 5: 65, 6: 65, 7: 85, 8: 85 },
        3: { 1: 40, 2: 65, 3: 65, 4: 65, 5: 65, 6: 65, 7: 85, 8: 85 },
        4: { 1: 65, 2: 65, 3: 65, 4: 65, 5: 65, 6: 65, 7: 65, 8: 65 },
        5: { 1: 40, 2: 65, 3: 65, 4: 65, 5: 65, 6: 65, 7: 65, 8: 65 },
        6: { 1: 40, 2: 65, 3: 65, 4: 65, 5: 65, 6: 65, 7: 85, 8: 85 },
        7: { 1: 65, 2: 85, 3: 85, 4: 65, 5: 65, 6: 85, 7: 85, 8: 85 },
        8: { 1: 65, 2: 85, 3: 85, 4: 65, 5: 65, 6: 85, 7: 85, 8: 85 }
    },
    'INR': {
        1: { 1: 0, 2: 1055, 3: 1055, 4: 1585, 5: 1055, 6: 1055, 7: 1585, 8: 1585 },
        2: { 1: 1055, 2: 1585, 3: 1585, 4: 1585, 5: 1585, 6: 1585, 7: 2115, 8: 2115 },
        3: { 1: 1055, 2: 1585, 3: 1585, 4: 1585, 5: 1585, 6: 1585, 7: 2115, 8: 2115 },
        4: { 1: 1585, 2: 1585, 3: 1585, 4: 1585, 5: 1585, 6: 1585, 7: 1585, 8: 1585 },
        5: { 1: 1055, 2: 1585, 3: 1585, 4: 1585, 5: 1585, 6: 1585, 7: 1585, 8: 1585 },
        6: { 1: 1055, 2: 1585, 3: 1585, 4: 1585, 5: 1585, 6: 1585, 7: 2115, 8: 2115 },
        7: { 1: 1585, 2: 2115, 3: 2115, 4: 1585, 5: 1585, 6: 2115, 7: 2115, 8: 2115 },
        8: { 1: 1585, 2: 2115, 3: 2115, 4: 1585, 5: 1585, 6: 2115, 7: 2115, 8: 2115 }
    },
    'PKR': {
        1: { 1: 0, 2: 3165, 3: 3165, 4: 4750, 5: 3165, 6: 3165, 7: 4750, 8: 4750 },
        2: { 1: 3165, 2: 4750, 3: 4750, 4: 4750, 5: 4750, 6: 4750, 7: 6335, 8: 6335 },
        3: { 1: 3165, 2: 4750, 3: 4750, 4: 4750, 5: 4750, 6: 4750, 7: 6335, 8: 6335 },
        4: { 1: 4750, 2: 4750, 3: 4750, 4: 4750, 5: 4750, 6: 4750, 7: 4750, 8: 4750 },
        5: { 1: 3165, 2: 4750, 3: 4750, 4: 4750, 5: 4750, 6: 4750, 7: 4750, 8: 4750 },
        6: { 1: 3165, 2: 4750, 3: 4750, 4: 4750, 5: 4750, 6: 4750, 7: 6335, 8: 6335 },
        7: { 1: 4750, 2: 6335, 3: 6335, 4: 4750, 5: 4750, 6: 6335, 7: 6335, 8: 6335 },
        8: { 1: 4750, 2: 6335, 3: 6335, 4: 4750, 5: 4750, 6: 6335, 7: 6335, 8: 6335 }
    },
    'QAR': {
        1: { 1: 0, 2: 40, 3: 40, 4: 65, 5: 40, 6: 40, 7: 65, 8: 65 },
        2: { 1: 40, 2: 65, 3: 65, 4: 65, 5: 65, 6: 65, 7: 85, 8: 85 },
        3: { 1: 40, 2: 65, 3: 65, 4: 65, 5: 65, 6: 65, 7: 85, 8: 85 },
        4: { 1: 65, 2: 65, 3: 65, 4: 65, 5: 65, 6: 65, 7: 65, 8: 65 },
        5: { 1: 40, 2: 65, 3: 65, 4: 65, 5: 65, 6: 65, 7: 65, 8: 65 },
        6: { 1: 40, 2: 65, 3: 65, 4: 65, 5: 65, 6: 65, 7: 85, 8: 85 },
        7: { 1: 65, 2: 85, 3: 85, 4: 65, 5: 65, 6: 85, 7: 85, 8: 85 },
        8: { 1: 65, 2: 85, 3: 85, 4: 65, 5: 65, 6: 85, 7: 85, 8: 85 }
    },
    'RUB': {
        1: { 1: 0, 2: 1085, 3: 1085, 4: 1630, 5: 1085, 6: 1085, 7: 1630, 8: 1630 },
        2: { 1: 1085, 2: 1630, 3: 1630, 4: 1630, 5: 1630, 6: 1630, 7: 2175, 8: 2175 },
        3: { 1: 1085, 2: 1630, 3: 1630, 4: 1630, 5: 1630, 6: 1630, 7: 2175, 8: 2175 },
        4: { 1: 1630, 2: 1630, 3: 1630, 4: 1630, 5: 1630, 6: 1630, 7: 1630, 8: 1630 },
        5: { 1: 1085, 2: 1630, 3: 1630, 4: 1630, 5: 1630, 6: 1630, 7: 1630, 8: 1630 },
        6: { 1: 1085, 2: 1630, 3: 1630, 4: 1630, 5: 1630, 6: 1630, 7: 2175, 8: 2175 },
        7: { 1: 1630, 2: 2175, 3: 2175, 4: 1630, 5: 1630, 6: 2175, 7: 2175, 8: 2175 },
        8: { 1: 1630, 2: 2175, 3: 2175, 4: 1630, 5: 1630, 6: 2175, 7: 2175, 8: 2175 }
    }
};

// EK/AC/UA rates (from PDF pages 24-25)
const EK_EXCESS_RATES = {
    // Per KG rates (USD)
    'per_kg': {
        'M.E.': { 'M.E.': 15, 'WAIO': 15, 'Africa': 25, 'Europe': 25, 'Far East': 25, 'ANZ': 40, 'Americas': 40 },
        'WAIO': { 'M.E.': 15, 'WAIO': 15, 'Africa': 25, 'Europe': 25, 'Far East': 25, 'ANZ': 40, 'Americas': 40 },
        'Europe': { 'M.E.': 25, 'WAIO': 30, 'Africa': 30, 'Europe': 30, 'Far East': 40, 'ANZ': 30, 'Americas': 50 },
        'Far East': { 'M.E.': 25, 'WAIO': 30, 'Africa': 15, 'Europe': 30, 'Far East': 30, 'ANZ': 15, 'Americas': 30 },
        'ANZ': { 'M.E.': 40, 'WAIO': 50, 'Africa': 50, 'Europe': 30, 'Far East': 15, 'ANZ': 15, 'Americas': 30 },
        'Americas': { 'M.E.': 40, 'WAIO': 40, 'Africa': 200, 'Europe': 100, 'Far East': 250, 'ANZ': 250, 'Americas': 200 }
    },
    // Per piece rates (USD)
    'per_piece': {
        'Africa': { 'Africa': 200, 'Americas': 200, 'Europe': 200, 'Far East': 200, 'ANZ': 250, 'M.E.': 250, 'WAIO': 200 },
        'Americas': { 'Africa': 200, 'Americas': 100, 'Europe': 100, 'Far East': 250, 'ANZ': 250, 'M.E.': 225, 'WAIO': 225 },
        'Canada': { 'Africa': 250, 'Americas': 125, 'Europe': 125, 'Far East': 300, 'ANZ': 300, 'M.E.': 280, 'WAIO': 280 }
    }
};

const UA_AC_RATES = {
    'free_allowance_eco': 23, // kg
    'free_allowance_bus': 32, // kg
    '1_excess_bag': 75, // USD
    '2_excess_bag': 100, // USD
    '3_or_more_excess_bag': 200, // USD
    'oversize': 200, // USD
    'overweight': 200 // USD
};

// Calculate excess baggage rate
export function calculateExcessBaggageRate(origin, destination, airline) {
    const originZone = getZoneForAirport(origin);
    const destZone = getZoneForAirport(destination);
    const currency = getCurrencyForDestination(destination);
    
    if (!originZone || !destZone) {
        return {
            error: 'Invalid airport code. Please check origin and destination.',
            originZone,
            destZone
        };
    }
    
    // Handle FZ rates
    if (airline === 'FZ') {
        const rates = EXCESS_BAGGAGE_RATES[currency] || EXCESS_BAGGAGE_RATES['USD'];
        const rate = rates[originZone] && rates[originZone][destZone];
        
        if (rate === undefined) {
            return {
                error: `Rate not available for ${currency} from Zone ${originZone} to Zone ${destZone}`,
                originZone,
                destZone,
                currency
            };
        }
        
        return {
            airline: 'FZ',
            origin: origin.toUpperCase(),
            destination: destination.toUpperCase(),
            originZone,
            destZone,
            currency,
            ratePerKg: rate,
            rateDescription: `${rate} ${currency} per kg`,
            carrierName: translateAirline('FZ')
        };
    }
    
    // Handle EK rates (for FZ-EK interline)
    if (airline === 'EK') {
        // Map zones to EK regions
        const originRegion = mapZoneToEKRegion(originZone);
        const destRegion = mapZoneToEKRegion(destZone);
        
        const perKgRate = EK_EXCESS_RATES.per_kg[originRegion] && 
                         EK_EXCESS_RATES.per_kg[originRegion][destRegion];
        
        return {
            airline: 'EK',
            origin: origin.toUpperCase(),
            destination: destination.toUpperCase(),
            originZone,
            destZone,
            originRegion,
            destRegion,
            currency: 'USD',
            ratePerKg: perKgRate || 'N/A',
            rateDescription: perKgRate ? `$${perKgRate} USD per kg` : 'Rate not available',
            carrierName: translateAirline('EK')
        };
    }
    
    // Handle AC/UA rates
    if (airline === 'AC' || airline === 'UA') {
        return {
            airline,
            origin: origin.toUpperCase(),
            destination: destination.toUpperCase(),
            originZone,
            destZone,
            currency: 'USD',
            freeAllowanceEco: UA_AC_RATES.free_allowance_eco,
            freeAllowanceBus: UA_AC_RATES.free_allowance_bus,
            rates: {
                '1_excess_bag': UA_AC_RATES['1_excess_bag'],
                '2_excess_bag': UA_AC_RATES['2_excess_bag'],
                '3_or_more_excess_bag': UA_AC_RATES['3_or_more_excess_bag'],
                'oversize': UA_AC_RATES.oversize,
                'overweight': UA_AC_RATES.overweight
            },
            carrierName: translateAirline(airline)
        };
    }
    
    return {
        error: `Rates not configured for airline ${airline}`,
        airline
    };
}

// Map zone to EK region
function mapZoneToEKRegion(zone) {
    const mapping = {
        1: 'M.E.', // UAE
        2: 'M.E.', // Gulf
        3: 'M.E.', // KSA
        4: 'M.E.', // Middle East
        5: 'Africa',
        6: 'WAIO', // Sub-continent
        7: 'Far East', // SEA
        8: 'Europe' // Europe/CIS
    };
    return mapping[zone] || 'M.E.';
}

// Get zone name
export function getZoneName(zone) {
    const names = {
        1: 'UAE',
        2: 'Gulf Countries (GCC)',
        3: 'Saudi Arabia (KSA)',
        4: 'Middle East (ME)',
        5: 'Africa (AF)',
        6: 'Sub-Continent (SC)',
        7: 'South East Asia (SEA)',
        8: 'Europe/CIS'
    };
    return names[zone] || `Zone ${zone}`;
}
