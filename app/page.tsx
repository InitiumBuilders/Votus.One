"use client";

import Link from "next/link";
import { useState, useCallback } from "react";
import SoundGate from "@/components/SoundEngine";
import Countdown from "@/components/Countdown";
import SubCount from "@/components/SubCount";

export default function Home() {
  const [rushed, setRushed] = useState(false);

  const rushAnimation = useCallback(() => {
    if (!rushed) setRushed(true);
  }, [rushed]);

  const fast = rushed;
  const d = (normal: string) => fast ? "0s" : normal;
  const dur = (normal: string) => fast ? "0.15s" : normal;

  return (
    <SoundGate scene="home">
      <style>{`
        @keyframes vline {
          0% { opacity: 0; transform: translateY(24px); filter: blur(8px); }
          100% { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes vglow {
          0%, 100% { text-shadow: 0 0 50px rgba(0,212,255,0.3), 0 0 100px rgba(0,212,255,0.1); }
          50% { text-shadow: 0 0 90px rgba(0,212,255,0.6), 0 0 180px rgba(0,212,255,0.2); }
        }
        @keyframes vpulse {
          0% { opacity: 0; }
          50% { opacity: 0.7; }
          100% { opacity: 0; }
        }
        @keyframes vfinal {
          0% { opacity: 0; letter-spacing: 0.5em; filter: blur(10px); }
          60% { opacity: 1; filter: blur(0); }
          100% { opacity: 1; letter-spacing: 0.25em; filter: blur(0); }
        }
        @keyframes vline-spread {
          0% { width: 0; opacity: 0; }
          100% { width: 100px; opacity: 1; }
        }
        @keyframes mark-draw {
          0% { stroke-dashoffset: 60; opacity: 0; }
          30% { opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 1; }
        }
        @keyframes arrow-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(5px); }
        }
        @keyframes top-hint-appear {
          0% { opacity: 0; transform: translateX(-50%) translateY(-8px); }
          100% { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes discord-pulse {
          0%, 100% {
            box-shadow: 0 0 20px rgba(0,212,255,0.15), 0 0 40px rgba(0,212,255,0.05);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 35px rgba(0,212,255,0.35), 0 0 70px rgba(0,212,255,0.12);
            transform: scale(1.03);
          }
        }
        .vl { opacity: 0; animation: vline var(--dur, 1.4s) ease-out var(--del, 0s) forwards; }
        .vf { opacity: 0; animation: vfinal var(--dur-f, 2s) ease-out var(--del, 0s) forwards; }
        .vls { animation: vline-spread var(--dur, 1.2s) ease-out var(--del, 0s) forwards; opacity: 0; }
        .vlink {
          text-decoration: none; color: inherit; cursor: pointer;
          transition: color 0.4s, text-shadow 0.4s; display: block;
        }
        .vlink:hover {
          color: #00d4ff !important;
          text-shadow: 0 0 50px rgba(0,212,255,0.5);
        }
        .mark-path {
          stroke-dasharray: 60; stroke-dashoffset: 60;
          animation: mark-draw var(--dur, 1.8s) ease-out var(--del, 0.2s) forwards;
        }
        /* "Select To Learn More" pinned to top, appears last */
        .top-hint {
          position: fixed;
          top: 24px;
          left: 50%;
          transform: translateX(-50%);
          opacity: 0;
          animation: top-hint-appear var(--dur, 0.8s) ease-out var(--del, 10.8s) forwards;
          z-index: 100;
          white-space: nowrap;
          pointer-events: none;
          text-align: center;
        }
        .discord-btn {
          animation: discord-pulse 3s ease-in-out infinite;
          text-decoration: none;
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          background: rgba(0,212,255,0.06);
          border: 1px solid rgba(0,212,255,0.2);
          border-radius: 16px;
          padding: 24px 36px;
          cursor: pointer;
          transition: background 0.3s;
        }
        .discord-btn:hover { background: rgba(0,212,255,0.12); }
      `}</style>

      {/* Ambient orb */}
      <div style={{
        position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        width: 500, height: 500, borderRadius: "50%", pointerEvents: "none",
        background: "radial-gradient(circle, rgba(0,212,255,0.06), transparent 70%)",
        animation: "vpulse 7s ease-in-out infinite 3s",
      }} />

      {/* "Select To Learn More" — FIXED AT TOP, appears after animation */}
      <div
        className="top-hint"
        style={{
          ["--del" as string]: d("10.8s"),
          ["--dur" as string]: dur("1s"),
        } as React.CSSProperties}
      >
        <p style={{
          fontSize: "clamp(0.7rem, 1.6vw, 0.85rem)",
          letterSpacing: "0.4em",
          textTransform: "uppercase",
          color: "rgba(0,212,255,0.4)",
          marginBottom: 6,
        }}>
          Select To Learn More
        </p>
        <div style={{
          color: "rgba(0,212,255,0.2)",
          fontSize: 13,
          animation: "arrow-bounce 2s ease-in-out infinite",
          marginTop: 2,
        }}>&#8595;</div>
      </div>

      {/* ─── SCREEN 1: The Reveal ─── */}
      <section
        onClick={rushAnimation}
        style={{
          background: "#09090b", color: "#fafafa", minHeight: "100dvh",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif",
          WebkitFontSmoothing: "antialiased",
          padding: "80px 28px",
          textAlign: "center",
          cursor: fast ? "default" : "pointer",
        }}
      >
        {/* V Mark */}
        <svg width="56" height="56" viewBox="0 0 40 40" fill="none" style={{
          marginBottom: 44,
          ["--dur" as string]: dur("1.8s"),
          ["--del" as string]: d("0.5s"),
          filter: "drop-shadow(0 0 24px rgba(0,212,255,0.45))",
        }}>
          <path className="mark-path" d="M8 10 L20 32 L32 10" stroke="#00d4ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>

        {/* Introducing */}
        <Link href="/introducing" className="vl vlink" style={{
          fontSize: "clamp(0.9rem, 2.2vw, 1.2rem)",
          fontWeight: 300,
          letterSpacing: "0.45em",
          textTransform: "uppercase",
          color: "rgba(250,250,250,0.4)",
          marginBottom: 44,
          ["--del" as string]: d("1s"),
          ["--dur" as string]: dur("1.4s"),
        } as React.CSSProperties}>
          Introducing&hellip;
        </Link>

        {/* MOTUS */}
        <Link href="/motus" className="vl vlink" style={{
          fontSize: "clamp(3.2rem, 13vw, 7.5rem)",
          fontWeight: 200,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#fafafa",
          lineHeight: 1,
          marginBottom: 16,
          ["--del" as string]: d("2.5s"),
          ["--dur" as string]: dur("1.6s"),
          animation: `vline ${dur("1.6s")} ease-out ${d("2.5s")} forwards, vglow 4s ease-in-out infinite ${d("4.5s")}`,
        } as React.CSSProperties}>
          ::: Motus :::
        </Link>

        {/* By Votus.One */}
        <a href="https://semble-rocks.vercel.app" className="vl vlink" style={{
          fontSize: "clamp(0.9rem, 2.2vw, 1.1rem)",
          fontWeight: 300,
          letterSpacing: "0.35em",
          textTransform: "uppercase",
          color: "#00d4ff",
          marginBottom: 56,
          textShadow: "0 0 20px rgba(0,212,255,0.25)",
          ["--del" as string]: d("4s"),
          ["--dur" as string]: dur("1.4s"),
        } as React.CSSProperties}>
          By Votus.One
        </a>

        {/* Divider */}
        <div className="vls" style={{
          height: 1,
          background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.45), transparent)",
          marginBottom: 56,
          ["--del" as string]: d("5.5s"),
          ["--dur" as string]: dur("1.2s"),
        } as React.CSSProperties} />

        {/* Move As One */}
        <Link href="/motus" className="vl vlink" style={{
          fontSize: "clamp(1.2rem, 4vw, 2rem)",
          fontWeight: 300,
          letterSpacing: "0.4em",
          textTransform: "uppercase",
          color: "rgba(250,250,250,0.6)",
          marginBottom: 32,
          ["--del" as string]: d("6.5s"),
          ["--dur" as string]: dur("1.4s"),
        } as React.CSSProperties}>
          Move As One
        </Link>

        {/* Votus.One/AllRise */}
        <Link href="/allrise" className="vl vlink" style={{
          fontSize: "clamp(0.9rem, 2.2vw, 1.1rem)",
          fontWeight: 300,
          letterSpacing: "0.28em",
          color: "rgba(0,212,255,0.5)",
          marginBottom: 44,
          ["--del" as string]: d("7.8s"),
          ["--dur" as string]: dur("1.4s"),
        } as React.CSSProperties}>
          Votus.One/AllRise
        </Link>

        {/* ///AllRise/// */}
        <Link href="/allrise" className="vf vlink" style={{
          fontSize: "clamp(1.8rem, 6vw, 3.2rem)",
          fontWeight: 200,
          letterSpacing: "0.25em",
          textTransform: "uppercase",
          color: "#00d4ff",
          textShadow: "0 0 50px rgba(0,212,255,0.35)",
          marginBottom: 64,
          ["--del" as string]: d("9.2s"),
          ["--dur-f" as string]: dur("2s"),
          animationFillMode: "forwards",
        } as React.CSSProperties}>
          ///AllRise///
        </Link>

        {/* Discord CTA — appears after animation (same delay as top-hint) */}
        <div className="vl" style={{
          ["--del" as string]: d("11s"),
          ["--dur" as string]: dur("1s"),
          opacity: 0,
        } as React.CSSProperties}>
          <a
            href="https://discord.gg/BDUDhayHeX"
            target="_blank"
            rel="noopener noreferrer"
            className="discord-btn"
            onClick={(e) => e.stopPropagation()}
          >
            <span style={{
              fontSize: "clamp(1rem, 2.5vw, 1.3rem)",
              fontWeight: 200,
              color: "#fafafa",
              letterSpacing: "0.1em",
            }}>It&rsquo;s Time To Move</span>
            <span style={{
              fontSize: "clamp(0.8rem, 1.8vw, 0.95rem)",
              fontWeight: 300,
              letterSpacing: "0.2em",
              color: "rgba(0,212,255,0.7)",
              textTransform: "uppercase",
            }}>Join The Votus.One Community Discord</span>
            <span style={{
              marginTop: 4,
              fontSize: 11,
              letterSpacing: "0.2em",
              color: "rgba(0,212,255,0.3)",
            }}>discord.gg/BDUDhayHeX ↗</span>
          </a>
        </div>
      </section>

      {/* ─── SCREEN 2: Countdown + Account CTA ─── */}
      <section style={{
        background: "#09090b", padding: "56px 24px 64px", textAlign: "center",
        display: "flex", flexDirection: "column", alignItems: "center",
      }}>
        <Countdown />
        <div style={{ marginTop: 10 }}><SubCount /></div>

        {/* Nav links */}
        <div style={{
          marginTop: 56,
          display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center",
        }}>
          <Link href="/votus-units" style={{
            textDecoration: "none", fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase",
            color: "rgba(0,212,255,0.5)", background: "rgba(0,212,255,0.05)",
            border: "1px solid rgba(0,212,255,0.12)", borderRadius: 100, padding: "12px 22px",
            transition: "all 0.3s",
          }}>Browse Votus Units</Link>
          <Link href="/account/login" style={{
            textDecoration: "none", fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase",
            color: "rgba(0,212,255,0.7)", background: "rgba(0,212,255,0.08)",
            border: "1px solid rgba(0,212,255,0.2)", borderRadius: 100, padding: "12px 22px",
            transition: "all 0.3s",
            boxShadow: "0 0 20px rgba(0,212,255,0.08)",
          }}>My Votus Account</Link>
          <Link href="/start" style={{
            textDecoration: "none", fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase",
            color: "rgba(250,250,250,0.35)",
            border: "1px solid rgba(250,250,250,0.07)", borderRadius: 100, padding: "12px 22px",
            transition: "all 0.3s",
          }}>Start A Unit</Link>
          <a href="https://github.com/InitiumBuilders/Votus.One" target="_blank" rel="noopener noreferrer" style={{
            textDecoration: "none", fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase",
            color: "rgba(250,250,250,0.25)",
            border: "1px solid rgba(250,250,250,0.06)", borderRadius: 100, padding: "12px 22px",
            transition: "all 0.3s",
            display: "inline-flex", alignItems: "center", gap: 8,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="rgba(250,250,250,0.25)">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            Open Source
          </a>
        </div>
      </section>
    </SoundGate>
  );
}
