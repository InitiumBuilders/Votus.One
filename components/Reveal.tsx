"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createScrollSounds } from "./SoundEngine";

export default function Reveal({ children, delay = 0, sound }: { children: ReactNode; delay?: number; sound?: "reveal" | "reckoning" | "allrise" | "pledge" }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const played = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
          
          // Play scroll sound if audio context exists
          if (sound && !played.current) {
            played.current = true;
            const ctx = (window as unknown as Record<string, unknown>).__votusAudioCtx as AudioContext | undefined;
            if (ctx && ctx.state === "running") {
              const s = createScrollSounds(ctx);
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
