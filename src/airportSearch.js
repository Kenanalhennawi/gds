

import { translateCity } from "./translator.js";

const AIRPORT_DATA = {

    'DXB': { code: 'DXB', city: 'Dubai', country: 'United Arab Emirates', name: 'Dubai (Intl)' },
    'DWC': { code: 'DWC', city: 'Dubai', country: 'United Arab Emirates', name: 'Dubai (World Central)' },
    'AUH': { code: 'AUH', city: 'Abu Dhabi', country: 'United Arab Emirates', name: 'Abu Dhabi' },
    'SHJ': { code: 'SHJ', city: 'Sharjah', country: 'United Arab Emirates', name: 'Sharjah' },

    'RUH': { code: 'RUH', city: 'Riyadh', country: 'Saudi Arabia', name: 'Riyadh' },
    'JED': { code: 'JED', city: 'Jeddah', country: 'Saudi Arabia', name: 'Jeddah' },
    'DMM': { code: 'DMM', city: 'Dammam', country: 'Saudi Arabia', name: 'Dammam' },
    'MED': { code: 'MED', city: 'Madinah', country: 'Saudi Arabia', name: 'Madinah' },
    'AHB': { code: 'AHB', city: 'Abha', country: 'Saudi Arabia', name: 'Abha' },
    'ELQ': { code: 'ELQ', city: 'Gassim', country: 'Saudi Arabia', name: 'Gassim' },
    'TIF': { code: 'TIF', city: 'Taif', country: 'Saudi Arabia', name: 'Taif' },
    'TUU': { code: 'TUU', city: 'Tabuk', country: 'Saudi Arabia', name: 'Tabuk' },
    'HAS': { code: 'HAS', city: 'Hail', country: 'Saudi Arabia', name: 'Hail' },
    'YNB': { code: 'YNB', city: 'Yanbu', country: 'Saudi Arabia', name: 'Yanbu' },
    'AJF': { code: 'AJF', city: 'Al Jouf', country: 'Saudi Arabia', name: 'Al Jouf' },
    'AQI': { code: 'AQI', city: 'Qaisumah', country: 'Saudi Arabia', name: 'Qaisumah' },
    'EAM': { code: 'EAM', city: 'Najran', country: 'Saudi Arabia', name: 'Najran' },
    'GIZ': { code: 'GIZ', city: 'Gizan', country: 'Saudi Arabia', name: 'Gizan' },
    'HOF': { code: 'HOF', city: 'Al Ahsa', country: 'Saudi Arabia', name: 'Al Ahsa' },
    'NUM': { code: 'NUM', city: 'Neom', country: 'Saudi Arabia', name: 'Neom' },
    'RSI': { code: 'RSI', city: 'Ras Tanura', country: 'Saudi Arabia', name: 'Ras Tanura' },
    'ULH': { code: 'ULH', city: 'Al Ula', country: 'Saudi Arabia', name: 'Al Ula' },

    'DOH': { code: 'DOH', city: 'Doha', country: 'Qatar', name: 'Doha' },

    'KWI': { code: 'KWI', city: 'Kuwait', country: 'Kuwait', name: 'Kuwait' },

    'BAH': { code: 'BAH', city: 'Bahrain', country: 'Bahrain', name: 'Bahrain' },

    'MCT': { code: 'MCT', city: 'Muscat', country: 'Oman', name: 'Muscat' },
    'SLL': { code: 'SLL', city: 'Salalah', country: 'Oman', name: 'Salalah' },
    'OHS': { code: 'OHS', city: 'Sohar', country: 'Oman', name: 'Sohar' },

    'AMM': { code: 'AMM', city: 'Amman', country: 'Jordan', name: 'Amman' },
    'AQJ': { code: 'AQJ', city: 'Aqaba', country: 'Jordan', name: 'Aqaba' },

    'BEY': { code: 'BEY', city: 'Beirut', country: 'Lebanon', name: 'Beirut' },

    'DAM': { code: 'DAM', city: 'Damascus', country: 'Syria', name: 'Damascus' },
    'ALP': { code: 'ALP', city: 'Aleppo', country: 'Syria', name: 'Aleppo' },
    'LTK': { code: 'LTK', city: 'Latakia', country: 'Syria', name: 'Latakia' },

    'BGW': { code: 'BGW', city: 'Baghdad', country: 'Iraq', name: 'Baghdad' },
    'BSR': { code: 'BSR', city: 'Basra', country: 'Iraq', name: 'Basra' },
    'EBL': { code: 'EBL', city: 'Erbil', country: 'Iraq', name: 'Erbil' },
    'ISU': { code: 'ISU', city: 'Sulaymaniyah', country: 'Iraq', name: 'Sulaymaniyah' },
    'NJF': { code: 'NJF', city: 'Najaf', country: 'Iraq', name: 'Najaf' },

    'IKA': { code: 'IKA', city: 'Tehran', country: 'Iran', name: 'Tehran (Imam Khomeini)' },
    'THR': { code: 'THR', city: 'Tehran', country: 'Iran', name: 'Tehran (Mehrabad)' },
    'MHD': { code: 'MHD', city: 'Mashhad', country: 'Iran', name: 'Mashhad' },
    'SYZ': { code: 'SYZ', city: 'Shiraz', country: 'Iran', name: 'Shiraz' },
    'IFN': { code: 'IFN', city: 'Isfahan', country: 'Iran', name: 'Isfahan' },
    'TBZ': { code: 'TBZ', city: 'Tabriz', country: 'Iran', name: 'Tabriz' },
    'KIH': { code: 'KIH', city: 'Kish Island', country: 'Iran', name: 'Kish Island' },
    'KER': { code: 'KER', city: 'Kerman', country: 'Iran', name: 'Kerman' },
    'GSM': { code: 'GSM', city: 'Qeshm', country: 'Iran', name: 'Qeshm' },
    'LRR': { code: 'LRR', city: 'Lar', country: 'Iran', name: 'Lar' },
    'BUZ': { code: 'BUZ', city: 'Bushehr', country: 'Iran', name: 'Bushehr' },
    'AWZ': { code: 'AWZ', city: 'Ahwaz', country: 'Iran', name: 'Ahwaz' },
    'HDM': { code: 'HDM', city: 'Hamadan', country: 'Iran', name: 'Hamadan' },
    'BND': { code: 'BND', city: 'Bandar Abbas', country: 'Iran', name: 'Bandar Abbas' },

    'ADE': { code: 'ADE', city: 'Aden', country: 'Yemen', name: 'Aden' },
    'SAH': { code: 'SAH', city: 'Sanaa', country: 'Yemen', name: 'Sanaa' },

    'TLV': { code: 'TLV', city: 'Tel Aviv', country: 'Israel', name: 'Tel Aviv' },

    'CAI': { code: 'CAI', city: 'Cairo', country: 'Egypt', name: 'Cairo' },
    'HBE': { code: 'HBE', city: 'Alexandria', country: 'Egypt', name: 'Alexandria' },
    'SSH': { code: 'SSH', city: 'Sharm El Sheikh', country: 'Egypt', name: 'Sharm El Sheikh' },
    'LXR': { code: 'LXR', city: 'Luxor', country: 'Egypt', name: 'Luxor' },
    'HRG': { code: 'HRG', city: 'Hurghada', country: 'Egypt', name: 'Hurghada' },
    'SPX': { code: 'SPX', city: 'Sphinx', country: 'Egypt', name: 'Sphinx' },
    'DBB': { code: 'DBB', city: 'Dahab', country: 'Egypt', name: 'Dahab' },
    'HMB': { code: 'HMB', city: 'Sohag', country: 'Egypt', name: 'Sohag' },

    'DEL': { code: 'DEL', city: 'Delhi', country: 'India', name: 'Delhi' },
    'BOM': { code: 'BOM', city: 'Mumbai', country: 'India', name: 'Mumbai' },
    'BLR': { code: 'BLR', city: 'Bangalore', country: 'India', name: 'Bangalore' },
    'MAA': { code: 'MAA', city: 'Chennai', country: 'India', name: 'Chennai' },
    'HYD': { code: 'HYD', city: 'Hyderabad', country: 'India', name: 'Hyderabad' },
    'COK': { code: 'COK', city: 'Kochi', country: 'India', name: 'Kochi' },
    'CCJ': { code: 'CCJ', city: 'Kozhikode', country: 'India', name: 'Kozhikode' },
    'TRV': { code: 'TRV', city: 'Thiruvananthapuram', country: 'India', name: 'Thiruvananthapuram' },
    'CCU': { code: 'CCU', city: 'Kolkata', country: 'India', name: 'Kolkata' },
    'AMD': { code: 'AMD', city: 'Ahmedabad', country: 'India', name: 'Ahmedabad' },
    'LKO': { code: 'LKO', city: 'Lucknow', country: 'India', name: 'Lucknow' },
    'GOI': { code: 'GOI', city: 'Goa', country: 'India', name: 'Goa' },

    'KHI': { code: 'KHI', city: 'Karachi', country: 'Pakistan', name: 'Karachi' },
    'LHE': { code: 'LHE', city: 'Lahore', country: 'Pakistan', name: 'Lahore' },
    'ISB': { code: 'ISB', city: 'Islamabad', country: 'Pakistan', name: 'Islamabad' },
    'PEW': { code: 'PEW', city: 'Peshawar', country: 'Pakistan', name: 'Peshawar' },
    'SKT': { code: 'SKT', city: 'Sialkot', country: 'Pakistan', name: 'Sialkot' },
    'MUX': { code: 'MUX', city: 'Multan', country: 'Pakistan', name: 'Multan' },
    'LYP': { code: 'LYP', city: 'Faisalabad', country: 'Pakistan', name: 'Faisalabad' },
    'UET': { code: 'UET', city: 'Quetta', country: 'Pakistan', name: 'Quetta' },

    'DAC': { code: 'DAC', city: 'Dhaka', country: 'Bangladesh', name: 'Dhaka' },
    'CGP': { code: 'CGP', city: 'Chittagong', country: 'Bangladesh', name: 'Chittagong' },

    'KTM': { code: 'KTM', city: 'Kathmandu', country: 'Nepal', name: 'Kathmandu' },
    'BWA': { code: 'BWA', city: 'Bhairahawa', country: 'Nepal', name: 'Bhairahawa' },

    'CMB': { code: 'CMB', city: 'Colombo', country: 'Sri Lanka', name: 'Colombo' },

    'KBL': { code: 'KBL', city: 'Kabul', country: 'Afghanistan', name: 'Kabul' },

    'BKK': { code: 'BKK', city: 'Bangkok', country: 'Thailand', name: 'Bangkok (Suvarnabhumi)' },
    'DMK': { code: 'DMK', city: 'Bangkok', country: 'Thailand', name: 'Bangkok (Don Mueang)' },
    'HKT': { code: 'HKT', city: 'Phuket', country: 'Thailand', name: 'Phuket' },
    'CNX': { code: 'CNX', city: 'Chiang Mai', country: 'Thailand', name: 'Chiang Mai' },
    'KBV': { code: 'KBV', city: 'Krabi', country: 'Thailand', name: 'Krabi' },
    'UTP': { code: 'UTP', city: 'Pattaya', country: 'Thailand', name: 'Pattaya' },

    'KUL': { code: 'KUL', city: 'Kuala Lumpur', country: 'Malaysia', name: 'Kuala Lumpur' },
    'LGK': { code: 'LGK', city: 'Langkawi', country: 'Malaysia', name: 'Langkawi' },
    'PEN': { code: 'PEN', city: 'Penang', country: 'Malaysia', name: 'Penang' },

    'MLE': { code: 'MLE', city: 'Male', country: 'Maldives', name: 'Male' },
    'GAN': { code: 'GAN', city: 'Gan', country: 'Maldives', name: 'Gan' },

    'TAS': { code: 'TAS', city: 'Tashkent', country: 'Uzbekistan', name: 'Tashkent' },
    'ALA': { code: 'ALA', city: 'Almaty', country: 'Kazakhstan', name: 'Almaty' },
    'NQZ': { code: 'NQZ', city: 'Astana', country: 'Kazakhstan', name: 'Astana' },
    'CIT': { code: 'CIT', city: 'Shymkent', country: 'Kazakhstan', name: 'Shymkent' },
    'TSE': { code: 'TSE', city: 'Astana', country: 'Kazakhstan', name: 'Astana' },
    'DYU': { code: 'DYU', city: 'Dushanbe', country: 'Tajikistan', name: 'Dushanbe' },
    'ASB': { code: 'ASB', city: 'Ashgabat', country: 'Turkmenistan', name: 'Ashgabat' },
    'FRU': { code: 'FRU', city: 'Bishkek', country: 'Kyrgyzstan', name: 'Bishkek' },
    'BSZ': { code: 'BSZ', city: 'Bishkek', country: 'Kyrgyzstan', name: 'Bishkek (same as FRU)' },
    'OSS': { code: 'OSS', city: 'Osh', country: 'Kyrgyzstan', name: 'Osh' },
    'GYD': { code: 'GYD', city: 'Baku', country: 'Azerbaijan', name: 'Baku' },
    'GBB': { code: 'GBB', city: 'Guba', country: 'Azerbaijan', name: 'Guba' },
    'EVN': { code: 'EVN', city: 'Yerevan', country: 'Armenia', name: 'Yerevan' },
    'TBS': { code: 'TBS', city: 'Tbilisi', country: 'Georgia', name: 'Tbilisi' },
    'BUS': { code: 'BUS', city: 'Batumi', country: 'Georgia', name: 'Batumi' },
    'GRV': { code: 'GRV', city: 'Grozny', country: 'Russia', name: 'Grozny' },

    'LHR': { code: 'LHR', city: 'London', country: 'United Kingdom', name: 'London (Heathrow)' },
    'LGW': { code: 'LGW', city: 'London', country: 'United Kingdom', name: 'London (Gatwick)' },
    'STN': { code: 'STN', city: 'London', country: 'United Kingdom', name: 'London (Stansted)' },
    'LTN': { code: 'LTN', city: 'London', country: 'United Kingdom', name: 'Luton' },
    'MAN': { code: 'MAN', city: 'Manchester', country: 'United Kingdom', name: 'Manchester' },
    'CDG': { code: 'CDG', city: 'Paris', country: 'France', name: 'Paris (CDG)' },
    'ORY': { code: 'ORY', city: 'Paris', country: 'France', name: 'Paris (Orly)' },
    'NCE': { code: 'NCE', city: 'Nice', country: 'France', name: 'Nice' },
    'FRA': { code: 'FRA', city: 'Frankfurt', country: 'Germany', name: 'Frankfurt' },
    'MUC': { code: 'MUC', city: 'Munich', country: 'Germany', name: 'Munich' },
    'AMS': { code: 'AMS', city: 'Amsterdam', country: 'Netherlands', name: 'Amsterdam' },
    'BRU': { code: 'BRU', city: 'Brussels', country: 'Belgium', name: 'Brussels' },
    'ZRH': { code: 'ZRH', city: 'Zurich', country: 'Switzerland', name: 'Zurich' },
    'BSL': { code: 'BSL', city: 'Basel', country: 'Switzerland', name: 'Basel' },
    'VIE': { code: 'VIE', city: 'Vienna', country: 'Austria', name: 'Vienna' },
    'SZG': { code: 'SZG', city: 'Salzburg', country: 'Austria', name: 'Salzburg' },
    'FCO': { code: 'FCO', city: 'Rome', country: 'Italy', name: 'Rome (Fiumicino)' },
    'MXP': { code: 'MXP', city: 'Milan', country: 'Italy', name: 'Milan (Malpensa)' },
    'MAD': { code: 'MAD', city: 'Madrid', country: 'Spain', name: 'Madrid' },
    'BCN': { code: 'BCN', city: 'Barcelona', country: 'Spain', name: 'Barcelona' },
    'IST': { code: 'IST', city: 'Istanbul', country: 'Turkey', name: 'Istanbul (IST)' },
    'SAW': { code: 'SAW', city: 'Istanbul', country: 'Turkey', name: 'Istanbul (Sabiha)' },
    'AYT': { code: 'AYT', city: 'Antalya', country: 'Turkey', name: 'Antalya' },
    'ADB': { code: 'ADB', city: 'Izmir', country: 'Turkey', name: 'Izmir' },
    'ESB': { code: 'ESB', city: 'Ankara', country: 'Turkey', name: 'Ankara' },
    'TZX': { code: 'TZX', city: 'Trabzon', country: 'Turkey', name: 'Trabzon' },
    'BJV': { code: 'BJV', city: 'Bodrum', country: 'Turkey', name: 'Bodrum' },
    'SVO': { code: 'SVO', city: 'Moscow', country: 'Russia', name: 'Moscow (Sheremetyevo)' },
    'DME': { code: 'DME', city: 'Moscow', country: 'Russia', name: 'Moscow (Domodedovo)' },
    'VKO': { code: 'VKO', city: 'Moscow', country: 'Russia', name: 'Moscow (Vnukovo)' },
    'LED': { code: 'LED', city: 'St. Petersburg', country: 'Russia', name: 'St. Petersburg' },
    'AER': { code: 'AER', city: 'Sochi', country: 'Russia', name: 'Sochi' },
    'KUF': { code: 'KUF', city: 'Samara', country: 'Russia', name: 'Samara' },
    'KZN': { code: 'KZN', city: 'Kazan', country: 'Russia', name: 'Kazan' },
    'MCX': { code: 'MCX', city: 'Makhachkala', country: 'Russia', name: 'Makhachkala' },
    'MRV': { code: 'MRV', city: 'Mineralnye Vody', country: 'Russia', name: 'Mineralnye Vody' },
    'OVB': { code: 'OVB', city: 'Novosibirsk', country: 'Russia', name: 'Novosibirsk' },
    'UFA': { code: 'UFA', city: 'Ufa', country: 'Russia', name: 'Ufa' },
    'VOG': { code: 'VOG', city: 'Volgograd', country: 'Russia', name: 'Volgograd' },
    'SVX': { code: 'SVX', city: 'Yekaterinburg', country: 'Russia', name: 'Yekaterinburg' },
    'KRR': { code: 'KRR', city: 'Krasnodar', country: 'Russia', name: 'Krasnodar' },
    'ROV': { code: 'ROV', city: 'Rostov', country: 'Russia', name: 'Rostov' },
    'PEE': { code: 'PEE', city: 'Perm', country: 'Russia', name: 'Perm' },
    'ZIA': { code: 'ZIA', city: 'Zhukovsky', country: 'Russia', name: 'Zhukovsky' },
    'WAW': { code: 'WAW', city: 'Warsaw', country: 'Poland', name: 'Warsaw' },
    'KRK': { code: 'KRK', city: 'Krakow', country: 'Poland', name: 'Krakow' },
    'POZ': { code: 'POZ', city: 'Poznan', country: 'Poland', name: 'Poznan' },
    'PRG': { code: 'PRG', city: 'Prague', country: 'Czech Republic', name: 'Prague' },
    'BUD': { code: 'BUD', city: 'Budapest', country: 'Hungary', name: 'Budapest' },
    'OTP': { code: 'OTP', city: 'Bucharest', country: 'Romania', name: 'Bucharest' },
    'CLJ': { code: 'CLJ', city: 'Cluj', country: 'Romania', name: 'Cluj' },
    'SOF': { code: 'SOF', city: 'Sofia', country: 'Bulgaria', name: 'Sofia' },
    'BEG': { code: 'BEG', city: 'Belgrade', country: 'Serbia', name: 'Belgrade' },
    'ZAG': { code: 'ZAG', city: 'Zagreb', country: 'Croatia', name: 'Zagreb' },
    'DBV': { code: 'DBV', city: 'Dubrovnik', country: 'Croatia', name: 'Dubrovnik' },
    'SJJ': { code: 'SJJ', city: 'Sarajevo', country: 'Bosnia and Herzegovina', name: 'Sarajevo' },
    'TIA': { code: 'TIA', city: 'Tirana', country: 'Albania', name: 'Tirana' },
    'SKP': { code: 'SKP', city: 'Skopje', country: 'North Macedonia', name: 'Skopje' },
    'LJU': { code: 'LJU', city: 'Ljubljana', country: 'Slovenia', name: 'Ljubljana' },
    'ATH': { code: 'ATH', city: 'Athens', country: 'Greece', name: 'Athens' },
    'SKG': { code: 'SKG', city: 'Thessaloniki', country: 'Greece', name: 'Thessaloniki' },
    'JMK': { code: 'JMK', city: 'Mykonos', country: 'Greece', name: 'Mykonos' },
    'JTR': { code: 'JTR', city: 'Santorini', country: 'Greece', name: 'Santorini' },
    'CFU': { code: 'CFU', city: 'Corfu', country: 'Greece', name: 'Corfu' },
    'VNO': { code: 'VNO', city: 'Vilnius', country: 'Lithuania', name: 'Vilnius' },
    'RIX': { code: 'RIX', city: 'Riga', country: 'Latvia', name: 'Riga' },
    'TLL': { code: 'TLL', city: 'Tallinn', country: 'Estonia', name: 'Tallinn' },
    'HEL': { code: 'HEL', city: 'Helsinki', country: 'Finland', name: 'Helsinki' },
    'CTA': { code: 'CTA', city: 'Catania', country: 'Italy', name: 'Catania' },
    'NAP': { code: 'NAP', city: 'Naples', country: 'Italy', name: 'Naples' },
    'PSA': { code: 'PSA', city: 'Pisa', country: 'Italy', name: 'Pisa' },
    'BGY': { code: 'BGY', city: 'Bergamo', country: 'Italy', name: 'Bergamo' },
    'OLB': { code: 'OLB', city: 'Olbia', country: 'Italy', name: 'Olbia' },
    'CAG': { code: 'CAG', city: 'Cagliari', country: 'Italy', name: 'Cagliari' },
    'MLA': { code: 'MLA', city: 'Malta', country: 'Malta', name: 'Malta' },
    'TIV': { code: 'TIV', city: 'Tivat', country: 'Montenegro', name: 'Tivat' },
    'BTS': { code: 'BTS', city: 'Bratislava', country: 'Slovakia', name: 'Bratislava' },
    'KBP': { code: 'KBP', city: 'Kyiv', country: 'Ukraine', name: 'Kyiv (Boryspil)' },
    'IEV': { code: 'IEV', city: 'Kyiv', country: 'Ukraine', name: 'Kyiv (Zhuliany)' },
    'ODS': { code: 'ODS', city: 'Odessa', country: 'Ukraine', name: 'Odessa' },
    'MSQ': { code: 'MSQ', city: 'Minsk', country: 'Belarus', name: 'Minsk' },

    'ADD': { code: 'ADD', city: 'Addis Ababa', country: 'Ethiopia', name: 'Addis Ababa' },
    'JIB': { code: 'JIB', city: 'Djibouti', country: 'Djibouti', name: 'Djibouti' },
    'ASM': { code: 'ASM', city: 'Asmara', country: 'Eritrea', name: 'Asmara' },
    'NBO': { code: 'NBO', city: 'Nairobi', country: 'Kenya', name: 'Nairobi' },
    'MBA': { code: 'MBA', city: 'Mombasa', country: 'Kenya', name: 'Mombasa' },
    'DAR': { code: 'DAR', city: 'Dar Es Salaam', country: 'Tanzania', name: 'Dar Es Salaam' },
    'JRO': { code: 'JRO', city: 'Kilimanjaro', country: 'Tanzania', name: 'Kilimanjaro' },
    'ZNZ': { code: 'ZNZ', city: 'Zanzibar', country: 'Tanzania', name: 'Zanzibar' },
    'EBB': { code: 'EBB', city: 'Entebbe', country: 'Uganda', name: 'Entebbe' },
    'KGL': { code: 'KGL', city: 'Kigali', country: 'Rwanda', name: 'Kigali' },
    'BJM': { code: 'BJM', city: 'Bujumbura', country: 'Burundi', name: 'Bujumbura' },
    'FIH': { code: 'FIH', city: 'Kinshasa', country: 'DR Congo', name: 'Kinshasa' },
    'JUB': { code: 'JUB', city: 'Juba', country: 'South Sudan', name: 'Juba' },
    'KRT': { code: 'KRT', city: 'Khartoum', country: 'Sudan', name: 'Khartoum' },
    'PZU': { code: 'PZU', city: 'Port Sudan', country: 'Sudan', name: 'Port Sudan' },
    'HGA': { code: 'HGA', city: 'Hargeisa', country: 'Somalia', name: 'Hargeisa' },
    'MGQ': { code: 'MGQ', city: 'Mogadishu', country: 'Somalia', name: 'Mogadishu' },

    'ADE': { code: 'ADE', city: 'Aden', country: 'Yemen', name: 'Aden' },
    'SAH': { code: 'SAH', city: 'Sanaa', country: 'Yemen', name: 'Sanaa' },

    'HRI': { code: 'HRI', city: 'Hambantota', country: 'Sri Lanka', name: 'Hambantota' },
    'KDH': { code: 'KDH', city: 'Kandahar', country: 'Afghanistan', name: 'Kandahar' },
    'GOJ': { code: 'GOJ', city: 'Nizhny Novgorod', country: 'Russia', name: 'Nizhny Novgorod' },
    'KUT': { code: 'KUT', city: 'Kutaisi', country: 'Georgia', name: 'Kutaisi' },
    'MBX': { code: 'MBX', city: 'Maribor', country: 'Slovenia', name: 'Maribor' },
    'NMA': { code: 'NMA', city: 'Namangan', country: 'Uzbekistan', name: 'Namangan' },
    'RGN': { code: 'RGN', city: 'Yangon', country: 'Myanmar', name: 'Yangon' },
    'SKD': { code: 'SKD', city: 'Samarkand', country: 'Uzbekistan', name: 'Samarkand' },
    'TGD': { code: 'TGD', city: 'Podgorica', country: 'Montenegro', name: 'Podgorica' },
    'VOZ': { code: 'VOZ', city: 'Voronezh', country: 'Russia', name: 'Voronezh' },
    'ZYL': { code: 'ZYL', city: 'Sylhet', country: 'Bangladesh', name: 'Sylhet' },
    'DOK': { code: 'DOK', city: 'Donetsk', country: 'Ukraine', name: 'Donetsk' },
    'KIV': { code: 'KIV', city: 'Chisinau', country: 'Moldova', name: 'Chisinau' },

    'YYZ': { code: 'YYZ', city: 'Toronto', country: 'Canada', name: 'Toronto' },
    'YVR': { code: 'YVR', city: 'Vancouver', country: 'Canada', name: 'Vancouver' },
    'YUL': { code: 'YUL', city: 'Montreal', country: 'Canada', name: 'Montreal' },
    'YYC': { code: 'YYC', city: 'Calgary', country: 'Canada', name: 'Calgary' },
    'JFK': { code: 'JFK', city: 'New York', country: 'United States', name: 'New York (JFK)' },
    'LAX': { code: 'LAX', city: 'Los Angeles', country: 'United States', name: 'Los Angeles' },
    'MIA': { code: 'MIA', city: 'Miami', country: 'United States', name: 'Miami' },
    'MEX': { code: 'MEX', city: 'Mexico City', country: 'Mexico', name: 'Mexico City' },
    'CUN': { code: 'CUN', city: 'Cancun', country: 'Mexico', name: 'Cancun' },
    'BOG': { code: 'BOG', city: 'Bogota', country: 'Colombia', name: 'Bogota' },
    'EZE': { code: 'EZE', city: 'Buenos Aires', country: 'Argentina', name: 'Buenos Aires' },
    'SCL': { code: 'SCL', city: 'Santiago', country: 'Chile', name: 'Santiago' },

    'SIN': { code: 'SIN', city: 'Singapore', country: 'Singapore', name: 'Singapore' },
    'KUL': { code: 'KUL', city: 'Kuala Lumpur', country: 'Malaysia', name: 'Kuala Lumpur' },
    'CGK': { code: 'CGK', city: 'Jakarta', country: 'Indonesia', name: 'Jakarta' },
    'DPS': { code: 'DPS', city: 'Bali', country: 'Indonesia', name: 'Bali' },
    'MNL': { code: 'MNL', city: 'Manila', country: 'Philippines', name: 'Manila' },
    'HKG': { code: 'HKG', city: 'Hong Kong', country: 'Hong Kong', name: 'Hong Kong' },
    'PEK': { code: 'PEK', city: 'Beijing', country: 'China', name: 'Beijing (Capital)' },
    'PVG': { code: 'PVG', city: 'Shanghai', country: 'China', name: 'Shanghai (Pudong)' },
    'NRT': { code: 'NRT', city: 'Tokyo', country: 'Japan', name: 'Tokyo (Narita)' },
    'ICN': { code: 'ICN', city: 'Seoul', country: 'South Korea', name: 'Seoul (Incheon)' },
    'SYD': { code: 'SYD', city: 'Sydney', country: 'Australia', name: 'Sydney' },
    'MEL': { code: 'MEL', city: 'Melbourne', country: 'Australia', name: 'Melbourne' },
    'AKL': { code: 'AKL', city: 'Auckland', country: 'New Zealand', name: 'Auckland' }
};

const AIRPORT_LIST = Object.values(AIRPORT_DATA);

let searchIndex = null;

function buildSearchIndex() {
    if (searchIndex) return searchIndex;

    const index = [];
    for (const airport of AIRPORT_LIST) {
        index.push({
            airport,
            searchText: `${airport.code} ${airport.city} ${airport.country} ${airport.name}`.toUpperCase()
        });
    }
    searchIndex = index;
    return searchIndex;
}

export function searchAirports(query, limit = 10) {
    if (!query || query.length < 1) return [];
    
    const searchTerm = query.toUpperCase();
    const index = buildSearchIndex();
    const results = [];

    for (const item of index) {
        if (item.airport.code.startsWith(searchTerm)) {
            results.push(item.airport);
            if (results.length >= limit) return results;
        }
    }

    for (const item of index) {
        if (results.length >= limit) break;
        if (results.includes(item.airport)) continue;
        
        if (item.searchText.includes(searchTerm)) {
            results.push(item.airport);
        }
    }

    results.sort((a, b) => {
        const aCodeMatch = a.code.startsWith(searchTerm);
        const bCodeMatch = b.code.startsWith(searchTerm);
        if (aCodeMatch && !bCodeMatch) return -1;
        if (!aCodeMatch && bCodeMatch) return 1;
        
        const aCityMatch = a.city.toUpperCase().startsWith(searchTerm);
        const bCityMatch = b.city.toUpperCase().startsWith(searchTerm);
        if (aCityMatch && !bCityMatch) return -1;
        if (!aCityMatch && bCityMatch) return 1;
        
        return 0;
    });
    
    return results.slice(0, limit);
}

export function getAirportByCode(code) {
    return AIRPORT_DATA[code.toUpperCase()] || null;
}

export function getAllAirportCodes() {
    return Object.keys(AIRPORT_DATA);
}
