"use client";

// The PromptHero glyph — a living flame rising out of the Votus V.
// The fire is the ask. The V is the lineage. The flicker is you.
export default function EmberMark({ size = 56 }: { size?: number }) {
  return (
    <span style={{ display: "inline-block", position: "relative" }}>
      <style>{`
        @keyframes em-flicker {
          0%, 100% { transform: scaleY(1) scaleX(1); opacity: 0.95; }
          30% { transform: scaleY(1.06) scaleX(0.97); opacity: 1; }
          60% { transform: scaleY(0.96) scaleX(1.03); opacity: 0.88; }
          80% { transform: scaleY(1.03) scaleX(0.99); opacity: 1; }
        }
        @keyframes em-inner {
          0%, 100% { transform: scaleY(1); opacity: 0.9; }
          45% { transform: scaleY(1.14); opacity: 1; }
          70% { transform: scaleY(0.9); opacity: 0.8; }
        }
        .em-outer { transform-origin: 24px 35px; animation: em-flicker 2.8s ease-in-out infinite; }
        .em-core { transform-origin: 24px 32px; animation: em-inner 1.9s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .em-outer, .em-core { animation: none; } }
      `}</style>
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
        <defs>
          <linearGradient id="ember-grad" x1="24" y1="6" x2="24" y2="36" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#ffd166" />
            <stop offset="0.6" stopColor="#ff9e64" />
            <stop offset="1" stopColor="#ff7a45" />
          </linearGradient>
        </defs>
        {/* The V — the lineage */}
        <path
          d="M8 16 L24 42 L40 16"
          stroke="rgba(0,212,255,0.35)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* The flame — the ask, alive */}
        <path
          className="em-outer"
          d="M24 6 C27 13 32.5 16.5 32.5 24.5 A8.5 8.5 0 1 1 15.5 24.5 C15.5 17.5 21 13.5 24 6 Z"
          stroke="url(#ember-grad)"
          strokeWidth="1.6"
          strokeLinejoin="round"
          fill="rgba(255,158,100,0.07)"
          style={{ filter: "drop-shadow(0 0 10px rgba(255,158,100,0.45)) drop-shadow(0 0 24px rgba(0,212,255,0.18))" }}
        />
        {/* The core — the fire within */}
        <path
          className="em-core"
          d="M24 19.5 C25.6 23 28 24.5 28 27.8 A4 4 0 1 1 20 27.8 C20 24.8 22.4 23 24 19.5 Z"
          fill="rgba(255,209,102,0.5)"
          style={{ filter: "drop-shadow(0 0 8px rgba(255,209,102,0.7))" }}
        />
      </svg>
    </span>
  );
}
