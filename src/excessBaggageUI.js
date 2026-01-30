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
    getUpgradeRate,
    getUpgradeOnBoardRate,
    getExtraLegroomRate,
    getExtraLegroomCurrencies,
    AIRCRAFT_XLGR_REFERENCE,
    REFERENCE_TEXTS,
    INTERLINE_JOURNEY_RULES,
    EXCESS_BAGGAGE_DISCLAIMER
} from "./excessBaggage.js";
import { answerAgentQuestion } from "./rateAgent.js";
import { translateAirline, translateCity } from "./translator.js";
import { searchAirports, getAirportByCode } from "./airportSearch.js";

function getCountryForAirport(code) {
    const airport = getAirportByCode(code);
    return airport ? airport.country : null;
}

let globalClickHandler = null;

export function renderExcessBaggageCalculator(container) {
    if (globalClickHandler) {
        document.removeEventListener('click', globalClickHandler);
        globalClickHandler = null;
    }
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
                    <div class="how-to-use-wrap" style="margin-bottom:16px;">
                        <button type="button" id="howToUseToggle" class="how-to-use-toggle" aria-expanded="false" aria-controls="howToUseContent" style="display:flex; align-items:center; gap:8px; padding:10px 14px; background:rgba(59,130,246,0.1); border:1px solid var(--glass-border); border-radius:8px; color:var(--info-blue); font-size:13px; font-weight:600; cursor:pointer; width:100%; text-align:left;">
                            <span aria-hidden="true">?</span> How to use
                        </button>
                        <div id="howToUseContent" class="how-to-use-content" hidden style="padding:14px; background:rgba(0,0,0,0.2); border-radius:8px; margin-top:6px; font-size:13px; color:var(--text-muted); line-height:1.6;">
                            <p style="margin-bottom:8px;"><strong style="color:var(--text-main);">1.</strong> Choose a tab (Excess Baggage, Go-Show, Upgrade, etc.).</p>
                            <p style="margin-bottom:8px;"><strong style="color:var(--text-main);">2.</strong> Fill in the fields (e.g. origin, destination, airline, currency).</p>
                            <p style="margin-bottom:8px;"><strong style="color:var(--text-main);">3.</strong> Click <strong>Calculate</strong> or press <kbd style="background:rgba(0,0,0,0.3); padding:2px 6px; border-radius:4px;">Ctrl+Enter</kbd>.</p>
                            <p style="margin-bottom:0;"><strong style="color:var(--text-main);">4.</strong> Use <strong>Ask Agent</strong> for questions about rates and rules.</p>
                        </div>
                    </div>
                    <div class="service-tabs-container service-tabs-scroll" role="tablist" aria-label="Rate calculator services" style="display:flex; gap:10px; margin-bottom:20px; overflow-x:auto; flex-wrap:nowrap; -webkit-overflow-scrolling:touch;">
                        <button class="service-tab active" data-service="excess" role="tab" aria-selected="true" aria-controls="excessSection" id="tabExcess">
                            Excess Baggage
                        </button>
                        <button class="service-tab" data-service="goshow" role="tab" aria-selected="false" aria-controls="goshowSection" id="tabGoshow">
                            Go-Show Fares
                        </button>
                        <button class="service-tab" id="tabSports" data-service="sports" role="tab" aria-selected="false" aria-controls="sportsSection">
                            Sports Equipment
                        </button>
                        <button class="service-tab" id="tabReporting" data-service="reporting" role="tab" aria-selected="false" aria-controls="reportingSection">
                            Reporting Fees
                        </button>
                        <button class="service-tab" id="tabTransfer" data-service="transfer" role="tab" aria-selected="false" aria-controls="transferSection">
                            Transfer Baggage
                        </button>
                        <button class="service-tab" id="tabUpgrade" data-service="upgrade" role="tab" aria-selected="false" aria-controls="upgradeSection">
                            Upgrade to Business
                        </button>
                        <button class="service-tab" id="tabExtralegroom" data-service="extralegroom" role="tab" aria-selected="false" aria-controls="extralegroomSection">
                            Extra Legroom
                        </button>
                        <button class="service-tab" id="tabReference" data-service="reference" role="tab" aria-selected="false" aria-controls="referenceSection">
                            Reference
                        </button>
                        <button class="service-tab" id="tabAgent" data-service="agent" role="tab" aria-selected="false" aria-controls="agentSection">
                            Ask Agent
                        </button>
                    </div>
                    <div id="excessSection" class="service-section" role="tabpanel" aria-labelledby="tabExcess" aria-hidden="false">
                        <div class="excess-form-grid" style="gap:15px; margin-bottom:20px;">
                            <div style="position:relative;">
                                <label style="display:block; font-weight:600; margin-bottom:8px; color:var(--text-main);" title="3-letter IATA code or search by city/country">Origin Airport</label>
                                <input 
                                    type="text" 
                                    id="originInput" 
                                    class="styled-input"
                                    placeholder="e.g. DXB or Dubai"
                                    autocomplete="off"
                                    title="Enter 3-letter IATA code (e.g. DXB) or type city/country to search"
                                    style="width:100%; padding:12px; background:rgba(0,0,0,0.3); border:1px solid var(--glass-border); border-radius:8px; color:var(--text-main); font-family:var(--font-code); font-size:14px; outline:none;"
                                />
                                <div id="originAutocomplete" class="autocomplete-dropdown" style="display:none; position:absolute; top:100%; left:0; right:0; background:rgba(20,20,30,0.95); border:1px solid var(--glass-border); border-radius:8px; margin-top:4px; max-height:200px; overflow-y:auto; z-index:1000; box-shadow:0 4px 12px rgba(0,0,0,0.3);"></div>
                                <div id="originInfo" style="margin-top:5px; font-size:11px; color:var(--text-muted);"></div>
                            </div>
                            <div style="display:flex; align-items:flex-end; padding-bottom:2px;">
                                <button type="button" id="swapOriginDestBtn" class="swap-btn" title="Swap origin and destination" aria-label="Swap origin and destination" style="width:44px; height:44px; border-radius:8px; border:1px solid var(--glass-border); background:rgba(59,130,246,0.15); color:var(--info-blue); cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:18px; flex-shrink:0;">⇄</button>
                            </div>
                            <div style="position:relative;">
                                <label style="display:block; font-weight:600; margin-bottom:8px; color:var(--text-main);" title="3-letter IATA code or search by city/country">Destination Airport</label>
                                <input 
                                    type="text" 
                                    id="destinationInput" 
                                    class="styled-input"
                                    placeholder="e.g. DXB or Dubai"
                                    autocomplete="off"
                                    title="Enter 3-letter IATA code (e.g. DXB) or type city/country to search"
                                    style="width:100%; padding:12px; background:rgba(0,0,0,0.3); border:1px solid var(--glass-border); border-radius:8px; color:var(--text-main); font-family:var(--font-code); font-size:14px; outline:none;"
                                />
                                <div id="destinationAutocomplete" class="autocomplete-dropdown" style="display:none; position:absolute; top:100%; left:0; right:0; background:rgba(20,20,30,0.95); border:1px solid var(--glass-border); border-radius:8px; margin-top:4px; max-height:200px; overflow-y:auto; z-index:1000; box-shadow:0 4px 12px rgba(0,0,0,0.3);"></div>
                                <div id="destinationInfo" style="margin-top:5px; font-size:11px; color:var(--text-muted);"></div>
                            </div>
                            
                            <div>
                                <label style="display:block; font-weight:600; margin-bottom:8px; color:var(--text-main);" title="Carrier for excess baggage rate">Airline</label>
                                <select 
                                    id="airlineSelect"
                                    class="styled-select"
                                    title="FZ Flydubai, EK Emirates, AC Air Canada, UA United, OAL Other airlines"
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
                                <label style="display:block; font-weight:600; margin-bottom:8px; color:var(--text-main);" title="Display currency for rates">Currency</label>
                                <select 
                                    id="currencySelect"
                                    class="styled-select"
                                    title="Auto picks by origin/destination; or choose a specific currency"
                                    style="width:100%; padding:12px; background:rgba(0,0,0,0.3); border:1px solid var(--glass-border); border-radius:8px; color:var(--text-main); font-size:14px; outline:none; cursor:pointer;"
                                >
                                    <option value="AUTO">Auto (by origin/destination)</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div id="goshowSection" class="service-section" role="tabpanel" aria-labelledby="tabGoshow" aria-hidden="true" style="display:none;">
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:20px;">
                            <div style="position:relative;">
                                <label style="display:block; font-weight:600; margin-bottom:8px; color:var(--text-main);" title="3-letter IATA or search by city/country">Origin Airport</label>
                                <input 
                                    type="text" 
                                    id="goshowOrigin" 
                                    class="styled-input"
                                    placeholder="e.g. DXB or Dubai"
                                    autocomplete="off"
                                    title="Enter 3-letter IATA code or type city/country to search"
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
                    <div id="sportsSection" class="service-section" role="tabpanel" aria-labelledby="tabSports" aria-hidden="true" style="display:none;">
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
                    <div id="reportingSection" class="service-section" role="tabpanel" aria-labelledby="tabReporting" aria-hidden="true" style="display:none;">
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
                    <div id="transferSection" class="service-section" role="tabpanel" aria-labelledby="tabTransfer" aria-hidden="true" style="display:none;">
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
                    <div id="upgradeSection" class="service-section" role="tabpanel" aria-labelledby="tabUpgrade" aria-hidden="true" style="display:none;">
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:20px;">
                            <div style="position:relative;">
                                <label style="display:block; font-weight:600; margin-bottom:8px; color:var(--text-main);" title="3-letter IATA or search by city/country">Origin Airport</label>
                                <input 
                                    type="text" 
                                    id="upgradeOrigin" 
                                    class="styled-input"
                                    placeholder="e.g. DXB or Dubai"
                                    autocomplete="off"
                                    title="Enter 3-letter IATA code or type city/country to search"
                                    style="width:100%; padding:12px; background:rgba(0,0,0,0.3); border:1px solid var(--glass-border); border-radius:8px; color:var(--text-main); font-family:var(--font-code); font-size:14px; outline:none;"
                                />
                                <div id="upgradeAutocomplete" class="autocomplete-dropdown" style="display:none; position:absolute; top:100%; left:0; right:0; background:rgba(20,20,30,0.95); border:1px solid var(--glass-border); border-radius:8px; margin-top:4px; max-height:200px; overflow-y:auto; z-index:1000; box-shadow:0 4px 12px rgba(0,0,0,0.3);"></div>
                            </div>
                            <div>
                                <label style="display:block; font-weight:600; margin-bottom:8px; color:var(--text-main);" title="Currency for upgrade rate">Currency</label>
                                <select 
                                    id="upgradeCurrency"
                                    class="styled-select"
                                    title="Choose currency for at-airport and on-board upgrade rates"
                                    style="width:100%; padding:12px; background:rgba(0,0,0,0.3); border:1px solid var(--glass-border); border-radius:8px; color:var(--text-main); font-size:14px; outline:none; cursor:pointer;"
                                >
                                    <option value="AED">AED - UAE Dirham</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div id="extralegroomSection" class="service-section" role="tabpanel" aria-labelledby="tabExtralegroom" aria-hidden="true" style="display:none;">
                        <div style="display:grid; grid-template-columns:1fr; gap:15px; margin-bottom:20px;">
                            <div>
                                <label style="display:block; font-weight:600; margin-bottom:8px; color:var(--text-main);">
                                    Currency
                                </label>
                                <select 
                                    id="extralegroomCurrency"
                                    class="styled-select"
                                    style="width:100%; max-width:280px; padding:12px; background:rgba(0,0,0,0.3); border:1px solid var(--glass-border); border-radius:8px; color:var(--text-main); font-size:14px; outline:none; cursor:pointer;"
                                >
                                    <option value="AED">AED</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div id="referenceSection" class="service-section" role="tabpanel" aria-labelledby="tabReference" aria-hidden="true" style="display:none;">
                        <div id="referenceContent"></div>
                    </div>
                    <div id="agentSection" class="service-section" role="tabpanel" aria-labelledby="tabAgent" aria-hidden="true" style="display:none;">
                        <p style="color:var(--text-muted); font-size:14px; line-height:1.6; margin-bottom:16px;">
                            Ask anything about excess baggage, interline rates, upgrade, go-show, extra legroom, regional classification, or document rules. The agent answers from the official reference (GO-SHOW/UPGRADE/EXCESS BAGGAGE RATES).
                        </p>
                        <div style="display:flex; gap:10px; margin-bottom:12px;">
                            <input 
                                type="text" 
                                id="agentQuestionInput" 
                                placeholder="e.g. Which carrier's rate applies for FZ–EK? Larnaca Malta rate? Interline rules?"
                                autocomplete="off"
                                style="flex:1; padding:14px 16px; background:rgba(0,0,0,0.3); border:1px solid var(--glass-border); border-radius:8px; color:var(--text-main); font-size:14px; outline:none;"
                            />
                            <button id="agentAskBtn" class="btn-primary" style="padding:14px 24px; white-space:nowrap;">
                                Ask
                            </button>
                        </div>
                        <p style="font-size:12px; color:var(--text-muted); margin-bottom:12px;">Try:</p>
                        <div id="agentSuggestedQuestions" style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:16px;"></div>
                        <div style="display:flex; align-items:flex-start; gap:10px;">
                            <div id="agentResponseArea" style="flex:1; min-height:120px; padding:16px; background:rgba(0,0,0,0.2); border-radius:8px; border:1px solid var(--glass-border); color:var(--text-muted); font-size:14px; line-height:1.6; white-space:pre-wrap;">
                                Your answer will appear here after you ask.
                            </div>
                            <button id="agentCopyBtn" type="button" title="Copy answer" style="display:none; padding:10px 14px; background:rgba(59,130,246,0.2); border:1px solid var(--glass-border); border-radius:8px; color:var(--info-blue); font-size:13px; cursor:pointer; white-space:nowrap; align-self:flex-start;">Copy</button>
                        </div>
                        <div id="agentHistory" style="margin-top:16px;"></div>
                    </div>
                    
                    <div style="display:flex; gap:10px; margin-bottom:20px;">
                        <button id="calculateBtn" class="btn-primary" style="flex:1;">
                            Calculate
                        </button>
                        <button id="clearBtn" class="btn-glass" style="padding:12px 24px; white-space:nowrap;">
                            Clear All
                        </button>
                    </div>
                    
                    <div id="rateResult" class="rate-result-panel" role="region" aria-live="polite" aria-atomic="true" style="display:none;"></div>
                </div>
            </div>
        </div>
    `;
    const currencies = getAllCurrencies();
    const currencyOptionsHTML = currencies.map(curr => `<option value="${curr}">${curr}</option>`).join('');
    let currencySelect = container.querySelector('#currencySelect');
    const sportsCurrency = container.querySelector('#sportsCurrency');
    const reportingCurrency = container.querySelector('#reportingCurrency');
    const upgradeSelect = container.querySelector('#upgradeCurrency');
    
    if (currencySelect) {
        currencySelect.innerHTML = '<option value="AUTO">Auto (by destination)</option>' + currencyOptionsHTML;
    }
    if (sportsCurrency) {
        sportsCurrency.innerHTML = '<option value="AED">AED</option>' + currencyOptionsHTML;
    }
    if (reportingCurrency) {
        reportingCurrency.innerHTML = '<option value="AED">AED</option>' + currencyOptionsHTML;
    }
    const upgradeCurrencies = ['AED', 'PKR', 'BHD', 'BYN', 'CHF', 'CZK', 'EGP', 'EUR', 'HUF', 'INR', 'JOD', 'KWD', 'KZT', 'LBP', 'LKR', 'MYR', 'NPR', 'OMR', 'PLN', 'QAR', 'RUB', 'SAR', 'TJS', 'THB', 'USD', 'UZS', 'IRR'];
    if (upgradeSelect) {
        upgradeSelect.innerHTML = upgradeCurrencies.map(curr => `<option value="${curr}">${curr}</option>`).join('');
    }
    const extralegroomCurrencySelect = container.querySelector('#extralegroomCurrency');
    if (extralegroomCurrencySelect) {
        const xlgrCurrencies = getExtraLegroomCurrencies();
        extralegroomCurrencySelect.innerHTML = xlgrCurrencies.map(curr => `<option value="${curr}">${curr}</option>`).join('');
    }
    try {
        const last = localStorage.getItem('gds_excess_last');
        if (last && originInput && destInput && airlineSelect && currencySelect) {
            const data = JSON.parse(last);
            if (data.origin) originInput.value = data.origin;
            if (data.destination) destInput.value = data.destination;
            if (data.airline && [...airlineSelect.options].some(o => o.value === data.airline)) airlineSelect.value = data.airline;
            if (data.currency && (data.currency === 'AUTO' || [...currencySelect.options].some(o => o.value === data.currency))) currencySelect.value = data.currency;
        }
    } catch (_) {}
    const howToUseToggle = container.querySelector('#howToUseToggle');
    const howToUseContent = container.querySelector('#howToUseContent');
    if (howToUseToggle && howToUseContent) {
        howToUseToggle.addEventListener('click', () => {
            const isOpen = howToUseContent.hidden === false;
            howToUseContent.hidden = isOpen;
            howToUseToggle.setAttribute('aria-expanded', !isOpen);
        });
    }
    const tabs = container.querySelectorAll('.service-tab');
    const sections = container.querySelectorAll('.service-section');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const service = tab.dataset.service;
            tabs.forEach(t => {
                t.classList.remove('active');
                t.style.background = '';
                t.style.borderBottom = '';
                t.style.color = '';
                t.style.boxShadow = '';
                t.setAttribute('aria-selected', 'false');
            });
            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');
            sections.forEach(s => {
                s.style.display = 'none';
                s.setAttribute('aria-hidden', 'true');
            });
            const activeSection = container.querySelector(`#${service}Section`);
            const calcBtn = container.querySelector('#calculateBtn');
            const clearBtnEl = container.querySelector('#clearBtn');
            const rateResultEl = container.querySelector('#rateResult');
            const buttonsRow = calcBtn && calcBtn.parentElement;
            if (activeSection) {
                activeSection.style.display = 'block';
                activeSection.setAttribute('aria-hidden', 'false');
                if (service === 'reference') {
                    const refContent = container.querySelector('#referenceContent');
                    if (refContent) refContent.innerHTML = renderReferenceContent();
                }
                if (service === 'reference' || service === 'agent') {
                    if (buttonsRow) buttonsRow.style.display = 'none';
                    if (rateResultEl) rateResultEl.style.display = 'none';
                } else {
                    if (buttonsRow) buttonsRow.style.display = 'flex';
                    if (rateResultEl) rateResultEl.style.display = 'none';
                }
            }
        });
    });
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
    function createAutocompleteHandler(input, dropdown, infoDiv, onSelect) {
        let debounceTimer;
        let selectedAirport = null;
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
                const results = searchAirports(query, 15);
                
                if (results.length === 0) {
                    dropdown.style.display = 'none';
                    return;
                }
                
                dropdown.innerHTML = '';
                const esc = (s) => (s == null ? '' : String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'));
                results.forEach(airport => {
                    const item = document.createElement('div');
                    item.style.cssText = 'padding:10px 12px; cursor:pointer; border-bottom:1px solid rgba(255,255,255,0.05); transition:background 0.2s;';
                    item.innerHTML = `
                        <div style="font-weight:700; color:var(--text-main); font-size:13px;">${esc(airport.code)} - ${esc(airport.name)}</div>
                        <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">${esc(airport.city)}, ${esc(airport.country)}</div>
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
            }, 200);
        });
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
    globalClickHandler = (e) => {
        const target = e.target;
        if (target && (
            target.id === 'tabDecoder' || 
            target.id === 'tabExcessBaggage' || 
            target.closest('#tabDecoder') || 
            target.closest('#tabExcessBaggage') ||
            target.closest('.header-tabs')
        )) {
            return;
        }
        activeDropdowns.forEach(({ input, dropdown }) => {
            if (!input.contains(target) && !dropdown.contains(target)) {
                dropdown.style.display = 'none';
            }
        });
    };
    document.addEventListener('click', globalClickHandler);
    createAutocompleteHandler(originInput, originAutocomplete, originInfo, (airport) => {
        const zone = getZoneForAirport(airport.code);
        originInfo.textContent = `${airport.city}, ${airport.country}${zone ? ` - Zone ${zone}` : ''}`;
        if (currencySelect && currencySelect.value === 'AUTO') {
            const destValue = destInput ? destInput.value.trim() : null;
            const currency = getCurrencyForOriginOrDestination(airport.code, destValue);
            currencySelect.value = currency;
        }
    });
    createAutocompleteHandler(destInput, destAutocomplete, destInfo, (airport) => {
        const zone = getZoneForAirport(airport.code);
        const destCurrency = getCurrencyForDestination(airport.code);
        destInfo.textContent = `${airport.city}, ${airport.country}${zone ? ` - Zone ${zone}` : ''} (${destCurrency})`;
        if (currencySelect && currencySelect.value === 'AUTO') {
            const originValue = originInput ? originInput.value.trim() : null;
            const currency = getCurrencyForOriginOrDestination(originValue, airport.code);
            currencySelect.value = currency;
        }
    });
    const swapOriginDestBtn = container.querySelector('#swapOriginDestBtn');
    if (swapOriginDestBtn && originInput && destInput) {
        swapOriginDestBtn.addEventListener('click', () => {
            const o = originInput.value;
            const oInfo = originInfo ? originInfo.textContent : '';
            originInput.value = destInput.value;
            destInput.value = o;
            if (originInfo) originInfo.textContent = destInfo ? destInfo.textContent : '';
            if (destInfo) destInfo.textContent = oInfo;
            if (currencySelect && currencySelect.value === 'AUTO') {
                const currency = getCurrencyForOriginOrDestination(originInput.value.trim(), destInput.value.trim());
                currencySelect.value = currency;
            }
        });
    }
    const goshowOrigin = container.querySelector('#goshowOrigin');
    const goshowAutocomplete = container.querySelector('#goshowAutocomplete');
    if (goshowOrigin && goshowAutocomplete) {
        createAutocompleteHandler(goshowOrigin, goshowAutocomplete, null, null);
    }
    const upgradeOrigin = container.querySelector('#upgradeOrigin');
    const upgradeAutocomplete = container.querySelector('#upgradeAutocomplete');
    if (upgradeOrigin && upgradeAutocomplete) {
        createAutocompleteHandler(upgradeOrigin, upgradeAutocomplete, null, null);
    }
    const agentQuestionInput = container.querySelector('#agentQuestionInput');
    const agentAskBtn = container.querySelector('#agentAskBtn');
    const agentResponseArea = container.querySelector('#agentResponseArea');
    const agentCopyBtn = container.querySelector('#agentCopyBtn');
    const agentSuggestedQuestions = container.querySelector('#agentSuggestedQuestions');
    const SUGGESTED_QUESTIONS = [
        'What is excess baggage?',
        'Which carrier for FZ–EK?',
        'Upgrade from Kuwait?',
        'Larnaca Malta rate?',
        'UA AC flat fees?',
        'How many tabs?',
        'Clear All'
    ];
    if (agentSuggestedQuestions) {
        agentSuggestedQuestions.innerHTML = SUGGESTED_QUESTIONS.map(q =>
            `<button type="button" class="agent-suggest-chip" data-question="${q.replace(/"/g, '&quot;')}" style="padding:8px 14px; background:rgba(59,130,246,0.15); border:1px solid var(--glass-border); border-radius:20px; color:var(--info-blue); font-size:12px; cursor:pointer; white-space:nowrap;">${q}</button>`
        ).join('');
        agentSuggestedQuestions.querySelectorAll('.agent-suggest-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const q = chip.getAttribute('data-question');
                if (q === 'Clear All') {
                    if (agentQuestionInput) agentQuestionInput.value = '';
                    if (agentResponseArea) {
                        agentResponseArea.textContent = 'Your answer will appear here after you ask.';
                        agentResponseArea.style.color = 'var(--text-muted)';
                    }
                    if (agentCopyBtn) agentCopyBtn.style.display = 'none';
                } else if (q && agentQuestionInput && agentAskBtn) {
                    agentQuestionInput.value = q;
                    agentAskBtn.click();
                }
            });
        });
    }
    if (agentAskBtn && agentQuestionInput && agentResponseArea) {
        function formatAgentAnswer(text) {
            if (!text) return '';
            return text
                .replace(/\*\*(.+?)\*\*/g, '<strong style="color:var(--text-main);">$1</strong>')
                .replace(/\n/g, '<br>');
        }
        function askAgent() {
            const query = agentQuestionInput.value.trim();
            const answer = answerAgentQuestion(query);
            agentResponseArea.innerHTML = formatAgentAnswer(answer);
            agentResponseArea.style.color = 'var(--text-main)';
            if (agentCopyBtn) {
                agentCopyBtn.style.display = 'block';
                agentCopyBtn.dataset.copyText = answer.replace(/<[^>]+>/g, '\n').replace(/&nbsp;/g, ' ');
            }
        }
        agentAskBtn.addEventListener('click', askAgent);
        agentQuestionInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                agentAskBtn.click();
            }
            if (e.key === 'Escape') {
                agentQuestionInput.value = '';
                agentResponseArea.textContent = 'Your answer will appear here after you ask.';
                agentResponseArea.style.color = 'var(--text-muted)';
                if (agentCopyBtn) agentCopyBtn.style.display = 'none';
            }
        });
        if (agentCopyBtn) {
            agentCopyBtn.addEventListener('click', () => {
                const text = agentCopyBtn.dataset.copyText || (agentResponseArea.textContent || agentResponseArea.innerText || '').trim();
                if (!text) return;
                navigator.clipboard.writeText(text).then(() => {
                    const orig = agentCopyBtn.textContent;
                    agentCopyBtn.textContent = 'Copied!';
                    setTimeout(() => { agentCopyBtn.textContent = orig; }, 1500);
                }).catch(() => {});
            });
        }
    }
    
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            originInput.value = '';
            destInput.value = '';
            if (goshowOrigin) goshowOrigin.value = '';
            if (upgradeOrigin) upgradeOrigin.value = '';
            if (airlineSelect) airlineSelect.value = 'FZ';
            if (currencySelect) currencySelect.value = 'AUTO';
            if (container.querySelector('#goshowClass')) container.querySelector('#goshowClass').value = 'ECONOMY';
            if (container.querySelector('#sportsCurrency')) container.querySelector('#sportsCurrency').value = 'AED';
            if (container.querySelector('#sportsType')) container.querySelector('#sportsType').value = 'SPEQ';
            if (container.querySelector('#reportingCurrency')) container.querySelector('#reportingCurrency').value = 'AED';
            if (container.querySelector('#reportingType')) container.querySelector('#reportingType').value = 'LRTP';
            if (container.querySelector('#transferLocation')) container.querySelector('#transferLocation').value = 'DXB';
            if (container.querySelector('#upgradeCurrency')) container.querySelector('#upgradeCurrency').value = 'AED';
            if (container.querySelector('#extralegroomCurrency')) container.querySelector('#extralegroomCurrency').value = 'AED';
            if (container.querySelector('#agentQuestionInput')) container.querySelector('#agentQuestionInput').value = '';
            const agentResponseAreaEl = container.querySelector('#agentResponseArea');
            if (agentResponseAreaEl) {
                agentResponseAreaEl.textContent = 'Your answer will appear here after you ask.';
                agentResponseAreaEl.style.color = 'var(--text-muted)';
            }
            originInfo.textContent = '';
            destInfo.textContent = '';
            originAutocomplete.style.display = 'none';
            destAutocomplete.style.display = 'none';
            if (goshowAutocomplete) goshowAutocomplete.style.display = 'none';
            if (upgradeAutocomplete) upgradeAutocomplete.style.display = 'none';
            resultDiv.style.display = 'none';
        });
    }
    function doCalculate() {
        const activeTab = container.querySelector('.service-tab.active');
        const service = activeTab ? activeTab.dataset.service : 'excess';
        const origBtnText = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'Calculating…';
        
        const done = () => {
            btn.disabled = false;
            btn.textContent = origBtnText;
        };
        
        try {
            let result;
            
            if (service === 'excess') {
                let origin = originInput.value.trim().toUpperCase();
                let destination = destInput.value.trim().toUpperCase();
                const originMatch = origin.match(/\b([A-Z]{3})\b/);
                const destMatch = destination.match(/\b([A-Z]{3})\b/);
                
                if (originMatch) origin = originMatch[1];
                if (destMatch) destination = destMatch[1];
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
                    done();
                    showError(resultDiv, 'Enter a 3-letter IATA airport code or select an airport from the search (type city or country name). Both origin and destination are required.');
                    return;
                }
                
                result = calculateExcessBaggageRate(origin, destination, airline, currency);
                if (!result.error) {
                    try {
                        localStorage.setItem('gds_excess_last', JSON.stringify({ origin, destination, airline, currency: currencySelect.value }));
                    } catch (_) {}
                }
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
                    done();
                    showError(resultDiv, 'Enter a 3-letter IATA code or select an airport from the search (by city or country).');
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
                    done();
                    showError(resultDiv, 'Enter a 3-letter IATA code or select an airport from the search (by city or country).');
                    return;
                }
                
                result = getUpgradeRate(origin, currency);
                if (!result.error) {
                    const onBoard = getUpgradeOnBoardRate(origin, currency);
                    result.onBoard = onBoard.error ? null : onBoard;
                }
            } else if (service === 'extralegroom') {
                const currency = container.querySelector('#extralegroomCurrency').value;
                result = getExtraLegroomRate(currency);
            }
            
            displayResult(resultDiv, result, service);
        } catch (e) {
            const errorMessage = e.message || "An error occurred while calculating rates";
            showError(resultDiv, `Error: ${errorMessage}`);
        } finally {
            done();
        }
    }
    
    btn.addEventListener('click', doCalculate);
    container.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            const activeTab = container.querySelector('.service-tab.active');
            const service = activeTab ? activeTab.dataset.service : '';
            if (service && service !== 'reference' && service !== 'agent') {
                e.preventDefault();
                doCalculate();
            }
        }
    });
}

const RATE_DOC_VALIDITY = 'Rates based on document GO-SHOW/UPGRADE/EXCESS BAGGAGE RATES (Version 2025.112(A) Outstation), effective 17 May 2025. Confirm with latest source before use.';

function renderReferenceContent() {
    const aircraftRows = AIRCRAFT_XLGR_REFERENCE.map(a =>
        `<tr><td>${a.type}</td><td>${a.cabin || 'Y'}</td><td>${a.capacity}</td><td>${a.xlgrRows}</td></tr>`
    ).join('');
    const interlineRows = INTERLINE_JOURNEY_RULES.map(r =>
        `<tr><td style="padding:8px; border:1px solid var(--glass-border);">${r.journey}</td><td style="padding:8px; border:1px solid var(--glass-border);">${r.condition}</td></tr>`
    ).join('');
    return `
        <div style="margin-bottom:20px; padding:14px; background:rgba(59,130,246,0.08); border-radius:8px; border-left:3px solid var(--primary-blue); font-size:13px; color:var(--text-muted);">
            <strong style="color:var(--text-main);">Document / rate validity:</strong> ${RATE_DOC_VALIDITY}
        </div>
        <div style="margin-bottom:28px;">
            <h3 style="font-size:16px; font-weight:700; color:var(--info-blue); margin-bottom:12px; border-bottom:1px solid var(--glass-border); padding-bottom:6px;">Interline Excess Baggage – Which Carrier's Rates Apply</h3>
            <p style="color:var(--text-muted); font-size:13px; margin-bottom:12px;">For interline bookings, the following carrier's excess baggage rates apply. Document: GO-SHOW/UPGRADE/EXCESS BAGGAGE RATES Version 2025.112(A) Outstation, Effective 17 May 2025.</p>
            <div style="overflow-x:auto; margin-bottom:16px;">
                <table style="width:100%; border-collapse:collapse; font-size:13px;">
                    <thead>
                        <tr style="background:rgba(59,130,246,0.15);">
                            <th style="text-align:left; padding:10px; border:1px solid var(--glass-border);">Journey</th>
                            <th style="text-align:left; padding:10px; border:1px solid var(--glass-border);">Condition</th>
                        </tr>
                    </thead>
                    <tbody>${interlineRows}</tbody>
                </table>
            </div>
            <div style="padding:12px; background:rgba(251,191,36,0.08); border-radius:8px; border-left:3px solid var(--warning-amber); font-size:13px; color:var(--text-muted); margin-bottom:10px;">
                <strong style="color:var(--warning-amber);">Customer disclaimer:</strong> ${EXCESS_BAGGAGE_DISCLAIMER}
            </div>
            <p style="font-size:12px; color:var(--text-muted); margin-bottom:20px;">In case excess baggage rate is missing for a specific destination, please refer to FS/SUP in charge.</p>
        </div>
        <div style="margin-bottom:28px;">
            <h3 style="font-size:16px; font-weight:700; color:var(--info-blue); margin-bottom:12px; border-bottom:1px solid var(--glass-border); padding-bottom:6px;">Aircraft Type & Extra Legroom (XLGR) Seats</h3>
            <p style="color:var(--text-muted); font-size:13px; margin-bottom:12px;">Reference: flydubai document Page 26 – aircraft types, capacity and XLGR seat rows.</p>
            <div style="overflow-x:auto;">
                <table style="width:100%; border-collapse:collapse; font-size:13px;">
                    <thead>
                        <tr style="background:rgba(59,130,246,0.15);">
                            <th style="text-align:left; padding:10px; border:1px solid var(--glass-border);">A/C Type</th>
                            <th style="text-align:left; padding:10px; border:1px solid var(--glass-border);">Cabin</th>
                            <th style="text-align:left; padding:10px; border:1px solid var(--glass-border);">Capacity</th>
                            <th style="text-align:left; padding:10px; border:1px solid var(--glass-border);">XLGR Rows</th>
                        </tr>
                    </thead>
                    <tbody>${aircraftRows}</tbody>
                </table>
            </div>
        </div>
        <div style="margin-bottom:28px;">
            <h3 style="font-size:16px; font-weight:700; color:var(--info-blue); margin-bottom:12px; border-bottom:1px solid var(--glass-border); padding-bottom:6px;">EK / OAL Excess Baggage (Emirates & Other Airlines)</h3>
            <p style="color:var(--text-muted); font-size:13px; line-height:1.6;">${REFERENCE_TEXTS.EK_OAL_EXCESS}</p>
        </div>
        <div style="margin-bottom:28px;">
            <h3 style="font-size:16px; font-weight:700; color:var(--info-blue); margin-bottom:12px; border-bottom:1px solid var(--glass-border); padding-bottom:6px;">UA / AC Excess Baggage (United & Air Canada)</h3>
            <p style="color:var(--text-muted); font-size:13px; line-height:1.6;">${REFERENCE_TEXTS.UA_AC_EXCESS}</p>
        </div>
        <div style="margin-bottom:12px;">
            <h3 style="font-size:16px; font-weight:700; color:var(--info-blue); margin-bottom:12px; border-bottom:1px solid var(--glass-border); padding-bottom:6px;">Regional Classification (EK/OAL)</h3>
            <p style="color:var(--text-muted); font-size:13px; line-height:1.6;">${REFERENCE_TEXTS.REGIONAL_CLASSIFICATION}</p>
        </div>
    `;
}

function showError(container, message) {
    const esc = (s) => (s == null ? '' : String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'));
    container.style.display = 'block';
    container.innerHTML = `
        <div class="glass-panel" style="margin-top:20px;">
            <div style="padding:20px;">
                <div style="padding:15px; background:rgba(248,113,113,0.1); border-radius:8px; border-left:3px solid var(--error-red); color:var(--text-main);">
                    ${esc(message)}
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
    
    let html = `<div class="glass-panel rate-result-panel" style="margin-top:20px;"><div style="padding:20px; position:relative;"><div style="position:absolute; top:12px; right:12px; display:flex; gap:8px;"><button type="button" id="printResultBtn" style="padding:8px 14px; background:rgba(59,130,246,0.2); border:1px solid var(--glass-border); border-radius:6px; color:var(--info-blue); font-size:12px; cursor:pointer;">Print result</button><button type="button" id="copyResultBtn" style="padding:8px 14px; background:rgba(59,130,246,0.2); border:1px solid var(--glass-border); border-radius:6px; color:var(--info-blue); font-size:12px; cursor:pointer;">Copy result</button></div><div id="rateResultContent">`;
    
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
    } else if (service === 'extralegroom') {
        html += displayExtraLegroomResult(result);
    }
    
    html += `</div></div></div>`;
    container.innerHTML = html;
    const copyResultBtn = container.querySelector('#copyResultBtn');
    const printResultBtn = container.querySelector('#printResultBtn');
    const rateResultContent = container.querySelector('#rateResultContent');
    if (copyResultBtn && rateResultContent) {
        copyResultBtn.addEventListener('click', () => {
            const text = (rateResultContent.textContent || rateResultContent.innerText || '').trim();
            if (!text) return;
            navigator.clipboard.writeText(text).then(() => {
                const orig = copyResultBtn.textContent;
                copyResultBtn.textContent = 'Copied!';
                setTimeout(() => { copyResultBtn.textContent = orig; }, 1500);
            }).catch(() => {});
        });
    }
    if (printResultBtn && rateResultContent) {
        printResultBtn.addEventListener('click', () => {
            const printWindow = window.open('', '_blank');
            if (!printWindow) return;
            printWindow.document.write(`
                <!DOCTYPE html><html><head><title>Rate Result</title>
                <style>body{font-family:system-ui,sans-serif;padding:24px;background:#fff;color:#111;}</style>
                </head><body><pre style="white-space:pre-wrap;word-wrap:break-word;">${(rateResultContent.textContent || rateResultContent.innerText || '').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre></body></html>`);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        });
    }
}

function displayExtraLegroomResult(result) {
    const exchangeLine = result.currencyExchange != null
        ? `<div style="background:rgba(0,0,0,0.2); padding:12px; border-radius:8px; margin-bottom:15px;"><div style="font-weight:600; margin-bottom:4px; color:var(--text-muted); font-size:12px;">Currency Exchange (to USD)</div><div style="font-size:15px; color:var(--text-main);">1 USD = ${result.currencyExchange} ${result.currency}</div></div>`
        : '';
    return `
        <div style="font-weight:700; font-size:18px; margin-bottom:15px; color:var(--info-blue);">
            ✓ Extra Legroom (XLGR) Rates
        </div>
        
        <div style="background:rgba(0,0,0,0.2); padding:15px; border-radius:8px; margin-bottom:15px;">
            <div style="font-weight:600; margin-bottom:5px; color:var(--text-muted); font-size:12px;">Currency</div>
            <div style="font-size:16px; color:var(--text-main);">${result.currency}</div>
        </div>
        ${exchangeLine}
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
            <div style="background:rgba(96,165,250,0.1); padding:15px; border-radius:8px; border-left:3px solid var(--info-blue);">
                <div style="font-weight:700; margin-bottom:8px; color:var(--info-blue); font-size:13px;">Airport Rate</div>
                <div style="font-size:22px; font-weight:800; color:var(--text-main);">${result.airport.toLocaleString()} ${result.currency}</div>
                <div style="font-size:12px; color:var(--text-muted); margin-top:4px;">At check-in / airport</div>
            </div>
            <div style="background:rgba(251,191,36,0.08); padding:15px; border-radius:8px; border-left:3px solid var(--warning-amber);">
                <div style="font-weight:700; margin-bottom:8px; color:var(--warning-amber); font-size:13px;">On Board Rate</div>
                <div style="font-size:22px; font-weight:800; color:var(--text-main);">${result.onBoard.toLocaleString()} ${result.currency}</div>
                <div style="font-size:12px; color:var(--text-muted); margin-top:4px;">When purchased on board</div>
            </div>
        </div>
    `;
}

function displayUpgradeResult(result) {
    const originCity = translateCity(result.origin);
    const exceptionBadge = result.isException && result.exceptionFrom
        ? `<div style="font-size:11px; color:var(--warning-amber); margin-bottom:8px; font-weight:600;">Exception rate: ${result.exceptionFrom}</div>`
        : '';
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
            ${exceptionBadge}
            <div style="font-weight:700; margin-bottom:10px; color:var(--info-blue);">Upgrade Rate (at airport)</div>
            <div style="font-size:24px; font-weight:800; color:var(--text-main); margin-bottom:5px;">
                ${result.rate.toLocaleString()} ${result.currency}
            </div>
            <div style="font-size:13px; color:var(--text-muted); margin-bottom:8px;">
                Adult/Child rate for upgrade to Business Class
            </div>
            ${result.infantRate != null ? `<div style="font-size:13px; color:var(--text-muted);"><strong>Infant:</strong> ${result.infantRate.toLocaleString()} ${result.currency}</div>` : ''}
        </div>
        ${result.onBoard ? `
        <div style="background:rgba(251,191,36,0.08); padding:15px; border-radius:8px; border-left:3px solid var(--warning-amber); margin-top:12px;">
            <div style="font-weight:700; margin-bottom:10px; color:var(--warning-amber);">Upgrade On Board</div>
            <div style="font-size:20px; font-weight:700; color:var(--text-main); margin-bottom:5px;">
                ${result.onBoard.rate.toLocaleString()} ${result.onBoard.currency}
            </div>
            <div style="font-size:13px; color:var(--text-muted); margin-bottom:8px;">
                Adult/Child rate when upgrading on board
            </div>
            ${result.onBoard.infantRate != null ? `<div style="font-size:13px; color:var(--text-muted);"><strong>Infant:</strong> ${result.onBoard.infantRate.toLocaleString()} ${result.onBoard.currency}</div>` : ''}
        </div>
        ` : ''}
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
                ${result.isException ? '<div style="font-size:11px; color:var(--warning-amber); margin-bottom:8px; font-weight:600;">Exception rate for this route</div>' : ''}
                <div style="font-weight:700; margin-bottom:10px; color:var(--info-blue);">Excess Baggage Rate</div>
                <div style="font-size:24px; font-weight:800; color:var(--text-main); margin-bottom:5px;">
                    ${result.ratePerKg} ${result.currency}
                </div>
                <div style="font-size:13px; color:var(--text-muted);">
                    Per kilogram (kg) of excess baggage
                </div>
                ${result.indiaNote ? `<div style="margin-top:12px; padding:10px; background:rgba(251,191,36,0.08); border-radius:6px; font-size:12px; color:var(--text-muted); border-left:3px solid var(--warning-amber);"><strong>India (without pre-purchased baggage):</strong> ${result.indiaNote}</div>` : ''}
            </div>
        `;
    } else if (result.airline === 'EK' || result.airline === 'OAL') {
        const routeInfo = result.originRegion && result.destRegion 
            ? `Route: ${result.originRegion} → ${result.destRegion}`
            : '';
        const lcaMlaBadge = result.isLarnacaMaltaException 
            ? '<div style="font-size:11px; color:var(--warning-amber); margin-bottom:8px; font-weight:600;">Larnaca–Malta exception: $15 per kg</div>' 
            : '';
        const fsSupNote = result.referToFSSUP 
            ? '<div style="margin-top:10px; padding:10px; background:rgba(251,191,36,0.08); border-radius:6px; font-size:12px; color:var(--text-muted); border-left:3px solid var(--warning-amber);">If rate is missing for this destination, refer to FS/SUP in charge.</div>' 
            : '';
        const perPieceBlock = result.ratePerPiece != null 
            ? `<div style="margin-top:12px; padding:10px; background:rgba(0,0,0,0.2); border-radius:6px;"><div style="font-weight:600; margin-bottom:4px; color:var(--text-muted); font-size:12px;">Additional piece (at airport)</div><div style="font-size:18px; font-weight:700; color:var(--text-main);">${result.ratePerPiece.toLocaleString()} ${result.pieceCurrency}</div><div style="font-size:11px; color:var(--text-muted);">Per additional piece of baggage</div></div>` 
            : '';
        html += `
            <div style="background:rgba(96,165,250,0.1); padding:15px; border-radius:8px; border-left:3px solid var(--info-blue);">
                ${lcaMlaBadge}
                <div style="font-weight:700; margin-bottom:10px; color:var(--info-blue);">Excess Baggage Rate (per kg)</div>
                <div style="font-size:24px; font-weight:800; color:var(--text-main); margin-bottom:5px;">
                    ${result.ratePerKg === null || result.ratePerKg === 'N/A' || result.ratePerKg === undefined ? 'Rate not available' : `$${result.ratePerKg} USD`}
                </div>
                <div style="font-size:13px; color:var(--text-muted); margin-bottom:10px;">
                    Per kilogram (kg) of excess baggage
                    ${routeInfo ? `<br><span style="font-size:11px; color:var(--text-dim); margin-top:5px; display:block;">${routeInfo}</span>` : ''}
                </div>
                ${perPieceBlock}
                ${fsSupNote}
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
    
    html += `
        <div style="margin-top:16px; padding:12px; background:rgba(251,191,36,0.08); border-radius:8px; border-left:3px solid var(--warning-amber); font-size:12px; color:var(--text-muted); line-height:1.5;">
            <strong style="color:var(--warning-amber);">Note:</strong> ${EXCESS_BAGGAGE_DISCLAIMER}
        </div>
    `;
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
