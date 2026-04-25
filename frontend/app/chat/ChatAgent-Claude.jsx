"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { sendMessage, getProcurementSystemPrompt } from "@/lib/claudeAI"

const initialMessages = [
  { id: "m1", role: "ai", text: "🚀 CLAUDE AI SYSTEM ONLINE. I'm now connected with real AI capabilities! Ask me about invoices, RFQs, vendors, and procurement operations." },
]

export default function ChatAgent() {
  const [messages, setMessages] = useState(initialMessages)
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [streamingCursor, setStreamingCursor] = useState(false)
  const [error, setError] = useState("")

  const suggestions = useMemo(
    () => [
      "Show unpaid invoices due this week",
      "Summarize vendor risk for ABC Steels",
      "Find RFQs sent in the last 30 days",
      "What is the latest PO reference?",
    ],
    []
  )

  const listRef = useRef(null)
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, isTyping])

  const send = async () => {
    const text = input.trim()
    if (!text) return
    
    setError("")
    setInput("")
    const userMsg = { id: `u_${Date.now()}`, role: "user", text }
    setMessages((prev) => [...prev, userMsg])

    setIsTyping(true)
    setStreamingCursor(true)
    
    try {
      // Call Claude AI with procurement context
      const response = await sendMessage(
        [...messages, userMsg],
        {
          systemPrompt: getProcurementSystemPrompt("You have access to procurement data including invoices, RFQs, vendors, and purchase orders.")
        }
      )
      
      setIsTyping(false)
      setMessages((prev) => [
        ...prev,
        {
          id: `a_${Date.now()}`,
          role: "ai",
          text: response,
          source: "Claude AI - Live",
        },
      ])
    } catch (err) {
      setIsTyping(false)
      setError(err.message || "Failed to get response from Claude AI")
      setMessages((prev) => [
        ...prev,
        {
          id: `a_${Date.now()}`,
          role: "ai",
          text: `⚠️ Error: ${err.message}. Make sure ANTHROPIC_API_KEY is set in your environment.`,
          source: "Error",
        },
      ])
    }
    
    window.setTimeout(() => setStreamingCursor(false), 600)
  }

  const handleSuggestion = (suggestion) => {
    setInput(suggestion)
    setTimeout(() => send(), 100)
  }

  return (
    <div className="min-h-screen w-full text-white rfq-page">
      <div className="rfq-bg">
        <div className="rfq-stars" aria-hidden="true" />
        <div className="rfq-mesh" aria-hidden="true" />
        <div className="rfq-scanlines" aria-hidden="true" />
        <div className="rfq-orb rfq-orb-1" aria-hidden="true" />
        <div className="rfq-orb rfq-orb-2" aria-hidden="true" />
        <div className="rfq-orb rfq-orb-3" aria-hidden="true" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-10 space-y-10">
        <header className="relative rfq-title-block">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="rfq-title">CHAT AGENT - CLAUDE AI</div>
              <div className="rfq-underline" aria-hidden="true" />
              <div className="text-slate-300 text-[12px] font-mono tracking-[0.18em] uppercase">
                POWERED BY ANTHROPIC CLAUDE | REAL AI RESPONSES
              </div>
            </div>
            <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.15em] text-emerald-300 mt-1">
              <span className="rfq-online-dot" aria-hidden="true" />
              {error ? "ERROR" : "CLAUDE ONLINE"}
            </div>
          </div>
          <div className="mt-6 rfq-hr" aria-hidden="true" />
        </header>

        <section className="rfq-step-card relative overflow-hidden rfq-entrance rfq-entrance-1">
          <div className="rfq-step-watermark" aria-hidden="true">
            01
          </div>
          <div className="rfq-step-leftglow" aria-hidden="true" />

          <div className="rfq-section-label rfq-card-header">SUGGESTED QUERIES</div>
          <div className="mt-4 flex flex-wrap gap-2">
            {suggestions.map((s, idx) => (
              <button
                key={s}
                type="button"
                className="rfq-chip rfq-suggest"
                style={{ animationDelay: `${idx * 45}ms` }}
                onClick={() => handleSuggestion(s)}
                aria-label={`Suggestion: ${s}`}
              >
                {s}
              </button>
            ))}
          </div>
        </section>

        <section className="rfq-step-card relative overflow-hidden rfq-entrance rfq-entrance-2">
          <div className="rfq-step-watermark" aria-hidden="true">
            02
          </div>
          <div className="rfq-step-leftglow" aria-hidden="true" />

          <div className="rfq-section-label rfq-card-header">CONVERSATION WITH CLAUDE</div>

          <div
            ref={listRef}
            className="mt-4 h-[420px] overflow-y-auto pr-2 space-y-3"
            aria-label="Chat messages"
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className={[
                  "rfq-bubble rfq-warm-rise",
                  m.role === "user" ? "rfq-bubble-user" : "rfq-bubble-ai",
                ].join(" ")}
              >
                <div className="text-[12px] text-slate-200 font-mono">
                  {m.text}
                  {m.role === "ai" && streamingCursor && (
                    <span className="rfq-cursor" aria-hidden="true">
                      ▍
                    </span>
                  )}
                </div>
                {m.source && (
                  <div className="mt-2">
                    <span className="rfq-source-pill" aria-label="Source">
                      {m.source}
                    </span>
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="rfq-bubble rfq-bubble-ai rfq-warm-rise" aria-label="Claude typing">
                <div className="rfq-typing">
                  <span className="rfq-dot rfq-dot-1" />
                  <span className="rfq-dot rfq-dot-2" />
                  <span className="rfq-dot rfq-dot-3" />
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") send()
              }}
              className="rfq-search flex-1"
              placeholder="ASK CLAUDE ANYTHING..."
              aria-label="Chat input"
            />
            <button
              type="button"
              onClick={send}
              disabled={!input.trim() || isTyping}
              className={["rfq-icon-btn rfq-send-btn", (!input.trim() || isTyping) ? "rfq-send-disabled" : ""].join(" ")}
              aria-label="Send message"
            >
              ➤ SEND
            </button>
          </div>
        </section>
      </div>

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&family=Orbitron:wght@500;600;700&display=swap");

        /* Animations */
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes riseIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInLeft { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes underlineExpand { from { transform: scaleX(0); transform-origin: left; } to { transform: scaleX(1); transform-origin: left; } }
        @keyframes shimmerWarm { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes dotBounce { 0%,80%,100% { transform: translateY(0); opacity: 0.4; } 40% { transform: translateY(-4px); opacity: 1; } }
        @keyframes checkStroke { from { stroke-dashoffset: 20; opacity: 0; } to { stroke-dashoffset: 0; opacity: 1; } }
        @keyframes progressExpand { from { width: 0; } to { width: var(--fill); } }
        @keyframes popIn { 0% { opacity: 0; transform: scale(0.9); } 70% { transform: scale(1.02); } 100% { opacity: 1; transform: scale(1); } }
        @keyframes cursorBlink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }

        .rfq-title-block { animation: riseIn 0.3s ease both; }
        .rfq-entrance { animation: riseIn 0.35s ease both; }
        .rfq-entrance-1 { animation-delay: 0.05s; }
        .rfq-entrance-2 { animation-delay: 0.12s; }

        .rfq-card-header { position: relative; padding-bottom: 6px; }
        .rfq-card-header::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: 0;
          height: 1px;
          width: 100%;
          background: rgba(226, 232, 240, 0.12);
          transform: scaleX(0);
          animation: underlineExpand 0.4s ease 0.1s both;
        }

        .rfq-page {
          background: radial-gradient(circle at 50% 20%, #020818 0%, #000000 70%, #000000 100%);
          font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue", Arial;
          position: relative;
          overflow: hidden;
        }
        .rfq-bg { position: absolute; inset: 0; z-index: 0; pointer-events: none; }
        .rfq-stars {
          position: absolute;
          inset: -20%;
          background-image:
            radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,0.8) 50%, transparent 51%),
            radial-gradient(1px 1px at 30% 80%, rgba(255,255,255,0.6) 50%, transparent 51%),
            radial-gradient(1px 1px at 70% 40%, rgba(255,255,255,0.7) 50%, transparent 51%),
            radial-gradient(1px 1px at 90% 70%, rgba(255,255,255,0.6) 50%, transparent 51%);
          background-repeat: repeat;
          background-size: 340px 340px;
          opacity: 0.25;
          animation: rfqStarDrift 26s linear infinite;
        }
        @keyframes rfqStarDrift { from { transform: translate3d(0,0,0); } to { transform: translate3d(-120px,140px,0); } }
        .rfq-mesh {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(6, 182, 212, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6, 182, 212, 0.05) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(circle at 50% 30%, rgba(0,0,0,1), rgba(0,0,0,0.2) 70%, rgba(0,0,0,0));
        }
        .rfq-scanlines {
          position: absolute; inset: 0;
          background: repeating-linear-gradient(to bottom, rgba(255,255,255,0.02), rgba(255,255,255,0.02) 1px, transparent 1px, transparent 4px);
          opacity: 0.35;
          mix-blend-mode: overlay;
        }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
        .rfq-orb { position: absolute; width: 420px; height: 420px; border-radius: 9999px; filter: blur(40px); opacity: 0.22; animation: float 6s ease-in-out infinite; }
        .rfq-orb-1 { top: -120px; left: -80px; background: radial-gradient(circle at 30% 30%, rgba(6,182,212,0.9), rgba(124,58,237,0.25) 60%, transparent 75%); }
        .rfq-orb-2 { top: 260px; right: -160px; background: radial-gradient(circle at 30% 30%, rgba(124,58,237,0.9), rgba(6,182,212,0.25) 60%, transparent 75%); animation-delay: 1.2s; }
        .rfq-orb-3 { bottom: -160px; left: 45%; transform: translateX(-50%); background: radial-gradient(circle at 30% 30%, rgba(6,182,212,0.7), rgba(124,58,237,0.25) 60%, transparent 75%); animation-delay: 2.2s; }

        .rfq-title {
          font-family: Orbitron, Inter, system-ui;
          font-size: 24px;
          font-weight: 700;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: #e2e8f0;
          text-shadow: 0 0 20px rgba(6, 182, 212, 0.18);
        }
        .rfq-underline { height: 2px; width: 100%; background: linear-gradient(90deg, transparent, #06b6d4, transparent); transform-origin: left; animation: underlineExpand 0.4s ease 0.1s both; }
        .rfq-hr { height: 1px; width: 100%; background: linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.65), transparent); opacity: 0.75; }
        .rfq-section-label { font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: #e2e8f0; font-weight: 600; }
        @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }
        .rfq-online-dot { width: 10px; height: 10px; border-radius: 9999px; background: #10b981; box-shadow: 0 0 12px rgba(16, 185, 129, 0.65); animation: blink 1s infinite; }

        .rfq-step-card {
          background: rgba(6, 182, 212, 0.04);
          border: 1px solid rgba(6, 182, 212, 0.15);
          backdrop-filter: blur(20px);
          border-radius: 18px;
          padding: 18px;
          position: relative;
          z-index: 1;
          transition: border-color 200ms ease;
          box-shadow: 0 0 0 1px rgba(6, 182, 212, 0.04), 0 18px 50px rgba(0,0,0,0.4);
        }
        .rfq-step-card:hover {
          border-color: rgba(6, 182, 212, 0.35);
        }
        .rfq-step-leftglow { position: absolute; inset: 10px auto 10px 10px; width: 4px; border-radius: 999px; background: linear-gradient(180deg, rgba(6,182,212,0.9), rgba(124,58,237,0.45)); box-shadow: 0 0 18px rgba(6, 182, 212, 0.4); }
        .rfq-step-watermark { position: absolute; top: 10px; right: 12px; font-family: Orbitron, Inter, system-ui; font-weight: 700; font-size: 42px; letter-spacing: 0.12em; color: rgba(6, 182, 212, 0.08); user-select: none; pointer-events: none; }

        .rfq-icon-btn, .rfq-chip, .rfq-search {
          transition: background 180ms ease, color 180ms ease, border-color 180ms ease, transform 100ms ease, opacity 180ms ease;
        }
        .rfq-icon-btn { border-radius: 12px; padding: 10px 12px; font-size: 12px; color: #e2e8f0; background: rgba(255,255,255,0.02); border: 1px solid rgba(6, 182, 212, 0.25); outline: none; display: inline-flex; align-items: center; gap: 6px; }
        .rfq-icon-btn:hover { background: rgba(6, 182, 212, 0.08); border-color: rgba(6, 182, 212, 0.5); }
        .rfq-icon-btn:active { transform: scale(0.97); }
        .rfq-send-btn { transition: opacity 180ms ease, background 180ms ease, border-color 180ms ease, transform 100ms ease; }
        .rfq-send-btn:active { transform: scale(0.97); }
        .rfq-send-disabled { opacity: 0.5; cursor: not-allowed; }
        .rfq-chip { font-size: 12px; color: #e2e8f0; background: rgba(255,255,255,0.03); border: 1px solid rgba(6,182,212,0.25); border-radius: 999px; padding: 6px 10px; outline: none; cursor: pointer; }
        .rfq-chip:hover { background: rgba(6, 182, 212, 0.08); border-color: rgba(6, 182, 212, 0.5); }
        .rfq-chip:active { transform: scale(0.94); }
        .rfq-suggest { animation: slideInLeft 0.22s ease both; }

        .rfq-search {
          width: 100%;
          border-radius: 14px;
          background: rgba(6,182,212,0.03);
          border: 1px solid rgba(6,182,212,0.2);
          padding: 12px 12px 12px 12px;
          color: #e2e8f0;
          outline: none;
          font-family: "JetBrains Mono", "Courier New", monospace;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-size: 11px;
        }

        .rfq-bubble {
          border-radius: 16px;
          padding: 12px 14px;
          border: 1px solid rgba(6,182,212,0.12);
          background: rgba(6,182,212,0.03);
          backdrop-filter: blur(18px);
          animation: riseIn 0.22s ease both;
        }
        .rfq-bubble-user { border-color: rgba(124,58,237,0.22); background: rgba(124,58,237,0.06); }
        .rfq-bubble-ai { border-color: rgba(6,182,212,0.18); }

        .rfq-typing { display: inline-flex; gap: 6px; align-items: center; padding: 6px 0; }
        .rfq-dot {
          width: 6px; height: 6px; border-radius: 9999px;
          background: rgba(226,232,240,0.85);
          animation: dotBounce 1.3s ease-in-out infinite;
        }
        .rfq-dot-2 { animation-delay: 180ms; }
        .rfq-dot-3 { animation-delay: 360ms; }

        .rfq-cursor { margin-left: 4px; animation: cursorBlink 1s steps(1) infinite; }

        .rfq-source-pill {
          display: inline-flex;
          font-family: "JetBrains Mono", "Courier New", monospace;
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 6px 10px;
          border-radius: 9999px;
          border: 1px solid rgba(6,182,212,0.25);
          background: rgba(6,182,212,0.08);
          animation: popIn 0.2s ease both;
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
  )
}
