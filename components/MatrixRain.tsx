"use client";

import { useEffect, useRef } from "react";

export default function MatrixRain({ onDone }: { onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const cols = Math.floor(canvas.width / 14);
    const drops: number[] = Array(cols).fill(1);
    const chars = "アイウエオカキクケコ01アABCDEF日本語0110";

    const draw = () => {
      ctx.fillStyle = "rgba(0,0,0,0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#00ff88";
      ctx.font = "13px monospace";
      drops.forEach((y, i) => {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(char, i * 14, y * 14);
        if (y * 14 > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      });
    };

    const interval = setInterval(draw, 33);

    // Type out ///ALLRISE/// after 1s
    let typed = "";
    const target = "///ALLRISE///";
    let ti = 0;
    const typeInterval = setTimeout(() => {
      const typeNext = setInterval(() => {
        if (ti < target.length) {
          typed += target[ti];
          if (textRef.current) textRef.current.textContent = typed + "█";
          ti++;
        } else {
          clearInterval(typeNext);
          if (textRef.current) textRef.current.textContent = target;
        }
      }, 80);
    }, 800);

    const done = setTimeout(() => {
      clearInterval(interval);
      onDone();
    }, 4000);

    return () => {
      clearInterval(interval);
      clearTimeout(typeInterval);
      clearTimeout(done);
    };
  }, [onDone]);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9998, background: "#000",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0 }} />
      <div
        ref={textRef}
        style={{
          position: "relative", zIndex: 1,
          fontFamily: "monospace", fontSize: "clamp(24px, 5vw, 48px)",
          color: "#00ff88", letterSpacing: "0.2em",
          textShadow: "0 0 20px #00ff88, 0 0 40px #00ff88",
        }}
      />
    </div>
  );
}
