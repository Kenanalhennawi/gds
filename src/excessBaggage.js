/**
 * Comprehensive Flydubai Rate Calculator
 * Includes: Excess Baggage, Go-Show Fares, Upgrades, Sports Equipment, etc.
 */

import { translateAirline, translateCity } from "./translator.js";

// Zone mapping for airports – Excess Baggage (from PDF pages 13–14)
// Zone 1: UAE | Zone 2: Gulf (Kuwait, Bahrain, Oman) | Zone 3: KSA | Zone 4: Middle East | Zone 5: Africa | Zone 6: Sub-Continent | Zone 7: SEA | Zone 8: Europe/CIS
const ZONE_MAPPING = {
    'DXB': 1, 'DWC': 1,
    'KWI': 2, 'BAH': 2, 'MCT': 2, 'SLL': 2, 'OHS': 2,
    'AHB': 3, 'AQI': 3, 'AJF': 3, 'DMM': 3, 'ELQ': 3, 'EAM': 3, 'GIZ': 3, 'HAS': 3, 'HOF': 3, 'JED': 3, 'NUM': 3, 'MED': 3, 'RUH': 3, 'RSI': 3, 'TUU': 3, 'TIF': 3, 'ULH': 3, 'YNB': 3,
    'BUZ': 4, 'GSM': 4, 'IFN': 4, 'IKA': 4, 'LRR': 4, 'MHD': 4, 'SYZ': 4, 'TBZ': 4, 'KIH': 4, 'KER': 4, 'BGW': 4, 'BSR': 4, 'EBL': 4, 'ISU': 4, 'NJF': 4, 'TLV': 4, 'AMM': 4, 'BEY': 4,
    'JIB': 5, 'ASM': 5, 'ADD': 5, 'MBA': 5, 'HGA': 5, 'MGQ': 5, 'JUB': 5, 'KRT': 5, 'PZU': 5, 'DAR': 5, 'JRO': 5, 'ZNZ': 5, 'EBB': 5, 'HBE': 5, 'SSH': 5, 'HMB': 5, 'SPX': 5, 'DBB': 5,
    'AMD': 6, 'BOM': 6, 'BLR': 6, 'CCJ': 6, 'CCU': 6, 'COK': 6, 'DEL': 6, 'HYD': 6, 'LKO': 6, 'MAA': 6, 'TRV': 6, 'KBL': 6, 'CGP': 6, 'DAC': 6, 'KTM': 6, 'BWA': 6, 'ISB': 6, 'KHI': 6, 'MUX': 6, 'LYP': 6, 'SKT': 6, 'UET': 6, 'LHE': 6, 'PEW': 6, 'CMB': 6, 'HRI': 6, 'LGK': 6, 'PEN': 6,
    'MLE': 7, 'GAN': 7, 'RGN': 7, 'KBV': 7, 'UTP': 7,
    'GYD': 8, 'MSQ': 8, 'BUS': 8, 'TBS': 8, 'GRV': 8, 'EVN': 8, 'ALA': 8, 'CIT': 8, 'TSE': 8, 'FRU': 8, 'OSS': 8, 'DYU': 8, 'ASB': 8, 'TAS': 8, 'SKD': 8, 'NMA': 8, 'SZG': 8, 'TIA': 8, 'SJJ': 8, 'SOF': 8, 'DBV': 8, 'ZAG': 8, 'PRG': 8, 'JMK': 8, 'JTR': 8, 'CFU': 8, 'TLL': 8, 'HEL': 8, 'CTA': 8, 'NAP': 8, 'PSA': 8, 'BGY': 8, 'CAG': 8, 'OLB': 8, 'RIX': 8, 'VNO': 8, 'MLA': 8, 'TIV': 8, 'SKP': 8, 'KRK': 8, 'WAW': 8, 'POZ': 8, 'OTP': 8, 'CLJ': 8, 'AER': 8, 'KUF': 8, 'KRR': 8, 'KZN': 8, 'MCX': 8, 'MRV': 8, 'OVB': 8, 'PEE': 8, 'ROV': 8, 'SVX': 8, 'UFA': 8, 'VOG': 8, 'VKO': 8, 'ZIA': 8, 'LED': 8, 'BEG': 8, 'BTS': 8, 'LJU': 8, 'BSL': 8, 'ADB': 8, 'AYT': 8, 'SAW': 8, 'IST': 8, 'BJV': 8, 'TZX': 8, 'IEV': 8, 'KBP': 8, 'ODS': 8, 'KIV': 8,
    'ADE': 4, 'AWZ': 4, 'BND': 7, 'DOH': 2, 'ESB': 8, 'FIH': 5, 'DOK': 5, 'GBB': 8, 'HDM': 4, 'HRK': 8, 'SAH': 4, 'SVO': 8, 'TGD': 8, 'XWC': 8, 'ZYL': 6, 'GOI': 6, 'GOJ': 8, 'KGL': 5, 'MBX': 8, 'KDH': 6
};

// Currency mapping by destination (from PDF page 23)
const CURRENCY_MAPPING = {
    'AED': ['DXB', 'KRT', 'PZU'],
    'BHD': ['BAH'],
    'CHF': ['BSL'],
    'CZK': ['PRG'],
    'EGP': ['HBE', 'SSH', 'SPX', 'DBB'],
    'ERN': ['ASM'],
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

// Get currency for origin or destination (prefers origin, falls back to destination)
export function getCurrencyForOriginOrDestination(origin, destination) {
    // First try origin
    if (origin) {
        const originCurrency = getCurrencyForDestination(origin);
        if (originCurrency !== 'USD' || !destination) {
            return originCurrency;
        }
    }
    // Fall back to destination
    if (destination) {
        return getCurrencyForDestination(destination);
    }
    return 'USD'; // Default
}

// Get all available currencies - cached for performance
let CURRENCIES_CACHE = null;
export function getAllCurrencies() {
    if (CURRENCIES_CACHE === null) {
        CURRENCIES_CACHE = Object.keys(CURRENCY_MAPPING).sort();
    }
    return CURRENCIES_CACHE;
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
        1: { 1: 0, 2: 40, 3: 40, 4: 60, 5: 40, 6: 40, 7: 60, 8: 80 },
        2: { 1: 40, 2: 60, 3: 60, 4: 60, 5: 60, 6: 60, 7: 80, 8: 80 },
        3: { 1: 40, 2: 60, 3: 60, 4: 60, 5: 60, 6: 60, 7: 80, 8: 80 },
        4: { 1: 60, 2: 60, 3: 60, 4: 60, 5: 60, 6: 60, 7: 60, 8: 60 },
        5: { 1: 40, 2: 60, 3: 60, 4: 60, 5: 60, 6: 60, 7: 60, 8: 60 },
        6: { 1: 40, 2: 60, 3: 60, 4: 60, 5: 60, 6: 60, 7: 80, 8: 80 },
        7: { 1: 60, 2: 80, 3: 80, 4: 60, 5: 60, 6: 80, 7: 80, 8: 80 },
        8: { 1: 60, 2: 80, 3: 80, 4: 60, 5: 60, 6: 80, 7: 80, 8: 80 }
    },
    'BHD': {
        1: { 1: 0, 2: 4, 3: 4, 4: 6, 5: 4, 6: 4, 7: 6, 8: 8 },
        2: { 1: 4, 2: 6, 3: 6, 4: 6, 5: 6, 6: 6, 7: 8, 8: 8 },
        3: { 1: 4, 2: 6, 3: 6, 4: 6, 5: 6, 6: 6, 7: 8, 8: 8 },
        4: { 1: 6, 2: 6, 3: 6, 4: 6, 5: 6, 6: 6, 7: 6, 8: 6 },
        5: { 1: 4, 2: 6, 3: 6, 4: 6, 5: 6, 6: 6, 7: 6, 8: 6 },
        6: { 1: 4, 2: 6, 3: 6, 4: 6, 5: 6, 6: 6, 7: 8, 8: 8 },
        7: { 1: 6, 2: 8, 3: 8, 4: 6, 5: 6, 6: 8, 7: 8, 8: 8 },
        8: { 1: 6, 2: 8, 3: 8, 4: 6, 5: 6, 6: 8, 7: 8, 8: 8 }
    },
    'BYN': {
        1: { 1: 0, 2: 35, 3: 35, 4: 55, 5: 35, 6: 35, 7: 55, 8: 75 },
        2: { 1: 35, 2: 55, 3: 55, 4: 55, 5: 55, 6: 55, 7: 75, 8: 75 },
        3: { 1: 35, 2: 55, 3: 55, 4: 55, 5: 55, 6: 55, 7: 75, 8: 75 },
        4: { 1: 55, 2: 55, 3: 55, 4: 55, 5: 55, 6: 55, 7: 55, 8: 55 },
        5: { 1: 35, 2: 55, 3: 55, 4: 55, 5: 55, 6: 55, 7: 55, 8: 55 },
        6: { 1: 35, 2: 55, 3: 55, 4: 55, 5: 55, 6: 55, 7: 75, 8: 75 },
        7: { 1: 55, 2: 75, 3: 75, 4: 55, 5: 55, 6: 75, 7: 75, 8: 75 },
        8: { 1: 55, 2: 75, 3: 75, 4: 55, 5: 55, 6: 75, 7: 75, 8: 75 }
    },
    'CHF': {
        1: { 1: 0, 2: 9, 3: 9, 4: 14, 5: 9, 6: 9, 7: 14, 8: 18 },
        2: { 1: 9, 2: 14, 3: 14, 4: 14, 5: 14, 6: 14, 7: 18, 8: 18 },
        3: { 1: 9, 2: 14, 3: 14, 4: 14, 5: 14, 6: 14, 7: 18, 8: 18 },
        4: { 1: 14, 2: 14, 3: 14, 4: 14, 5: 14, 6: 14, 7: 14, 8: 14 },
        5: { 1: 9, 2: 14, 3: 14, 4: 14, 5: 14, 6: 14, 7: 14, 8: 14 },
        6: { 1: 9, 2: 14, 3: 14, 4: 14, 5: 14, 6: 14, 7: 18, 8: 18 },
        7: { 1: 14, 2: 18, 3: 18, 4: 14, 5: 14, 6: 18, 7: 18, 8: 18 },
        8: { 1: 14, 2: 18, 3: 18, 4: 14, 5: 14, 6: 18, 7: 18, 8: 18 }
    },
    'CZK': {
        1: { 1: 0, 2: 260, 3: 260, 4: 390, 5: 260, 6: 260, 7: 390, 8: 520 },
        2: { 1: 260, 2: 390, 3: 390, 4: 390, 5: 390, 6: 390, 7: 520, 8: 520 },
        3: { 1: 260, 2: 390, 3: 390, 4: 390, 5: 390, 6: 390, 7: 520, 8: 520 },
        4: { 1: 390, 2: 390, 3: 390, 4: 390, 5: 390, 6: 390, 7: 390, 8: 390 },
        5: { 1: 260, 2: 390, 3: 390, 4: 390, 5: 390, 6: 390, 7: 390, 8: 390 },
        6: { 1: 260, 2: 390, 3: 390, 4: 390, 5: 390, 6: 390, 7: 520, 8: 520 },
        7: { 1: 390, 2: 520, 3: 520, 4: 390, 5: 390, 6: 520, 7: 520, 8: 520 },
        8: { 1: 390, 2: 520, 3: 520, 4: 390, 5: 390, 6: 520, 7: 520, 8: 520 }
    },
    'EGP': {
        1: { 1: 0, 2: 570, 3: 570, 4: 855, 5: 570, 6: 570, 7: 855, 8: 1140 },
        2: { 1: 570, 2: 855, 3: 855, 4: 855, 5: 855, 6: 855, 7: 1140, 8: 1140 },
        3: { 1: 570, 2: 855, 3: 855, 4: 855, 5: 855, 6: 855, 7: 1140, 8: 1140 },
        4: { 1: 855, 2: 855, 3: 855, 4: 855, 5: 855, 6: 855, 7: 855, 8: 855 },
        5: { 1: 570, 2: 855, 3: 855, 4: 855, 5: 855, 6: 855, 7: 855, 8: 855 },
        6: { 1: 570, 2: 855, 3: 855, 4: 855, 5: 855, 6: 855, 7: 1140, 8: 1140 },
        7: { 1: 855, 2: 1140, 3: 1140, 4: 855, 5: 855, 6: 1140, 7: 1140, 8: 1140 },
        8: { 1: 855, 2: 1140, 3: 1140, 4: 855, 5: 855, 6: 1140, 7: 1140, 8: 1140 }
    },
    'HUF': {
        1: { 1: 0, 2: 4195, 3: 4195, 4: 6295, 5: 4195, 6: 4195, 7: 6295, 8: 8390 },
        2: { 1: 4195, 2: 6295, 3: 6295, 4: 6295, 5: 6295, 6: 6295, 7: 8390, 8: 8390 },
        3: { 1: 4195, 2: 6295, 3: 6295, 4: 6295, 5: 6295, 6: 6295, 7: 8390, 8: 8390 },
        4: { 1: 6295, 2: 6295, 3: 6295, 4: 6295, 5: 6295, 6: 6295, 7: 6295, 8: 6295 },
        5: { 1: 4195, 2: 6295, 3: 6295, 4: 6295, 5: 6295, 6: 6295, 7: 6295, 8: 6295 },
        6: { 1: 4195, 2: 6295, 3: 6295, 4: 6295, 5: 6295, 6: 6295, 7: 8390, 8: 8390 },
        7: { 1: 6295, 2: 8390, 3: 8390, 4: 6295, 5: 6295, 6: 8390, 7: 8390, 8: 8390 },
        8: { 1: 6295, 2: 8390, 3: 8390, 4: 6295, 5: 6295, 6: 8390, 7: 8390, 8: 8390 }
    },
    'JOD': {
        1: { 1: 0, 2: 8, 3: 8, 4: 12, 5: 8, 6: 8, 7: 12, 8: 16 },
        2: { 1: 8, 2: 12, 3: 12, 4: 12, 5: 12, 6: 12, 7: 16, 8: 16 },
        3: { 1: 8, 2: 12, 3: 12, 4: 12, 5: 12, 6: 12, 7: 16, 8: 16 },
        4: { 1: 12, 2: 12, 3: 12, 4: 12, 5: 12, 6: 12, 7: 12, 8: 12 },
        5: { 1: 8, 2: 12, 3: 12, 4: 12, 5: 12, 6: 12, 7: 12, 8: 12 },
        6: { 1: 8, 2: 12, 3: 12, 4: 12, 5: 12, 6: 12, 7: 16, 8: 16 },
        7: { 1: 12, 2: 16, 3: 16, 4: 12, 5: 12, 6: 16, 7: 16, 8: 16 },
        8: { 1: 12, 2: 16, 3: 16, 4: 12, 5: 12, 6: 16, 7: 16, 8: 16 }
    },
    'KWD': {
        1: { 1: 0, 2: 3, 3: 3, 4: 5, 5: 3, 6: 3, 7: 5, 8: 7 },
        2: { 1: 3, 2: 5, 3: 5, 4: 5, 5: 5, 6: 5, 7: 7, 8: 7 },
        3: { 1: 3, 2: 5, 3: 5, 4: 5, 5: 5, 6: 5, 7: 7, 8: 7 },
        4: { 1: 5, 2: 5, 3: 5, 4: 5, 5: 5, 6: 5, 7: 5, 8: 5 },
        5: { 1: 3, 2: 5, 3: 5, 4: 5, 5: 5, 6: 5, 7: 5, 8: 5 },
        6: { 1: 3, 2: 5, 3: 5, 4: 5, 5: 5, 6: 5, 7: 7, 8: 7 },
        7: { 1: 5, 2: 7, 3: 7, 4: 5, 5: 5, 6: 7, 7: 7, 8: 7 },
        8: { 1: 5, 2: 7, 3: 7, 4: 5, 5: 5, 6: 7, 7: 7, 8: 7 }
    },
    'KZT': {
        1: { 1: 0, 2: 6055, 3: 6055, 4: 9085, 5: 6055, 6: 6055, 7: 9085, 8: 12110 },
        2: { 1: 6055, 2: 9085, 3: 9085, 4: 9085, 5: 9085, 6: 9085, 7: 12110, 8: 12110 },
        3: { 1: 6055, 2: 9085, 3: 9085, 4: 9085, 5: 9085, 6: 9085, 7: 12110, 8: 12110 },
        4: { 1: 9085, 2: 9085, 3: 9085, 4: 9085, 5: 9085, 6: 9085, 7: 9085, 8: 9085 },
        5: { 1: 6055, 2: 9085, 3: 9085, 4: 9085, 5: 9085, 6: 9085, 7: 9085, 8: 9085 },
        6: { 1: 6055, 2: 9085, 3: 9085, 4: 9085, 5: 9085, 6: 9085, 7: 12110, 8: 12110 },
        7: { 1: 9085, 2: 12110, 3: 12110, 4: 9085, 5: 9085, 6: 12110, 7: 12110, 8: 12110 },
        8: { 1: 9085, 2: 12110, 3: 12110, 4: 9085, 5: 9085, 6: 12110, 7: 12110, 8: 12110 }
    },
    'LKR': {
        1: { 1: 0, 2: 3365, 3: 3365, 4: 5045, 5: 3365, 6: 3365, 7: 5045, 8: 6725 },
        2: { 1: 3365, 2: 5045, 3: 5045, 4: 5045, 5: 5045, 6: 5045, 7: 6725, 8: 6725 },
        3: { 1: 3365, 2: 5045, 3: 5045, 4: 5045, 5: 5045, 6: 5045, 7: 6725, 8: 6725 },
        4: { 1: 5045, 2: 5045, 3: 5045, 4: 5045, 5: 5045, 6: 5045, 7: 5045, 8: 5045 },
        5: { 1: 3365, 2: 5045, 3: 5045, 4: 5045, 5: 5045, 6: 5045, 7: 5045, 8: 5045 },
        6: { 1: 3365, 2: 5045, 3: 5045, 4: 5045, 5: 5045, 6: 5045, 7: 6725, 8: 6725 },
        7: { 1: 5045, 2: 6725, 3: 6725, 4: 5045, 5: 5045, 6: 6725, 7: 6725, 8: 6725 },
        8: { 1: 5045, 2: 6725, 3: 6725, 4: 5045, 5: 5045, 6: 6725, 7: 6725, 8: 6725 }
    },
    'MYR': {
        1: { 1: 0, 2: 50, 3: 50, 4: 75, 5: 50, 6: 50, 7: 75, 8: 95 },
        2: { 1: 50, 2: 75, 3: 75, 4: 75, 5: 75, 6: 75, 7: 95, 8: 95 },
        3: { 1: 50, 2: 75, 3: 75, 4: 75, 5: 75, 6: 75, 7: 95, 8: 95 },
        4: { 1: 75, 2: 75, 3: 75, 4: 75, 5: 75, 6: 75, 7: 75, 8: 75 },
        5: { 1: 50, 2: 75, 3: 75, 4: 75, 5: 75, 6: 75, 7: 75, 8: 75 },
        6: { 1: 50, 2: 75, 3: 75, 4: 75, 5: 75, 6: 75, 7: 95, 8: 95 },
        7: { 1: 75, 2: 95, 3: 95, 4: 75, 5: 75, 6: 95, 7: 95, 8: 95 },
        8: { 1: 75, 2: 95, 3: 95, 4: 75, 5: 75, 6: 95, 7: 95, 8: 95 }
    },
    'NPR': {
        1: { 1: 0, 2: 1765, 3: 1765, 4: 2650, 5: 1765, 6: 1765, 7: 2650, 8: 3530 },
        2: { 1: 1765, 2: 2650, 3: 2650, 4: 2650, 5: 2650, 6: 2650, 7: 3530, 8: 3530 },
        3: { 1: 1765, 2: 2650, 3: 2650, 4: 2650, 5: 2650, 6: 2650, 7: 3530, 8: 3530 },
        4: { 1: 2650, 2: 2650, 3: 2650, 4: 2650, 5: 2650, 6: 2650, 7: 2650, 8: 2650 },
        5: { 1: 1765, 2: 2650, 3: 2650, 4: 2650, 5: 2650, 6: 2650, 7: 2650, 8: 2650 },
        6: { 1: 1765, 2: 2650, 3: 2650, 4: 2650, 5: 2650, 6: 2650, 7: 3530, 8: 3530 },
        7: { 1: 2650, 2: 3530, 3: 3530, 4: 2650, 5: 2650, 6: 3530, 7: 3530, 8: 3530 },
        8: { 1: 2650, 2: 3530, 3: 3530, 4: 2650, 5: 2650, 6: 3530, 7: 3530, 8: 3530 }
    },
    'OMR': {
        1: { 1: 0, 2: 4, 3: 4, 4: 6, 5: 4, 6: 4, 7: 6, 8: 9 },
        2: { 1: 4, 2: 6, 3: 6, 4: 6, 5: 6, 6: 6, 7: 9, 8: 9 },
        3: { 1: 4, 2: 6, 3: 6, 4: 6, 5: 6, 6: 6, 7: 9, 8: 9 },
        4: { 1: 6, 2: 6, 3: 6, 4: 6, 5: 6, 6: 6, 7: 6, 8: 6 },
        5: { 1: 4, 2: 6, 3: 6, 4: 6, 5: 6, 6: 6, 7: 6, 8: 6 },
        6: { 1: 4, 2: 6, 3: 6, 4: 6, 5: 6, 6: 6, 7: 9, 8: 9 },
        7: { 1: 6, 2: 9, 3: 9, 4: 6, 5: 6, 6: 9, 7: 9, 8: 9 },
        8: { 1: 6, 2: 9, 3: 9, 4: 6, 5: 6, 6: 9, 7: 9, 8: 9 }
    },
    'PLN': {
        1: { 1: 0, 2: 40, 3: 40, 4: 65, 5: 40, 6: 40, 7: 65, 8: 85 },
        2: { 1: 40, 2: 65, 3: 65, 4: 65, 5: 65, 6: 65, 7: 85, 8: 85 },
        3: { 1: 40, 2: 65, 3: 65, 4: 65, 5: 65, 6: 65, 7: 85, 8: 85 },
        4: { 1: 65, 2: 65, 3: 65, 4: 65, 5: 65, 6: 65, 7: 65, 8: 65 },
        5: { 1: 40, 2: 65, 3: 65, 4: 65, 5: 65, 6: 65, 7: 65, 8: 65 },
        6: { 1: 40, 2: 65, 3: 65, 4: 65, 5: 65, 6: 65, 7: 85, 8: 85 },
        7: { 1: 65, 2: 85, 3: 85, 4: 65, 5: 65, 6: 85, 7: 85, 8: 85 },
        8: { 1: 65, 2: 85, 3: 85, 4: 65, 5: 65, 6: 85, 7: 85, 8: 85 }
    },
    'THB': {
        1: { 1: 0, 2: 375, 3: 375, 4: 565, 5: 375, 6: 375, 7: 565, 8: 750 },
        2: { 1: 375, 2: 565, 3: 565, 4: 565, 5: 565, 6: 565, 7: 750, 8: 750 },
        3: { 1: 375, 2: 565, 3: 565, 4: 565, 5: 565, 6: 565, 7: 750, 8: 750 },
        4: { 1: 565, 2: 565, 3: 565, 4: 565, 5: 565, 6: 565, 7: 565, 8: 565 },
        5: { 1: 375, 2: 565, 3: 565, 4: 565, 5: 565, 6: 565, 7: 565, 8: 565 },
        6: { 1: 375, 2: 565, 3: 565, 4: 565, 5: 565, 6: 565, 7: 750, 8: 750 },
        7: { 1: 565, 2: 750, 3: 750, 4: 565, 5: 565, 6: 750, 7: 750, 8: 750 },
        8: { 1: 565, 2: 750, 3: 750, 4: 565, 5: 565, 6: 750, 7: 750, 8: 750 }
    },
    'UZS': {
        1: { 1: 0, 2: 145360, 3: 145360, 4: 218040, 5: 145360, 6: 145360, 7: 218040, 8: 290720 },
        2: { 1: 145360, 2: 218040, 3: 218040, 4: 218040, 5: 218040, 6: 218040, 7: 290720, 8: 290720 },
        3: { 1: 145360, 2: 218040, 3: 218040, 4: 218040, 5: 218040, 6: 218040, 7: 290720, 8: 290720 },
        4: { 1: 218040, 2: 218040, 3: 218040, 4: 218040, 5: 218040, 6: 218040, 7: 218040, 8: 218040 },
        5: { 1: 145360, 2: 218040, 3: 218040, 4: 218040, 5: 218040, 6: 218040, 7: 218040, 8: 218040 },
        6: { 1: 145360, 2: 218040, 3: 218040, 4: 218040, 5: 218040, 6: 218040, 7: 290720, 8: 290720 },
        7: { 1: 218040, 2: 290720, 3: 290720, 4: 218040, 5: 218040, 6: 290720, 7: 290720, 8: 290720 },
        8: { 1: 218040, 2: 290720, 3: 290720, 4: 218040, 5: 218040, 6: 290720, 7: 290720, 8: 290720 }
    },
    'USD': {
        1: { 1: 0, 2: 11, 3: 11, 4: 17, 5: 11, 6: 11, 7: 17, 8: 22 },
        2: { 1: 11, 2: 17, 3: 17, 4: 17, 5: 17, 6: 17, 7: 22, 8: 22 },
        3: { 1: 11, 2: 17, 3: 17, 4: 17, 5: 17, 6: 17, 7: 22, 8: 22 },
        4: { 1: 17, 2: 17, 3: 17, 4: 17, 5: 17, 6: 17, 7: 17, 8: 17 },
        5: { 1: 11, 2: 17, 3: 17, 4: 17, 5: 17, 6: 17, 7: 17, 8: 17 },
        6: { 1: 11, 2: 17, 3: 17, 4: 17, 5: 17, 6: 17, 7: 22, 8: 22 },
        7: { 1: 17, 2: 22, 3: 22, 4: 17, 5: 17, 6: 22, 7: 22, 8: 22 },
        8: { 1: 17, 2: 22, 3: 22, 4: 17, 5: 17, 6: 22, 7: 22, 8: 22 }
    },
    'EUR': {
        1: { 1: 0, 2: 10, 3: 10, 4: 15, 5: 10, 6: 10, 7: 15, 8: 20 },
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

// Upgrade Zone Mapping (from PDF page 11)
const UPGRADE_ZONE_MAPPING = {
    1: ['AWZ', 'AQI', 'BAH', 'BND', 'BSR', 'DMM', 'DOH', 'DWC', 'DXB', 'ELQ', 'HAS', 'HOF', 'IFN', 'KER', 'KHI', 'KIH', 'KWI', 'LRR', 'MCT', 'OHS', 'RUH', 'SLL', 'SYZ'],
    2: ['ADE', 'AHB', 'AJF', 'AMD', 'AMM', 'AQJ', 'BEY', 'BGW', 'BOM', 'BLR', 'BUS', 'BUZ', 'CCJ', 'CCU', 'COK', 'DEL', 'EAM', 'EBL', 'EVN', 'GBB', 'GIZ', 'GSM', 'GYD', 'HDM', 'HRI', 'HYD', 'IKA', 'ISB', 'ISU', 'JED', 'JIB', 'KBL', 'KDH', 'LKO', 'LHE', 'LYP', 'MAA', 'MED', 'MHD', 'MRV', 'MUX', 'NJF', 'NUM', 'RSI', 'SAH', 'SKT', 'TBS', 'TBZ', 'TIF', 'TRV', 'TUU', 'UET', 'ULH', 'YNB'],
    3: ['ADB', 'ADD', 'AER', 'ALA', 'ASB', 'ASM', 'AYT', 'BEG', 'BGY', 'BJM', 'BJV', 'BKK', 'BSL', 'BUD', 'BTS', 'BWA', 'CAG', 'CLJ', 'CMB', 'CTA', 'CIT', 'CFU', 'CGP', 'DAC', 'DAR', 'DBB', 'DBV', 'DYU', 'EBB', 'ESB', 'DOK', 'FIH', 'FRU', 'GAN', 'GOI', 'GOJ', 'GRV', 'HBE', 'HGA', 'HMB', 'HRI', 'HEL', 'HRK', 'IEV', 'IST', 'JMK', 'JRO', 'JTR', 'KBP', 'KBV', 'KGL', 'JUB', 'KIV', 'KRR', 'KRK', 'KRT', 'KTM', 'KUF', 'KUT', 'KZN', 'LED', 'LGK', 'LJU', 'MBA', 'MBX', 'MCX', 'MGQ', 'MLA', 'MLE', 'MSQ', 'NAP', 'NMA', 'NQZ', 'OLB', 'OSS', 'OTP', 'OVB', 'ODS', 'PEE', 'PEN', 'PEW', 'POZ', 'PRG', 'PSA', 'PZU', 'RIX', 'RGN', 'ROV', 'SJJ', 'SKG', 'SKP', 'SAW', 'SKD', 'SOF', 'SPX', 'SSH', 'SVO', 'SVX', 'SZG', 'TAS', 'TIA', 'TIV', 'TLL', 'TLV', 'TGD', 'TZX', 'UTP', 'UFA', 'VNO', 'VKO', 'VOG', 'WAW', 'XWC', 'ZIA', 'ZNZ', 'ZYL', 'ZAG']
};

// Upgrade to Business – On Board rates (from PDF page 13)
const UPGRADE_ON_BOARD_RATES = {
    'AED': { 1: 1400, 2: 2100, 3: 2300 },
    'PKR': { 1: 115205, 2: 184330, 3: 207375 }
};
// Exception: when paying in AED from PKR airport (Pakistan), On Board AED is 1500/2400/2700 (not 1400/2100/2300)
const UPGRADE_ON_BOARD_AED_PKR = { 1: 1500, 2: 2400, 3: 2700 };

// Infant Upgrade to Business – at airport (from PDF page 11; same currencies as adult)
const UPGRADE_INFANT_RATES = {
    'ZONE1': {
        'AED': 33, 'PKR': 2496, 'BHD': 3, 'BYN': 27, 'CHF': 7, 'CZK': 189, 'EGP': 415, 'EUR': 8, 'HUF': 3052,
        'INR': 699, 'JOD': 6, 'KWD': 3, 'KZT': 4405, 'LBP': 750000, 'LKR': 2447, 'MYR': 35, 'NPR': 1117,
        'OMR': 3, 'PLN': 31, 'QAR': 31, 'RUB': 700, 'SAR': 31, 'TJS': 87, 'THB': 273, 'USD': 8, 'UZS': 105749, 'IRR': 5649718
    },
    'ZONE2': {
        'AED': 53, 'PKR': 4032, 'BHD': 5, 'BYN': 40, 'CHF': 11, 'CZK': 283, 'EGP': 623, 'EUR': 11, 'HUF': 4578,
        'INR': 1049, 'JOD': 9, 'KWD': 4, 'KZT': 6608, 'LBP': 1125000, 'LKR': 3671, 'MYR': 53, 'NPR': 1675,
        'OMR': 5, 'PLN': 46, 'QAR': 46, 'RUB': 1049, 'SAR': 46, 'TJS': 131, 'THB': 410, 'USD': 12, 'UZS': 158624, 'IRR': 8474576
    },
    'ZONE3': {
        'AED': 63, 'PKR': 4800, 'BHD': 5, 'BYN': 47, 'CHF': 13, 'CZK': 330, 'EGP': 726, 'EUR': 13, 'HUF': 5341,
        'INR': 1223, 'JOD': 10, 'KWD': 4, 'KZT': 7709, 'LBP': 1312500, 'LKR': 4282, 'MYR': 62, 'NPR': 1955,
        'OMR': 6, 'PLN': 54, 'QAR': 54, 'RUB': 1224, 'SAR': 54, 'TJS': 153, 'THB': 478, 'USD': 14, 'UZS': 185061, 'IRR': 9887006
    }
};

// Infant Upgrade to Business – On Board (from PDF page 11)
const UPGRADE_ON_BOARD_INFANT_RATES = {
    'AED': { 1: 35, 2: 53, 3: 58 },
    'PKR': { 1: 28801, 2: 46083, 3: 51844 }
};

// Excess baggage route exceptions (from PDF page 22)
const EXCESS_BAGGAGE_EXCEPTIONS = {
    'CMB-MLE': { currency: 'LKR', amount: 3025 },
    'MLE-CMB': { currency: 'USD', amount: 10 },
    'INDIA_NO_PREPURCHASE': { note: 'Without pre-purchased baggage: INR 900 plus taxes for baggage up to 20 kg. Excess above 20 kg at normal rates.' }
};

// Upgrade to Business – exceptions by route/market (from PDF page 12)
const UPGRADE_EXCEPTIONS = {
    'SAUDI': { from: 'All KSA points', AED: 1175, SAR: 1200 },
    'INDIA': { from: 'All India points', AED: 1315, INR: 30640 },
    'CMB-MLE': { from: 'Sri Lanka–Maldives', AED: 745, LKR: 60080 },
    'MLE-CMB': { from: 'Maldives–Sri Lanka', AED: 920, USD: 250 },
    'BGW': { from: 'Iraq (BGW)', AED: 1650, USD: 450 },
    'TLV': { from: 'Israel (TLV)', AED: 2185, USD: 595 },
    'KTM': { from: 'Nepal (KTM)', AED: 2185, NPR: 81350 },
    'KWI': { from: 'Kuwait (KWI)', AED: 660, KWD: 55 },
    'BAH': { from: 'Bahrain (BAH)', AED: 535, BHD: 55 },
    'MCT': { from: 'Muscat (MCT)', AED: 715, OMR: 75 }
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

// Get Upgrade to Business rate (adult/child)
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
    
    const infantRates = UPGRADE_INFANT_RATES[zoneKey];
    const infantRate = infantRates && infantRates[currency];
    
    return {
        origin: origin.toUpperCase(),
        zone: parseInt(zone),
        currency,
        rate,
        infantRate: infantRate != null ? infantRate : null,
        description: `Upgrade to Business Class from Zone ${zone}`
    };
}

// Get Infant Upgrade to Business rate (at airport)
export function getUpgradeInfantRate(origin, currency) {
    const zone = getUpgradeZone(origin);
    if (!zone) return { error: `Infant upgrade rate not available for ${origin}` };
    const zoneKey = `ZONE${zone}`;
    const rate = UPGRADE_INFANT_RATES[zoneKey] && UPGRADE_INFANT_RATES[zoneKey][currency];
    if (rate == null) return { error: `Infant upgrade rate not available for ${currency} from Zone ${zone}` };
    return { origin: origin.toUpperCase(), zone: parseInt(zone), currency, rate, description: 'Infant upgrade to Business (at airport)' };
}

// Get Upgrade to Business – On Board rate (from PDF page 13)
export function getUpgradeOnBoardRate(origin, currency) {
    const zone = getUpgradeZone(origin);
    if (!zone) {
        return { error: `Upgrade On Board rate not available for ${origin}` };
    }
    const infantRates = UPGRADE_ON_BOARD_INFANT_RATES[currency];
    const infantRate = infantRates && infantRates[zone];
    // Exception: AED from PKR airport uses 1500/2400/2700 (Page 13)
    if (currency === 'AED' && getCurrencyForDestination(origin) === 'PKR') {
        const rate = UPGRADE_ON_BOARD_AED_PKR[zone];
        if (rate != null) {
            return {
                origin: origin.toUpperCase(),
                zone: parseInt(zone),
                currency: 'AED',
                rate,
                infantRate: infantRate != null ? infantRate : null,
                description: `Upgrade to Business Class On Board from Zone ${zone} (PKR airport exception)`
            };
        }
    }
    const rate = UPGRADE_ON_BOARD_RATES[currency] && UPGRADE_ON_BOARD_RATES[currency][zone];
    if (rate == null) {
        return { error: `Upgrade On Board rate not available for ${currency} from Zone ${zone}` };
    }
    return {
        origin: origin.toUpperCase(),
        zone: parseInt(zone),
        currency,
        rate,
        infantRate: infantRate != null ? infantRate : null,
        description: `Upgrade to Business Class On Board from Zone ${zone}`
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
        'ASM': { currency: 'USD', adult: 705, infant: 20, alt: { ERN: { adult: 10790, infant: 300 } } },
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

// Aircraft type and Extra Legroom (XLGR) seat rows – reference (from PDF page 26)
export const AIRCRAFT_XLGR_REFERENCE = [
    { type: '737-800NG', cabin: 'Y', capacity: 189, xlgrRows: '1ABC, 2DEF, 15 & 16' },
    { type: '737-8', cabin: 'Y', capacity: 189, xlgrRows: '1ABC, 2DEF, 15 & 16' },
    { type: '737-9', cabin: 'Y', capacity: 210, xlgrRows: '1ABC, 2DEF, 16 & 17' },
    { type: '737 MAX 8', cabin: 'Y', capacity: 189, xlgrRows: '1ABC, 2DEF, 15 & 16' },
    { type: '737 MAX 9', cabin: 'Y', capacity: 210, xlgrRows: '1ABC, 2DEF, 16 & 17' }
];

// Interline journey rules – which carrier's rates apply (Page 4 / document)
export const INTERLINE_JOURNEY_RULES = [
    { journey: 'FZ – EK', condition: 'EK rates will apply' },
    { journey: 'FZ – EK – AC (EK is the Transatlantic carrier)', condition: 'EK rates will apply' },
    { journey: 'FZ – OAL', condition: 'EK rates will apply' },
    { journey: 'FZ – AC (AC is the Transatlantic carrier)', condition: 'AC rates will apply' },
    { journey: 'FZ – UA (UA is the Transatlantic carrier)', condition: 'UA rates will apply' }
];

// Customer disclaimer for excess baggage (to be communicated when providing rates)
export const EXCESS_BAGGAGE_DISCLAIMER = 'Please note that the excess baggage rates quoted are approximate. For the exact rate, please check with the airport team at the time of departure.';

// Reference text: EK/OAL Excess Baggage and UA/AC rules (Page 4 and document)
export const REFERENCE_TEXTS = {
    INTERLINE_RULES: `Interline excess baggage – which carrier's rates apply: FZ–EK → EK rates; FZ–EK–AC (EK transatlantic) → EK rates; FZ–OAL → EK rates; FZ–AC (AC transatlantic) → AC rates; FZ–UA (UA transatlantic) → UA rates. Document contains EK, AC and UA rates for all regions. If a rate is missing for a destination, refer to FS/SUP in charge.`,
    EK_OAL_EXCESS: `EK (Emirates) / OAL (Other Airlines) Excess Baggage – Region-based USD per kg and USD/CAD per piece. Buying additional weight at the airport (USD per kg): Middle East/South Asia ↔ ME/SA $15, to Africa $25, to Far East $25, to Europe $25, to Australia & New Zealand $40. Far East: to ME/SA $25, to Africa $30, to Far East $15, to Europe $30, to ANZ $30. Europe: to ME/SA $25, to Africa $30, to Far East $30, to Europe $40, to ANZ $50. Australia & New Zealand: to ME/SA $40, to Africa $50, to Far East $30, to Europe $50, to ANZ $15. *$15 per kg for travel between Larnaca (LCA) and Malta (MLA). Buying additional pieces: From/to Africa, Americas, Canada (CAD) – see rate matrix.`,
    UA_AC_EXCESS: `United Airlines (UA) / Air Canada (AC) Excess Baggage – Flat USD fees. Free Allowance: Economy 0–23 kg, Business 0–32 kg. 1 Excess Baggage $75, 2 Excess Baggage $100, 3 or more Excess Baggage $200, Oversize $200, Overweight $200. (GO-SHOW/UPGRADE/EXCESS BAGGAGE RATES Version 2025.112(A) Outstation, Effective 17 May 2025.)`,
    REGIONAL_CLASSIFICATION: `Middle East: Bahrain, Iran, Iraq, Jordan, Kuwait, Lebanon, Oman, Qatar, Saudi Arabia, UAE, Israel. South Asia: Afghanistan, Bangladesh, India, Maldives, Pakistan, Sri Lanka, Nepal, Kazakhstan, Kyrgyzstan, Tajikistan, Turkmenistan. Africa: Algeria, Angola, Côte d'Ivoire, Egypt, Ethiopia, Ghana, Guinea, Kenya, Libya, Madagascar, Mauritius, Morocco, Nigeria, Senegal, Seychelles, South Africa, Sudan, Tanzania, Tunisia, Uganda, Zambia, Zimbabwe, Congo, Djibouti, Eritrea, Somalia, South Sudan. Europe: Austria, Belgium, Croatia, Cyprus, Czech Republic, Denmark, France, Germany, Greece, Hungary, Ireland, Italy, Malta, Netherlands, Norway, Poland, Portugal, Russia, Spain, Sweden, Switzerland, Türkiye, Ukraine, United Kingdom, Armenia, Azerbaijan, Bosnia, Bulgaria, Georgia, Macedonia, Montenegro, Romania, Serbia, Slovakia, Finland. Far East: Cambodia, China, Hong Kong, Indonesia, Japan, Malaysia, Myanmar, Philippines, Singapore, South Korea, Taiwan, Thailand, Vietnam. Australia and New Zealand. Americas: Argentina, Brazil, Canada, Chile, Colombia, USA.`
};

// Extra Legroom rates – Airport Rate / On Board Rate + Currency Exchange (from PDF pages 26-29)
const EXTRA_LEGROOM_RATES = {
    'AED': { airport: 175, onBoard: 200, currencyExchange: 3.67 },
    'AFN': { airport: 3385, onBoard: 3868 },
    'AOA': { airport: 44081, onBoard: 50378 },
    'ARS': { airport: 56090, onBoard: 64103 },
    'AUD': { airport: 74, onBoard: 85, currencyExchange: 1.53 },
    'AZN': { airport: 81, onBoard: 93 },
    'BAM': { airport: 82, onBoard: 94 },
    'BBD': { airport: 95, onBoard: 109 },
    'BDT': { airport: 5813, onBoard: 6643 },
    'BGN': { airport: 82, onBoard: 94 },
    'BHD': { airport: 18, onBoard: 21, currencyExchange: 0.38 },
    'BMD': { airport: 48, onBoard: 54 },
    'BND': { airport: 62, onBoard: 71 },
    'BOB': { airport: 329, onBoard: 376 },
    'BRL': { airport: 269, onBoard: 308 },
    'BWP': { airport: 656, onBoard: 750 },
    'CAD': { airport: 66, onBoard: 76, currencyExchange: 1.36 },
    'CHF': { airport: 39, onBoard: 45, currencyExchange: 0.88 },
    'CLP': { airport: 44987, onBoard: 51414 },
    'CNY': { airport: 347, onBoard: 396 },
    'COP': { airport: 201149, onBoard: 229885 },
    'CZK': { airport: 1100, onBoard: 1257, currencyExchange: 22.5 },
    'DJF': { airport: 8462, onBoard: 9671 },
    'DKK': { airport: 312, onBoard: 357 },
    'DZD': { airport: 6299, onBoard: 7199 },
    'EGP': { airport: 2421, onBoard: 2767, currencyExchange: 50.5 },
    'ERN': { airport: 715, onBoard: 817 },
    'ETB': { airport: 6003, onBoard: 6861 },
    'EUR': { airport: 42, onBoard: 48, currencyExchange: 0.92 },
    'FJD': { airport: 109, onBoard: 124 },
    'GBP': { airport: 36, onBoard: 41, currencyExchange: 0.79 },
    'GEL': { airport: 131, onBoard: 150 },
    'GHS': { airport: 685, onBoard: 783 },
    'GNF': { airport: 416667, onBoard: 476190 },
    'GYD': { airport: 9977, onBoard: 11403 },
    'HKD': { airport: 370, onBoard: 422 },
    'HRK': { airport: 315, onBoard: 360 },
    'HUF': { airport: 17803, onBoard: 20346, currencyExchange: 365 },
    'IDR': { airport: 795455, onBoard: 909091 },
    'ILS': { airport: 174, onBoard: 199 },
    'INR': { airport: 4077, onBoard: 4660, currencyExchange: 83 },
    'IQD': { airport: 62500, onBoard: 71429 },
    'IRR': { airport: 32956685, onBoard: 37664783 },
    'ISK': { airport: 6112, onBoard: 6986 },
    'JMD': { airport: 7498, onBoard: 8569 },
    'JOD': { airport: 34, onBoard: 39, currencyExchange: 0.71 },
    'JPY': { airport: 6788, onBoard: 7758 },
    'KES': { airport: 6164, onBoard: 7045 },
    'KHR': { airport: 190217, onBoard: 217391 },
    'KMF': { airport: 20588, onBoard: 23529 },
    'KRW': { airport: 68627, onBoard: 78431 },
    'KWD': { airport: 15, onBoard: 17, currencyExchange: 0.31 },
    'KZT': { airport: 25698, onBoard: 29369, currencyExchange: 450 },
    'LBP': { airport: 4375000, onBoard: 5000000 },
    'LKR': { airport: 14274, onBoard: 16313, currencyExchange: 298 },
    'LSL': { airport: 884, onBoard: 1010 },
    'LYD': { airport: 261, onBoard: 298 },
    'MAD': { airport: 441, onBoard: 505 },
    'MGA': { airport: 213415, onBoard: 243902 },
    'MKD': { airport: 2578, onBoard: 2946 },
    'MMK': { airport: 100000, onBoard: 114286 },
    'MOP': { airport: 381, onBoard: 435 },
    'MRU': { airport: 1889, onBoard: 2159 },
    'MUR': { airport: 2154, onBoard: 2461 },
    'MVR': { airport: 729, onBoard: 833 },
    'MWK': { airport: 82547, onBoard: 94340 },
    'MXN': { airport: 935, onBoard: 1068 },
    'MYR': { airport: 206, onBoard: 236, currencyExchange: 4.7 },
    'MZN': { airport: 3041, onBoard: 3476 },
    'NAD': { airport: 884, onBoard: 1010 },
    'NGN': { airport: 76419, onBoard: 87336 },
    'NOK': { airport: 494, onBoard: 565 },
    'NPR': { airport: 6515, onBoard: 7446, currencyExchange: 133 },
    'NZD': { airport: 80, onBoard: 92 },
    'OMR': { airport: 18, onBoard: 21, currencyExchange: 0.38 },
    'PHP': { airport: 2683, onBoard: 3067 },
    'PKR': { airport: 13441, onBoard: 15361, currencyExchange: 278 },
    'PLN': { airport: 179, onBoard: 205, currencyExchange: 4.0 },
    'PYG': { airport: 380435, onBoard: 434783 },
    'QAR': { airport: 180, onBoard: 206, currencyExchange: 3.65 },
    'RON': { airport: 219, onBoard: 250 },
    'RSD': { airport: 4906, onBoard: 5607 },
    'RUB': { airport: 4080, onBoard: 4663, currencyExchange: 92 },
    'SAR': { airport: 179, onBoard: 204, currencyExchange: 3.75 },
    'SCR': { airport: 693, onBoard: 792 },
    'SDG': { airport: 96685, onBoard: 110497 },
    'SDR': { airport: 35, onBoard: 40 },
    'SEK': { airport: 459, onBoard: 524 },
    'SGD': { airport: 62, onBoard: 71 },
    'SOS': { airport: 28878, onBoard: 33003 },
    'SSP': { airport: 213415, onBoard: 243902 },
    'SYP': { airport: 583333, onBoard: 666667 },
    'SZL': { airport: 884, onBoard: 1010 },
    'THB': { airport: 1593, onBoard: 1820, currencyExchange: 36 },
    'TJS': { airport: 510, onBoard: 583 },
    'TND': { airport: 142, onBoard: 162 },
    'TRY': { airport: 1848, onBoard: 2112 },
    'TTD': { airport: 322, onBoard: 369 },
    'TWD': { airport: 1538, onBoard: 1757 },
    'TZS': { airport: 127737, onBoard: 145985 },
    'UAH': { airport: 1986, onBoard: 2270 },
    'UGX': { airport: 175000, onBoard: 200000 },
    'USD': { airport: 48, onBoard: 54, currencyExchange: 1 },
    'UYU': { airport: 1997, onBoard: 2283 },
    'UZS': { airport: 616871, onBoard: 704995 },
    'VND': { airport: 1250000, onBoard: 1428571 },
    'XAF': { airport: 27473, onBoard: 31397 },
    'XCD': { airport: 129, onBoard: 147 },
    'XOF': { airport: 27473, onBoard: 31397 },
    'YER': { airport: 11674, onBoard: 13342 },
    'ZAR': { airport: 884, onBoard: 1010 },
    'ZIG': { airport: 1277, onBoard: 1459 },
    'ZMW': { airport: 1333, onBoard: 1524 },
    'AMD': { airport: 18677, onBoard: 21345 },
    'BYN': { airport: 156, onBoard: 178, currencyExchange: 3.26 },
    'CDF': { airport: 135659, onBoard: 155039 },
    'CRC': { airport: 23713, onBoard: 27100 },
    'DOP': { airport: 2840, onBoard: 3246 },
    'KGS': { airport: 4167, onBoard: 4762 },
    'MDL': { airport: 819, onBoard: 937 },
    'RWF': { airport: 68627, onBoard: 78431 },
    'STN': { airport: 1023, onBoard: 1170 },
    'TMT': { airport: 167, onBoard: 191 }
};

// Get excess baggage exception for a route (CMB-MLE, MLE-CMB)
export function getExcessBaggageException(origin, destination) {
    const key = `${origin.toUpperCase()}-${destination.toUpperCase()}`;
    return EXCESS_BAGGAGE_EXCEPTIONS[key] || null;
}

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
        // Route exceptions (CMB-MLE, MLE-CMB)
        const exception = getExcessBaggageException(origin, destination);
        if (exception && exception.amount != null) {
            return {
                airline: 'FZ',
                origin: origin.toUpperCase(),
                destination: destination.toUpperCase(),
                originZone,
                destZone,
                currency: exception.currency,
                ratePerKg: exception.amount,
                rateDescription: `${exception.amount} ${exception.currency} (exception rate for this route)`,
                carrierName: translateAirline('FZ'),
                isException: true
            };
        }
        
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
        
        const o = origin.toUpperCase();
        const d = destination.toUpperCase();
        const indiaNote = (INDIA_AIRPORT_CODES.includes(o) || INDIA_AIRPORT_CODES.includes(d))
            ? (EXCESS_BAGGAGE_EXCEPTIONS.INDIA_NO_PREPURCHASE && EXCESS_BAGGAGE_EXCEPTIONS.INDIA_NO_PREPURCHASE.note)
            : null;
        return {
            airline: 'FZ',
            origin: o,
            destination: d,
            originZone,
            destZone,
            currency: selectedCurrency,
            ratePerKg: rate,
            rateDescription: `${rate} ${selectedCurrency} per kg`,
            carrierName: translateAirline('FZ'),
            indiaNote: indiaNote || undefined
        };
    }
    
    // Handle EK rates
    if (airline === 'EK') {
        const o = origin.toUpperCase();
        const d = destination.toUpperCase();
        const isLcaMla = (o === 'LCA' && d === 'MLA') || (o === 'MLA' && d === 'LCA');
        if (isLcaMla) {
            return {
                airline: 'EK',
                origin: o,
                destination: d,
                originZone,
                destZone,
                originRegion: 'EUROPE',
                destRegion: 'EUROPE',
                currency: 'USD',
                ratePerKg: 15,
                rateDescription: '$15 USD per kg (Larnaca–Malta)',
                carrierName: translateAirline('EK'),
                isLarnacaMaltaException: true
            };
        }
        const originRegion = getEKRegionForAirport(origin);
        const destRegion = getEKRegionForAirport(destination);
        
        if (!originRegion || !destRegion) {
            return {
                error: `Region not found for ${o} or ${d}`,
                origin: o,
                destination: d
            };
        }
        
        const perKgRate = EK_OAL_EXCESS_RATES_PER_KG[originRegion] && 
                         EK_OAL_EXCESS_RATES_PER_KG[originRegion][destRegion];
        const pieceOrigin = CANADA_AIRPORT_CODES.includes(o) ? 'CANADA' : originRegion;
        const pieceRates = EK_OAL_EXCESS_RATES_PER_PIECE[pieceOrigin];
        const ratePerPiece = pieceRates && pieceRates[destRegion] != null ? pieceRates[destRegion] : null;
        const pieceCurrency = pieceOrigin === 'CANADA' && EK_OAL_EXCESS_RATES_PER_PIECE.CANADA && EK_OAL_EXCESS_RATES_PER_PIECE.CANADA.currency ? 'CAD' : 'USD';
        return {
            airline: 'EK',
            origin: o,
            destination: d,
            originZone,
            destZone,
            originRegion,
            destRegion,
            currency: 'USD',
            ratePerKg: perKgRate ?? null,
            rateDescription: perKgRate != null ? `$${perKgRate} USD per kg` : 'Rate not available for this route',
            ratePerPiece: ratePerPiece != null ? ratePerPiece : undefined,
            pieceCurrency: ratePerPiece != null ? pieceCurrency : undefined,
            referToFSSUP: perKgRate == null,
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
        const o = origin.toUpperCase();
        const d = destination.toUpperCase();
        const isLcaMla = (o === 'LCA' && d === 'MLA') || (o === 'MLA' && d === 'LCA');
        if (isLcaMla) {
            return {
                airline: 'OAL',
                origin: o,
                destination: d,
                originZone,
                destZone,
                originRegion: 'EUROPE',
                destRegion: 'EUROPE',
                currency: 'USD',
                ratePerKg: 15,
                rateDescription: '$15 USD per kg (Larnaca–Malta)',
                carrierName: 'Other Airlines (OAL)',
                note: 'Using EK/OAL interline rates',
                isLarnacaMaltaException: true
            };
        }
        const originRegion = getEKRegionForAirport(origin);
        const destRegion = getEKRegionForAirport(destination);
        
        if (!originRegion || !destRegion) {
            return {
                error: `Region not found for ${o} or ${d}`,
                origin: o,
                destination: d
            };
        }
        
        const perKgRate = EK_OAL_EXCESS_RATES_PER_KG[originRegion] && 
                         EK_OAL_EXCESS_RATES_PER_KG[originRegion][destRegion];
        const pieceOrigin = CANADA_AIRPORT_CODES.includes(o) ? 'CANADA' : originRegion;
        const pieceRates = EK_OAL_EXCESS_RATES_PER_PIECE[pieceOrigin];
        const ratePerPiece = pieceRates && pieceRates[destRegion] != null ? pieceRates[destRegion] : null;
        const pieceCurrency = pieceOrigin === 'CANADA' && EK_OAL_EXCESS_RATES_PER_PIECE.CANADA && EK_OAL_EXCESS_RATES_PER_PIECE.CANADA.currency ? 'CAD' : 'USD';
        return {
            airline: 'OAL',
            origin: o,
            destination: d,
            originZone,
            destZone,
            originRegion,
            destRegion,
            currency: 'USD',
            ratePerKg: perKgRate ?? null,
            rateDescription: perKgRate != null ? `$${perKgRate} USD per kg` : 'Rate not available for this route',
            ratePerPiece: ratePerPiece != null ? ratePerPiece : undefined,
            pieceCurrency: ratePerPiece != null ? pieceCurrency : undefined,
            referToFSSUP: perKgRate == null,
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
export function getGoShowFare(origin, classType = 'ECONOMY', currency = null) {
    const originCode = origin.toUpperCase();
    const fare = GOSHOW_FARES[classType] && GOSHOW_FARES[classType][originCode];
    
    if (!fare) {
        return {
            error: `Go-Show fare not available for ${originCode} in ${classType} class`
        };
    }
    
    const requestedCurrency = currency || getCurrencyForDestination(originCode);
    const altFare = fare.alt && fare.alt[requestedCurrency];
    const useAlt = altFare && requestedCurrency in fare.alt;
    
    return {
        origin: originCode,
        classType,
        currency: useAlt ? requestedCurrency : fare.currency,
        adult: useAlt ? altFare.adult : fare.adult,
        infant: useAlt ? altFare.infant : fare.infant,
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

// Get Extra Legroom rate (from PDF pages 26-29)
export function getExtraLegroomRate(currency) {
    const rates = EXTRA_LEGROOM_RATES[currency];
    if (!rates) {
        return {
            error: `Extra Legroom rates not available for currency ${currency}`
        };
    }
    return {
        currency,
        airport: rates.airport,
        onBoard: rates.onBoard,
        currencyExchange: rates.currencyExchange != null ? rates.currencyExchange : null,
        description: 'Extra Legroom (XLGR) seats'
    };
}

export function getExtraLegroomCurrencies() {
    return Object.keys(EXTRA_LEGROOM_RATES).sort();
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
    if (['LHR', 'LGW', 'STN', 'LTN', 'MAN', 'CDG', 'ORY', 'NCE', 'FRA', 'MUC', 'AMS', 'BRU', 'ZRH', 'BSL', 'VIE', 'SZG', 'FCO', 'MXP', 'MAD', 'BCN', 'IST', 'SAW', 'AYT', 'ADB', 'ESB', 'TZX', 'BJV', 'SVO', 'DME', 'VKO', 'LED', 'AER', 'KUF', 'KZN', 'MCX', 'MRV', 'OVB', 'UFA', 'VOG', 'SVX', 'KRR', 'ROV', 'PEE', 'ZIA', 'WAW', 'KRK', 'POZ', 'PRG', 'BUD', 'OTP', 'CLJ', 'SOF', 'BEG', 'ZAG', 'DBV', 'SJJ', 'TIA', 'SKP', 'LJU', 'ATH', 'SKG', 'JMK', 'JTR', 'CFU', 'VNO', 'RIX', 'TLL', 'HEL', 'CTA', 'NAP', 'PSA', 'BGY', 'OLB', 'CAG', 'MLA', 'LCA', 'TIV', 'BTS', 'KBP', 'IEV', 'ODS', 'MSQ'].includes(code)) {
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

// EK/OAL Excess Baggage Rates per KG (USD) – Page 4: Middle East/South Asia, Africa, Far East, Europe, Australia & New Zealand
// *$15 per kg for travel between Larnaca (LCA) and Malta (MLA) – applied in calculateExcessBaggageRate
const EK_OAL_EXCESS_RATES_PER_KG = {
    'ME': {
        'ME': 15,
        'WAIO': 15,
        'AFRICA': 25,
        'EUROPE': 25,
        'FAREAST': 25,
        'ANZ': 40,
        'AMERICAS': null
    },
    'WAIO': {
        'ME': 15,
        'WAIO': 15,
        'AFRICA': 25,
        'EUROPE': 25,
        'FAREAST': 25,
        'ANZ': 40,
        'AMERICAS': null
    },
    'AFRICA': {
        'ME': 15,
        'WAIO': 15,
        'AFRICA': 25,
        'EUROPE': 25,
        'FAREAST': 25,
        'ANZ': 40,
        'AMERICAS': null
    },
    'EUROPE': {
        'ME': 25,
        'WAIO': 25,
        'AFRICA': 30,
        'EUROPE': 40,
        'FAREAST': 30,
        'ANZ': 50,
        'AMERICAS': null
    },
    'FAREAST': {
        'ME': 25,
        'WAIO': 25,
        'AFRICA': 30,
        'EUROPE': 30,
        'FAREAST': 15,
        'ANZ': 30,
        'AMERICAS': null
    },
    'ANZ': {
        'ME': 40,
        'WAIO': 40,
        'AFRICA': 50,
        'EUROPE': 50,
        'FAREAST': 30,
        'ANZ': 15,
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

// Canadian airport codes – for EK/OAL per-piece (CAD)
const CANADA_AIRPORT_CODES = ['YYZ', 'YVR', 'YUL', 'YYC', 'YOW', 'YHZ', 'YEG'];

// India airport codes (FZ zone 6) – for India excess baggage note
const INDIA_AIRPORT_CODES = ['AMD', 'BOM', 'BLR', 'CCJ', 'CCU', 'COK', 'DEL', 'HYD', 'LKO', 'MAA', 'TRV', 'GOI'];

// EK/OAL Excess Baggage Rates per Piece (USD / CAD for Canada)
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

