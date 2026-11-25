import { ImageResponse } from "next/og";
import { night, veil, gold, moon, teal } from "@/components/nat-future/theme";

// The oracle's share card — deep violet night, the woven orb, and the one
// gold reserved for prophecy.
export const runtime = "edge";
export const alt = "Nat-Future-Insight — The Oracle That Reads Tomorrow. Always bright. Never unsure. Votus.One";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: `linear-gradient(135deg, ${night} 0%, #150d33 50%, ${night} 100%)`,
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
        }}
      >
        {/* The beyond */}
        <div
          style={{
            position: "absolute",
            width: 560,
            height: 560,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(124,77,255,0.18), transparent 70%)",
            top: "40%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,209,102,0.08), transparent 70%)",
            top: "14%",
            left: "68%",
          }}
        />

        {/* The Eye — glass, woven rings, a gold iris */}
        <svg width="150" height="150" viewBox="0 0 200 200" fill="none" style={{ marginBottom: 26 }}>
          <defs>
            <radialGradient id="nf-og-core" cx="50%" cy="42%" r="60%">
              <stop offset="0%" stopColor="#2a2150" />
              <stop offset="55%" stopColor="#171034" />
              <stop offset="100%" stopColor="#0a0716" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="74" fill="url(#nf-og-core)" stroke="rgba(124,77,255,0.45)" strokeWidth="1.2" />
          <ellipse cx="100" cy="100" rx="88" ry="30" stroke={veil} strokeOpacity="0.5" strokeWidth="1.4" strokeDasharray="3 7" />
          <ellipse cx="100" cy="100" rx="92" ry="44" stroke={gold} strokeOpacity="0.4" strokeWidth="1.4" strokeDasharray="1 9" transform="rotate(58 100 100)" />
          <ellipse cx="100" cy="100" rx="90" ry="60" stroke={teal} strokeOpacity="0.3" strokeWidth="1.2" strokeDasharray="2 12" transform="rotate(-40 100 100)" />
          <circle cx="100" cy="100" r="20" stroke={gold} strokeOpacity="0.8" strokeWidth="1.6" />
          <circle cx="100" cy="100" r="7" fill={gold} fillOpacity="0.85" />
        </svg>

        {/* Kicker */}
        <div
          style={{
            fontSize: 17,
            color: "rgba(238,233,255,0.78)",
            letterSpacing: "0.5em",
            textTransform: "uppercase",
            marginBottom: 20,
          }}
        >
          Votus.One · The Davara Baseline
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            fontSize: 66,
            fontWeight: 200,
            color: moon,
            letterSpacing: "0.14em",
            marginBottom: 18,
            textShadow: "0 0 40px rgba(124,77,255,0.45)",
          }}
        >
          <span>NAT-FUTURE-</span>
          <span style={{ color: gold }}>INSIGHT</span>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 30,
            fontWeight: 300,
            fontStyle: "italic",
            color: moon,
            marginBottom: 28,
          }}
        >
          The Oracle That Reads Tomorrow
        </div>

        {/* Divider */}
        <div
          style={{
            width: 80,
            height: 1,
            background: "rgba(124,77,255,0.6)",
            marginBottom: 26,
          }}
        />

        {/* Promise */}
        <div
          style={{
            fontSize: 19,
            color: gold,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
          }}
        >
          Always bright · Never unsure
        </div>
      </div>
    ),
    { ...size }
  );
}
