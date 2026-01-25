/**
 * UI for Excess Baggage Rate Calculator
 */

import { calculateExcessBaggageRate, getZoneForAirport, getZoneName, getCurrencyForDestination } from "./excessBaggage.js";
import { translateAirline, translateCity } from "./translator.js";

export function renderExcessBaggageCalculator(container) {
    container.innerHTML = `
        <div class="excess-baggage-container">
            <div class="glass-panel" style="margin-bottom:20px;">
                <div style="padding:20px;">
                    <h2 style="font-size:20px; font-weight:800; margin-bottom:10px; color:var(--text-main);">
                        Excess Baggage Rate Calculator
                    </h2>
                    <p style="color:var(--text-muted); font-size:14px; line-height:1.6; margin-bottom:20px;">
                        Calculate excess baggage rates for Flydubai (FZ), Emirates (EK), Air Canada (AC), and United Airlines (UA) based on origin and destination.
                    </p>
                    
                    <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:15px; margin-bottom:20px;">
                        <div>
                            <label style="display:block; font-weight:600; margin-bottom:8px; color:var(--text-main);">
                                Origin Airport (3-letter code)
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
                                Destination Airport (3-letter code)
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
                    </div>
                    
                    <button id="calculateBtn" class="btn-primary" style="width:100%; margin-bottom:20px;">
                        Calculate Excess Baggage Rate
                    </button>
                    
                    <div id="rateResult" style="display:none;"></div>
                </div>
            </div>
        </div>
    `;
    
    const originInput = container.querySelector('#originInput');
    const destInput = container.querySelector('#destinationInput');
    const airlineSelect = container.querySelector('#airlineSelect');
    const btn = container.querySelector('#calculateBtn');
    const resultDiv = container.querySelector('#rateResult');
    const originInfo = container.querySelector('#originInfo');
    const destInfo = container.querySelector('#destinationInfo');
    
    // Auto-update info on input
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
        } else {
            destInfo.textContent = '';
        }
    });
    
    btn.addEventListener('click', () => {
        const origin = originInput.value.trim().toUpperCase();
        const destination = destInput.value.trim().toUpperCase();
        const airline = airlineSelect.value;
        
        if (!origin || origin.length !== 3) {
            resultDiv.style.display = 'block';
            resultDiv.innerHTML = `
                <div style="padding:15px; background:rgba(251,191,36,0.1); border-radius:8px; border-left:3px solid var(--warning-amber); color:var(--text-main);">
                    Please enter a valid 3-letter origin airport code.
                </div>
            `;
            return;
        }
        
        if (!destination || destination.length !== 3) {
            resultDiv.style.display = 'block';
            resultDiv.innerHTML = `
                <div style="padding:15px; background:rgba(251,191,36,0.1); border-radius:8px; border-left:3px solid var(--warning-amber); color:var(--text-main);">
                    Please enter a valid 3-letter destination airport code.
                </div>
            `;
            return;
        }
        
        try {
            const result = calculateExcessBaggageRate(origin, destination, airline);
            displayResult(resultDiv, result);
        } catch (e) {
            console.error(e);
            resultDiv.style.display = 'block';
            resultDiv.innerHTML = `
                <div style="padding:15px; background:rgba(248,113,113,0.1); border-radius:8px; border-left:3px solid var(--error-red); color:var(--text-main);">
                    Error calculating rate: ${e.message}
                </div>
            `;
        }
    });
}

function displayResult(container, result) {
    container.style.display = 'block';
    
    if (result.error) {
        container.innerHTML = `
            <div class="glass-panel" style="margin-top:20px;">
                <div style="padding:20px;">
                    <div style="padding:15px; background:rgba(248,113,113,0.1); border-radius:8px; border-left:3px solid var(--error-red); color:var(--text-main);">
                        ${result.error}
                    </div>
                </div>
            </div>
        `;
        return;
    }
    
    const carrierColor = result.airline === 'EK' ? 'var(--info-blue)' : 
                        result.airline === 'AC' ? 'var(--success-green)' :
                        result.airline === 'UA' ? 'var(--primary-blue)' :
                        'var(--warning-amber)';
    
    const originCity = translateCity(result.origin);
    const destCity = translateCity(result.destination);
    
    let html = `
        <div class="glass-panel" style="margin-top:20px;">
            <div style="padding:20px;">
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
    
    // Display rates based on airline
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
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:15px;">
                        <div style="padding:10px; background:rgba(0,0,0,0.2); border-radius:6px;">
                            <div style="font-size:11px; color:var(--text-muted); margin-bottom:3px;">Economy Class</div>
                            <div style="font-size:18px; font-weight:700; color:var(--text-main);">${result.freeAllowanceEco} kg</div>
                        </div>
                        <div style="padding:10px; background:rgba(0,0,0,0.2); border-radius:6px;">
                            <div style="font-size:11px; color:var(--text-muted); margin-bottom:3px;">Business Class</div>
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
                            <span style="color:var(--text-muted);">3rd or More Excess Bag</span>
                            <span style="font-weight:700; color:var(--text-main);">$${result.rates['3_or_more_excess_bag']}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; padding:8px; background:rgba(0,0,0,0.2); border-radius:4px;">
                            <span style="color:var(--text-muted);">Oversize Bag</span>
                            <span style="font-weight:700; color:var(--text-main);">$${result.rates.oversize}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; padding:8px; background:rgba(0,0,0,0.2); border-radius:4px;">
                            <span style="color:var(--text-muted);">Overweight Bag</span>
                            <span style="font-weight:700; color:var(--text-main);">$${result.rates.overweight}</span>
                        </div>
                    </div>
                </div>
        `;
    }
    
    html += `
                <div style="background:rgba(96,165,250,0.1); padding:15px; border-radius:8px; border-left:3px solid var(--info-blue); margin-top:15px;">
                    <div style="font-weight:600; margin-bottom:8px; color:var(--info-blue);">Important Notes:</div>
                    <div style="font-size:12px; color:var(--text-muted); line-height:1.6;">
                        <div>• Rates are per kilogram (kg) for FZ and EK, per piece for AC/UA.</div>
                        <div>• Rates may vary based on route and booking class.</div>
                        <div>• For interline bookings, refer to the applicable carrier's policy.</div>
                        <div>• Contact FLX team if rate is missing for a specific destination.</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}
