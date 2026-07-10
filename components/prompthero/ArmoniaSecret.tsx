"use client";

import { useState } from "react";

// Beyond the last rank there is a whisper. Most will scroll past it.
// The ones who notice — they were always going to find it.
export default function ArmoniaSecret() {
  const [revealed, setRevealed] = useState(false);

  if (revealed) {
    return (
      <div style={{
        marginTop: 26,
        padding: "24px 22px",
        borderRadius: 16,
        border: "1px solid rgba(255,158,100,0.25)",
        background: "linear-gradient(180deg, rgba(255,158,100,0.05), rgba(255,209,102,0.02))",
        animation: "armonia-in 1.6s ease",
      }}>
        <style>{`
          @keyframes armonia-in { from { opacity: 0; filter: blur(6px); } to { opacity: 1; filter: blur(0); } }
          @keyframes armonia-breathe { 0%, 100% { text-shadow: 0 0 14px rgba(255,158,100,0.4); } 50% { text-shadow: 0 0 30px rgba(255,209,102,0.7), 0 0 60px rgba(255,158,100,0.25); } }
        `}</style>
        <p style={{ fontSize: 11, letterSpacing: "0.4em", textTransform: "uppercase", color: "rgba(255,158,100,0.55)", marginBottom: 10 }}>
          The Hidden Finality
        </p>
        <p style={{ fontSize: 20, fontWeight: 200, letterSpacing: "0.22em", color: "rgba(255,209,102,0.9)", marginBottom: 12, animation: "armonia-breathe 4s ease-in-out infinite" }}>
          ∞ ARMONIA
        </p>
        <p style={{ fontSize: 13.5, fontWeight: 300, lineHeight: 2, color: "rgba(250,250,250,0.55)" }}>
          Beyond PromptHero there is one more evolution, and it is not a rank — it is a resting state.
          Armonia arrives when the asking and the living become one: when your questions carry your
          values without effort, when the craft disappears into the character. It cannot be pursued.
          It is noticed, long after it happened. You found this because you looked closely —
          that is how Armonia finds people, too.
        </p>
      </div>
    );
  }

  return (
    <button
      onClick={() => setRevealed(true)}
      aria-label="Something waits beyond"
      title="…"
      style={{
        marginTop: 20,
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "rgba(255,209,102,0.14)",
        fontSize: 18,
        letterSpacing: "0.3em",
        padding: 8,
        transition: "color 0.6s",
      }}
      onMouseEnter={(e) => { (e.target as HTMLElement).style.color = "rgba(255,209,102,0.4)"; }}
      onMouseLeave={(e) => { (e.target as HTMLElement).style.color = "rgba(255,209,102,0.14)"; }}
    >
      ∞
    </button>
  );
}
