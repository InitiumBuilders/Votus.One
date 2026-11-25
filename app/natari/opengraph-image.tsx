import { ImageResponse } from "next/og";
import { night, violet, cyan, gold, ink, inkSecondary, label, signal } from "@/components/natari/theme";

// Natari's share card — the Nocturne night, one violet current, one cyan
// charge, and the gold kept for the leverage point alone.
export const runtime = "edge";
export const alt = "Natari — Systems With Soul. Diagnose the system. Never blame the node. Always leave a door. Votus.One";
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
          background: `linear-gradient(135deg, ${night} 0%, #1a1630 52%, ${night} 100%)`,
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
        }}
      >
        {/* The aurora — art only, never under text */}
        <div
          style={{
            position: "absolute",
            width: 560,
            height: 560,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(167,139,255,0.16), transparent 70%)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 320,
            height: 320,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(34,211,238,0.1), transparent 70%)",
            top: "6%",
            left: "70%",
          }}
        />

        {/* The system, and the one place it can be moved */}
        <svg width="84" height="84" viewBox="0 0 48 48" fill="none" style={{ marginBottom: 30 }}>
          <path d="M24 5 L44 41 L4 41 Z" stroke={violet} strokeWidth="1.6" strokeLinejoin="round" fill="rgba(167,139,255,0.08)" />
          <path d="M24 25 L30 36 L18 36 Z" stroke={cyan} strokeWidth="1.2" strokeLinejoin="round" fill="none" />
          <circle cx="24" cy="31.5" r="2.2" fill={gold} />
        </svg>

        {/* Kicker */}
        <div
          style={{
            fontSize: 18,
            color: label,
            letterSpacing: "0.34em",
            textTransform: "uppercase",
            marginBottom: 22,
          }}
        >
          Votus.One · Woven on the Davara Baseline
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 112,
            fontWeight: 200,
            color: ink,
            letterSpacing: "0.12em",
            lineHeight: 1,
            marginBottom: 22,
            textShadow: "0 0 60px rgba(167,139,255,0.35)",
          }}
        >
          NATARI
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 34,
            fontWeight: 300,
            color: signal,
            marginBottom: 32,
          }}
        >
          Systems With Soul
        </div>

        {/* Divider */}
        <div
          style={{
            width: 80,
            height: 1,
            background: "rgba(167,139,255,0.5)",
            marginBottom: 30,
          }}
        />

        {/* Creed */}
        <div
          style={{
            fontSize: 19,
            color: inkSecondary,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          Diagnose the system · Never blame the node · Always leave a door
        </div>
      </div>
    ),
    { ...size }
  );
}
