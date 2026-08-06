"use client";

// ─────────────────────────────────────────────────────────────────────────────
// THE SWARM — Natari's resident life-form.
//
// Hundreds of luminous particles behaving as ONE conscious spirit: a complex
// adaptive system with a temperament. It inhabits and orbits whatever holds the
// charge, absorbs that element's essence hue, streams across the screen when
// the charge hands off (murmuration), notices the cursor, leads when you idle,
// and scatters playfully when startled.
//
// Micro-lightning lives INSIDE the being — thin arcs between close particles —
// because electricity here is a creature, not a glow.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef } from "react";

export type Mood = "orbit" | "gather" | "lead" | "startle" | "gentle";

interface P {
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  hueOff: number;
  phase: number;
  wob: number;
}

interface Props {
  /** DOM id of the element currently holding the charge. */
  attractorId?: string | null;
  /** Essence hue (degrees) the being eases toward — the charged concept's color. */
  essence?: number;
  /** Temperament. `gentle` runs the whole system at 0.65 tempo. */
  mood?: Mood;
  /** Ids of word-level beacons; the swarm detaches wisps to visit them. */
  wispId?: string | null;
}

const TAU = Math.PI * 2;

export default function Swarm({ attractorId = null, essence = 265, mood = "orbit", wispId = null }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({ attractorId, essence, mood, wispId });
  stateRef.current = { attractorId, essence, mood, wispId };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0, h = 0, dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    // ── the body ────────────────────────────────────────────────────────────
    const mobile = w < 720;
    const COUNT = reduced ? 0 : mobile ? 130 : 210;
    const parts: P[] = Array.from({ length: COUNT }, () => ({
      x: w / 2 + (Math.random() - 0.5) * w * 0.6,
      y: h / 2 + (Math.random() - 0.5) * h * 0.6,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      size: 1.5 + Math.random() * 2,
      hueOff: (Math.random() - 0.5) * 44, // the being is never one flat color
      phase: Math.random() * TAU,
      wob: 0.6 + Math.random() * 0.9,
    }));

    // ── attention ───────────────────────────────────────────────────────────
    const mouse = { x: -9999, y: -9999, live: false };
    let lastMove = performance.now();
    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX; mouse.y = e.clientY; mouse.live = true;
      lastMove = performance.now();
    };
    const onLeave = () => { mouse.live = false; };
    let startleAt = -9999;
    const onDown = () => { startleAt = performance.now(); };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("resize", resize);

    // ── the attractor: a live ring around the charged element ───────────────
    const target = { x: w / 2, y: h * 0.42, r: 150 };
    const eased = { x: target.x, y: target.y, r: target.r, hue: essence };
    let travel = 0; // 0..1 — how far the being is from home (drives murmuration streaks)

    const readAttractor = () => {
      const id = stateRef.current.attractorId;
      const wisp = stateRef.current.wispId;
      const pick = wisp ? document.getElementById(wisp) : id ? document.getElementById(id) : null;
      if (pick) {
        const r = pick.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) {
          target.x = r.left + r.width / 2;
          target.y = r.top + r.height / 2;
          // inhabit the element: ring sized to it, not a fixed dot
          target.r = Math.max(52, Math.min(Math.max(r.width, r.height) * 0.62, 260));
          return;
        }
      }
      target.x = w / 2; target.y = h * 0.42; target.r = mobile ? 120 : 170;
    };

    let raf = 0;
    let visible = true;
    const onVis = () => { visible = !document.hidden; };
    document.addEventListener("visibilitychange", onVis);

    let t0 = performance.now();

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      const dt = Math.min((now - t0) / 16.67, 2.5); // normalized to ~60fps
      t0 = now;

      readAttractor();
      const st = stateRef.current;
      const gentle = st.mood === "gentle";
      const tempo = gentle ? 0.65 : 1;

      // Essence absorption — the being takes on what it visits.
      const dh = ((st.essence - eased.hue + 540) % 360) - 180;
      eased.hue += dh * 0.028 * dt;

      // Spring toward the attractor with follow-through (anticipation → settle).
      const dx = target.x - eased.x, dy = target.y - eased.y;
      const dist = Math.hypot(dx, dy);
      travel += (Math.min(dist / 420, 1) - travel) * 0.08 * dt;
      const pull = (st.mood === "gather" ? 0.14 : 0.075) * tempo;
      eased.x += dx * pull * dt;
      eased.y += dy * pull * dt;
      eased.r += (target.r - eased.r) * 0.07 * dt;

      const sinceMove = now - lastMove;
      const leading = st.mood === "lead" || sinceMove > 4200; // it guides when you pause
      const startling = now - startleAt < 900;
      const startleK = startling ? 1 - (now - startleAt) / 900 : 0;

      // The breath — the ring itself is never static.
      const breath = 1 + Math.sin(now / (gentle ? 3400 : 2400)) * 0.075;
      const ringR = eased.r * breath;

      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter"; // additive: luminous in the dark

      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];

        // 1 · spring toward a RING around the attractor — inhabit, don't collapse
        const ax = p.x - eased.x, ay = p.y - eased.y;
        const ad = Math.hypot(ax, ay) || 1;
        const want = ringR * (leading ? 1.16 : 1) + Math.sin(now / 1600 + p.phase) * 16;
        const radial = (want - ad) * 0.0055 * tempo;
        p.vx += (ax / ad) * radial * dt;
        p.vy += (ay / ad) * radial * dt;

        // 2 · tangential orbit drift — the being turns
        const spin = (gentle ? 0.05 : 0.085) * (1 + travel * 0.7);
        p.vx += (-ay / ad) * spin * 0.01 * dt;
        p.vy += (ax / ad) * spin * 0.01 * dt;

        // 3 · layered sine wander (hand-of-nature variance)
        p.vx += Math.sin(now / 900 * p.wob + p.phase) * 0.012 * tempo * dt;
        p.vy += Math.cos(now / 1100 * p.wob + p.phase * 1.7) * 0.012 * tempo * dt;

        // 4 · sampled separation — each checks a handful of random peers
        for (let s = 0; s < 3; s++) {
          const q = parts[(Math.random() * parts.length) | 0];
          const sx = p.x - q.x, sy = p.y - q.y;
          const sd2 = sx * sx + sy * sy;
          if (sd2 > 0.5 && sd2 < 460) {
            const f = 0.055 / sd2;
            p.vx += sx * f * dt; p.vy += sy * f * dt;
          }
        }

        // 5 · it notices you
        if (mouse.live) {
          const mx = mouse.x - p.x, my = mouse.y - p.y;
          const md = Math.hypot(mx, my);
          if (md < 150 && md > 1) {
            const f = (1 - md / 150) * 0.05 * tempo;
            p.vx += (mx / md) * f * dt;
            p.vy += (my / md) * f * dt;
          }
        }

        // 6 · STARTLE — playful scatter, then regather
        if (startleK > 0) {
          p.vx += (ax / ad) * startleK * 0.9 * dt;
          p.vy += (ay / ad) * startleK * 0.9 * dt;
        }

        // damping + clamp
        p.vx *= 0.955; p.vy *= 0.955;
        const sp = Math.hypot(p.vx, p.vy);
        const max = 3.4 * tempo * (1 + travel);
        if (sp > max) { p.vx = (p.vx / sp) * max; p.vy = (p.vy / sp) * max; }

        p.x += p.vx * dt; p.y += p.vy * dt;

        // wrap softly so the being never "ends"
        if (p.x < -60) p.x = w + 60; else if (p.x > w + 60) p.x = -60;
        if (p.y < -60) p.y = h + 60; else if (p.y > h + 60) p.y = -60;

        // draw — murmuration streaks while travelling, points at rest
        const hue = (eased.hue + p.hueOff + 360) % 360;
        const speed = Math.hypot(p.vx, p.vy);
        const alpha = 0.34 + Math.min(speed / 3, 1) * 0.4;
        if (travel > 0.12 && speed > 0.55) {
          ctx.strokeStyle = `hsla(${hue}, 92%, 72%, ${alpha * 0.75})`;
          ctx.lineWidth = p.size * 0.7;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * 3.4, p.y - p.vy * 3.4);
          ctx.stroke();
        } else {
          ctx.fillStyle = `hsla(${hue}, 92%, 74%, ${alpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, TAU);
          ctx.fill();
        }
      }

      // ── micro-lightning: electricity as the being's own texture ───────────
      const arcs = mobile ? 12 : 22;
      ctx.lineWidth = 0.85;
      for (let a = 0; a < arcs; a++) {
        const p = parts[(Math.random() * parts.length) | 0];
        const q = parts[(Math.random() * parts.length) | 0];
        if (!p || !q || p === q) continue;
        const dx2 = p.x - q.x, dy2 = p.y - q.y;
        const d2 = Math.hypot(dx2, dy2);
        if (d2 > 74 || d2 < 4) continue;
        const hue = (eased.hue + 12) % 360;
        ctx.strokeStyle = `hsla(${hue}, 96%, 80%, ${0.3 * (1 - d2 / 74)})`;
        // kinked, not straight — a bolt has opinions
        const mx = (p.x + q.x) / 2 + (Math.random() - 0.5) * 11;
        const my = (p.y + q.y) / 2 + (Math.random() - 0.5) * 11;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(mx, my);
        ctx.lineTo(q.x, q.y);
        ctx.stroke();
      }

      ctx.globalCompositeOperation = "source-over";
    };

    if (!reduced) raf = requestAnimationFrame(frame);
    else {
      // Reduced motion: a calm static aura marks the charged element.
      readAttractor();
      const paint = () => {
        ctx.clearRect(0, 0, w, h);
        const g = ctx.createRadialGradient(target.x, target.y, 0, target.x, target.y, target.r * 1.5);
        g.addColorStop(0, `hsla(${stateRef.current.essence}, 90%, 70%, 0.20)`);
        g.addColorStop(1, "hsla(0,0%,0%,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      };
      paint();
      const iv = setInterval(paint, 900);
      return () => {
        clearInterval(iv);
        window.removeEventListener("resize", resize);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerleave", onLeave);
        window.removeEventListener("pointerdown", onDown);
        document.removeEventListener("visibilitychange", onVis);
      };
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("pointerdown", onDown);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: "fixed", inset: 0, zIndex: 1,
        pointerEvents: "none", mixBlendMode: "screen",
      }}
    />
  );
}
