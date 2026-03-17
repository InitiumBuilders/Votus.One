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
        {/* Ambient glow */}
        <div
          style={{
            position: "absolute",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,212,255,0.12), transparent 70%)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />

        {/* V Mark */}
        <svg width="80" height="80" viewBox="0 0 40 40" fill="none" style={{ marginBottom: 40 }}>
          <path d="M8 10 L20 32 L32 10" stroke="#00d4ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        {/* Title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 200,
            color: "#fafafa",
            letterSpacing: "0.08em",
            marginBottom: 16,
            textShadow: "0 0 60px rgba(0,212,255,0.3)",
          }}
        >
          Votus.One
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 24,
            fontWeight: 300,
            color: "#00d4ff",
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            marginBottom: 40,
          }}
        >
          Move As One
        </div>

        {/* Divider */}
        <div
          style={{
            width: 80,
            height: 1,
            background: "rgba(0,212,255,0.3)",
            marginBottom: 40,
          }}
        />

        {/* Description */}
        <div
          style={{
            fontSize: 20,
            fontWeight: 300,
            color: "rgba(250,250,250,0.6)",
            textAlign: "center",
            maxWidth: 800,
            lineHeight: 1.6,
          }}
        >
          Teams who run together, govern together, and make democracy human.
        </div>

        {/* AllRise */}
        <div
          style={{
            fontSize: 18,
            fontWeight: 200,
            color: "rgba(0,212,255,0.5)",
            letterSpacing: "0.2em",
            marginTop: 40,
          }}
        >
          ///AllRise///
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
