import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Fetch unit data at the edge
  const baseUrl = req.nextUrl.origin;
  let unitName = slug;
  let purpose = "";
  let city = "";
  let votes = 0;
  let members = 1;

  try {
    const res = await fetch(`${baseUrl}/api/units/by-slug/${slug}`);
    if (res.ok) {
      const data = await res.json();
      if (data.unit) {
        unitName = data.unit.name || slug;
        purpose = data.unit.purpose || "";
        city = [data.unit.city, data.unit.state].filter(Boolean).join(", ");
        votes = data.unit.votes || 0;
        members = data.unit.members || 1;
      }
    }
  } catch { /* fallback to slug */ }

  const shortPurpose = purpose.length > 120 ? purpose.slice(0, 117) + "..." : purpose;

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
          background: "linear-gradient(135deg, #09090b 0%, #0a1628 50%, #09090b 100%)",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          padding: "60px 80px",
        }}
      >
        {/* Ambient glow */}
        <div
          style={{
            position: "absolute",
            width: 500,
            height: 300,
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(0,212,255,0.1), transparent 70%)",
            top: "40%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />

        {/* Badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 24,
          }}
        >
          <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
            <path d="M8 10 L20 32 L32 10" stroke="#00d4ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div style={{ fontSize: 16, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(0,212,255,0.6)" }}>
            Votus Unit
          </div>
        </div>

        {/* Unit Name */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 200,
            color: "#fafafa",
            letterSpacing: "0.05em",
            marginBottom: 16,
            textAlign: "center",
            textShadow: "0 0 50px rgba(0,212,255,0.2)",
          }}
        >
          {unitName}
        </div>

        {/* Location */}
        {city && (
          <div style={{ fontSize: 20, color: "rgba(250,250,250,0.4)", letterSpacing: "0.1em", marginBottom: 24 }}>
            📍 {city}
          </div>
        )}

        {/* Purpose */}
        {shortPurpose && (
          <div
            style={{
              fontSize: 22,
              fontWeight: 300,
              fontStyle: "italic",
              color: "rgba(250,250,250,0.55)",
              textAlign: "center",
              maxWidth: 800,
              lineHeight: 1.5,
              marginBottom: 32,
            }}
          >
            &ldquo;{shortPurpose}&rdquo;
          </div>
        )}

        {/* Stats */}
        <div style={{ display: "flex", gap: 48, marginBottom: 32 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ fontSize: 32, fontWeight: 200, color: "#00d4ff" }}>{members}</div>
            <div style={{ fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(250,250,250,0.3)" }}>Members</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ fontSize: 32, fontWeight: 200, color: "#00d4ff" }}>{votes}</div>
            <div style={{ fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(250,250,250,0.3)" }}>Votes</div>
          </div>
        </div>

        {/* URL */}
        <div style={{ fontSize: 18, color: "rgba(0,212,255,0.4)", letterSpacing: "0.1em" }}>
          Votus.One/u/{slug}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
