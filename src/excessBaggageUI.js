/**
 * Comprehensive UI for Flydubai Rate Calculator
 * Includes: Excess Baggage, Go-Show Fares, Sports Equipment, Reporting Fees, etc.
 */

import { 
    calculateExcessBaggageRate, 
    getZoneForAirport, 
    getZoneName, 
    getCurrencyForDestination,
    getAllCurrencies,
    getGoShowFare,
    getSportsEquipmentRate,
    getReportingRate,
    getTransferBaggageFee,
    getUpgradeRate
} from "./excessBaggage.js";
import { translateAirline, translateCity } from "./translator.js";

export function renderExcessBaggageCalculator(container) {
    container.innerHTML = `
        <div class="excess-baggage-container">
            <div class="glass-panel" style="margin-bottom:20px;">
                <div style="padding:20px;">
                    <h2 style="font-size:20px; font-weight:800; margin-bottom:10px; color:var(--text-main);">
                        Flydubai Rate Calculator
                    </h2>
                    <p style="color:var(--text-muted); font-size:14px; line-height:1.6; margin-bottom:20px;">
                        Calculate rates for excess baggage, go-show fares, sports equipment, and other services.
                    </p>
                    
                    <!-- Service Tabs -->
                    <div style="display:flex; gap:10px; margin-bottom:20px; border-bottom:2px solid var(--glass-border);">
                        <button class="service-tab active" data-service="excess" style="padding:10px 20px; background:rgba(74,158,255,0.2); border:none; border-bottom:2px solid var(--primary-blue); color:var(--primary-blue); font-weight:600; cursor:pointer; font-size:13px;">
                            Excess Baggage
                        </button>
                        <button class="service-tab" data-service="goshow" style="padding:10px 20px; background:transparent; border:none; color:var(--text-muted); font-weight:600; cursor:pointer; font-size:13px;">
                            Go-Show Fares
                        </button>
                        <button class="service-tab" data-service="sports" style="padding:10px 20px; background:transparent; border:none; color:var(--text-muted); font-weight:600; cursor:pointer; font-size:13px;">
                            Sports Equipment
                        </button>
                        <button class="service-tab" data-service="reporting" style="padding:10px 20px; background:transparent; border:none; color:var(--text-muted); font-weight:600; cursor:pointer; font-size:13px;">
                            Reporting Fees
                        </button>
                        <button class="service-tab" data-service="transfer" style="padding:10px 20px; background:transparent; border:none; color:var(--text-muted); font-weight:600; cursor:pointer; font-size:13px;">
                            Transfer Baggage
                        </button>
                        <button class="service-tab" data-service="upgrade" style="padding:10px 20px; background:transparent; border:none; color:var(--text-muted); font-weight:600; cursor:pointer; font-size:13px;">
                            Upgrade to Business
                        </button>
                    </div>
                    
                    <!-- Excess Baggage Section -->
                    <div id="excessSection" class="service-section">
                        <div style="display:grid; grid-template-columns:1fr 1fr 1fr 1fr; gap:15px; margin-bottom:20px;">
                            <div>
                                <label style="display:block; font-weight:600; margin-bottom:8px; color:var(--text-main);">
                                    Origin Airport
                                </label>
                                <input 
                                    type="text" 
                                    id="originInput" 
                                    placeholder="e.g., DXB, TAS, DEL"
                                    maxlength="3"
                                    style="width:100%; padding:12px; background:rgba(0,0,0,0.3); border:1px solid var(--glass-border); border-radius:8px; color:var(--text-main); font-family:var(--font-code); font-size:14px; text-transform:uppercase; outline:none;"
                                />
                                <div id="originInfo" style="margin-top:5px; font-size:11px; color:var(--text-muted);"></div>
                            </div>
                            
                            <div>
                                <label style="display:block; font-weight:600; margin-bottom:8px; color:var(--text-main);">
                                    Destination Airport
                                </label>
                                <input 
                                    type="text" 
                                    id="destinationInput" 
                                    placeholder="e.g., DXB, YYZ, LHR"
                                    maxlength="3"
                                    style="width:100%; padding:12px; background:rgba(0,0,0,0.3); border:1px solid var(--glass-border); border-radius:8px; color:var(--text-main); font-family:var(--font-code); font-size:14px; text-transform:uppercase; outline:none;"
                                />
                                <div id="destinationInfo" style="margin-top:5px; font-size:11px; color:var(--text-muted);"></div>
                            </div>
                            
                            <div>
                                <label style="display:block; font-weight:600; margin-bottom:8px; color:var(--text-main);">
                                    Airline
                                </label>
                                <select 
                                    id="airlineSelect"
                                    style="width:100%; padding:12px; background:rgba(0,0,0,0.3); border:1px solid var(--glass-border); border-radius:8px; color:var(--text-main); font-size:14px; outline:none; cursor:pointer;"
                                >
                                    <option value="FZ">Flydubai (FZ)</option>
                                    <option value="EK">Emirates (EK)</option>
                                    <option value="AC">Air Canada (AC)</option>
                                    <option value="UA">United Airlines (UA)</option>
                                </select>
                            </div>
                            
                            <div>
                                <label style="display:block; font-weight:600; margin-bottom:8px; color:var(--text-main);">
                                    Currency
                                </label>
                                <select 
                                    id="currencySelect"
                                    style="width:100%; padding:12px; background:rgba(0,0,0,0.3); border:1px solid var(--glass-border); border-radius:8px; color:var(--text-main); font-size:14px; outline:none; cursor:pointer;"
                                >
                                    <option value="AUTO">Auto (by destination)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Go-Show Section -->
                    <div id="goshowSection" class="service-section" style="display:none;">
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:20px;">
                            <div>
                                <label style="display:block; font-weight:600; margin-bottom:8px; color:var(--text-main);">
                                    Origin Airport
                                </label>
                                <input 
                                    type="text" 
                                    id="goshowOrigin" 
                                    placeholder="e.g., TAS, DEL, AMM"
                                    maxlength="3"
                                    style="width:100%; padding:12px; background:rgba(0,0,0,0.3); border:1px solid var(--glass-border); border-radius:8px; color:var(--text-main); font-family:var(--font-code); font-size:14px; text-transform:uppercase; outline:none;"
                                />
                            </div>
                            <div>
                                <label style="display:block; font-weight:600; margin-bottom:8px; color:var(--text-main);">
                                    Class
                                </label>
                                <select 
                                    id="goshowClass"
                                    style="width:100%; padding:12px; background:rgba(0,0,0,0.3); border:1px solid var(--glass-border); border-radius:8px; color:var(--text-main); font-size:14px; outline:none; cursor:pointer;"
                                >
                                    <option value="ECONOMY">Economy</option>
                                    <option value="BUSINESS">Business</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Sports Equipment Section -->
                    <div id="sportsSection" class="service-section" style="display:none;">
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:20px;">
                            <div>
                                <label style="display:block; font-weight:600; margin-bottom:8px; color:var(--text-main);">
                                    Currency
                                </label>
                                <select 
                                    id="sportsCurrency"
                                    style="width:100%; padding:12px; background:rgba(0,0,0,0.3); border:1px solid var(--glass-border); border-radius:8px; color:var(--text-main); font-size:14px; outline:none; cursor:pointer;"
                                >
                                    <option value="AED">AED - UAE Dirham</option>
                                </select>
                            </div>
                            <div>
                                <label style="display:block; font-weight:600; margin-bottom:8px; color:var(--text-main);">
                                    Equipment Type
                                </label>
                                <select 
                                    id="sportsType"
                                    style="width:100%; padding:12px; background:rgba(0,0,0,0.3); border:1px solid var(--glass-border); border-radius:8px; color:var(--text-main); font-size:14px; outline:none; cursor:pointer;"
                                >
                                    <option value="SPEQ">SPEQ - Standard</option>
                                    <option value="SPEX">SPEX - Oversized</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Reporting Section -->
                    <div id="reportingSection" class="service-section" style="display:none;">
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:20px;">
                            <div>
                                <label style="display:block; font-weight:600; margin-bottom:8px; color:var(--text-main);">
                                    Currency
                                </label>
                                <select 
                                    id="reportingCurrency"
                                    style="width:100%; padding:12px; background:rgba(0,0,0,0.3); border:1px solid var(--glass-border); border-radius:8px; color:var(--text-main); font-size:14px; outline:none; cursor:pointer;"
                                >
                                    <option value="AED">AED - UAE Dirham</option>
                                </select>
                            </div>
                            <div>
                                <label style="display:block; font-weight:600; margin-bottom:8px; color:var(--text-main);">
                                    Fee Type
                                </label>
                                <select 
                                    id="reportingType"
                                    style="width:100%; padding:12px; background:rgba(0,0,0,0.3); border:1px solid var(--glass-border); border-radius:8px; color:var(--text-main); font-size:14px; outline:none; cursor:pointer;"
                                >
                                    <option value="LRTP">LRTP - Late Reporting</option>
                                    <option value="ERTP">ERTP - Early Reporting</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Transfer Section -->
                    <div id="transferSection" class="service-section" style="display:none;">
                        <div style="margin-bottom:20px;">
                            <label style="display:block; font-weight:600; margin-bottom:8px; color:var(--text-main);">
                                Location
                            </label>
                            <select 
                                id="transferLocation"
                                style="width:100%; padding:12px; background:rgba(0,0,0,0.3); border:1px solid var(--glass-border); border-radius:8px; color:var(--text-main); font-size:14px; outline:none; cursor:pointer;"
                            >
                                <option value="DXB">DXB - Dubai</option>
                                <option value="OUTSTATION">Outstation</option>
                            </select>
                        </div>
                    </div>
                    
                    <!-- Upgrade Section -->
                    <div id="upgradeSection" class="service-section" style="display:none;">
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:20px;">
                            <div>
                                <label style="display:block; font-weight:600; margin-bottom:8px; color:var(--text-main);">
                                    Origin Airport
                                </label>
                                <input 
                                    type="text" 
                                    id="upgradeOrigin" 
                                    placeholder="e.g., DXB, TAS, DEL"
                                    maxlength="3"
                                    style="width:100%; padding:12px; background:rgba(0,0,0,0.3); border:1px solid var(--glass-border); border-radius:8px; color:var(--text-main); font-family:var(--font-code); font-size:14px; text-transform:uppercase; outline:none;"
                                />
                            </div>
                            <div>
                                <label style="display:block; font-weight:600; margin-bottom:8px; color:var(--text-main);">
                                    Currency
                                </label>
                                <select 
                                    id="upgradeCurrency"
                                    style="width:100%; padding:12px; background:rgba(0,0,0,0.3); border:1px solid var(--glass-border); border-radius:8px; color:var(--text-main); font-size:14px; outline:none; cursor:pointer;"
                                >
                                    <option value="AED">AED - UAE Dirham</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <button id="calculateBtn" class="btn-primary" style="width:100%; margin-bottom:20px;">
                        Calculate
                    </button>
                    
                    <div id="rateResult" style="display:none;"></div>
                </div>
            </div>
        </div>
    `;
    
    // Initialize currency dropdowns
    const currencies = getAllCurrencies();
    const currencySelects = ['currencySelect', 'sportsCurrency', 'reportingCurrency', 'upgradeCurrency'];
    currencySelects.forEach(selectId => {
        const select = container.querySelector(`#${selectId}`);
        if (select) {
            currencies.forEach(curr => {
                const option = document.createElement('option');
                option.value = curr;
                option.textContent = curr;
                if (selectId === 'currencySelect') {
                    select.appendChild(option);
                } else {
                    select.appendChild(option.cloneNode(true));
                }
            });
        }
    });
    
    // Add upgrade currencies (including PKR, BYN, etc.)
    const upgradeCurrencies = ['AED', 'PKR', 'BHD', 'BYN', 'CHF', 'CZK', 'EGP', 'EUR', 'HUF', 'INR', 'JOD', 'KWD', 'KZT', 'LBP', 'LKR', 'MYR', 'NPR', 'OMR', 'PLN', 'QAR', 'RUB', 'SAR', 'TJS', 'THB', 'USD', 'UZS', 'IRR'];
    const upgradeSelect = container.querySelector('#upgradeCurrency');
    if (upgradeSelect) {
        upgradeSelect.innerHTML = '';
        upgradeCurrencies.forEach(curr => {
            const option = document.createElement('option');
            option.value = curr;
            option.textContent = curr;
            upgradeSelect.appendChild(option);
        });
    }
    
    // Tab switching
    const tabs = container.querySelectorAll('.service-tab');
    const sections = container.querySelectorAll('.service-section');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const service = tab.dataset.service;
            
            // Update tabs
            tabs.forEach(t => {
                t.classList.remove('active');
                t.style.background = 'transparent';
                t.style.borderBottom = 'none';
                t.style.color = 'var(--text-muted)';
            });
            tab.classList.add('active');
            tab.style.background = 'rgba(74,158,255,0.2)';
            tab.style.borderBottom = '2px solid var(--primary-blue)';
            tab.style.color = 'var(--primary-blue)';
            
            // Update sections
            sections.forEach(s => s.style.display = 'none');
            const activeSection = container.querySelector(`#${service}Section`);
            if (activeSection) activeSection.style.display = 'block';
        });
    });
    
    // Input handlers
    const originInput = container.querySelector('#originInput');
    const destInput = container.querySelector('#destinationInput');
    const airlineSelect = container.querySelector('#airlineSelect');
    const currencySelect = container.querySelector('#currencySelect');
    const btn = container.querySelector('#calculateBtn');
    const resultDiv = container.querySelector('#rateResult');
    const originInfo = container.querySelector('#originInfo');
    const destInfo = container.querySelector('#destinationInfo');
    
    // Auto-update info
    originInput.addEventListener('input', () => {
        const code = originInput.value.toUpperCase();
        if (code.length === 3) {
            const city = translateCity(code);
            const zone = getZoneForAirport(code);
            originInfo.textContent = city !== code ? `${city} - ${zone ? getZoneName(zone) : 'Zone not found'}` : '';
        } else {
            originInfo.textContent = '';
        }
    });
    
    destInput.addEventListener('input', () => {
        const code = destInput.value.toUpperCase();
        if (code.length === 3) {
            const city = translateCity(code);
            const zone = getZoneForAirport(code);
            const currency = getCurrencyForDestination(code);
            destInfo.textContent = city !== code ? `${city} - ${zone ? getZoneName(zone) : 'Zone not found'} (${currency})` : '';
            // Update currency select if auto
            if (currencySelect.value === 'AUTO') {
                currencySelect.value = currency;
            }
        } else {
            destInfo.textContent = '';
        }
    });
    
    // Calculate button
    btn.addEventListener('click', () => {
        const activeTab = container.querySelector('.service-tab.active');
        const service = activeTab ? activeTab.dataset.service : 'excess';
        
        try {
            let result;
            
            if (service === 'excess') {
                const origin = originInput.value.trim().toUpperCase();
                const destination = destInput.value.trim().toUpperCase();
                const airline = airlineSelect.value;
                const currency = currencySelect.value === 'AUTO' ? null : currencySelect.value;
                
                if (!origin || origin.length !== 3 || !destination || destination.length !== 3) {
                    showError(resultDiv, 'Please enter valid 3-letter airport codes for origin and destination.');
                    return;
                }
                
                result = calculateExcessBaggageRate(origin, destination, airline, currency);
            } else if (service === 'goshow') {
                const origin = container.querySelector('#goshowOrigin').value.trim().toUpperCase();
                const classType = container.querySelector('#goshowClass').value;
                
                if (!origin || origin.length !== 3) {
                    showError(resultDiv, 'Please enter a valid 3-letter origin airport code.');
                    return;
                }
                
                result = getGoShowFare(origin, classType);
            } else if (service === 'sports') {
                const currency = container.querySelector('#sportsCurrency').value;
                const type = container.querySelector('#sportsType').value;
                
                result = getSportsEquipmentRate(currency, type);
            } else if (service === 'reporting') {
                const currency = container.querySelector('#reportingCurrency').value;
                const type = container.querySelector('#reportingType').value;
                
                result = getReportingRate(currency, type);
            } else if (service === 'transfer') {
                const location = container.querySelector('#transferLocation').value;
                
                result = getTransferBaggageFee(location);
            } else if (service === 'upgrade') {
                const origin = container.querySelector('#upgradeOrigin').value.trim().toUpperCase();
                const currency = container.querySelector('#upgradeCurrency').value;
                
                if (!origin || origin.length !== 3) {
                    showError(resultDiv, 'Please enter a valid 3-letter origin airport code.');
                    return;
                }
                
                result = getUpgradeRate(origin, currency);
            }
            
            displayResult(resultDiv, result, service);
        } catch (e) {
            console.error(e);
            showError(resultDiv, `Error: ${e.message}`);
        }
    });
}

function showError(container, message) {
    container.style.display = 'block';
    container.innerHTML = `
        <div class="glass-panel" style="margin-top:20px;">
            <div style="padding:20px;">
                <div style="padding:15px; background:rgba(248,113,113,0.1); border-radius:8px; border-left:3px solid var(--error-red); color:var(--text-main);">
                    ${message}
                </div>
            </div>
        </div>
    `;
}

function displayResult(container, result, service) {
    container.style.display = 'block';
    
    if (result.error) {
        showError(container, result.error);
        return;
    }
    
    let html = `<div class="glass-panel" style="margin-top:20px;"><div style="padding:20px;">`;
    
    if (service === 'excess') {
        html += displayExcessBaggageResult(result);
    } else if (service === 'goshow') {
        html += displayGoShowResult(result);
    } else if (service === 'sports') {
        html += displaySportsResult(result);
    } else if (service === 'reporting') {
        html += displayReportingResult(result);
    } else if (service === 'transfer') {
        html += displayTransferResult(result);
    } else if (service === 'upgrade') {
        html += displayUpgradeResult(result);
    }
    
    html += `</div></div>`;
    container.innerHTML = html;
}

function displayUpgradeResult(result) {
    const originCity = translateCity(result.origin);
    
    return `
        <div style="font-weight:700; font-size:18px; margin-bottom:15px; color:var(--info-blue);">
            ✓ Upgrade to Business Class
        </div>
        
        <div style="background:rgba(0,0,0,0.2); padding:15px; border-radius:8px; margin-bottom:15px;">
            <div style="font-weight:600; margin-bottom:5px; color:var(--text-muted); font-size:12px;">Origin</div>
            <div style="font-size:16px; color:var(--text-main);">
                ${result.origin} ${originCity !== result.origin ? `(${originCity})` : ''}
            </div>
            <div style="font-size:12px; color:var(--text-muted); margin-top:3px;">
                Zone ${result.zone}
            </div>
        </div>
        
        <div style="background:rgba(96,165,250,0.1); padding:15px; border-radius:8px; border-left:3px solid var(--info-blue);">
            <div style="font-weight:700; margin-bottom:10px; color:var(--info-blue);">Upgrade Rate</div>
            <div style="font-size:24px; font-weight:800; color:var(--text-main); margin-bottom:5px;">
                ${result.rate.toLocaleString()} ${result.currency}
            </div>
            <div style="font-size:13px; color:var(--text-muted);">
                Adult/Child rate for upgrade to Business Class
            </div>
        </div>
    `;
}

function displayExcessBaggageResult(result) {
    const carrierColor = result.airline === 'EK' ? 'var(--info-blue)' : 
                        result.airline === 'AC' ? 'var(--success-green)' :
                        result.airline === 'UA' ? 'var(--primary-blue)' :
                        'var(--warning-amber)';
    
    const originCity = translateCity(result.origin);
    const destCity = translateCity(result.destination);
    
    let html = `
        <div style="font-weight:700; font-size:18px; margin-bottom:15px; color:${carrierColor};">
            ✓ ${result.carrierName} (${result.airline}) Excess Baggage Rates
        </div>
        
        <div style="background:rgba(0,0,0,0.2); padding:15px; border-radius:8px; margin-bottom:15px;">
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px;">
                <div>
                    <div style="font-weight:600; margin-bottom:5px; color:var(--text-muted); font-size:12px;">Origin</div>
                    <div style="font-size:16px; color:var(--text-main);">
                        ${result.origin} ${originCity !== result.origin ? `(${originCity})` : ''}
                    </div>
                    <div style="font-size:12px; color:var(--text-muted); margin-top:3px;">
                        ${getZoneName(result.originZone)}
                    </div>
                </div>
                <div>
                    <div style="font-weight:600; margin-bottom:5px; color:var(--text-muted); font-size:12px;">Destination</div>
                    <div style="font-size:16px; color:var(--text-main);">
                        ${result.destination} ${destCity !== result.destination ? `(${destCity})` : ''}
                    </div>
                    <div style="font-size:12px; color:var(--text-muted); margin-top:3px;">
                        ${getZoneName(result.destZone)} (${result.currency})
                    </div>
                </div>
            </div>
        </div>
    `;
    
    if (result.airline === 'FZ') {
        html += `
            <div style="background:rgba(96,165,250,0.1); padding:15px; border-radius:8px; border-left:3px solid var(--info-blue);">
                <div style="font-weight:700; margin-bottom:10px; color:var(--info-blue);">Excess Baggage Rate</div>
                <div style="font-size:24px; font-weight:800; color:var(--text-main); margin-bottom:5px;">
                    ${result.ratePerKg} ${result.currency}
                </div>
                <div style="font-size:13px; color:var(--text-muted);">
                    Per kilogram (kg) of excess baggage
                </div>
            </div>
        `;
    } else if (result.airline === 'EK') {
        html += `
            <div style="background:rgba(96,165,250,0.1); padding:15px; border-radius:8px; border-left:3px solid var(--info-blue);">
                <div style="font-weight:700; margin-bottom:10px; color:var(--info-blue);">Excess Baggage Rate</div>
                <div style="font-size:24px; font-weight:800; color:var(--text-main); margin-bottom:5px;">
                    ${result.ratePerKg === 'N/A' ? 'N/A' : `$${result.ratePerKg} USD`}
                </div>
                <div style="font-size:13px; color:var(--text-muted); margin-bottom:10px;">
                    Per kilogram (kg) of excess baggage
                </div>
                <div style="font-size:12px; color:var(--text-muted); padding-top:10px; border-top:1px solid rgba(255,255,255,0.1);">
                    Route: ${result.originRegion} → ${result.destRegion}
                </div>
            </div>
        `;
    } else if (result.airline === 'AC' || result.airline === 'UA') {
        html += `
            <div style="background:rgba(96,165,250,0.1); padding:15px; border-radius:8px; border-left:3px solid var(--info-blue); margin-bottom:15px;">
                <div style="font-weight:700; margin-bottom:10px; color:var(--info-blue);">Free Baggage Allowance</div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                    <div style="padding:10px; background:rgba(0,0,0,0.2); border-radius:6px;">
                        <div style="font-size:11px; color:var(--text-muted); margin-bottom:3px;">Economy</div>
                        <div style="font-size:18px; font-weight:700; color:var(--text-main);">${result.freeAllowanceEco} kg</div>
                    </div>
                    <div style="padding:10px; background:rgba(0,0,0,0.2); border-radius:6px;">
                        <div style="font-size:11px; color:var(--text-muted); margin-bottom:3px;">Business</div>
                        <div style="font-size:18px; font-weight:700; color:var(--text-main);">${result.freeAllowanceBus} kg</div>
                    </div>
                </div>
            </div>
            <div style="background:rgba(0,0,0,0.2); padding:15px; border-radius:8px;">
                <div style="font-weight:700; margin-bottom:10px; color:var(--text-main);">Excess Baggage Charges (USD)</div>
                <div style="display:flex; flex-direction:column; gap:8px;">
                    <div style="display:flex; justify-content:space-between; padding:8px; background:rgba(0,0,0,0.2); border-radius:4px;">
                        <span style="color:var(--text-muted);">1st Excess Bag</span>
                        <span style="font-weight:700; color:var(--text-main);">$${result.rates['1_excess_bag']}</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; padding:8px; background:rgba(0,0,0,0.2); border-radius:4px;">
                        <span style="color:var(--text-muted);">2nd Excess Bag</span>
                        <span style="font-weight:700; color:var(--text-main);">$${result.rates['2_excess_bag']}</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; padding:8px; background:rgba(0,0,0,0.2); border-radius:4px;">
                        <span style="color:var(--text-muted);">3rd or More</span>
                        <span style="font-weight:700; color:var(--text-main);">$${result.rates['3_or_more_excess_bag']}</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; padding:8px; background:rgba(0,0,0,0.2); border-radius:4px;">
                        <span style="color:var(--text-muted);">Oversize</span>
                        <span style="font-weight:700; color:var(--text-main);">$${result.rates.oversize}</span>
                    </div>
                    <div style="display:flex; justify-content:space-between; padding:8px; background:rgba(0,0,0,0.2); border-radius:4px;">
                        <span style="color:var(--text-muted);">Overweight</span>
                        <span style="font-weight:700; color:var(--text-main);">$${result.rates.overweight}</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    return html;
}

function displayGoShowResult(result) {
    const originCity = translateCity(result.origin);
    
    return `
        <div style="font-weight:700; font-size:18px; margin-bottom:15px; color:var(--info-blue);">
            ✓ Go-Show ${result.classType} Fare
        </div>
        
        <div style="background:rgba(0,0,0,0.2); padding:15px; border-radius:8px; margin-bottom:15px;">
            <div style="font-weight:600; margin-bottom:5px; color:var(--text-muted); font-size:12px;">Route</div>
            <div style="font-size:16px; color:var(--text-main);">
                ${result.origin} ${originCity !== result.origin ? `(${originCity})` : ''} → ${result.destination}
            </div>
        </div>
        
        <div style="background:rgba(96,165,250,0.1); padding:15px; border-radius:8px; border-left:3px solid var(--info-blue);">
            <div style="font-weight:700; margin-bottom:10px; color:var(--info-blue);">Fares (${result.currency})</div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                <div style="padding:10px; background:rgba(0,0,0,0.2); border-radius:6px;">
                    <div style="font-size:11px; color:var(--text-muted); margin-bottom:3px;">Adult</div>
                    <div style="font-size:18px; font-weight:700; color:var(--text-main);">${result.adult.toLocaleString()} ${result.currency}</div>
                </div>
                <div style="padding:10px; background:rgba(0,0,0,0.2); border-radius:6px;">
                    <div style="font-size:11px; color:var(--text-muted); margin-bottom:3px;">Infant</div>
                    <div style="font-size:18px; font-weight:700; color:var(--text-main);">${result.infant.toLocaleString()} ${result.currency}</div>
                </div>
            </div>
        </div>
    `;
}

function displaySportsResult(result) {
    return `
        <div style="font-weight:700; font-size:18px; margin-bottom:15px; color:var(--info-blue);">
            ✓ Sports Equipment Rate
        </div>
        
        <div style="background:rgba(96,165,250,0.1); padding:15px; border-radius:8px; border-left:3px solid var(--info-blue);">
            <div style="font-weight:700; margin-bottom:10px; color:var(--info-blue);">${result.description}</div>
            <div style="font-size:24px; font-weight:800; color:var(--text-main); margin-bottom:5px;">
                ${result.amount ? result.amount.toLocaleString() : 'N/A'} ${result.currency}
            </div>
            <div style="font-size:13px; color:var(--text-muted);">
                SSR Code: ${result.type}
            </div>
        </div>
    `;
}

function displayReportingResult(result) {
    return `
        <div style="font-weight:700; font-size:18px; margin-bottom:15px; color:var(--info-blue);">
            ✓ ${result.description}
        </div>
        
        <div style="background:rgba(96,165,250,0.1); padding:15px; border-radius:8px; border-left:3px solid var(--info-blue);">
            <div style="font-weight:700; margin-bottom:10px; color:var(--info-blue);">Fee</div>
            <div style="font-size:24px; font-weight:800; color:var(--text-main); margin-bottom:5px;">
                ${result.amount ? result.amount.toLocaleString() : 'N/A'} ${result.currency}
            </div>
            <div style="font-size:13px; color:var(--text-muted);">
                SSR Code: ${result.type}
            </div>
        </div>
    `;
}

function displayTransferResult(result) {
    return `
        <div style="font-weight:700; font-size:18px; margin-bottom:15px; color:var(--info-blue);">
            ✓ Transfer Baggage Fee
        </div>
        
        <div style="background:rgba(96,165,250,0.1); padding:15px; border-radius:8px; border-left:3px solid var(--info-blue);">
            <div style="font-weight:700; margin-bottom:10px; color:var(--info-blue);">Service Price</div>
            <div style="font-size:24px; font-weight:800; color:var(--text-main); margin-bottom:15px;">
                ${result.amount} ${result.currency}
            </div>
            <div style="padding-top:10px; border-top:1px solid rgba(255,255,255,0.1);">
                <div style="font-weight:600; margin-bottom:5px; color:var(--text-muted);">Additional GHA Fee</div>
                <div style="font-size:16px; color:var(--text-main);">
                    ${typeof result.ghaFee === 'number' ? `${result.ghaFee} ${result.currency}` : result.ghaFee}
                </div>
            </div>
            <div style="font-size:13px; color:var(--text-muted); margin-top:10px;">
                SSR Code: TRBF
            </div>
        </div>
    `;
}
