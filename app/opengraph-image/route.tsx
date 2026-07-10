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

        {/* Spark in the V */}
        <svg width="96" height="96" viewBox="0 0 48 48" fill="none" style={{ marginBottom: 32 }}>
          <path d="M10 14 L24 40 L38 14" stroke="rgba(0,212,255,0.4)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M26 6 L18 24 L23.5 24 L21 36 L30 18 L24.5 18 L26 6 Z" stroke="#ffd166" strokeWidth="1.8" strokeLinejoin="round" fill="rgba(255,209,102,0.06)" />
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
