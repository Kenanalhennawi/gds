/**
 * Comprehensive Flydubai Rate Calculator
 * Includes: Excess Baggage, Go-Show Fares, Upgrades, Sports Equipment, etc.
 */

import { translateAirline, translateCity } from "./translator.js";

// Zone mapping for airports (from PDF page 13-14)
const ZONE_MAPPING = {
    'DXB': 1, 'DWC': 1, 'AWZ': 1, 'AQI': 1, 'BAH': 1, 'BND': 1, 'BSR': 1, 'DMM': 1, 'DOH': 1, 'ELQ': 1,
    'HAS': 1, 'HOF': 1, 'IFN': 1, 'KER': 1, 'KHI': 1, 'KIH': 1, 'KWI': 1, 'LRR': 1, 'MCT': 1, 'OHS': 1,
    'RUH': 1, 'SLL': 1, 'SYZ': 1,
    
    'KWI': 2, 'BAH': 2, 'MCT': 2, 'SLL': 2, 'OHS': 2,
    'ADE': 2, 'AHB': 2, 'AJF': 2, 'AMD': 2, 'AMM': 2, 'AQJ': 2, 'BEY': 2, 'BGW': 2, 'BOM': 2, 'BLR': 2,
    'BUS': 2, 'BUZ': 2, 'CCJ': 2, 'CCU': 2, 'COK': 2, 'DEL': 2, 'EAM': 2, 'EBL': 2, 'EVN': 2, 'GBB': 2,
    'GIZ': 2, 'GSM': 2, 'GYD': 2, 'HDM': 2, 'HRI': 2, 'HYD': 2, 'IKA': 2, 'ISB': 2, 'ISU': 2, 'JED': 2,
    'JIB': 2, 'KBL': 2, 'KDH': 2, 'LKO': 2, 'LHE': 2, 'LYP': 2, 'MAA': 2, 'MED': 2, 'MHD': 2, 'MRV': 2,
    'MUX': 2, 'NJF': 2, 'NUM': 2, 'RSI': 2, 'SAH': 2, 'SKT': 2, 'TBS': 2, 'TBZ': 2, 'TIF': 2, 'TRV': 2,
    'TUU': 2, 'UET': 2, 'ULH': 2, 'YNB': 2,
    
    'AHB': 3, 'AQI': 3, 'AJF': 3, 'DMM': 3, 'ELQ': 3, 'EAM': 3, 'GIZ': 3, 'HAS': 3, 'HOF': 3,
    'JED': 3, 'NUM': 3, 'MED': 3, 'RUH': 3, 'RSI': 3, 'TUU': 3, 'TIF': 3, 'ULH': 3, 'YNB': 3,
    'ADB': 3, 'ADD': 3, 'AER': 3, 'ALA': 3, 'ASB': 3, 'ASM': 3, 'AYT': 3, 'BEG': 3, 'BGY': 3, 'BJM': 3,
    'BJV': 3, 'BKK': 3, 'BSL': 3, 'BUD': 3, 'BTS': 3, 'BWA': 3, 'CAG': 3, 'CLJ': 3, 'CMB': 3, 'CTA': 3,
    'CIT': 3, 'CFU': 3, 'CGP': 3, 'DAC': 3, 'DAR': 3, 'DBB': 3, 'DBV': 3, 'DYU': 3, 'EBB': 3, 'ESB': 3,
    'DOK': 3, 'FIH': 3, 'FRU': 3, 'GAN': 3, 'GOI': 3, 'GOJ': 3, 'GRV': 3, 'HBE': 3, 'HGA': 3, 'HMB': 3,
    'HRI': 3, 'HEL': 3, 'HRK': 3, 'IEV': 3, 'IST': 3, 'JMK': 3, 'JRO': 3, 'JTR': 3, 'KBP': 3, 'KBV': 3,
    'KGL': 3, 'JUB': 3, 'KIV': 3, 'KRR': 3, 'KRK': 3, 'KRT': 3, 'KTM': 3, 'KUF': 3, 'KUT': 3, 'KZN': 3,
    'LED': 3, 'LGK': 3, 'LJU': 3, 'MBA': 3, 'MBX': 3, 'MCX': 3, 'MGQ': 3, 'MLA': 3, 'MLE': 3, 'MSQ': 3,
    'NAP': 3, 'NMA': 3, 'NQZ': 3, 'OLB': 3, 'OSS': 3, 'OTP': 3, 'OVB': 3, 'ODS': 3, 'PEE': 3, 'PEN': 3,
    'PEW': 3, 'POZ': 3, 'PRG': 3, 'PSA': 3, 'PZU': 3, 'RIX': 3, 'RGN': 3, 'ROV': 3, 'SJJ': 3, 'SKG': 3,
    'SKP': 3, 'SAW': 3, 'SKD': 3, 'SOF': 3, 'SPX': 3, 'SSH': 3, 'SVO': 3, 'SVX': 3, 'SZG': 3, 'TAS': 3,
    'TIA': 3, 'TIV': 3, 'TLL': 3, 'TLV': 3, 'TGD': 3, 'TZX': 3, 'UTP': 3, 'UFA': 3, 'VNO': 3, 'VKO': 3,
    'VOG': 3, 'WAW': 3, 'XWC': 3, 'ZIA': 3, 'ZNZ': 3, 'ZYL': 3, 'ZAG': 3
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

// Get all available currencies
export function getAllCurrencies() {
    return Object.keys(CURRENCY_MAPPING).sort();
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

// Excess Baggage Rates Table (from PDF pages 15-22)
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

// Upgrade to Business Rates (from PDF page 11-12)
const UPGRADE_RATES = {
    'ZONE1': {
        'AED': 1300, 'PKR': 99845,
        'BHD': 123, 'BYN': 1070, 'CHF': 288, 'CZK': 7540, 'EGP': 16600, 'EUR': 306, 'HUF': 122075,
        'INR': 27960, 'JOD': 232, 'KWD': 101, 'KZT': 176210, 'LBP': 30000000, 'LKR': 97880,
        'MYR': 1415, 'NPR': 44675, 'OMR': 126, 'PLN': 1225, 'QAR': 1235, 'RUB': 27980,
        'SAR': 1225, 'TJS': 3495, 'THB': 10920, 'USD': 327, 'UZS': 4229970, 'IRR': 225988700
    },
    'ZONE2': {
        'AED': 2100, 'PKR': 161290,
        'BHD': 185, 'BYN': 1605, 'CHF': 433, 'CZK': 11310, 'EGP': 24905, 'EUR': 459, 'HUF': 183115,
        'INR': 41940, 'JOD': 347, 'KWD': 151, 'KZT': 264315, 'LBP': 45000000, 'LKR': 146820,
        'MYR': 2120, 'NPR': 67015, 'OMR': 189, 'PLN': 1840, 'QAR': 1850, 'RUB': 41970,
        'SAR': 1840, 'TJS': 5245, 'THB': 16380, 'USD': 490, 'UZS': 6344955, 'IRR': 338983050
    },
    'ZONE3': {
        'AED': 2500, 'PKR': 192010,
        'BHD': 216, 'BYN': 1875, 'CHF': 505, 'CZK': 13195, 'EGP': 29055, 'EUR': 535, 'HUF': 213630,
        'INR': 48930, 'JOD': 405, 'KWD': 176, 'KZT': 308370, 'LBP': 52500000, 'LKR': 171290,
        'MYR': 2475, 'NPR': 78185, 'OMR': 220, 'PLN': 2150, 'QAR': 2160, 'RUB': 48960,
        'SAR': 2145, 'TJS': 6120, 'THB': 19110, 'USD': 572, 'UZS': 7402445, 'IRR': 395480225
    }
};

// Upgrade Zone Mapping
const UPGRADE_ZONE_MAPPING = {
    1: ['AWZ', 'AQI', 'BAH', 'BND', 'BSR', 'DMM', 'DOH', 'DWC', 'DXB', 'ELQ', 'HAS', 'HOF', 'IFN', 'KER', 'KHI', 'KIH', 'KWI', 'LRR', 'MCT', 'OHS', 'RUH', 'SLL', 'SYZ'],
    2: ['ADE', 'AHB', 'AJF', 'AMD', 'AMM', 'AQJ', 'BEY', 'BGW', 'BOM', 'BLR', 'BUS', 'BUZ', 'CCJ', 'CCU', 'COK', 'DEL', 'EAM', 'EBL', 'EVN', 'GBB', 'GIZ', 'GSM', 'GYD', 'HDM', 'HRI', 'HYD', 'IKA', 'ISB', 'ISU', 'JED', 'JIB', 'KBL', 'KDH', 'LKO', 'LHE', 'LYP', 'MAA', 'MED', 'MHD', 'MRV', 'MUX', 'NJF', 'NUM', 'RSI', 'SAH', 'SKT', 'TBS', 'TBZ', 'TIF', 'TRV', 'TUU', 'UET', 'ULH', 'YNB'],
    3: ['ADB', 'ADD', 'AER', 'ALA', 'ASB', 'ASM', 'AYT', 'BEG', 'BGY', 'BJM', 'BJV', 'BKK', 'BSL', 'BUD', 'BTS', 'BWA', 'CAG', 'CLJ', 'CMB', 'CTA', 'CIT', 'CFU', 'CGP', 'DAC', 'DAR', 'DBB', 'DBV', 'DYU', 'EBB', 'ESB', 'DOK', 'FIH', 'FRU', 'GAN', 'GOI', 'GOJ', 'GRV', 'HBE', 'HGA', 'HMB', 'HRI', 'HEL', 'HRK', 'IEV', 'IST', 'JMK', 'JRO', 'JTR', 'KBP', 'KBV', 'KGL', 'JUB', 'KIV', 'KRR', 'KRK', 'KRT', 'KTM', 'KUF', 'KUT', 'KZN', 'LED', 'LGK', 'LJU', 'MBA', 'MBX', 'MCX', 'MGQ', 'MLA', 'MLE', 'MSQ', 'NAP', 'NMA', 'NQZ', 'OLB', 'OSS', 'OTP', 'OVB', 'ODS', 'PEE', 'PEN', 'PEW', 'POZ', 'PRG', 'PSA', 'PZU', 'RIX', 'RGN', 'ROV', 'SJJ', 'SKG', 'SKP', 'SAW', 'SKD', 'SOF', 'SPX', 'SSH', 'SVO', 'SVX', 'SZG', 'TAS', 'TIA', 'TIV', 'TLL', 'TLV', 'TGD', 'TZX', 'UTP', 'UFA', 'VNO', 'VKO', 'VOG', 'WAW', 'XWC', 'ZIA', 'ZNZ', 'ZYL', 'ZAG']
};

// Get upgrade zone for airport
function getUpgradeZone(airport) {
    const code = airport.toUpperCase();
    for (const [zone, airports] of Object.entries(UPGRADE_ZONE_MAPPING)) {
        if (airports.includes(code)) {
            return zone;
        }
    }
    return null;
}

// Get Upgrade to Business rate
export function getUpgradeRate(origin, currency) {
    const zone = getUpgradeZone(origin);
    if (!zone) {
        return {
            error: `Upgrade rate not available for ${origin}`
        };
    }
    
    const zoneKey = `ZONE${zone}`;
    const rate = UPGRADE_RATES[zoneKey] && UPGRADE_RATES[zoneKey][currency];
    
    if (!rate) {
        return {
            error: `Upgrade rate not available for ${currency} from Zone ${zone}`
        };
    }
    
    return {
        origin: origin.toUpperCase(),
        zone: parseInt(zone),
        currency,
        rate,
        description: `Upgrade to Business Class from Zone ${zone}`
    };
}

// Go-Show Fares (from PDF pages 2-10)
const GOSHOW_FARES = {
    'ECONOMY': {
        'ADD': { currency: 'USD', adult: 705, infant: 20 },
        'AER': { currency: 'RUB', adult: 59895, infant: 1710 },
        'AHB': { currency: 'SAR', adult: 2565, infant: 75 },
        'AJF': { currency: 'SAR', adult: 2565, infant: 75 },
        'ALA': { currency: 'KZT', adult: 361070, infant: 10780 },
        'AMD': { currency: 'INR', adult: 50020, infant: 1710 },
        'AMM': { currency: 'JOD', adult: 530, infant: 15 },
        'AQI': { currency: 'SAR', adult: 2565, infant: 75 },
        'ASB': { currency: 'USD', adult: 715, infant: 20 },
        'ASM': { currency: 'USD', adult: 705, infant: 20 },
        'BAH': { currency: 'BHD', adult: 260, infant: 10 },
        'BEG': { currency: 'EUR', adult: 630, infant: 20 },
        'BEY': { currency: 'LBP', adult: 65142500, infant: 1835000 },
        'BGW': { currency: 'USD', adult: 730, infant: 20 },
        'BGY': { currency: 'EUR', adult: 615, infant: 20 },
        'BJV': { currency: 'USD', adult: 710, infant: 20 },
        'BND': { currency: 'USD', adult: 685, infant: 20 },
        'BOM': { currency: 'INR', adult: 49595, infant: 1710 },
        'BSL': { currency: 'CHF', adult: 560, infant: 15 },
        'BSR': { currency: 'USD', adult: 710, infant: 20 },
        'BUD': { currency: 'EUR', adult: 640, infant: 20 },
        'BUS': { currency: 'USD', adult: 710, infant: 20 },
        'BWA': { currency: 'NPR', adult: 59435, infant: 2735 },
        'BUZ': { currency: 'USD', adult: 685, infant: 20 },
        'CCJ': { currency: 'INR', adult: 49595, infant: 1710 },
        'CCU': { currency: 'INR', adult: 50450, infant: 1710 },
        'CFU': { currency: 'EUR', adult: 630, infant: 20 },
        'CGP': { currency: 'USD', adult: 785, infant: 20 },
        'CIT': { currency: 'KZT', adult: 371850, infant: 10780 },
        'CMB': { currency: 'LKR', adult: 218525, infant: 5985 },
        'COK': { currency: 'INR', adult: 49595, infant: 1710 },
        'CTA': { currency: 'EUR', adult: 650, infant: 20 },
        'DAC': { currency: 'USD', adult: 785, infant: 20 },
        'DAR': { currency: 'USD', adult: 735, infant: 20 },
        'DBB': { currency: 'USD', adult: 700, infant: 20 },
        'DBV': { currency: 'EUR', adult: 605, infant: 20 },
        'DEL': { currency: 'INR', adult: 49595, infant: 1710 },
        'DMM': { currency: 'SAR', adult: 2605, infant: 75 },
        'DOH': { currency: 'QAR', adult: 2620, infant: 75 },
        'DYU': { currency: 'USD', adult: 705, infant: 20 },
        'EAM': { currency: 'SAR', adult: 2565, infant: 75 },
        'EBB': { currency: 'USD', adult: 720, infant: 20 },
        'EBL': { currency: 'USD', adult: 730, infant: 20 },
        'ELQ': { currency: 'SAR', adult: 2565, infant: 75 },
        'ESB': { currency: 'USD', adult: 690, infant: 20 },
        'EVN': { currency: 'USD', adult: 725, infant: 20 },
        'FRU': { currency: 'USD', adult: 710, infant: 20 },
        'GIZ': { currency: 'SAR', adult: 2565, infant: 75 },
        'GSM': { currency: 'USD', adult: 685, infant: 20 },
        'GYD': { currency: 'USD', adult: 715, infant: 20 },
        'HAS': { currency: 'SAR', adult: 2565, infant: 75 },
        'HBE': { currency: 'USD', adult: 700, infant: 20 },
        'HGA': { currency: 'USD', adult: 740, infant: 20 },
        'HOF': { currency: 'SAR', adult: 2565, infant: 75 },
        'HYD': { currency: 'INR', adult: 51730, infant: 1710 },
        'IFN': { currency: 'USD', adult: 685, infant: 20 },
        'IKA': { currency: 'USD', adult: 685, infant: 20 },
        'ISB': { currency: 'PKR', adult: 170535, infant: 5635 },
        'IST': { currency: 'USD', adult: 695, infant: 20 },
        'ISU': { currency: 'USD', adult: 710, infant: 20 },
        'JED': { currency: 'SAR', adult: 2605, infant: 75 },
        'JIB': { currency: 'USD', adult: 765, infant: 20 },
        'JMK': { currency: 'EUR', adult: 635, infant: 20 },
        'JTR': { currency: 'EUR', adult: 635, infant: 20 },
        'JUB': { currency: 'USD', adult: 845, infant: 20 },
        'KBL': { currency: 'USD', adult: 730, infant: 20 },
        'KBV': { currency: 'THB', adult: 22380, infant: 670 },
        'KER': { currency: 'USD', adult: 685, infant: 20 },
        'KHI': { currency: 'PKR', adult: 170535, infant: 5635 },
        'KIH': { currency: 'USD', adult: 685, infant: 20 },
        'KRK': { currency: 'PLN', adult: 2570, infant: 75 },
        'KTM': { currency: 'NPR', adult: 59435, infant: 2735 },
        'KUF': { currency: 'RUB', adult: 60755, infant: 1710 },
        'KWI': { currency: 'KWD', adult: 210, infant: 5 },
        'KZN': { currency: 'RUB', adult: 59895, infant: 1710 },
        'LED': { currency: 'RUB', adult: 59470, infant: 1710 },
        'LGK': { currency: 'MYR', adult: 3135, infant: 85 },
        'LHE': { currency: 'PKR', adult: 279055, infant: 5635 },
        'LJU': { currency: 'EUR', adult: 615, infant: 20 },
        'LKO': { currency: 'INR', adult: 51730, infant: 1710 },
        'LRR': { currency: 'USD', adult: 685, infant: 20 },
        'LYP': { currency: 'PKR', adult: 166305, infant: 5635 },
        'MBA': { currency: 'USD', adult: 745, infant: 20 },
        'MCT': { currency: 'OMR', adult: 265, infant: 10 },
        'MCX': { currency: 'RUB', adult: 58185, infant: 1710 },
        'MED': { currency: 'SAR', adult: 2565, infant: 75 },
        'MGQ': { currency: 'USD', adult: 740, infant: 20 },
        'MHD': { currency: 'USD', adult: 685, infant: 20 },
        'MLE': { currency: 'USD', adult: 755, infant: 20 },
        'MRV': { currency: 'RUB', adult: 58185, infant: 1710 },
        'MSQ': { currency: 'USD', adult: 730, infant: 20 },
        'MUX': { currency: 'PKR', adult: 169125, infant: 5635 },
        'NAP': { currency: 'EUR', adult: 625, infant: 20 },
        'NJF': { currency: 'USD', adult: 710, infant: 20 },
        'NQZ': { currency: 'KZT', adult: 377240, infant: 10780 },
        'NUM': { currency: 'SAR', adult: 2565, infant: 75 },
        'OLB': { currency: 'EUR', adult: 650, infant: 20 },
        'OTP': { currency: 'EUR', adult: 610, infant: 20 },
        'OVB': { currency: 'RUB', adult: 58185, infant: 1710 },
        'PEN': { currency: 'MYR', adult: 3135, infant: 85 },
        'PEW': { currency: 'PKR', adult: 170535, infant: 5635 },
        'POZ': { currency: 'PLN', adult: 2610, infant: 75 },
        'PRG': { currency: 'CZK', adult: 15910, infant: 460 },
        'PSA': { currency: 'EUR', adult: 640, infant: 20 },
        'RIX': { currency: 'EUR', adult: 620, infant: 20 },
        'RSI': { currency: 'SAR', adult: 2550, infant: 75 },
        'RUH': { currency: 'SAR', adult: 2605, infant: 75 },
        'SAW': { currency: 'USD', adult: 695, infant: 20 },
        'SJJ': { currency: 'EUR', adult: 635, infant: 20 },
        'SKD': { currency: 'USD', adult: 655, infant: 20 },
        'SKT': { currency: 'PKR', adult: 170535, infant: 5635 },
        'SLL': { currency: 'OMR', adult: 265, infant: 10 },
        'SOF': { currency: 'EUR', adult: 610, infant: 20 },
        'SPX': { currency: 'USD', adult: 720, infant: 20 },
        'SVX': { currency: 'RUB', adult: 59895, infant: 1710 },
        'SYZ': { currency: 'USD', adult: 685, infant: 20 },
        'SZG': { currency: 'EUR', adult: 665, infant: 20 },
        'TAS': { currency: 'USD', adult: 960, infant: 20 },
        'TBS': { currency: 'USD', adult: 700, infant: 20 },
        'TBZ': { currency: 'USD', adult: 685, infant: 20 },
        'TIA': { currency: 'EUR', adult: 605, infant: 20 },
        'TIF': { currency: 'SAR', adult: 2565, infant: 75 },
        'TIV': { currency: 'EUR', adult: 605, infant: 20 },
        'TLL': { currency: 'EUR', adult: 610, infant: 20 },
        'TLV': { currency: 'USD', adult: 705, infant: 20 },
        'TUU': { currency: 'SAR', adult: 2565, infant: 75 },
        'TZX': { currency: 'USD', adult: 710, infant: 20 },
        'UET': { currency: 'PKR', adult: 170535, infant: 5635 },
        'UFA': { currency: 'RUB', adult: 59895, infant: 1710 },
        'ULH': { currency: 'SAR', adult: 2565, infant: 75 },
        'UTP': { currency: 'THB', adult: 23215, infant: 670 },
        'VKO': { currency: 'RUB', adult: 61180, infant: 1710 },
        'VNO': { currency: 'EUR', adult: 615, infant: 20 },
        'VOG': { currency: 'RUB', adult: 58185, infant: 1710 },
        'WAW': { currency: 'PLN', adult: 2720, infant: 75 },
        'YNB': { currency: 'SAR', adult: 2565, infant: 75 },
        'ZAG': { currency: 'EUR', adult: 620, infant: 20 },
        'ZNZ': { currency: 'USD', adult: 730, infant: 20 }
    },
    'BUSINESS': {
        'AER': { currency: 'RUB', adult: 182260, infant: 18395 },
        'AHB': { currency: 'SAR', adult: 3615, infant: 355 },
        'AJF': { currency: 'SAR', adult: 3615, infant: 355 },
        'ALA': { currency: 'KZT', adult: 662865, infant: 67365 },
        'AMD': { currency: 'INR', adult: 50875, infant: 5130 },
        'AMM': { currency: 'JOD', adult: 865, infant: 85 },
        'AQI': { currency: 'SAR', adult: 3615, infant: 355 },
        'ASB': { currency: 'USD', adult: 1805, infant: 180 },
        'ASM': { currency: 'USD', adult: 1490, infant: 150 },
        'BAH': { currency: 'BHD', adult: 235, infant: 25 },
        'BEG': { currency: 'EUR', adult: 2350, infant: 235 },
        'BEY': { currency: 'LBP', adult: 99548750, infant: 10092500 },
        'BGW': { currency: 'USD', adult: 1920, infant: 190 },
        'BGY': { currency: 'EUR', adult: 2195, infant: 220 },
        'BJV': { currency: 'USD', adult: 2385, infant: 240 },
        'BND': { currency: 'USD', adult: 1175, infant: 120 },
        'BOM': { currency: 'INR', adult: 51730, infant: 5130 },
        'BSL': { currency: 'CHF', adult: 2345, infant: 235 },
        'BSR': { currency: 'USD', adult: 2345, infant: 235 },
        'BUD': { currency: 'EUR', adult: 1695, infant: 170 },
        'BUS': { currency: 'USD', adult: 1880, infant: 190 },
        'BUZ': { currency: 'USD', adult: 1175, infant: 120 },
        'BWA': { currency: 'NPR', adult: 121605, infant: 12295 },
        'CCJ': { currency: 'INR', adult: 54725, infant: 5560 },
        'CCU': { currency: 'INR', adult: 52160, infant: 5130 },
        'CFU': { currency: 'EUR', adult: 2575, infant: 255 },
        'CIT': { currency: 'KZT', adult: 735615, infant: 72755 },
        'CMB': { currency: 'LKR', adult: 407115, infant: 40410 },
        'COK': { currency: 'INR', adult: 52160, infant: 5130 },
        'CTA': { currency: 'EUR', adult: 2460, infant: 245 },
        'DAR': { currency: 'USD', adult: 1700, infant: 170 },
        'DBB': { currency: 'USD', adult: 830, infant: 85 },
        'DBV': { currency: 'EUR', adult: 2120, infant: 215 },
        'DEL': { currency: 'INR', adult: 52160, infant: 5130 },
        'DMM': { currency: 'SAR', adult: 3000, infant: 300 },
        'DOH': { currency: 'QAR', adult: 5885, infant: 585 },
        'DYU': { currency: 'USD', adult: 1700, infant: 170 },
        'EAM': { currency: 'SAR', adult: 3615, infant: 355 },
        'EBB': { currency: 'USD', adult: 1270, infant: 125 },
        'EBL': { currency: 'USD', adult: 1700, infant: 170 },
        'ELQ': { currency: 'SAR', adult: 3615, infant: 355 },
        'ESB': { currency: 'USD', adult: 2480, infant: 250 },
        'EVN': { currency: 'USD', adult: 1040, infant: 105 },
        'FRU': { currency: 'USD', adult: 2070, infant: 205 },
        'GIZ': { currency: 'SAR', adult: 3615, infant: 355 },
        'GSM': { currency: 'USD', adult: 1175, infant: 120 },
        'GYD': { currency: 'USD', adult: 1060, infant: 105 },
        'HAS': { currency: 'SAR', adult: 3615, infant: 355 },
        'HBE': { currency: 'USD', adult: 830, infant: 85 },
        'HGA': { currency: 'USD', adult: 2025, infant: 205 },
        'HOF': { currency: 'SAR', adult: 3615, infant: 355 },
        'HYD': { currency: 'INR', adult: 52160, infant: 5130 },
        'IFN': { currency: 'USD', adult: 1185, infant: 120 },
        'IKA': { currency: 'USD', adult: 1070, infant: 105 },
        'ISB': { currency: 'PKR', adult: 325565, infant: 32415 },
        'IST': { currency: 'USD', adult: 1460, infant: 145 },
        'ISU': { currency: 'USD', adult: 2060, infant: 205 },
        'JED': { currency: 'SAR', adult: 3000, infant: 300 },
        'JIB': { currency: 'USD', adult: 2165, infant: 215 },
        'JMK': { currency: 'EUR', adult: 2575, infant: 255 },
        'JTR': { currency: 'EUR', adult: 2575, infant: 255 },
        'JUB': { currency: 'USD', adult: 2945, infant: 295 },
        'KBL': { currency: 'USD', adult: 1170, infant: 115 },
        'KBV': { currency: 'THB', adult: 44420, infant: 4510 },
        'KER': { currency: 'USD', adult: 1070, infant: 105 },
        'KHI': { currency: 'PKR', adult: 328385, infant: 32415 },
        'KIH': { currency: 'USD', adult: 1165, infant: 115 },
        'KRK': { currency: 'PLN', adult: 9965, infant: 995 },
        'KTM': { currency: 'NPR', adult: 121605, infant: 12295 },
        'KUF': { currency: 'RUB', adult: 198090, infant: 19680 },
        'KWI': { currency: 'KWD', adult: 125, infant: 10 },
        'KZN': { currency: 'RUB', adult: 181830, infant: 18395 },
        'LED': { currency: 'RUB', adult: 183545, infant: 18395 },
        'LGK': { currency: 'MYR', adult: 7845, infant: 780 },
        'LHE': { currency: 'PKR', adult: 411535, infant: 40870 },
        'LJU': { currency: 'EUR', adult: 2310, infant: 230 },
        'LKO': { currency: 'INR', adult: 51305, infant: 5130 },
        'LRR': { currency: 'USD', adult: 1175, infant: 120 },
        'LYP': { currency: 'PKR', adult: 326975, infant: 32415 },
        'MBA': { currency: 'USD', adult: 1525, infant: 155 },
        'MCT': { currency: 'OMR', adult: 175, infant: 15 },
        'MCX': { currency: 'RUB', adult: 145895, infant: 14545 },
        'MED': { currency: 'SAR', adult: 3000, infant: 300 },
        'MGQ': { currency: 'USD', adult: 2540, infant: 255 },
        'MHD': { currency: 'USD', adult: 1070, infant: 105 },
        'MLE': { currency: 'USD', adult: 1625, infant: 165 },
        'MRV': { currency: 'RUB', adult: 186965, infant: 18825 },
        'MSQ': { currency: 'USD', adult: 3640, infant: 365 },
        'MUX': { currency: 'PKR', adult: 325565, infant: 32415 },
        'NAP': { currency: 'EUR', adult: 2195, infant: 220 },
        'NJF': { currency: 'USD', adult: 2030, infant: 205 },
        'NQZ': { currency: 'KZT', adult: 660170, infant: 67365 },
        'NUM': { currency: 'SAR', adult: 3615, infant: 355 },
        'OLB': { currency: 'EUR', adult: 2580, infant: 255 },
        'OTP': { currency: 'EUR', adult: 2420, infant: 245 },
        'OVB': { currency: 'RUB', adult: 145895, infant: 14545 },
        'PEN': { currency: 'MYR', adult: 7390, infant: 735 },
        'PEW': { currency: 'PKR', adult: 325565, infant: 32415 },
        'POZ': { currency: 'PLN', adult: 8635, infant: 865 },
        'PRG': { currency: 'CZK', adult: 54770, infant: 5535 },
        'PSA': { currency: 'EUR', adult: 2195, infant: 220 },
        'RIX': { currency: 'EUR', adult: 1155, infant: 115 },
        'RSI': { currency: 'SAR', adult: 3615, infant: 355 },
        'RUH': { currency: 'SAR', adult: 3615, infant: 355 },
        'SAW': { currency: 'USD', adult: 1460, infant: 145 },
        'SJJ': { currency: 'EUR', adult: 2155, infant: 215 },
        'SKD': { currency: 'USD', adult: 1860, infant: 185 },
        'SKT': { currency: 'PKR', adult: 325565, infant: 32415 },
        'SLL': { currency: 'OMR', adult: 190, infant: 20 },
        'SOF': { currency: 'EUR', adult: 2495, infant: 250 },
        'SPX': { currency: 'USD', adult: 865, infant: 85 },
        'SVX': { currency: 'RUB', adult: 198090, infant: 19680 },
        'SYZ': { currency: 'USD', adult: 1070, infant: 105 },
        'SZG': { currency: 'EUR', adult: 1970, infant: 195 },
        'TAS': { currency: 'USD', adult: 1630, infant: 165 },
        'TBS': { currency: 'USD', adult: 1875, infant: 190 },
        'TBZ': { currency: 'USD', adult: 1070, infant: 105 },
        'TIA': { currency: 'EUR', adult: 2470, infant: 250 },
        'TIF': { currency: 'SAR', adult: 3615, infant: 355 },
        'TIV': { currency: 'EUR', adult: 1695, infant: 170 },
        'TLL': { currency: 'EUR', adult: 1440, infant: 140 },
        'TLV': { currency: 'USD', adult: 1930, infant: 195 },
        'TUU': { currency: 'SAR', adult: 3615, infant: 355 },
        'TZX': { currency: 'USD', adult: 2075, infant: 210 },
        'UET': { currency: 'PKR', adult: 317110, infant: 32415 },
        'UFA': { currency: 'RUB', adult: 181830, infant: 18395 },
        'ULH': { currency: 'SAR', adult: 3615, infant: 355 },
        'UTP': { currency: 'THB', adult: 47260, infant: 4675 },
        'VKO': { currency: 'RUB', adult: 198515, infant: 19680 },
        'VNO': { currency: 'EUR', adult: 1295, infant: 130 },
        'VOG': { currency: 'RUB', adult: 160010, infant: 15830 },
        'WAW': { currency: 'PLN', adult: 9180, infant: 920 },
        'YNB': { currency: 'SAR', adult: 3615, infant: 355 },
        'ZAG': { currency: 'EUR', adult: 2310, infant: 230 },
        'ZNZ': { currency: 'USD', adult: 1705, infant: 170 }
    }
};

// Sports Equipment Rates (from PDF page 30-31)
const SPORTS_EQUIPMENT_RATES = {
    'AED': { SPEQ: 150, SPEX: 270 },
    'AZN': { SPEQ: 70, SPEX: 125 },
    'BDT': { SPEQ: 4980, SPEX: 8970 },
    'BHD': { SPEQ: 15, SPEX: 28 },
    'CHF': { SPEQ: 34, SPEX: 61 },
    'CZK': { SPEQ: 945, SPEX: 1695 },
    'DJF': { SPEQ: 7255, SPEX: 13055 },
    'EUR': { SPEQ: 36, SPEX: 65 },
    'EGP': { SPEQ: 2075, SPEX: 3735 },
    'ERN': { SPEQ: 615, SPEX: 1105 },
    'ETB': { SPEQ: 5145, SPEX: 9260 },
    'HUF': { SPEQ: 15260, SPEX: 27465 },
    'INR': { SPEQ: 3495, SPEX: 6290 },
    'IQD': { SPEQ: 53570, SPEX: 96430 },
    'JOD': { SPEQ: 29, SPEX: 52 },
    'KWD': { SPEQ: 13, SPEX: 23 },
    'KZT': { SPEQ: 22025, SPEX: 39650 },
    'LBP': { SPEQ: 3750000, SPEX: 6750000 },
    'LKR': { SPEQ: 12235, SPEX: 22025 },
    'MYR': { SPEQ: 175, SPEX: 320 },
    'NPR': { SPEQ: 5585, SPEX: 10050 },
    'OMR': { SPEQ: 16, SPEX: 28 },
    'PKR': { SPEQ: 11520, SPEX: 20735 },
    'PLN': { SPEQ: 155, SPEX: 275 },
    'QAR': { SPEQ: 155, SPEX: 280 },
    'RUB': { SPEQ: 3495, SPEX: 6295 },
    'SAR': { SPEQ: 155, SPEX: 275 },
    'SDG': { SPEQ: 82875, SPEX: 149170 },
    'SYP': { SPEQ: 500000, SPEX: 900000 },
    'THB': { SPEQ: 1365, SPEX: 2455 },
    'USD': { SPEQ: 41, SPEX: 74 },
    'UZS': { SPEQ: 528745, SPEX: 951745 },
    'YER': { SPEQ: 10005, SPEX: 18010 }
};

// Late/Early Reporting Rates (from PDF page 31-32)
const REPORTING_RATES = {
    'AED': { LRTP: 200, ERTP: 100 },
    'AZN': { LRTP: 95, ERTP: 45 },
    'BDT': { LRTP: 6645, ERTP: 3320 },
    'CHF': { LRTP: 45, ERTP: 22 },
    'CZK': { LRTP: 1255, ERTP: 630 },
    'DJF': { LRTP: 9670, ERTP: 4835 },
    'EUR': { LRTP: 48, ERTP: 24 },
    'EGP': { LRTP: 2765, ERTP: 1385 },
    'ERN': { LRTP: 815, ERTP: 410 },
    'ETB': { LRTP: 6860, ERTP: 3430 },
    'HUF': { LRTP: 20345, ERTP: 10175 },
    'INR': { LRTP: 4660, ERTP: 2330 },
    'IQD': { LRTP: 71430, ERTP: 35715 },
    'JOD': { LRTP: 39, ERTP: 19 },
    'KZT': { LRTP: 29370, ERTP: 14685 },
    'LBP': { LRTP: 5000000, ERTP: 2500000 },
    'LKR': { LRTP: 16315, ERTP: 8155 },
    'MYR': { LRTP: 235, ERTP: 120 },
    'NPR': { LRTP: 7445, ERTP: 3725 },
    'OMR': { LRTP: 21, ERTP: 10 },
    'PKR': { LRTP: 15360, ERTP: 7680 },
    'PLN': { LRTP: 205, ERTP: 100 },
    'QAR': { LRTP: 205, ERTP: 105 },
    'RUB': { LRTP: 4665, ERTP: 2330 },
    'SAR': { LRTP: 205, ERTP: 100 },
    'SDG': { LRTP: 110495, ERTP: 55250 },
    'SYP': { LRTP: 666665, ERTP: 333335 },
    'THB': { LRTP: 1820, ERTP: 910 },
    'USD': { LRTP: 54, ERTP: 27 },
    'UZS': { LRTP: 704995, ERTP: 352495 },
    'YER': { LRTP: 13340, ERTP: 6670 },
    'BHD': { LRTP: 11, ERTP: 11 },
    'KWD': { LRTP: 15, ERTP: 10 }
};

// Transfer Baggage Fee (from PDF page 32)
const TRANSFER_BAGGAGE_FEE = {
    'DXB': { currency: 'AED', amount: 50, ghaFee: 50 },
    'OUTSTATION': { currency: 'USD', amount: 30, ghaFee: 'As applicable' }
};

// Calculate excess baggage rate
export function calculateExcessBaggageRate(origin, destination, airline, currency = null) {
    const originZone = getZoneForAirport(origin);
    const destZone = getZoneForAirport(destination);
    const defaultCurrency = getCurrencyForDestination(destination);
    const selectedCurrency = currency || defaultCurrency;
    
    if (!originZone || !destZone) {
        return {
            error: 'Invalid airport code. Please check origin and destination.',
            originZone,
            destZone
        };
    }
    
    // Handle FZ rates
    if (airline === 'FZ') {
        const rates = EXCESS_BAGGAGE_RATES[selectedCurrency] || EXCESS_BAGGAGE_RATES['USD'];
        const rate = rates[originZone] && rates[originZone][destZone];
        
        if (rate === undefined) {
            return {
                error: `Rate not available for ${selectedCurrency} from Zone ${originZone} to Zone ${destZone}`,
                originZone,
                destZone,
                currency: selectedCurrency
            };
        }
        
        return {
            airline: 'FZ',
            origin: origin.toUpperCase(),
            destination: destination.toUpperCase(),
            originZone,
            destZone,
            currency: selectedCurrency,
            ratePerKg: rate,
            rateDescription: `${rate} ${selectedCurrency} per kg`,
            carrierName: translateAirline('FZ')
        };
    }
    
    // Handle EK rates
    if (airline === 'EK') {
        const originRegion = getEKRegionForAirport(origin);
        const destRegion = getEKRegionForAirport(destination);
        
        if (!originRegion || !destRegion) {
            return {
                error: `Region not found for ${origin.toUpperCase()} or ${destination.toUpperCase()}`,
                origin,
                destination
            };
        }
        
        const perKgRate = EK_OAL_EXCESS_RATES_PER_KG[originRegion] && 
                         EK_OAL_EXCESS_RATES_PER_KG[originRegion][destRegion];
        
        return {
            airline: 'EK',
            origin: origin.toUpperCase(),
            destination: destination.toUpperCase(),
            originZone,
            destZone,
            originRegion,
            destRegion,
            currency: 'USD',
            ratePerKg: perKgRate || null,
            rateDescription: perKgRate ? `$${perKgRate} USD per kg` : 'Rate not available for this route',
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
            freeAllowanceEco: 23,
            freeAllowanceBus: 32,
            rates: {
                '1_excess_bag': 75,
                '2_excess_bag': 100,
                '3_or_more_excess_bag': 200,
                'oversize': 200,
                'overweight': 200
            },
            carrierName: translateAirline(airline)
        };
    }
    
    // Handle OAL (Other Airlines) - use EK/OAL rates
    if (airline === 'OAL') {
        const originRegion = getEKRegionForAirport(origin);
        const destRegion = getEKRegionForAirport(destination);
        
        if (!originRegion || !destRegion) {
            return {
                error: `Region not found for ${origin.toUpperCase()} or ${destination.toUpperCase()}`,
                origin,
                destination
            };
        }
        
        const perKgRate = EK_OAL_EXCESS_RATES_PER_KG[originRegion] && 
                         EK_OAL_EXCESS_RATES_PER_KG[originRegion][destRegion];
        
        return {
            airline: 'OAL',
            origin: origin.toUpperCase(),
            destination: destination.toUpperCase(),
            originZone,
            destZone,
            originRegion,
            destRegion,
            currency: 'USD',
            ratePerKg: perKgRate || null,
            rateDescription: perKgRate ? `$${perKgRate} USD per kg` : 'Rate not available for this route',
            carrierName: 'Other Airlines (OAL)',
            note: 'Using EK/OAL interline rates'
        };
    }
    
    return {
        error: `Rates not configured for airline ${airline}`,
        airline
    };
}

// Get Go-Show fare
export function getGoShowFare(origin, classType = 'ECONOMY') {
    const originCode = origin.toUpperCase();
    const fare = GOSHOW_FARES[classType] && GOSHOW_FARES[classType][originCode];
    
    if (!fare) {
        return {
            error: `Go-Show fare not available for ${originCode} in ${classType} class`
        };
    }
    
    return {
        origin: originCode,
        classType,
        currency: fare.currency,
        adult: fare.adult,
        infant: fare.infant,
        destination: 'DXB'
    };
}

// Get Sports Equipment rate
export function getSportsEquipmentRate(currency, type = 'SPEQ') {
    const rates = SPORTS_EQUIPMENT_RATES[currency];
    if (!rates) {
        return {
            error: `Sports equipment rates not available for currency ${currency}`
        };
    }
    
    return {
        currency,
        type,
        amount: rates[type] || null,
        description: type === 'SPEQ' ? 'Sports Equipment (Standard)' : 'Sports Equipment (Oversized)'
    };
}

// Get Late/Early Reporting rate
export function getReportingRate(currency, type = 'LRTP') {
    const rates = REPORTING_RATES[currency];
    if (!rates) {
        return {
            error: `Reporting rates not available for currency ${currency}`
        };
    }
    
    return {
        currency,
        type,
        amount: rates[type] || null,
        description: type === 'LRTP' ? 'Late Reporting Fee' : 'Early Reporting Fee'
    };
}

// Get Transfer Baggage Fee
export function getTransferBaggageFee(location) {
    const loc = location.toUpperCase();
    if (loc === 'DXB') {
        return TRANSFER_BAGGAGE_FEE.DXB;
    }
    return TRANSFER_BAGGAGE_FEE.OUTSTATION;
}

// EK Excess Rates
// EK/OAL Excess Baggage Rates (Except UA & AC)
// Zone Classification for EK/OAL
const EK_OAL_ZONE_MAPPING = {
    'ME': ['BAH', 'IKA', 'BGW', 'AMM', 'KWI', 'BEY', 'MCT', 'DOH', 'RUH', 'DXB', 'TLV'],
    'WAIO': ['KBL', 'DAC', 'AMD', 'MLE', 'KHI', 'CMB', 'KTM', 'ALA', 'FRU', 'DYU', 'ASB', 'ISB', 'DEL', 'BOM', 'BLR', 'HYD', 'MAA', 'COK', 'CCJ', 'TRV', 'CCU', 'LKO'],
    'AFRICA': ['ALG', 'AGO', 'CI', 'CAI', 'ADD', 'GHA', 'GIN', 'LBY', 'MUS', 'NGA', 'SEN', 'SYC', 'ZAF', 'KRT', 'TZA', 'TUN', 'UGA', 'ZMB', 'ZWE', 'COG', 'DJI', 'ERI', 'SOM', 'SSD'],
    'EUROPE': ['VIE', 'ESP', 'BEL', 'HRV', 'CYP', 'CZE', 'DNK', 'FRA', 'DEU', 'GRC', 'HUN', 'IRL', 'ITA', 'MLT', 'NLD', 'NOR', 'POL', 'PRT', 'RUS', 'SRB', 'SVK', 'SWE', 'CHE', 'TUR', 'UKR', 'GBR', 'ARM', 'AZE', 'BIH', 'BGR', 'GEO', 'MKD', 'MNE', 'ROU', 'FIN'],
    'FAREAST': ['CHN', 'HKG', 'IDN', 'JPN', 'MYS', 'PHL', 'SGP', 'KOR', 'TWN', 'THA', 'VNM'],
    'ANZ': ['AUS', 'NZL'],
    'AMERICAS': ['ARG', 'BRA', 'CHL', 'CAN', 'USA', 'MEX']
};

// Map airport to EK/OAL region
function getEKRegionForAirport(airport) {
    const code = airport.toUpperCase();
    
    // Middle East
    if (['BAH', 'IKA', 'THR', 'BGW', 'BSR', 'EBL', 'ISU', 'NJF', 'AMM', 'AQJ', 'KWI', 'BEY', 'MCT', 'OHS', 'SLL', 'DOH', 'RUH', 'JED', 'DMM', 'MED', 'AHB', 'ELQ', 'TIF', 'TUU', 'HAS', 'YNB', 'AJF', 'EAM', 'GIZ', 'HOF', 'NUM', 'RSI', 'ULH', 'DXB', 'DWC', 'AUH', 'SHJ', 'TLV'].includes(code)) {
        return 'ME';
    }
    
    // WAIO (West Asia, India, Others)
    if (['KBL', 'KDH', 'DAC', 'CGP', 'ZYL', 'AMD', 'BOM', 'BLR', 'CCU', 'CCJ', 'COK', 'DEL', 'HYD', 'LKO', 'MAA', 'TRV', 'GOI', 'MLE', 'GAN', 'KHI', 'ISB', 'LHE', 'PEW', 'SKT', 'MUX', 'LYP', 'UET', 'CMB', 'HRI', 'KTM', 'BWA', 'ALA', 'NQZ', 'CIT', 'TSE', 'FRU', 'OSS', 'DYU', 'ASB', 'NMA', 'SKD', 'TAS'].includes(code)) {
        return 'WAIO';
    }
    
    // Africa
    if (['CAI', 'HBE', 'SSH', 'LXR', 'HRG', 'SPX', 'DBB', 'HMB', 'ADD', 'ASM', 'JIB', 'NBO', 'MBA', 'DAR', 'JRO', 'ZNZ', 'EBB', 'KGL', 'BJM', 'FIH', 'JUB', 'KRT', 'PZU', 'HGA', 'MGQ', 'LOS', 'ABV', 'ACC', 'DKR', 'CMN', 'TUN', 'ALG', 'TIP', 'JNB', 'CPT'].includes(code)) {
        return 'AFRICA';
    }
    
    // Europe
    if (['LHR', 'LGW', 'STN', 'LTN', 'MAN', 'CDG', 'ORY', 'NCE', 'FRA', 'MUC', 'AMS', 'BRU', 'ZRH', 'BSL', 'VIE', 'SZG', 'FCO', 'MXP', 'MAD', 'BCN', 'IST', 'SAW', 'AYT', 'ADB', 'ESB', 'TZX', 'BJV', 'SVO', 'DME', 'VKO', 'LED', 'AER', 'KUF', 'KZN', 'MCX', 'MRV', 'OVB', 'UFA', 'VOG', 'SVX', 'KRR', 'ROV', 'PEE', 'ZIA', 'WAW', 'KRK', 'POZ', 'PRG', 'BUD', 'OTP', 'CLJ', 'SOF', 'BEG', 'ZAG', 'DBV', 'SJJ', 'TIA', 'SKP', 'LJU', 'ATH', 'SKG', 'JMK', 'JTR', 'CFU', 'VNO', 'RIX', 'TLL', 'HEL', 'CTA', 'NAP', 'PSA', 'BGY', 'OLB', 'CAG', 'MLA', 'TIV', 'BTS', 'KBP', 'IEV', 'ODS', 'MSQ'].includes(code)) {
        return 'EUROPE';
    }
    
    // Far East
    if (['BKK', 'DMK', 'HKT', 'CNX', 'KBV', 'UTP', 'KUL', 'LGK', 'PEN', 'SIN', 'CGK', 'DPS', 'MNL', 'HKG', 'PEK', 'PKX', 'PVG', 'SHA', 'CAN', 'CTU', 'SZX', 'NRT', 'HND', 'KIX', 'ICN', 'TPE', 'SGN', 'HAN', 'PNH'].includes(code)) {
        return 'FAREAST';
    }
    
    // ANZ (Australia/New Zealand)
    if (['SYD', 'MEL', 'BNE', 'PER', 'AKL'].includes(code)) {
        return 'ANZ';
    }
    
    // Americas
    if (['YYZ', 'YVR', 'YUL', 'YYC', 'JFK', 'EWR', 'LGA', 'BOS', 'IAD', 'DCA', 'ATL', 'MCO', 'MIA', 'FLL', 'ORD', 'DFW', 'IAH', 'DEN', 'LAX', 'SFO', 'SEA', 'LAS', 'MEX', 'CUN', 'BOG', 'EZE', 'SCL', 'LIM', 'GRU', 'GIG'].includes(code)) {
        return 'AMERICAS';
    }
    
    return null;
}

// EK/OAL Excess Baggage Rates per KG (USD)
const EK_OAL_EXCESS_RATES_PER_KG = {
    'ME': {
        'ME': 15,
        'WAIO': 25,
        'AFRICA': 40,
        'EUROPE': null,
        'FAREAST': null,
        'ANZ': null,
        'AMERICAS': null
    },
    'WAIO': {
        'ME': 15,
        'WAIO': 25,
        'AFRICA': 40,
        'EUROPE': null,
        'FAREAST': null,
        'ANZ': null,
        'AMERICAS': null
    },
    'EUROPE': {
        'ME': 25,
        'WAIO': 30,
        'AFRICA': 40,
        'EUROPE': 30,
        'FAREAST': 50,
        'ANZ': null,
        'AMERICAS': null
    },
    'FAREAST': {
        'ME': 25,
        'WAIO': 30,
        'AFRICA': null,
        'EUROPE': 15,
        'FAREAST': 30,
        'ANZ': null,
        'AMERICAS': null
    },
    'ANZ': {
        'ME': 40,
        'WAIO': 50,
        'AFRICA': null,
        'EUROPE': 30,
        'FAREAST': 15,
        'ANZ': null,
        'AMERICAS': null
    },
    'AMERICAS': {
        'ME': null,
        'WAIO': null,
        'AFRICA': null,
        'EUROPE': null,
        'FAREAST': null,
        'ANZ': null,
        'AMERICAS': null
    }
};

// EK/OAL Excess Baggage Rates per Piece (USD)
const EK_OAL_EXCESS_RATES_PER_PIECE = {
    'AFRICA': {
        'ME': 200,
        'WAIO': 200,
        'AFRICA': 200,
        'EUROPE': 200,
        'FAREAST': 250,
        'ANZ': 250,
        'AMERICAS': 200
    },
    'AMERICAS': {
        'ME': 225,
        'WAIO': 225,
        'AFRICA': 200,
        'EUROPE': 100,
        'FAREAST': 250,
        'ANZ': 250,
        'AMERICAS': 100
    },
    'CANADA': {
        'ME': 280,
        'WAIO': 280,
        'AFRICA': 250,
        'EUROPE': 125,
        'FAREAST': 300,
        'ANZ': 300,
        'AMERICAS': 125,
        'currency': 'CAD'
    }
};

