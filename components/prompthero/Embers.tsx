"use client";

import { useEffect, useRef } from "react";

// Embers rising through the dark — slow, glowing, alive. Each one a prompt
// on its way somewhere. Respects prefers-reduced-motion (renders nothing).
export default function Embers() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = 0, h = 0;

    type Ember = { x: number; y: number; r: number; vy: number; sway: number; phase: number; a: number; hue: [number, number, number] };
    const HUES: [number, number, number][] = [[255, 209, 102], [255, 158, 100], [255, 122, 69]];
    let embers: Ember[] = [];

    const spawn = (startAnywhere: boolean): Ember => ({
      x: Math.random() * w,
      y: startAnywhere ? Math.random() * h : h + 8,
      r: 0.7 + Math.random() * 1.5,
      vy: 0.18 + Math.random() * 0.4,
      sway: 8 + Math.random() * 22,
      phase: Math.random() * Math.PI * 2,
      a: 0.1 + Math.random() * 0.4,
      hue: HUES[Math.floor(Math.random() * HUES.length)],
    });

    const seed = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      embers = Array.from({ length: Math.min(40, Math.floor((w * h) / 32000)) }, () => spawn(true));
    };

    let t = 0;
    const draw = () => {
      t += 0.016;
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < embers.length; i++) {
        const e = embers[i];
        e.y -= e.vy;
        const x = e.x + Math.sin(e.phase + t * 0.8) * e.sway * 0.08;
        const flicker = 0.6 + 0.4 * Math.sin(e.phase * 3 + t * 2.2);
        const [r, g, b] = e.hue;
        ctx.beginPath();
        ctx.arc(x, e.y, e.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${e.a * flicker})`;
        ctx.shadowColor = `rgba(${r},${g},${b},0.6)`;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
        if (e.y < -10) embers[i] = spawn(false);
      }
      raf = requestAnimationFrame(draw);
    };

    seed();
    draw();
    const onResize = () => seed();
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", opacity: 0.7 }}
    />
  );
}
