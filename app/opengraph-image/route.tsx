import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
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
          background: "linear-gradient(135deg, #09090b 0%, #0a1420 50%, #09090b 100%)",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
        }}
      >
        {/* Ambient glows */}
        <div
          style={{
            position: "absolute",
            width: 420,
            height: 420,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,212,255,0.12), transparent 70%)",
            top: "50%",
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
            top: "18%",
            left: "68%",
          }}
        />

        {/* The flame in the V */}
        <svg width="96" height="96" viewBox="0 0 48 48" fill="none" style={{ marginBottom: 32 }}>
          <path d="M8 16 L24 42 L40 16" stroke="rgba(0,212,255,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M24 6 C27 13 32.5 16.5 32.5 24.5 A8.5 8.5 0 1 1 15.5 24.5 C15.5 17.5 21 13.5 24 6 Z" stroke="#ff9e64" strokeWidth="1.7" strokeLinejoin="round" fill="rgba(255,158,100,0.08)" />
          <path d="M24 19.5 C25.6 23 28 24.5 28 27.8 A4 4 0 1 1 20 27.8 C20 24.8 22.4 23 24 19.5 Z" fill="rgba(255,209,102,0.5)" />
        </svg>

        {/* Title */}
        <div
          style={{
            fontSize: 76,
            fontWeight: 200,
            color: "#fafafa",
            letterSpacing: "0.1em",
            marginBottom: 18,
            textShadow: "0 0 60px rgba(0,212,255,0.3)",
          }}
        >
          PromptHero
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 26,
            fontWeight: 300,
            color: "rgba(250,250,250,0.75)",
            fontStyle: "italic",
            marginBottom: 34,
          }}
        >
          Every prompt is a mirror. Learn to read it.
        </div>

        {/* Divider */}
        <div
          style={{
            width: 80,
            height: 1,
            background: "rgba(0,212,255,0.3)",
            marginBottom: 34,
          }}
        />

        {/* Sub */}
        <div
          style={{
            fontSize: 20,
            fontWeight: 300,
            color: "#00d4ff",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            marginBottom: 22,
          }}
        >
          The Universal Skill · Any Agent
        </div>

        <div
          style={{
            fontSize: 17,
            fontWeight: 200,
            color: "rgba(255,209,102,0.65)",
            letterSpacing: "0.14em",
          }}
        >
          There Is Hope In The Hard Questions · Votus.One
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
