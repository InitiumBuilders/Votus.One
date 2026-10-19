"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createScrollSounds } from "./SoundEngine";

// One voice per AudioContext — a fresh engine per reveal would build a new
// reverb every time and its debounce would never see the others.
const voices = new WeakMap<AudioContext, ReturnType<typeof createScrollSounds>>();

// Server HTML carries data-reveal: layout.tsx's <noscript> shows it without
// JS, and globals.css lets reduced motion skip the slide and the blur.
export default function Reveal({ children, delay = 0, sound }: { children: ReactNode; delay?: number; sound?: "reveal" | "reckoning" | "allrise" | "pledge" }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const played = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Stillness asked for: arrive at once — no slide, no blur, no chime.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();

          // Chime only while the veil's sound is on (a muted ctx is suspended)
          if (sound && !played.current) {
            played.current = true;
            const ctx = (window as unknown as Record<string, unknown>).__votusAudioCtx as AudioContext | undefined;
            if (ctx && ctx.state === "running") {
              let s = voices.get(ctx);
              if (!s) { s = createScrollSounds(ctx); voices.set(ctx, s); }
              if (sound === "reckoning") s.onReckoning();
              else if (sound === "allrise") s.onAllRise();
              else if (sound === "pledge") s.onPledge();
              else s.onReveal();
            }
          }
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [sound]);

  return (
    <div
      ref={ref}
      data-reveal=""
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        filter: visible ? "blur(0)" : "blur(4px)",
        transition: `opacity 0.8s ease ${delay}s, transform 0.8s ease ${delay}s, filter 0.8s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}
