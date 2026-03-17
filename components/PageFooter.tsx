"use client";

import Link from "next/link";
import Countdown from "./Countdown";
import SubCount from "./SubCount";
import VisitorPulse from "./VisitorPulse";

export default function PageFooter({ back = "/" }: { back?: string }) {
  return (
    <section style={{
      padding: "56px 24px 80px",
      display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif",
    }}>
      <style>{`
        @keyframes github-breathe {
          0%, 100% { box-shadow: 0 0 20px rgba(0,212,255,0.08), 0 0 40px rgba(0,212,255,0.03); border-color: rgba(0,212,255,0.15); }
          50% { box-shadow: 0 0 35px rgba(0,212,255,0.2), 0 0 60px rgba(0,212,255,0.06); border-color: rgba(0,212,255,0.3); }
        }
        .gh-link {
          animation: github-breathe 5s ease-in-out infinite;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: rgba(0,212,255,0.04);
          border: 1px solid rgba(0,212,255,0.15);
          border-radius: 100px;
          padding: 12px 24px;
          transition: all 0.4s;
        }
        .gh-link:hover {
          background: rgba(0,212,255,0.1);
          border-color: rgba(0,212,255,0.4);
          box-shadow: 0 0 50px rgba(0,212,255,0.25) !important;
        }
      `}</style>

      <Countdown />
      <SubCount />
      <VisitorPulse />

      <div style={{ width: 60, height: 1, background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.2), transparent)", margin: "28px auto" }} />

      {/* GitHub — Open Source CTA */}
      <div style={{ marginBottom: 28, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
        <a
          href="https://github.com/InitiumBuilders/Votus.One"
          target="_blank"
          rel="noopener noreferrer"
          className="gh-link"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="rgba(0,212,255,0.7)">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          <span style={{ fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(0,212,255,0.7)" }}>
            Open Source
          </span>
        </a>
        <p style={{ fontSize: 11, color: "rgba(250,250,250,0.2)", letterSpacing: "0.1em", maxWidth: 300 }}>
          Fork it. Build on it. Make democracy more human.
        </p>
      </div>

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
        <a href="https://x.com/BuiltByAugust" target="_blank" rel="noopener noreferrer"
          style={{ textDecoration: "none", color: "rgba(0,212,255,0.55)", fontSize: 13, letterSpacing: "0.12em", transition: "color 0.3s, text-shadow 0.3s" }}>
          August James ↗
        </a>
        <span style={{ color: "rgba(250,250,250,0.15)", fontSize: 13 }}>&amp;</span>
        <a href="https://www.linkedin.com/in/kristina-roll-2135b4114/" target="_blank" rel="noopener noreferrer"
          style={{ textDecoration: "none", color: "rgba(0,212,255,0.55)", fontSize: 13, letterSpacing: "0.12em", transition: "color 0.3s, text-shadow 0.3s" }}>
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
