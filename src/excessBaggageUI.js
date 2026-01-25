/**
 * UI for Excess Baggage Policy Calculator
 */

import { parseItinerary, determineApplicableCarrier, getPolicyExplanation } from "./excessBaggage.js";
import { translateAirline, translateCity } from "./translator.js";

export function renderExcessBaggageCalculator(container) {
    container.innerHTML = `
        <div class="excess-baggage-container">
            <div class="glass-panel" style="margin-bottom:20px;">
                <div style="padding:20px;">
                    <h2 style="font-size:20px; font-weight:800; margin-bottom:10px; color:var(--text-main);">
                        Overweight/Excess Charges Policy for Interline Booking
                    </h2>
                    <p style="color:var(--text-muted); font-size:14px; line-height:1.6; margin-bottom:20px;">
                        This tool determines which airline's excess baggage rates apply for interline bookings involving Flydubai (FZ) and partner airlines.
                    </p>
                    
                    <div style="background:rgba(96,165,250,0.1); padding:15px; border-radius:8px; border-left:3px solid var(--info-blue); margin-bottom:20px;">
                        <div style="font-weight:700; color:var(--info-blue); margin-bottom:10px; font-size:13px;">
                            📋 Policy Rules:
                        </div>
                        <div style="font-size:12px; color:var(--text-main); line-height:1.8;">
                            <div>• <strong>FZ - EK:</strong> EK rates apply</div>
                            <div>• <strong>FZ - EK - AC</strong> (EK is Transatlantic): EK rates apply</div>
                            <div>• <strong>FZ - OAL</strong> (Other Airlines): EK rates apply</div>
                            <div>• <strong>FZ - AC</strong> (AC is Transatlantic): AC rates apply</div>
                            <div>• <strong>FZ - UA</strong> (UA is Transatlantic): UA rates apply</div>
                        </div>
                    </div>
                    
                    <div style="margin-bottom:20px;">
                        <label style="display:block; font-weight:600; margin-bottom:8px; color:var(--text-main);">
                            Enter Itinerary (one segment per line):
                        </label>
                        <textarea 
                            id="itineraryInput" 
                            placeholder="Example formats:&#10;FZ: TAS-DXB&#10;EK: DXB-YUL&#10;AC: YUL-YYZ&#10;&#10;Or:&#10;FZ746L05JAN TIADXB HK1&#10;EK374K29JAN DXBYUL HK1"
                            style="width:100%; min-height:150px; padding:15px; background:rgba(0,0,0,0.3); border:1px solid var(--glass-border); border-radius:8px; color:var(--text-main); font-family:var(--font-code); font-size:13px; resize:vertical; outline:none;"
                        ></textarea>
                    </div>
                    
                    <button id="calculateBtn" class="btn-primary" style="width:100%; margin-bottom:20px;">
                        Calculate Applicable Policy
                    </button>
                    
                    <div id="policyResult" style="display:none;"></div>
                </div>
            </div>
        </div>
    `;
    
    const input = container.querySelector('#itineraryInput');
    const btn = container.querySelector('#calculateBtn');
    const resultDiv = container.querySelector('#policyResult');
    
    btn.addEventListener('click', () => {
        const inputText = input.value.trim();
        if (!inputText) {
            resultDiv.style.display = 'block';
            resultDiv.innerHTML = `
                <div style="padding:15px; background:rgba(251,191,36,0.1); border-radius:8px; border-left:3px solid var(--warning-amber); color:var(--text-main);">
                    Please enter an itinerary to calculate the applicable policy.
                </div>
            `;
            return;
        }
        
        try {
            const segments = parseItinerary(inputText);
            if (segments.length === 0) {
                resultDiv.style.display = 'block';
                resultDiv.innerHTML = `
                    <div style="padding:15px; background:rgba(248,113,113,0.1); border-radius:8px; border-left:3px solid var(--error-red); color:var(--text-main);">
                        Could not parse itinerary. Please use formats like:<br>
                        <code>FZ: TAS-DXB</code> or <code>FZ746L05JAN TIADXB HK1</code>
                    </div>
                `;
                return;
            }
            
            const result = determineApplicableCarrier(segments);
            displayResult(resultDiv, result, segments);
        } catch (e) {
            console.error(e);
            resultDiv.style.display = 'block';
            resultDiv.innerHTML = `
                <div style="padding:15px; background:rgba(248,113,113,0.1); border-radius:8px; border-left:3px solid var(--error-red); color:var(--text-main);">
                    Error calculating policy: ${e.message}
                </div>
            `;
        }
    });
}

function displayResult(container, result, segments) {
    container.style.display = 'block';
    
    const carrierColor = result.applicableCarrier === 'EK' ? 'var(--info-blue)' : 
                        result.applicableCarrier === 'AC' ? 'var(--success-green)' :
                        result.applicableCarrier === 'UA' ? 'var(--primary-blue)' :
                        'var(--warning-amber)';
    
    let html = `
        <div class="glass-panel" style="margin-top:20px;">
            <div style="padding:20px;">
                <div style="font-weight:700; font-size:18px; margin-bottom:15px; color:${carrierColor};">
                    ✓ Applicable Carrier: ${result.carrierName || result.applicableCarrier} (${result.applicableCarrier})
                </div>
                
                <div style="background:rgba(0,0,0,0.2); padding:15px; border-radius:8px; margin-bottom:15px;">
                    <div style="font-weight:600; margin-bottom:8px; color:var(--text-main);">Policy Rule:</div>
                    <div style="color:var(--text-muted); font-size:14px;">${result.description}</div>
                </div>
                
                <div style="margin-bottom:15px;">
                    <div style="font-weight:600; margin-bottom:10px; color:var(--text-main);">Itinerary Breakdown:</div>
                    <div style="display:flex; flex-direction:column; gap:8px;">
    `;
    
    segments.forEach((seg, idx) => {
        const carrierName = translateAirline(seg.carrier);
        const fromCity = translateCity(seg.from);
        const toCity = translateCity(seg.to);
        const isApplicable = seg.carrier === result.applicableCarrier;
        
        html += `
            <div style="padding:12px; background:${isApplicable ? 'rgba(96,165,250,0.15)' : 'rgba(0,0,0,0.2)'}; border-radius:6px; border-left:3px solid ${isApplicable ? carrierColor : 'var(--glass-border)'};">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                    <div style="font-weight:700; color:${isApplicable ? carrierColor : 'var(--text-main)'};">
                        ${idx + 1}. ${seg.carrier} (${carrierName})
                        ${isApplicable ? ' <span style="font-size:11px;">← Rates Apply</span>' : ''}
                    </div>
                </div>
                <div style="font-size:13px; color:var(--text-muted);">
                    ${seg.from} (${fromCity}) → ${seg.to} (${toCity})
                </div>
            </div>
        `;
    });
    
    html += `
                    </div>
                </div>
                
                <div style="background:rgba(96,165,250,0.1); padding:15px; border-radius:8px; border-left:3px solid var(--info-blue);">
                    <div style="font-weight:600; margin-bottom:8px; color:var(--info-blue);">Important Notes:</div>
                    <div style="font-size:12px; color:var(--text-muted); line-height:1.6;">
                        <div>• Excess baggage rates for <strong>${result.carrierName || result.applicableCarrier}</strong> will apply to this interline booking.</div>
                        <div>• Rates are based on the destination and weight of excess baggage.</div>
                        <div>• For specific rate tables, refer to the carrier's excess baggage policy document.</div>
                        <div>• If excess baggage rate is missing for a specific destination, contact the FLX team.</div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = html;
}
