"use client";

// The breath — 4-2-8. The single most useful structural intervention available
// in ninety seconds: the long exhale is a hardware override on the alarm loop.

import { useEffect, useState } from "react";
import {
  ink, inkSecondary, label as labelInk,
  display, mono, goldText, violet, glass, ease,
} from "./theme";

const CYCLE: [string, number][] = [
  ["Breathe in", 4000],
  ["Hold", 2000],
  ["Breathe out", 8000],
];

export default function Breathe({ onClose }: { onClose: () => void }) {
  const [phase, setPhase] = useState(0);
  const [round, setRound] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => {
      const next = (phase + 1) % CYCLE.length;
      setPhase(next);
      if (next === 0) setRound((r) => r + 1);
    }, CYCLE[phase][1]);
    return () => clearTimeout(t);
  }, [phase]);

  return (
    <div
      role="dialog" aria-modal="true" aria-label="Breathing pacer"
      style={{
        position: "fixed", inset: 0, zIndex: 80, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 44, padding: 26,
        background: "rgba(15,17,20,.95)", backdropFilter: "blur(22px)",
        animation: `nt-fade .5s ${ease} both`,
      }}
    >
      <style>{`
        @keyframes nt-breath { 0% { transform: scale(.56) } 28.57% { transform: scale(1) } 42.86% { transform: scale(1) } 100% { transform: scale(.56) } }
        @keyframes nt-breath-glow { 0% { opacity:.35 } 28.57% { opacity:1 } 42.86% { opacity:1 } 100% { opacity:.35 } }
        @media (prefers-reduced-motion: reduce) { .nt-b, .nt-bh { animation: none !important; transform: scale(.85) !important; } }
      `}</style>

      <button
        onClick={onClose} aria-label="Close breathing pacer" className="nt-press nt-focus"
        style={{
          position: "absolute", top: "calc(20px + env(safe-area-inset-top))", right: 22,
          width: 46, height: 46, borderRadius: 14, cursor: "pointer",
          color: inkSecondary, fontSize: 18, ...glass,
        }}
      >✕</button>

      <p style={{ fontFamily: mono, fontSize: 13, letterSpacing: "0.34em", textTransform: "uppercase", color: labelInk, margin: 0 }}>
        Breathe with the current
      </p>

      <div style={{ position: "relative", width: 290, height: 290, display: "grid", placeItems: "center" }}>
        <div className="nt-bh" style={{
          position: "absolute", width: 290, height: 290, borderRadius: "50%",
          background: `radial-gradient(circle, ${violet}44, transparent 62%)`,
          filter: "blur(28px)", animation: "nt-breath-glow 14s ease-in-out infinite",
        }} />
        <div className="nt-b" style={{
          width: 222, height: 222, borderRadius: "50%",
          border: `1px solid rgba(232,196,107,.5)`,
          background: "radial-gradient(circle at 50% 38%, rgba(167,139,255,.3), rgba(21,23,27,.6) 70%)",
          boxShadow: `0 0 70px -10px ${violet}, inset 0 0 50px rgba(167,139,255,.18)`,
          animation: "nt-breath 14s ease-in-out infinite",
          display: "grid", placeItems: "center",
        }}>
          <span style={{ fontSize: 30, color: goldText }}>☾</span>
        </div>
      </div>

      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: display, fontWeight: 300, fontSize: "clamp(1.8rem, 7vw, 2.4rem)", color: ink, minHeight: 42 }}>
          {CYCLE[phase][0]}
        </div>
        <div style={{ fontFamily: mono, fontSize: 13.5, letterSpacing: "0.14em", color: labelInk, marginTop: 14 }}>
          {round === 0 ? "FOUR IN · HOLD TWO · EIGHT OUT" : `${round} BREATH${round === 1 ? "" : "S"} · YOU'RE DOING IT`}
        </div>
      </div>

      <p style={{ fontSize: 17, color: inkSecondary, maxWidth: 380, textAlign: "center", lineHeight: 1.75, margin: 0 }}>
        You are not fragile — you are inside a loop that is doing its job too well.
        The long exhale is where it lets go.{" "}
        <span style={{ color: goldText }}>Stay for a few rounds.</span>
      </p>
    </div>
  );
}
