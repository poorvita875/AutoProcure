"use client";
import React, { useState } from 'react';
import { LightRays } from '@/components/ui/LightRays';
import { generateRFQ } from '@/lib/api';

const mockVendorBids = [
  { id: 1, name: 'ABC Bearings', rating: 4.8, price: '₹118', delivery: '7 days', initials: 'AB', best: true },
  { id: 2, name: 'XYZ Parts', rating: 4.2, price: '₹125', delivery: '10 days', initials: 'XP', best: false },
  { id: 3, name: 'LMN Industries', rating: 4.5, price: '₹132', delivery: '5 days', initials: 'LM', best: false }
];

const mockRFQData = {
  subject: 'RFQ for SKF 6205 Bearings — 500 units',
  vendors: ['ABC Bearings', 'XYZ Parts', 'LMN Industries'],
  body: `Dear Vendor,\n\nWe require the following:\n\nItem: SKF 6205 Bearings\nQuantity: 500 units\nDelivery: Pune by May 20th\n\nPlease send your best quote within 24 hours.\n\nRegards,\nProcurement Team`
};

export default function RFQAgent() {
  const [requirement, setRequirement] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [rfqData, setRfqData] = useState(null);
  const [vendorBids, setVendorBids] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [result, setResult] = useState(null);
  const [apiError, setApiError] = useState(null);

  const handleGenerate = async () => {
    if (!requirement.trim()) return;
    setIsGenerating(true);
    setRfqData(null);
    setVendorBids(null);
    setResult(null);
    setApiError(null);

    try {
      const data = await generateRFQ(requirement);
      setResult(data);
    } catch (err) {
      // Fall back to mock data if API is unavailable
      setApiError('Backend unavailable — showing mock data.');
      setRfqData(mockRFQData);
      setVendorBids(mockVendorBids);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectVendor = (id) => {
    const vendor = vendorBids ? vendorBids.find(v => v.id === id) : null;
    if (vendor) setSelectedVendor(vendor);
  };

  return (
    <div className="min-h-screen w-full text-white rfq-page">
      <div className="rfq-bg">
        <LightRays
          raysOrigin="top-center"
          raysColor="#a78bfa"
          raysSpeed={1.5}
          lightSpread={1.2}
          rayLength={1.8}
          followMouse={true}
          mouseInfluence={0.3}
          noiseAmount={0.03}
          distortion={0.08}
          className="z-0 opacity-60"
        />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-10 space-y-10 z-10">
        <header className="relative rfq-title-block">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="rfq-title">RFQ AGENT</div>
              <div className="rfq-underline" aria-hidden="true" />
              <div className="text-slate-300 text-[12px] font-mono tracking-[0.18em] uppercase">
                AUTONOMOUS SOURCING ENGINE v2.4
              </div>
            </div>
            <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.15em] text-emerald-300 mt-1">
              <span className="rfq-online-dot" aria-hidden="true" />
              SYSTEM ONLINE
            </div>
          </div>
          <div className="mt-6 rfq-hr" aria-hidden="true" />
        </header>

        {/* SECTION 1 — REQUIREMENT INPUT */}
        <section className="rfq-step-card relative overflow-hidden rfq-entrance rfq-entrance-1">
          <div className="rfq-step-watermark" aria-hidden="true">01</div>
          <div className="rfq-step-leftglow" aria-hidden="true" />

          <div className="rfq-section-label rfq-card-header">REQUIREMENT INPUT</div>
          
          <div className="mt-6 space-y-4">
            <textarea
              className="rfq-search w-full resize-y min-h-[100px]"
              placeholder="e.g. Need 500 SKF 6205 bearings delivered to Pune by May 20th"
              rows={4}
              value={requirement}
              onChange={(e) => setRequirement(e.target.value)}
              disabled={isGenerating}
            />
            
            <div className="flex flex-wrap gap-2">
              {["500 bearings by May 20th", "1,000 steel rods urgent", "50 circuit boards by Friday"].map((chip, idx) => (
                <button 
                  key={idx}
                  type="button"
                  className="rfq-chip rfq-suggest" 
                  style={{ animationDelay: `${idx * 45}ms` }}
                  onClick={() => !isGenerating && setRequirement(chip)}
                >
                  {chip}
                </button>
              ))}
            </div>

            <div className="pt-4">
              <button 
                className={["rfq-icon-btn rfq-send-btn", (isGenerating || !requirement.trim()) ? "rfq-send-disabled" : ""].join(" ")}
                onClick={handleGenerate}
                disabled={isGenerating || !requirement.trim()}
              >
                {isGenerating ? (
                  <>
                    <span className="rfq-typing mr-2">
                      <span className="rfq-dot rfq-dot-1" />
                      <span className="rfq-dot rfq-dot-2" />
                      <span className="rfq-dot rfq-dot-3" />
                    </span>
                    GENERATING...
                  </>
                ) : (
                  <>➤ GENERATE RFQ</>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* API ERROR NOTICE */}
        {apiError && (
          <div className="rfq-bubble border-yellow-500/30 bg-yellow-900/10 text-yellow-300 text-[11px] font-mono tracking-widest uppercase">
            ⚠ {apiError}
          </div>
        )}

        {/* SECTION 1b — REAL API RESULT */}
        {result && (
          <>
            {/* Generated RFQ Text */}
            <section className="rfq-step-card relative overflow-hidden rfq-entrance rfq-entrance-2">
              <div className="rfq-step-watermark" aria-hidden="true">02</div>
              <div className="rfq-step-leftglow" aria-hidden="true" />
              <div className="rfq-section-label rfq-card-header mb-6">GENERATED RFQ</div>
              <pre className="rfq-bubble rfq-bubble-ai font-mono text-sm text-slate-300 leading-relaxed whitespace-pre-wrap overflow-auto max-h-72">
                {result.rfq_text}
              </pre>
            </section>

            {/* Top Vendors */}
            <section className="rfq-step-card relative overflow-hidden rfq-entrance rfq-entrance-3">
              <div className="rfq-step-watermark" aria-hidden="true">03</div>
              <div className="rfq-step-leftglow" aria-hidden="true" />
              <div className="flex justify-between items-center rfq-card-header mb-6">
                <div className="rfq-section-label">TOP 3 MATCHED VENDORS</div>
                <div className="text-[11px] font-mono tracking-widest text-emerald-400">
                  {result.top_vendors?.length ?? 0} MATCHED
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {result.top_vendors?.map((vendor, i) => (
                  <div
                    key={vendor.id}
                    className="rfq-bubble rfq-bubble-user flex flex-col relative overflow-hidden"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    {/* Rank badge */}
                    <div className="mb-3">
                      <span className={[
                        "text-[10px] font-mono px-2 py-1 rounded-full tracking-widest uppercase font-bold border",
                        i === 0 ? "bg-emerald-900/40 text-emerald-300 border-emerald-700/50" :
                        i === 1 ? "bg-cyan-900/40 text-cyan-300 border-cyan-700/50" :
                                  "bg-slate-800/60 text-slate-400 border-slate-600/50"
                      ].join(" ")}>
                        #{i + 1} {i === 0 ? 'Best Match' : i === 1 ? 'Runner Up' : 'Alternative'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full border border-cyan-500/30 bg-cyan-900/20 flex items-center justify-center text-sm font-bold text-cyan-300">
                        {vendor.name?.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white tracking-wide">{vendor.name}</div>
                        <div className="text-[11px] font-mono text-slate-400 mt-0.5">{vendor.category}</div>
                      </div>
                    </div>

                    {/* Risk badge */}
                    <span className={[
                      "text-[10px] font-mono px-2 py-1 rounded-full mb-4 inline-block border w-fit",
                      vendor.risk_level === 'Low'    ? "bg-emerald-900/30 text-emerald-300 border-emerald-700/40" :
                      vendor.risk_level === 'Medium' ? "bg-yellow-900/30 text-yellow-300 border-yellow-700/40" :
                                                       "bg-rose-900/30 text-rose-300 border-rose-700/40"
                    ].join(" ")}>
                      RISK: {vendor.risk_level} ({vendor.risk_score}/100)
                    </span>

                    <button className="rfq-icon-btn w-full justify-center mt-auto border-violet-500/30 text-violet-300 hover:bg-violet-900/20 hover:border-violet-400">
                      ➤ SEND RFQ EMAIL
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {/* SECTION 2 — GENERATED RFQ (mock fallback) */}
        {rfqData && (
          <section className="rfq-step-card relative overflow-hidden rfq-entrance rfq-entrance-2">
            <div className="rfq-step-watermark" aria-hidden="true">02</div>
            <div className="rfq-step-leftglow" aria-hidden="true" />

            <div className="flex justify-between items-center rfq-card-header mb-6">
              <div className="rfq-section-label">GENERATED EMAIL</div>
              <div className="flex gap-2">
                <button className="rfq-icon-btn">COPY</button>
                <button className="rfq-icon-btn">EDIT</button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-mono tracking-widest text-slate-400 uppercase">To:</span>
                <div className="flex gap-2">
                  {rfqData.vendors.map((vendor, idx) => (
                    <span key={idx} className="rfq-source-pill">
                      {vendor}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[11px] font-mono tracking-widest text-slate-400 uppercase">Subject:</span>
                <span className="text-sm font-semibold tracking-wide text-cyan-100">{rfqData.subject}</span>
              </div>

              <div className="rfq-bubble rfq-bubble-ai font-mono text-sm text-slate-300 leading-relaxed whitespace-pre-wrap mt-4">
                {rfqData.body}
              </div>
            </div>
          </section>
        )}

        {/* SECTION 3 — VENDOR BIDS */}
        {rfqData && (
          <section className="rfq-step-card relative overflow-hidden rfq-entrance rfq-entrance-3">
            <div className="rfq-step-watermark" aria-hidden="true">03</div>
            <div className="rfq-step-leftglow" aria-hidden="true" />

            <div className="flex justify-between items-center rfq-card-header mb-6">
              <div className="rfq-section-label">VENDOR RESPONSES</div>
              <div className="text-[11px] font-mono tracking-widest text-emerald-400">
                {vendorBids ? `${vendorBids.length} RECEIVED` : 'AWAITING REPLIES'}
              </div>
            </div>

            {!vendorBids ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="rfq-typing mb-4">
                  <span className="rfq-dot rfq-dot-1" />
                  <span className="rfq-dot rfq-dot-2" />
                  <span className="rfq-dot rfq-dot-3" />
                </div>
                <div className="text-sm font-semibold tracking-wider text-cyan-200 mb-2">AWAITING VENDOR RESPONSES</div>
                <div className="text-[11px] font-mono tracking-widest text-slate-400 uppercase">Expected within 2-3 hours</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {vendorBids.map((vendor, idx) => (
                  <div key={vendor.id} className="rfq-bubble rfq-bubble-user flex flex-col relative overflow-hidden" style={{ animationDelay: `${idx * 100}ms` }}>
                    {vendor.best && (
                      <div className="absolute top-0 right-0 bg-cyan-900/40 text-cyan-300 text-[10px] font-mono px-3 py-1 border-b border-l border-cyan-800/50 rounded-bl-lg tracking-widest uppercase font-bold">
                        Best Value
                      </div>
                    )}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full border border-cyan-500/30 bg-cyan-900/20 flex items-center justify-center text-sm font-bold text-cyan-300">
                        {vendor.initials}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white tracking-wide">{vendor.name}</div>
                        <div className="text-[11px] font-mono text-emerald-400 mt-1">★ {vendor.rating}</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-6 flex-grow">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-mono text-slate-400 uppercase">Unit Price</span>
                        <span className="text-lg font-bold text-cyan-100">{vendor.price}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-mono text-slate-400 uppercase">Delivery</span>
                        <span className="text-sm text-slate-200">{vendor.delivery}</span>
                      </div>
                    </div>

                    <button
                      className={["rfq-icon-btn w-full justify-center", vendor.best ? "border-cyan-400 text-cyan-300 bg-cyan-900/20 hover:bg-cyan-800/40" : ""].join(" ")}
                      onClick={() => handleSelectVendor(vendor.id)}
                    >
                      {vendor.best ? "★ SELECT BEST" : "SELECT"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      {/* CONFIRMATION MODAL */}
      {selectedVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md rfq-entrance">
          <div className="rfq-step-card max-w-md w-full m-4 relative overflow-hidden">
            <div className="rfq-step-leftglow" aria-hidden="true" />
            <h3 className="text-lg font-bold font-mono text-cyan-100 mb-6 tracking-wide">CONFIRM AWARD</h3>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center pb-3 border-b border-cyan-900/30">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest">Vendor</span>
                <span className="text-sm font-bold text-cyan-300">{selectedVendor.name}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-cyan-900/30">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest">Unit Price</span>
                <span className="text-sm font-bold text-cyan-300">{selectedVendor.price}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest">Quantity</span>
                <span className="text-sm font-bold text-cyan-300">500 units</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => {
                  alert('Award Confirmed!');
                  setSelectedVendor(null);
                }}
                className="rfq-icon-btn flex-1 justify-center border-emerald-500/50 text-emerald-400 hover:bg-emerald-900/20"
              >
                ✓ CONFIRM AWARD
              </button>
              <button 
                onClick={() => setSelectedVendor(null)}
                className="rfq-icon-btn flex-1 justify-center border-rose-500/30 text-rose-300 hover:bg-rose-900/20"
              >
                ✕ CANCEL
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&family=Orbitron:wght@500;600;700&display=swap");

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes riseIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInLeft { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes underlineExpand { from { transform: scaleX(0); transform-origin: left; } to { transform: scaleX(1); transform-origin: left; } }
        @keyframes dotBounce { 0%,80%,100% { transform: translateY(0); opacity: 0.4; } 40% { transform: translateY(-4px); opacity: 1; } }
        @keyframes popIn { 0% { opacity: 0; transform: scale(0.9); } 70% { transform: scale(1.02); } 100% { opacity: 1; transform: scale(1); } }
        @keyframes cursorBlink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }

        .rfq-title-block { animation: riseIn 0.3s ease both; }
        .rfq-entrance { animation: riseIn 0.35s ease both; }
        .rfq-entrance-1 { animation-delay: 0.05s; }
        .rfq-entrance-2 { animation-delay: 0.12s; }
        .rfq-entrance-3 { animation-delay: 0.19s; }

        .rfq-card-header { position: relative; padding-bottom: 6px; }
        .rfq-card-header::after {
          content: "";
          position: absolute; left: 0; bottom: 0; height: 1px; width: 100%;
          background: rgba(226, 232, 240, 0.12);
          transform: scaleX(0);
          animation: underlineExpand 0.4s ease 0.1s both;
        }

        .rfq-page {
          background: radial-gradient(circle at 50% 20%, #020818 0%, #000000 70%, #000000 100%);
          font-family: Inter, system-ui, -apple-system, sans-serif;
          position: relative;
          overflow: hidden;
        }
        .rfq-bg { position: absolute; inset: 0; z-index: 0; pointer-events: none; }

        .rfq-title {
          font-family: Orbitron, Inter, system-ui;
          font-size: 24px; font-weight: 700; letter-spacing: 0.3em;
          text-transform: uppercase; color: #e2e8f0;
          text-shadow: 0 0 20px rgba(6, 182, 212, 0.18);
        }
        .rfq-underline { height: 2px; width: 100%; background: linear-gradient(90deg, transparent, #06b6d4, transparent); transform-origin: left; animation: underlineExpand 0.4s ease 0.1s both; }
        .rfq-hr { height: 1px; width: 100%; background: linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.65), transparent); opacity: 0.75; }
        .rfq-section-label { font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: #e2e8f0; font-weight: 600; }
        
        .rfq-online-dot { width: 10px; height: 10px; border-radius: 9999px; background: #10b981; box-shadow: 0 0 12px rgba(16, 185, 129, 0.65); animation: blink 1s infinite; }

        .rfq-step-card {
          background: rgba(6, 182, 212, 0.04);
          border: 1px solid rgba(6, 182, 212, 0.15);
          backdrop-filter: blur(20px);
          border-radius: 18px;
          padding: 24px;
          position: relative;
          z-index: 1;
          transition: border-color 200ms ease;
          box-shadow: 0 0 0 1px rgba(6, 182, 212, 0.04), 0 18px 50px rgba(0,0,0,0.4);
        }
        .rfq-step-card:hover { border-color: rgba(6, 182, 212, 0.35); }
        .rfq-step-leftglow { position: absolute; inset: 10px auto 10px 10px; width: 4px; border-radius: 999px; background: linear-gradient(180deg, rgba(6,182,212,0.9), rgba(124,58,237,0.45)); box-shadow: 0 0 18px rgba(6, 182, 212, 0.4); }
        .rfq-step-watermark { position: absolute; top: 10px; right: 12px; font-family: Orbitron, Inter, system-ui; font-weight: 700; font-size: 42px; letter-spacing: 0.12em; color: rgba(6, 182, 212, 0.08); user-select: none; pointer-events: none; }

        .rfq-icon-btn, .rfq-chip, .rfq-search {
          transition: background 180ms ease, color 180ms ease, border-color 180ms ease, transform 100ms ease, opacity 180ms ease;
        }
        .rfq-icon-btn { border-radius: 12px; padding: 10px 14px; font-size: 12px; font-weight: 600; letter-spacing: 0.05em; color: #e2e8f0; background: rgba(255,255,255,0.02); border: 1px solid rgba(6, 182, 212, 0.25); outline: none; display: inline-flex; align-items: center; gap: 6px; cursor: pointer; }
        .rfq-icon-btn:hover:not(:disabled) { background: rgba(6, 182, 212, 0.08); border-color: rgba(6, 182, 212, 0.5); }
        .rfq-icon-btn:active:not(:disabled) { transform: scale(0.97); }
        
        .rfq-send-btn { transition: opacity 180ms ease, background 180ms ease, border-color 180ms ease, transform 100ms ease; }
        .rfq-send-disabled { opacity: 0.5; cursor: not-allowed !important; }
        
        .rfq-chip { font-size: 12px; color: #e2e8f0; background: rgba(255,255,255,0.03); border: 1px solid rgba(6,182,212,0.25); border-radius: 999px; padding: 6px 12px; outline: none; cursor: pointer; }
        .rfq-chip:hover { background: rgba(6,182,212,0.1); border-color: rgba(6,182,212,0.5); }
        .rfq-chip:active { transform: scale(0.94); }
        .rfq-suggest { animation: slideInLeft 0.22s ease both; }

        .rfq-search {
          width: 100%;
          border-radius: 14px;
          background: rgba(6,182,212,0.03);
          border: 1px solid rgba(6,182,212,0.2);
          padding: 14px 16px;
          color: #e2e8f0;
          outline: none;
          font-family: "JetBrains Mono", monospace;
          letter-spacing: 0.05em;
          font-size: 13px;
        }
        .rfq-search:focus { border-color: rgba(6,182,212,0.6); box-shadow: 0 0 15px rgba(6,182,212,0.1); }

        .rfq-bubble {
          border-radius: 16px; padding: 16px;
          border: 1px solid rgba(6,182,212,0.12);
          background: rgba(6,182,212,0.03);
          backdrop-filter: blur(18px);
          animation: riseIn 0.22s ease both;
        }
        .rfq-bubble-user { border-color: rgba(124,58,237,0.22); background: rgba(124,58,237,0.06); transition: all 0.2s; }
        .rfq-bubble-user:hover { border-color: rgba(124,58,237,0.4); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.3); }
        .rfq-bubble-ai { border-color: rgba(6,182,212,0.18); }

        .rfq-typing { display: inline-flex; gap: 6px; align-items: center; padding: 6px 0; }
        .rfq-dot { width: 6px; height: 6px; border-radius: 9999px; background: rgba(226,232,240,0.85); animation: dotBounce 1.3s ease-in-out infinite; }
        .rfq-dot-2 { animation-delay: 180ms; }
        .rfq-dot-3 { animation-delay: 360ms; }

        .rfq-source-pill {
          display: inline-flex;
          font-family: "JetBrains Mono", monospace;
          font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase;
          padding: 4px 10px; border-radius: 9999px;
          border: 1px solid rgba(6,182,212,0.25);
          background: rgba(6,182,212,0.08);
          animation: popIn 0.2s ease both;
          color: #a5f3fc;
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}
