"use client";

import { useEffect, useRef } from "react";

// A quiet field of stars behind everything — some cyan, a few gold (the
// earned ones). Occasionally, a shooting star: a prompt leaving for somewhere.
export default function Starfield() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let w = 0, h = 0;

    type Star = { x: number; y: number; r: number; base: number; phase: number; speed: number; gold: boolean };
    let stars: Star[] = [];
    let shot: { x: number; y: number; vx: number; vy: number; life: number } | null = null;
    let nextShot = 400;

    const seed = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(160, Math.floor((w * h) / 9000));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 0.4 + Math.random() * 1.1,
        base: 0.12 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
        speed: 0.3 + Math.random() * 0.9,
        gold: Math.random() < 0.12,
      }));
    };

    let t = 0;
    const draw = () => {
      t += 0.016;
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        const tw = reduced ? 1 : 0.55 + 0.45 * Math.sin(s.phase + t * s.speed);
        const a = s.base * tw;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.gold ? `rgba(255,209,102,${a})` : `rgba(0,212,255,${a * 0.85})`;
        ctx.fill();
      }
      if (!reduced) {
        if (shot) {
          shot.x += shot.vx; shot.y += shot.vy; shot.life -= 1;
          const grad = ctx.createLinearGradient(shot.x, shot.y, shot.x - shot.vx * 12, shot.y - shot.vy * 12);
          grad.addColorStop(0, `rgba(255,255,255,${Math.min(0.7, shot.life / 40)})`);
          grad.addColorStop(1, "rgba(0,212,255,0)");
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(shot.x, shot.y);
          ctx.lineTo(shot.x - shot.vx * 12, shot.y - shot.vy * 12);
          ctx.stroke();
          if (shot.life <= 0 || shot.x < -50 || shot.x > w + 50) shot = null;
        } else if (--nextShot <= 0) {
          const fromLeft = Math.random() < 0.5;
          shot = {
            x: fromLeft ? -20 : w + 20,
            y: Math.random() * h * 0.5,
            vx: (fromLeft ? 1 : -1) * (4 + Math.random() * 3),
            vy: 1.2 + Math.random() * 1.4,
            life: 60,
          };
          nextShot = 500 + Math.random() * 900;
        }
        raf = requestAnimationFrame(draw);
      }
    };

    seed();
    draw();
    const onResize = () => { seed(); if (reduced) draw(); };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", opacity: 0.8 }}
    />
  );
}
