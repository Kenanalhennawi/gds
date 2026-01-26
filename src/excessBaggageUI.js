/**
 * Comprehensive UI for Flydubai Rate Calculator
 * Includes: Excess Baggage, Go-Show Fares, Sports Equipment, Reporting Fees, etc.
 */

import { 
    calculateExcessBaggageRate, 
    getZoneForAirport, 
    getZoneName, 
    getCurrencyForDestination,
    getCurrencyForOriginOrDestination,
    getAllCurrencies,
    getGoShowFare,
    getSportsEquipmentRate,
    getReportingRate,
    getTransferBaggageFee,
    getUpgradeRate
} from "./excessBaggage.js";
import { translateAirline, translateCity } from "./translator.js";
import { searchAirports, getAirportByCode } from "./airportSearch.js";

// Helper to get country name from airport code
function getCountryForAirport(code) {
    const airport = getAirportByCode(code);
    return airport ? airport.country : null;
}

// Global click handler for closing autocomplete dropdowns (single listener)
let globalClickHandler = null;

export function renderExcessBaggageCalculator(container) {
    // Remove old global click handler if it exists
    if (globalClickHandler) {
        document.removeEventListener('click', globalClickHandler);
        globalClickHandler = null;
    }
    
    // Track all active autocomplete dropdowns
    const activeDropdowns = new Set();
    
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
                    <div class="service-tabs-container" style="display:flex; gap:10px; margin-bottom:20px; border-bottom:2px solid var(--glass-border); padding-bottom:2px;">
                        <button class="service-tab active" data-service="excess" style="padding:10px 20px; background:rgba(59,130,246,0.25); border:none; border-bottom:2px solid var(--primary-blue); color:var(--primary-blue); font-weight:600; cursor:pointer; font-size:13px; border-radius:8px 8px 0 0;">
                            Excess Baggage
                        </button>
                        <button class="service-tab" data-service="goshow" style="padding:10px 20px; background:transparent; border:none; color:var(--text-muted); font-weight:600; cursor:pointer; font-size:13px; border-radius:8px 8px 0 0;">
                            Go-Show Fares
                        </button>
                        <button class="service-tab" data-service="sports" style="padding:10px 20px; background:transparent; border:none; color:var(--text-muted); font-weight:600; cursor:pointer; font-size:13px; border-radius:8px 8px 0 0;">
                            Sports Equipment
                        </button>
                        <button class="service-tab" data-service="reporting" style="padding:10px 20px; background:transparent; border:none; color:var(--text-muted); font-weight:600; cursor:pointer; font-size:13px; border-radius:8px 8px 0 0;">
                            Reporting Fees
                        </button>
                        <button class="service-tab" data-service="transfer" style="padding:10px 20px; background:transparent; border:none; color:var(--text-muted); font-weight:600; cursor:pointer; font-size:13px; border-radius:8px 8px 0 0;">
                            Transfer Baggage
                        </button>
                        <button class="service-tab" data-service="upgrade" style="padding:10px 20px; background:transparent; border:none; color:var(--text-muted); font-weight:600; cursor:pointer; font-size:13px; border-radius:8px 8px 0 0;">
                            Upgrade to Business
                        </button>
                    </div>
                    
                    <!-- Excess Baggage Section -->
                    <div id="excessSection" class="service-section">
                        <div style="display:grid; grid-template-columns:1fr 1fr 1fr 1fr; gap:15px; margin-bottom:20px;">
                            <div style="position:relative;">
                                <label style="display:block; font-weight:600; margin-bottom:8px; color:var(--text-main);">
                                    Origin Airport
                                </label>
                                <input 
                                    type="text" 
                                    id="originInput" 
                                    class="styled-input"
                                    placeholder="Search by code, city, or country..."
                                    autocomplete="off"
                                    style="width:100%; padding:12px; background:rgba(0,0,0,0.3); border:1px solid var(--glass-border); border-radius:8px; color:var(--text-main); font-family:var(--font-code); font-size:14px; outline:none;"
                                />
                                <div id="originAutocomplete" class="autocomplete-dropdown" style="display:none; position:absolute; top:100%; left:0; right:0; background:rgba(20,20,30,0.95); border:1px solid var(--glass-border); border-radius:8px; margin-top:4px; max-height:200px; overflow-y:auto; z-index:1000; box-shadow:0 4px 12px rgba(0,0,0,0.3);"></div>
                                <div id="originInfo" style="margin-top:5px; font-size:11px; color:var(--text-muted);"></div>
                            </div>
                            
                            <div style="position:relative;">
                                <label style="display:block; font-weight:600; margin-bottom:8px; color:var(--text-main);">
                                    Destination Airport
                                </label>
                                <input 
                                    type="text" 
                                    id="destinationInput" 
                                    class="styled-input"
                                    placeholder="Search by code, city, or country..."
                                    autocomplete="off"
                                    style="width:100%; padding:12px; background:rgba(0,0,0,0.3); border:1px solid var(--glass-border); border-radius:8px; color:var(--text-main); font-family:var(--font-code); font-size:14px; outline:none;"
                                />
                                <div id="destinationAutocomplete" class="autocomplete-dropdown" style="display:none; position:absolute; top:100%; left:0; right:0; background:rgba(20,20,30,0.95); border:1px solid var(--glass-border); border-radius:8px; margin-top:4px; max-height:200px; overflow-y:auto; z-index:1000; box-shadow:0 4px 12px rgba(0,0,0,0.3);"></div>
                                <div id="destinationInfo" style="margin-top:5px; font-size:11px; color:var(--text-muted);"></div>
                            </div>
                            
                            <div>
                                <label style="display:block; font-weight:600; margin-bottom:8px; color:var(--text-main);">
                                    Airline
                                </label>
                                <select 
                                    id="airlineSelect"
                                    class="styled-select"
                                    style="width:100%; padding:12px; background:rgba(0,0,0,0.3); border:1px solid var(--glass-border); border-radius:8px; color:var(--text-main); font-size:14px; outline:none; cursor:pointer;"
                                >
                                    <option value="FZ">Flydubai (FZ)</option>
                                    <option value="EK">Emirates (EK)</option>
                                    <option value="AC">Air Canada (AC)</option>
                                    <option value="UA">United Airlines (UA)</option>
                                    <option value="OAL">Other Airlines (OAL)</option>
                                </select>
                            </div>
                            
                            <div>
                                <label style="display:block; font-weight:600; margin-bottom:8px; color:var(--text-main);">
                                    Currency
                                </label>
                                <select 
                                    id="currencySelect"
                                    class="styled-select"
                                    style="width:100%; padding:12px; background:rgba(0,0,0,0.3); border:1px solid var(--glass-border); border-radius:8px; color:var(--text-main); font-size:14px; outline:none; cursor:pointer;"
                                >
                                    <option value="AUTO">Auto (by origin/destination)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Go-Show Section -->
                    <div id="goshowSection" class="service-section" style="display:none;">
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:20px;">
                            <div style="position:relative;">
                                <label style="display:block; font-weight:600; margin-bottom:8px; color:var(--text-main);">
                                    Origin Airport
                                </label>
                                <input 
                                    type="text" 
                                    id="goshowOrigin" 
                                    class="styled-input"
                                    placeholder="Search by code, city, or country..."
                                    autocomplete="off"
                                    style="width:100%; padding:12px; background:rgba(0,0,0,0.3); border:1px solid var(--glass-border); border-radius:8px; color:var(--text-main); font-family:var(--font-code); font-size:14px; outline:none;"
                                />
                                <div id="goshowAutocomplete" class="autocomplete-dropdown" style="display:none; position:absolute; top:100%; left:0; right:0; background:rgba(20,20,30,0.95); border:1px solid var(--glass-border); border-radius:8px; margin-top:4px; max-height:200px; overflow-y:auto; z-index:1000; box-shadow:0 4px 12px rgba(0,0,0,0.3);"></div>
                            </div>
                            <div>
                                <label style="display:block; font-weight:600; margin-bottom:8px; color:var(--text-main);">
                                    Class
                                </label>
                                <select 
                                    id="goshowClass"
                                    class="styled-select"
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
                                    class="styled-select"
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
                                    class="styled-select"
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
                                    class="styled-select"
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
                                    class="styled-select"
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
                                class="styled-select"
                                style="width:100%; padding:12px; background:rgba(0,0,0,0.3); border:1px solid var(--glass-border); border-radius:8px; color:var(--text-main); font-size:14px; outline:none; cursor:pointer; transition:all 0.3s ease;"
                            >
                                <option value="DXB">DXB - Dubai</option>
                                <option value="OUTSTATION">Outstation</option>
                            </select>
                        </div>
                    </div>
                    
                    <!-- Upgrade Section -->
                    <div id="upgradeSection" class="service-section" style="display:none;">
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:20px;">
                            <div style="position:relative;">
                                <label style="display:block; font-weight:600; margin-bottom:8px; color:var(--text-main);">
                                    Origin Airport
                                </label>
                                <input 
                                    type="text" 
                                    id="upgradeOrigin" 
                                    class="styled-input"
                                    placeholder="Search by code, city, or country..."
                                    autocomplete="off"
                                    style="width:100%; padding:12px; background:rgba(0,0,0,0.3); border:1px solid var(--glass-border); border-radius:8px; color:var(--text-main); font-family:var(--font-code); font-size:14px; outline:none;"
                                />
                                <div id="upgradeAutocomplete" class="autocomplete-dropdown" style="display:none; position:absolute; top:100%; left:0; right:0; background:rgba(20,20,30,0.95); border:1px solid var(--glass-border); border-radius:8px; margin-top:4px; max-height:200px; overflow-y:auto; z-index:1000; box-shadow:0 4px 12px rgba(0,0,0,0.3);"></div>
                            </div>
                            <div>
                                <label style="display:block; font-weight:600; margin-bottom:8px; color:var(--text-main);">
                                    Currency
                                </label>
                                <select 
                                    id="upgradeCurrency"
                                    class="styled-select"
                                    style="width:100%; padding:12px; background:rgba(0,0,0,0.3); border:1px solid var(--glass-border); border-radius:8px; color:var(--text-main); font-size:14px; outline:none; cursor:pointer;"
                                >
                                    <option value="AED">AED - UAE Dirham</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    
                    <div style="display:flex; gap:10px; margin-bottom:20px;">
                        <button id="calculateBtn" class="btn-primary" style="flex:1;">
                            Calculate
                        </button>
                        <button id="clearBtn" class="btn-glass" style="padding:12px 24px; white-space:nowrap;">
                            Clear All
                        </button>
                    </div>
                    
                    <div id="rateResult" style="display:none;"></div>
                </div>
            </div>
        </div>
    `;
    
    // Pre-populate currency dropdowns immediately - single pass for maximum performance
    const currencies = getAllCurrencies();
    const currencyOptionsHTML = currencies.map(curr => `<option value="${curr}">${curr}</option>`).join('');
    
    // Populate all currency selects in one batch operation
    let currencySelect = container.querySelector('#currencySelect');
    const sportsCurrency = container.querySelector('#sportsCurrency');
    const reportingCurrency = container.querySelector('#reportingCurrency');
    const upgradeSelect = container.querySelector('#upgradeCurrency');
    
    // Set innerHTML directly (fastest DOM operation)
    if (currencySelect) {
        currencySelect.innerHTML = '<option value="AUTO">Auto (by destination)</option>' + currencyOptionsHTML;
    }
    if (sportsCurrency) {
        sportsCurrency.innerHTML = '<option value="AED">AED</option>' + currencyOptionsHTML;
    }
    if (reportingCurrency) {
        reportingCurrency.innerHTML = '<option value="AED">AED</option>' + currencyOptionsHTML;
    }
    
    // Initialize upgrade currencies
    const upgradeCurrencies = ['AED', 'PKR', 'BHD', 'BYN', 'CHF', 'CZK', 'EGP', 'EUR', 'HUF', 'INR', 'JOD', 'KWD', 'KZT', 'LBP', 'LKR', 'MYR', 'NPR', 'OMR', 'PLN', 'QAR', 'RUB', 'SAR', 'TJS', 'THB', 'USD', 'UZS', 'IRR'];
    if (upgradeSelect) {
        upgradeSelect.innerHTML = upgradeCurrencies.map(curr => `<option value="${curr}">${curr}</option>`).join('');
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
            tab.style.background = 'rgba(59,130,246,0.25)';
            tab.style.borderBottom = '2px solid var(--primary-blue)';
            tab.style.color = 'var(--primary-blue)';
            tab.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.2)';
            
            // Update sections
            sections.forEach(s => s.style.display = 'none');
            const activeSection = container.querySelector(`#${service}Section`);
            if (activeSection) activeSection.style.display = 'block';
        });
    });
    
    // Input handlers (currencySelect already declared above)
    const originInput = container.querySelector('#originInput');
    const destInput = container.querySelector('#destinationInput');
    const airlineSelect = container.querySelector('#airlineSelect');
    const btn = container.querySelector('#calculateBtn');
    const clearBtn = container.querySelector('#clearBtn');
    const resultDiv = container.querySelector('#rateResult');
    const originInfo = container.querySelector('#originInfo');
    const destInfo = container.querySelector('#destinationInfo');
    const originAutocomplete = container.querySelector('#originAutocomplete');
    const destAutocomplete = container.querySelector('#destinationAutocomplete');
    
    // Debounce function for performance
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Create autocomplete handler
    function createAutocompleteHandler(input, dropdown, infoDiv, onSelect) {
        let debounceTimer;
        let selectedAirport = null;
        
        // Add this dropdown to active set
        activeDropdowns.add({ input, dropdown });
        
        input.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            const query = input.value.trim();
            
            if (query.length < 1) {
                dropdown.style.display = 'none';
                selectedAirport = null;
                if (infoDiv) infoDiv.textContent = '';
                return;
            }
            
            debounceTimer = setTimeout(() => {
                const results = searchAirports(query, 8);
                
                if (results.length === 0) {
                    dropdown.style.display = 'none';
                    return;
                }
                
                dropdown.innerHTML = '';
                results.forEach(airport => {
                    const item = document.createElement('div');
                    item.style.cssText = 'padding:10px 12px; cursor:pointer; border-bottom:1px solid rgba(255,255,255,0.05); transition:background 0.2s;';
                    item.innerHTML = `
                        <div style="font-weight:700; color:var(--text-main); font-size:13px;">${airport.code} - ${airport.name}</div>
                        <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">${airport.city}, ${airport.country}</div>
                    `;
                    
                    item.addEventListener('mouseenter', () => {
                        item.style.background = 'rgba(59,130,246,0.2)';
                    });
                    item.addEventListener('mouseleave', () => {
                        item.style.background = 'transparent';
                    });
                    
                    item.addEventListener('click', () => {
                        input.value = airport.code;
                        selectedAirport = airport;
                        dropdown.style.display = 'none';
                        if (onSelect) onSelect(airport);
                    });
                    
                    dropdown.appendChild(item);
                });
                
                dropdown.style.display = 'block';
            }, 150);
        });
        
        // Handle Enter key
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const firstItem = dropdown.querySelector('div');
                if (firstItem) firstItem.click();
            } else if (e.key === 'Escape') {
                dropdown.style.display = 'none';
            }
        });
    }
    
    // Single global click handler for all autocomplete dropdowns
    globalClickHandler = (e) => {
        // Don't interfere with header navigation buttons or their children
        const target = e.target;
        if (target && (
            target.id === 'tabDecoder' || 
            target.id === 'tabExcessBaggage' || 
            target.closest('#tabDecoder') || 
            target.closest('#tabExcessBaggage') ||
            target.closest('.header-tabs')
        )) {
            return; // Allow header button clicks to work
        }
        
        // Close all active dropdowns if click is outside
        activeDropdowns.forEach(({ input, dropdown }) => {
            if (!input.contains(target) && !dropdown.contains(target)) {
                dropdown.style.display = 'none';
            }
        });
    };
    
    // Add single global listener
    document.addEventListener('click', globalClickHandler);
    
    // Setup autocomplete for origin
    createAutocompleteHandler(originInput, originAutocomplete, originInfo, (airport) => {
        const zone = getZoneForAirport(airport.code);
        originInfo.textContent = `${airport.city}, ${airport.country}${zone ? ` - Zone ${zone}` : ''}`;
        
        // Auto-select currency based on origin or destination
        if (currencySelect && currencySelect.value === 'AUTO') {
            const destValue = destInput ? destInput.value.trim() : null;
            const currency = getCurrencyForOriginOrDestination(airport.code, destValue);
            currencySelect.value = currency;
        }
    });
    
    // Setup autocomplete for destination
    createAutocompleteHandler(destInput, destAutocomplete, destInfo, (airport) => {
        const zone = getZoneForAirport(airport.code);
        const destCurrency = getCurrencyForDestination(airport.code);
        destInfo.textContent = `${airport.city}, ${airport.country}${zone ? ` - Zone ${zone}` : ''} (${destCurrency})`;
        
        // Auto-select currency based on origin or destination (prefers origin)
        if (currencySelect && currencySelect.value === 'AUTO') {
            const originValue = originInput ? originInput.value.trim() : null;
            const currency = getCurrencyForOriginOrDestination(originValue, airport.code);
            currencySelect.value = currency;
        }
    });
    
    // Setup autocomplete for go-show origin
    const goshowOrigin = container.querySelector('#goshowOrigin');
    const goshowAutocomplete = container.querySelector('#goshowAutocomplete');
    if (goshowOrigin && goshowAutocomplete) {
        createAutocompleteHandler(goshowOrigin, goshowAutocomplete, null, null);
    }
    
    // Setup autocomplete for upgrade origin
    const upgradeOrigin = container.querySelector('#upgradeOrigin');
    const upgradeAutocomplete = container.querySelector('#upgradeAutocomplete');
    if (upgradeOrigin && upgradeAutocomplete) {
        createAutocompleteHandler(upgradeOrigin, upgradeAutocomplete, null, null);
    }
    
    // Clear button handler
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            // Clear all inputs
            originInput.value = '';
            destInput.value = '';
            if (goshowOrigin) goshowOrigin.value = '';
            if (upgradeOrigin) upgradeOrigin.value = '';
            
            // Reset selects
            if (airlineSelect) airlineSelect.value = 'FZ';
            if (currencySelect) currencySelect.value = 'AUTO';
            if (container.querySelector('#goshowClass')) container.querySelector('#goshowClass').value = 'ECONOMY';
            if (container.querySelector('#sportsCurrency')) container.querySelector('#sportsCurrency').value = 'AED';
            if (container.querySelector('#sportsType')) container.querySelector('#sportsType').value = 'SPEQ';
            if (container.querySelector('#reportingCurrency')) container.querySelector('#reportingCurrency').value = 'AED';
            if (container.querySelector('#reportingType')) container.querySelector('#reportingType').value = 'LRTP';
            if (container.querySelector('#transferLocation')) container.querySelector('#transferLocation').value = 'DXB';
            if (container.querySelector('#upgradeCurrency')) container.querySelector('#upgradeCurrency').value = 'AED';
            
            // Clear info displays
            originInfo.textContent = '';
            destInfo.textContent = '';
            
            // Hide autocomplete dropdowns
            originAutocomplete.style.display = 'none';
            destAutocomplete.style.display = 'none';
            if (goshowAutocomplete) goshowAutocomplete.style.display = 'none';
            if (upgradeAutocomplete) upgradeAutocomplete.style.display = 'none';
            
            // Hide results
            resultDiv.style.display = 'none';
        });
    }
    
    // Calculate button
    btn.addEventListener('click', () => {
        const activeTab = container.querySelector('.service-tab.active');
        const service = activeTab ? activeTab.dataset.service : 'excess';
        
        try {
            let result;
            
            if (service === 'excess') {
                // Extract airport code from input (might be full text or just code)
                let origin = originInput.value.trim().toUpperCase();
                let destination = destInput.value.trim().toUpperCase();
                
                // Try to extract code if it's a longer string
                const originMatch = origin.match(/\b([A-Z]{3})\b/);
                const destMatch = destination.match(/\b([A-Z]{3})\b/);
                
                if (originMatch) origin = originMatch[1];
                if (destMatch) destination = destMatch[1];
                
                // If still not 3 chars, try to get from airport data
                if (origin.length !== 3) {
                    const airport = getAirportByCode(origin) || searchAirports(origin, 1)[0];
                    if (airport) origin = airport.code;
                }
                if (destination.length !== 3) {
                    const airport = getAirportByCode(destination) || searchAirports(destination, 1)[0];
                    if (airport) destination = airport.code;
                }
                
                const airline = airlineSelect.value;
                const currency = currencySelect.value === 'AUTO' ? null : currencySelect.value;
                
                if (!origin || origin.length !== 3 || !destination || destination.length !== 3) {
                    showError(resultDiv, 'Please enter valid airport codes for origin and destination.');
                    return;
                }
                
                result = calculateExcessBaggageRate(origin, destination, airline, currency);
            } else if (service === 'goshow') {
                let origin = container.querySelector('#goshowOrigin').value.trim().toUpperCase();
                const originMatch = origin.match(/\b([A-Z]{3})\b/);
                if (originMatch) origin = originMatch[1];
                if (origin.length !== 3) {
                    const airport = getAirportByCode(origin) || searchAirports(origin, 1)[0];
                    if (airport) origin = airport.code;
                }
                const classType = container.querySelector('#goshowClass').value;
                
                if (!origin || origin.length !== 3) {
                    showError(resultDiv, 'Please enter a valid origin airport code.');
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
                let origin = container.querySelector('#upgradeOrigin').value.trim().toUpperCase();
                const originMatch = origin.match(/\b([A-Z]{3})\b/);
                if (originMatch) origin = originMatch[1];
                if (origin.length !== 3) {
                    const airport = getAirportByCode(origin) || searchAirports(origin, 1)[0];
                    if (airport) origin = airport.code;
                }
                const currency = container.querySelector('#upgradeCurrency').value;
                
                if (!origin || origin.length !== 3) {
                    showError(resultDiv, 'Please enter a valid origin airport code.');
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
                        result.airline === 'OAL' ? 'var(--warning-amber)' :
                        'var(--primary-blue)';
    
    const originCity = translateCity(result.origin);
    const destCity = translateCity(result.destination);
    const originAirport = getAirportByCode(result.origin);
    const destAirport = getAirportByCode(result.destination);
    const originCountry = originAirport ? originAirport.country : null;
    const destCountry = destAirport ? destAirport.country : null;
    
    // For EK/OAL, show region; for FZ, show country or zone
    const originDisplay = (result.airline === 'EK' || result.airline === 'OAL') && result.originRegion 
        ? result.originRegion 
        : (originCountry || (result.originZone ? `Zone ${result.originZone}` : ''));
    const destDisplay = (result.airline === 'EK' || result.airline === 'OAL') && result.destRegion 
        ? result.destRegion 
        : (destCountry || (result.destZone ? `Zone ${result.destZone}` : ''));
    
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
                        ${originCountry || originDisplay}${result.originZone && !originCountry ? ` - Zone ${result.originZone}` : ''}
                    </div>
                </div>
                <div>
                    <div style="font-weight:600; margin-bottom:5px; color:var(--text-muted); font-size:12px;">Destination</div>
                    <div style="font-size:16px; color:var(--text-main);">
                        ${result.destination} ${destCity !== result.destination ? `(${destCity})` : ''}
                    </div>
                    <div style="font-size:12px; color:var(--text-muted); margin-top:3px;">
                        ${destCountry || destDisplay}${result.destZone && !destCountry ? ` - Zone ${result.destZone}` : ''} (${result.currency})
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
    } else if (result.airline === 'EK' || result.airline === 'OAL') {
        const routeInfo = result.originRegion && result.destRegion 
            ? `Route: ${result.originRegion} → ${result.destRegion}`
            : '';
        html += `
            <div style="background:rgba(96,165,250,0.1); padding:15px; border-radius:8px; border-left:3px solid var(--info-blue);">
                <div style="font-weight:700; margin-bottom:10px; color:var(--info-blue);">Excess Baggage Rate</div>
                <div style="font-size:24px; font-weight:800; color:var(--text-main); margin-bottom:5px;">
                    ${result.ratePerKg === null || result.ratePerKg === 'N/A' || result.ratePerKg === undefined ? 'Rate not available' : `$${result.ratePerKg} USD`}
                </div>
                <div style="font-size:13px; color:var(--text-muted); margin-bottom:10px;">
                    Per kilogram (kg) of excess baggage
                    ${routeInfo ? `<br><span style="font-size:11px; color:var(--text-dim); margin-top:5px; display:block;">${routeInfo}</span>` : ''}
                </div>
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
