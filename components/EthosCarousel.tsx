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
  ["Votus.One", "Start A Vibe\nMove As One"],
  ["Votus.One", "///AllRise///"],
];

export default function EthosCarousel() {
  const [active, setActive] = useState(0);
  const [phase, setPhase] = useState<"enter" | "hold" | "exit">("enter");
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const enterT = setTimeout(() => setPhase("hold"), 1800);
    const exitT = setTimeout(() => setPhase("exit"), 9500);
    const nextT = setTimeout(() => {
      setActive((p) => (p + 1) % slogans.length);
      setPhase("enter");
    }, 12000);
    return () => { clearTimeout(enterT); clearTimeout(exitT); clearTimeout(nextT); };
  }, [visible, active]);

  const [line1, line2] = slogans[active];
  const cyan = "#00d4ff";

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
      <div style={{
        position: "absolute",
        width: 500,
        height: 500,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(0,212,255,0.06), transparent 70%)",
        pointerEvents: "none",
        animation: "ethos-ambient 8s ease-in-out infinite",
      }} />

      <p
        key={`e1-${active}`}
        style={{
          fontSize: "clamp(2.2rem, 8vw, 4rem)",
          fontWeight: 200,
          color: "#fafafa",
          marginBottom: 20,
          letterSpacing: "0.06em",
          lineHeight: 1.2,
          animation: phase === "enter"
            ? "ethos-enter 1.8s cubic-bezier(0.16,1,0.3,1) forwards"
            : phase === "exit"
            ? "ethos-exit 1.8s ease-in forwards"
            : "ethos-breathe 5s ease-in-out infinite",
          textShadow: "0 0 50px rgba(0,212,255,0.15)",
          position: "relative",
          zIndex: 1,
          maxWidth: 600,
        }}
      >
        {line1}
      </p>
      <p
        key={`e2-${active}`}
        style={{
          fontSize: "clamp(1.1rem, 4vw, 1.8rem)",
          fontWeight: 300,
          color: cyan,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          whiteSpace: "pre-line",
          animation: phase === "enter"
            ? "ethos-enter 1.8s cubic-bezier(0.16,1,0.3,1) 0.4s both"
            : phase === "exit"
            ? "ethos-exit 1.8s ease-in 0.2s both"
            : "ethos-sub-breathe 5s ease-in-out infinite",
          position: "relative",
          zIndex: 1,
        }}
      >
        {line2}
      </p>

      {/* Count indicator */}
      <p style={{
        marginTop: 48,
        fontSize: 13,
        fontWeight: 300,
        letterSpacing: "0.3em",
        color: "rgba(0,212,255,0.3)",
        position: "relative",
        zIndex: 1,
      }}>
        {String(active + 1).padStart(2, "0")} / {slogans.length}
      </p>

      <style>{`
        @keyframes ethos-enter {
          0% { opacity: 0; transform: translateY(40px) scale(0.92); filter: blur(12px); }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @keyframes ethos-exit {
          0% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
          100% { opacity: 0; transform: translateY(-30px) scale(1.03); filter: blur(10px); }
        }
        @keyframes ethos-breathe {
          0%, 100% { text-shadow: 0 0 50px rgba(0,212,255,0.1); }
          50% { text-shadow: 0 0 80px rgba(0,212,255,0.25), 0 0 150px rgba(0,212,255,0.08); }
        }
        @keyframes ethos-sub-breathe {
          0%, 100% { text-shadow: 0 0 25px rgba(0,212,255,0.2); }
          50% { text-shadow: 0 0 50px rgba(0,212,255,0.4); }
        }
        @keyframes ethos-ambient {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.15); }
        }
      `}</style>
    </div>
  );
}
