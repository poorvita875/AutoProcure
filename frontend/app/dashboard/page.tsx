"use client";
import {
  FileText,
  Mail,
  MessageCircle,
} from "lucide-react";

import { Component as BgGredient } from "@/components/ui/bg-gredient";
import RadialOrbitalTimeline, { TimelineItem } from "@/components/ui/radial-orbital-timeline";
import { DottedSurface } from "@/components/ui/dotted-surface";

const agentData: TimelineItem[] = [
  {
    id: 1,
    title: "Document Agent",
    date: "Agent 1 — Poorvita",
    content:
      "Reads any invoice, PO, or contract PDF. Extracts vendor name, date, items, and total amount automatically. Supports Hindi, Kannada, Tamil, and English.",
    category: "Document",
    href: "/document",
    icon: FileText,
    relatedIds: [6],
    status: "completed",
    energy: 95,
  },
  {
    id: 4,
    title: "RFQ Agent",
    date: "Agent 4 — Prathamesh",
    content:
      "You type one sentence like 'Need 500 bearings by May 20'. Agent writes the full RFQ email, sends it to top 3 vendors, collects bids, and ranks them for you.",
    category: "RFQ",
    href: "/rfq",
    icon: Mail,
    relatedIds: [6],
    status: "in-progress",
    energy: 70,
  },
  {
    id: 6,
    title: "Chat Agent",
    date: "Agent 6 — Poorvita",
    content:
      "Ask anything about your procurement data in plain English. Powered by RAG + FAISS + Groq. Answers come from YOUR invoices and vendor history, not general knowledge.",
    category: "Chat",
    href: "/chat",
    icon: MessageCircle,
    relatedIds: [1, 4],
    status: "pending",
    energy: 60,
  },
];

export default function DashboardPage() {
  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        background: "#000",
      }}
    >
      <BgGredient
        className="opacity-30 pointer-events-none"
        gradientFrom="rgba(99,179,237,0.30)"
        gradientTo="#000"
        gradientPosition="50% 15%"
        gradientSize="140% 140%"
        gradientStop="0%"
      />
      {/* Dotted surface — alternating blue (#63b3ed) & white wave animation */}
      <DottedSurface className="opacity-70" />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          padding: "20px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid rgba(99,179,237,0.1)",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "20px",
              fontWeight: 900,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "linear-gradient(to right, #FFFFFF, #63b3ed, #3182ce)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 0 10px rgba(99,179,237,0.4))",
              textTransform: "uppercase",
            }}
          >
            <span style={{ 
              fontSize: "24px", 
              WebkitTextFillColor: "initial",
              color: "#63b3ed",
              filter: "drop-shadow(0 0 12px rgba(99,179,237,0.6))",
              marginRight: "4px"
            }}>⬡</span>
            <span className="font-[family-name:var(--font-syncopate)] font-light tracking-[0.3em]">SUPPLY</span>
            <span className="font-[family-name:var(--font-outfit)] font-black tracking-tighter">MIND AI</span>
          </div>
          <div
            style={{
              fontSize: "9px",
              color: "rgba(255, 255, 255, 0.35)",
              letterSpacing: "5px",
              marginTop: "4px",
              fontWeight: 600,
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              gap: "10px"
            }}
            className="font-[family-name:var(--font-outfit)]"
          >
            <div style={{ height: "1px", width: "16px", background: "rgba(99,179,237,0.3)" }}></div>
            AUTONOMOUS PROCUREMENT INTELLIGENCE
          </div>
        </div>
        <div style={{ display: "flex", gap: "20px" }}>
          {[
            { label: "VENDORS", value: "24", color: "#63b3ed" },
            { label: "ALERTS", value: "3", color: "#fc8181" },
            { label: "DOCS", value: "47", color: "#68d391" },
            { label: "RFQs", value: "5", color: "#f6e05e" },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "18px", fontWeight: 700, color: s.color }}>
                {s.value}
              </div>
              <div
                style={{
                  fontSize: "9px",
                  color: "rgba(255,255,255,0.3)",
                  letterSpacing: "2px",
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <RadialOrbitalTimeline timelineData={agentData} />

      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          padding: "16px 32px",
          borderTop: "1px solid rgba(99,179,237,0.1)",
          display: "flex",
          justifyContent: "center",
          gap: "40px",
        }}
      >
        {[
          { dot: "#68d391", label: "Completed" },
          { dot: "#63b3ed", label: "In Progress" },
          { dot: "rgba(255,255,255,0.3)", label: "Pending" },
        ].map((l, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: l.dot,
              }}
            />
            <span
              style={{
                fontSize: "11px",
                color: "rgba(255,255,255,0.4)",
                letterSpacing: "1px",
              }}
            >
              {l.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

