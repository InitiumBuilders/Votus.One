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
    let seededW = 0, seededH = 0;

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

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = `${w}px`; canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const seed = () => {
      size();
      seededW = w; seededH = h;
      embers = Array.from({ length: Math.min(40, Math.floor((w * h) / 32000)) }, () => spawn(true));
    };

    // Clock time, not frame count — the same slow rise at 60Hz or 120Hz.
    let t = 0, last = 0;
    const draw = (now: number) => {
      const dt = last ? Math.min(Math.max((now - last) / 1000, 0), 0.1) : 1 / 60;
      last = now;
      const k = dt * 60;
      t += dt;
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < embers.length; i++) {
        const e = embers[i];
        e.y -= e.vy * k;
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
    draw(performance.now());
    // Toolbar resizes keep every ember where it is; only a new shape re-seeds.
    const onResize = () => {
      const nw = window.innerWidth, nh = window.innerHeight;
      if (Math.abs(nw - seededW) > seededW * 0.08 || Math.abs(nh - seededH) > seededH * 0.3) seed();
      else size();
    };
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
