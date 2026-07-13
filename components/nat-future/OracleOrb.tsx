"use client";

// The Eye of Nat-Future — a breathing orb of woven rings. It slows to a deep
// pulse while idle and spins its threads while divining.

import { gold, veil } from "./theme";

export default function OracleOrb({
  size = 180,
  divining = false,
}: {
  size?: number;
  divining?: boolean;
}) {
  const speed = divining ? 0.28 : 1;
  return (
    <div aria-hidden style={{ width: size, height: size, position: "relative", display: "grid", placeItems: "center" }}>
      <style>{`
        @keyframes nf-orb-breathe { 0%, 100% { transform: scale(1); opacity: 0.85; } 50% { transform: scale(1.06); opacity: 1; } }
        @keyframes nf-orb-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes nf-orb-spin-r { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
        @keyframes nf-orb-iris { 0%, 100% { transform: scale(1); } 50% { transform: scale(${divining ? 0.72 : 0.92}); } }
        @media (prefers-reduced-motion: reduce) { .nf-orb * { animation: none !important; } }
      `}</style>
      {/* halo */}
      <div style={{
        position: "absolute", inset: "-30%", borderRadius: "50%",
        background: `radial-gradient(circle, ${divining ? "rgba(255,209,102,0.16)" : "rgba(124,77,255,0.14)"}, transparent 60%)`,
        filter: "blur(12px)", transition: "background 1.2s ease",
        animation: `nf-orb-breathe ${6 * speed + 2}s ease-in-out infinite`,
      }} />
      <svg className="nf-orb" viewBox="0 0 200 200" width={size} height={size} style={{ overflow: "visible" }}>
        <defs>
          <radialGradient id="nf-orb-core" cx="50%" cy="42%" r="60%">
            <stop offset="0%" stopColor="#2a2150" />
            <stop offset="55%" stopColor="#171034" />
            <stop offset="100%" stopColor="#0a0716" />
          </radialGradient>
        </defs>
        {/* glass */}
        <circle cx="100" cy="100" r="74" fill="url(#nf-orb-core)" stroke="rgba(124,77,255,0.35)" strokeWidth="1" />
        <ellipse cx="82" cy="66" rx="26" ry="14" fill="rgba(238,233,255,0.08)" transform="rotate(-24 82 66)" />
        {/* woven rings */}
        <g style={{ transformOrigin: "100px 100px", animation: `nf-orb-spin ${26 * speed}s linear infinite` }}>
          <ellipse cx="100" cy="100" rx="88" ry="30" fill="none" stroke={veil} strokeOpacity="0.35" strokeWidth="1" strokeDasharray="3 7" />
        </g>
        <g style={{ transformOrigin: "100px 100px", animation: `nf-orb-spin-r ${34 * speed}s linear infinite` }}>
          <ellipse cx="100" cy="100" rx="92" ry="44" fill="none" stroke={gold} strokeOpacity="0.28" strokeWidth="1" strokeDasharray="1 9" transform="rotate(58 100 100)" />
        </g>
        <g style={{ transformOrigin: "100px 100px", animation: `nf-orb-spin ${42 * speed}s linear infinite` }}>
          <ellipse cx="100" cy="100" rx="90" ry="60" fill="none" stroke="rgba(103,232,249,0.22)" strokeWidth="1" strokeDasharray="2 12" transform="rotate(-40 100 100)" />
        </g>
        {/* the iris */}
        <g style={{ transformOrigin: "100px 100px", animation: `nf-orb-iris ${divining ? 1.6 : 5}s ease-in-out infinite` }}>
          <circle cx="100" cy="100" r="20" fill="none" stroke={gold} strokeOpacity="0.75" strokeWidth="1.4" />
          <circle cx="100" cy="100" r="7" fill={gold} fillOpacity={divining ? 0.95 : 0.7} style={{ transition: "fill-opacity 0.8s ease" }} />
        </g>
        {/* cardinal marks */}
        {[0, 90, 180, 270].map((r) => (
          <line key={r} x1="100" y1="18" x2="100" y2="26" stroke="rgba(238,233,255,0.3)" strokeWidth="1" transform={`rotate(${r} 100 100)`} />
        ))}
      </svg>
    </div>
  );
}
