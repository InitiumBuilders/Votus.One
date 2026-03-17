"use client";

import { useEffect, useState, useRef } from "react";

const slogans = [
  ["Wear One", "Votus.One"],
  ["We Are /One", "Votus.One"],
  ["You Make Me Motus", "You Make Me Move"],
  ["Motus By Votus", "Action And Alignment"],
  ["Motus By Votus", "Votus By Motus"],
  ["Start Strong", "Votus.One"],
  ["Start Together", "Votus.One"],
  ["It\u2019s Time To Move", "Votus.One"],
  ["What Moves You?", "Votus.One"],
  ["Vote And Vibe", "Learn And Earn"],
  ["I Want To Send You Motus", "Because You Make Me Move"],
  ["Votus.One", "Move Together"],
  ["Votus.One", "Start A Vibe"],
  ["Votus.One", "///AllRise///"],
];

export default function AnimatedSlogans() {
  const [active, setActive] = useState(0);
  const [phase, setPhase] = useState<"enter" | "hold" | "exit">("enter");
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;

    // enter → hold (after 1.5s enter animation)
    const enterTimer = setTimeout(() => setPhase("hold"), 1500);

    // hold → exit (at ~9s mark, giving 1.5s for exit)
    const exitTimer = setTimeout(() => setPhase("exit"), 9000);

    // exit → next slogan enter (at 11s total)
    const nextTimer = setTimeout(() => {
      setActive((p) => (p + 1) % slogans.length);
      setPhase("enter");
    }, 11000);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
      clearTimeout(nextTimer);
    };
  }, [visible, active]);

  const [line1, line2] = slogans[active];
  const cyan = "#00d4ff";

  const getOpacity = () => {
    if (phase === "enter") return 0;
    if (phase === "hold") return 1;
    return 0;
  };

  return (
    <div ref={ref} style={{
      minHeight: "80dvh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      position: "relative",
    }}>
      {/* Ambient glow behind text */}
      <div style={{
        position: "absolute",
        width: 400,
        height: 400,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(0,212,255,0.08), transparent 70%)",
        pointerEvents: "none",
        animation: "slogan-ambient 6s ease-in-out infinite",
      }} />

      <p
        key={`a-${active}`}
        style={{
          fontSize: "clamp(2rem, 7vw, 3.5rem)",
          fontWeight: 200,
          color: "#fafafa",
          marginBottom: 16,
          letterSpacing: "0.08em",
          animation: phase === "enter"
            ? "slogan-enter 1.5s ease-out forwards"
            : phase === "exit"
            ? "slogan-exit 1.5s ease-in forwards"
            : "slogan-glow 4s ease-in-out infinite",
          textShadow: "0 0 40px rgba(0,212,255,0.2), 0 0 80px rgba(0,212,255,0.05)",
          position: "relative",
          zIndex: 1,
        }}
      >
        {line1}
      </p>
      <p
        key={`b-${active}`}
        style={{
          fontSize: "clamp(1rem, 3.5vw, 1.5rem)",
          fontWeight: 300,
          color: cyan,
          letterSpacing: "0.15em",
          animation: phase === "enter"
            ? "slogan-enter 1.5s ease-out 0.3s both"
            : phase === "exit"
            ? "slogan-exit 1.5s ease-in 0.15s both"
            : "slogan-sub-glow 4s ease-in-out infinite",
          position: "relative",
          zIndex: 1,
        }}
      >
        {line2}
      </p>

      {/* Minimal dot indicator */}
      <div style={{
        display: "flex",
        gap: 8,
        marginTop: 48,
        position: "relative",
        zIndex: 1,
      }}>
        {slogans.map((_, i) => (
          <div
            key={i}
            style={{
              width: i === active ? 20 : 4,
              height: 4,
              borderRadius: 2,
              background: i === active ? cyan : "rgba(0,212,255,0.12)",
              transition: "all 0.6s ease",
              boxShadow: i === active ? `0 0 12px ${cyan}` : "none",
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes slogan-enter {
          0% { opacity: 0; transform: translateY(30px) scale(0.95); filter: blur(8px); }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @keyframes slogan-exit {
          0% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
          100% { opacity: 0; transform: translateY(-20px) scale(1.02); filter: blur(6px); }
        }
        @keyframes slogan-glow {
          0%, 100% { text-shadow: 0 0 40px rgba(0,212,255,0.15), 0 0 80px rgba(0,212,255,0.05); }
          50% { text-shadow: 0 0 60px rgba(0,212,255,0.3), 0 0 120px rgba(0,212,255,0.1); }
        }
        @keyframes slogan-sub-glow {
          0%, 100% { text-shadow: 0 0 20px rgba(0,212,255,0.2); }
          50% { text-shadow: 0 0 40px rgba(0,212,255,0.4); }
        }
        @keyframes slogan-ambient {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}
