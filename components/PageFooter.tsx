"use client";

import Link from "next/link";
import Countdown from "./Countdown";
import SubCount from "./SubCount";
import VisitorPulse from "./VisitorPulse";

export default function PageFooter({ back = "/" }: { back?: string }) {
  return (
    <section style={{
      padding: "56px 24px 72px",
      display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif",
    }}>
      <Countdown />
      <SubCount />
      <VisitorPulse />

      <div style={{ width: 60, height: 1, background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.2), transparent)", margin: "28px auto 28px" }} />

      <Link
        href={back}
        style={{
          textDecoration: "none",
          color: "rgba(0,212,255,0.4)",
          fontSize: 13,
          letterSpacing: "0.22em",
          transition: "color 0.3s",
          marginBottom: 32,
        }}
      >
        &larr; Return
      </Link>

      {/* Envisioned By */}
      <p style={{
        fontSize: 12,
        letterSpacing: "0.18em",
        color: "rgba(250,250,250,0.3)",
        marginBottom: 16,
        textTransform: "uppercase",
      }}>
        Envisioned By
      </p>
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap", justifyContent: "center", marginBottom: 24 }}>
        <a
          href="https://x.com/BuiltByAugust"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            textDecoration: "none",
            color: "rgba(0,212,255,0.55)",
            fontSize: 13,
            letterSpacing: "0.12em",
            transition: "color 0.3s, text-shadow 0.3s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = "#00d4ff";
            (e.currentTarget as HTMLElement).style.textShadow = "0 0 15px rgba(0,212,255,0.4)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = "rgba(0,212,255,0.55)";
            (e.currentTarget as HTMLElement).style.textShadow = "none";
          }}
        >
          August James ↗
        </a>
        <span style={{ color: "rgba(250,250,250,0.15)", fontSize: 13 }}>&amp;</span>
        <a
          href="https://www.linkedin.com/in/kristina-roll-2135b4114/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            textDecoration: "none",
            color: "rgba(0,212,255,0.55)",
            fontSize: 13,
            letterSpacing: "0.12em",
            transition: "color 0.3s, text-shadow 0.3s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = "#00d4ff";
            (e.currentTarget as HTMLElement).style.textShadow = "0 0 15px rgba(0,212,255,0.4)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = "rgba(0,212,255,0.55)";
            (e.currentTarget as HTMLElement).style.textShadow = "none";
          }}
        >
          Kristina Roll ↗
        </a>
      </div>

      <div style={{ width: 40, height: 1, background: "rgba(250,250,250,0.06)", margin: "0 auto 16px" }} />

      <p style={{ fontSize: 10, color: "rgba(250,250,250,0.15)", letterSpacing: "0.1em" }}>
        &copy; 2026 Votus.One &middot; Built by August James
      </p>
    </section>
  );
}
