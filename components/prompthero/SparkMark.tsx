"use client";

// The PromptHero glyph — a spark struck inside the Votus V.
// The question rising out of the mark that asked it.
export default function SparkMark({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <defs>
        <linearGradient id="spark-grad" x1="24" y1="4" x2="24" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffd166" />
          <stop offset="1" stopColor="#00d4ff" />
        </linearGradient>
      </defs>
      {/* The V — the lineage */}
      <path
        d="M10 14 L24 40 L38 14"
        stroke="rgba(0,212,255,0.35)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* The spark — the ask */}
      <path
        d="M26 6 L18 24 L23.5 24 L21 36 L30 18 L24.5 18 L26 6 Z"
        stroke="url(#spark-grad)"
        strokeWidth="1.6"
        strokeLinejoin="round"
        fill="rgba(255,209,102,0.05)"
        style={{ filter: "drop-shadow(0 0 10px rgba(0,212,255,0.35)) drop-shadow(0 0 22px rgba(255,209,102,0.15))" }}
      />
    </svg>
  );
}
