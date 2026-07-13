"use client";

// The orb becomes a breath. A 4-2-8 pacer — in for four, hold for two, out for
// eight — the single most useful thing an anxious visitor can do, wearing the
// oracle's own face.

import { useEffect, useState } from "react";
import { dim, gold, goldSoft, mid, moon, sans, serif, veil } from "./theme";

const CYCLE: [string, number][] = [
  ["Breathe in", 4000],
  ["Hold", 2000],
  ["Breathe out", 8000],
];

export default function BreathePacer({ onClose }: { onClose: () => void }) {
  const [phase, setPhase] = useState(0);
  const [round, setRound] = useState(0);

  useEffect(() => {
    const [, dur] = CYCLE[phase];
    const t = setTimeout(() => {
      const next = (phase + 1) % CYCLE.length;
      setPhase(next);
      if (next === 0) setRound((r) => r + 1);
    }, dur);
    return () => clearTimeout(t);
  }, [phase]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Breathing pacer"
      style={{
        position: "fixed", inset: 0, zIndex: 60, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 40,
        background: "rgba(7,5,16,0.94)", backdropFilter: "blur(18px)",
        animation: "nf-fade 0.5s ease both", padding: 24,
      }}
    >
      <style>{`
        @keyframes nf-breath {
          0% { transform: scale(0.58); }
          28.57% { transform: scale(1); }
          42.86% { transform: scale(1); }
          100% { transform: scale(0.58); }
        }
        @keyframes nf-breath-glow {
          0% { opacity: 0.4; }
          28.57% { opacity: 0.95; }
          42.86% { opacity: 0.95; }
          100% { opacity: 0.4; }
        }
        @media (prefers-reduced-motion: reduce) {
          .nf-breath-circle, .nf-breath-halo { animation: none !important; transform: scale(0.85) !important; }
        }
      `}</style>

      <button
        onClick={onClose}
        aria-label="Close breathing pacer"
        style={{
          position: "absolute", top: "calc(16px + env(safe-area-inset-top))", right: 18,
          width: 40, height: 40, borderRadius: "50%", border: `1px solid ${veil}`,
          background: "transparent", color: mid, cursor: "pointer", fontSize: 17,
        }}
      >
        ✕
      </button>

      <p style={{ fontSize: 11, letterSpacing: "0.4em", textTransform: "uppercase", color: dim, fontFamily: sans, margin: 0 }}>
        Breathe with the oracle
      </p>

      <div style={{ position: "relative", width: 260, height: 260, display: "grid", placeItems: "center" }}>
        <div
          className="nf-breath-halo"
          style={{
            position: "absolute", width: 260, height: 260, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(124,77,255,0.28), transparent 62%)",
            filter: "blur(24px)", animation: "nf-breath-glow 14s ease-in-out infinite",
          }}
        />
        <div
          className="nf-breath-circle"
          style={{
            width: 200, height: 200, borderRadius: "50%",
            border: `1px solid rgba(255,209,102,0.5)`,
            background: "radial-gradient(circle at 50% 40%, rgba(124,77,255,0.22), rgba(16,12,36,0.5) 70%)",
            boxShadow: "0 0 60px rgba(124,77,255,0.25), inset 0 0 40px rgba(124,77,255,0.15)",
            animation: "nf-breath 14s ease-in-out infinite",
            display: "grid", placeItems: "center",
          }}
        >
          <span style={{ fontSize: 28, color: goldSoft }}>☾</span>
        </div>
      </div>

      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: serif, fontSize: 26, fontWeight: 300, color: moon, letterSpacing: "0.04em", minHeight: 34 }}>
          {CYCLE[phase][0]}
          {phase === 2 ? "…" : phase === 1 ? "…" : ""}
        </div>
        <div style={{ fontSize: 11, letterSpacing: "0.2em", color: dim, marginTop: 12, fontFamily: sans }}>
          {round === 0 ? "Follow the circle. Four in, hold two, eight out." : `${round} breath${round === 1 ? "" : "s"} · you're doing it`}
        </div>
      </div>

      <p style={{ fontSize: 11, color: goldSoft, fontFamily: serif, fontStyle: "italic", maxWidth: 320, textAlign: "center", lineHeight: 1.7, margin: 0 }}>
        The long exhale is a hardware override, not a platitude. Stay for a few rounds. <span style={{ color: gold }}>You are larger than the alarm.</span>
      </p>
    </div>
  );
}
