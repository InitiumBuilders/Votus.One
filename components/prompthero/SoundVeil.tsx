"use client";

import { useRef, useState } from "react";

// Sound without a gate: the page arrives instantly; the soundscape waits
// quietly in the corner for whoever wants it. One tap — a crystalline
// arrival — and scroll-reveals begin to chime (Reveal reads the shared ctx).
export default function SoundVeil({ children }: { children: React.ReactNode }) {
  const [on, setOn] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);

  const chime = (ctx: AudioContext, freq: number, at: number, vol: number, dur = 2.4) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, at);
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(vol, at + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0008, at + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(at);
    osc.stop(at + dur);
  };

  const toggle = () => {
    if (!ctxRef.current) {
      const ctx = new AudioContext();
      ctxRef.current = ctx;
      (window as unknown as Record<string, unknown>).__votusAudioCtx = ctx;
      const t = ctx.currentTime;
      chime(ctx, 523.25, t + 0.1, 0.05);        // C5 — clean arrival
      chime(ctx, 659.25, t + 0.5, 0.035);       // E5
      chime(ctx, 65.41, t + 0.4, 0.03, 4);      // C2 ground
      chime(ctx, 783.99, t + 1.1, 0.022);       // G5 shimmer
      setOn(true);
      return;
    }
    if (on) {
      ctxRef.current.suspend();
      setOn(false);
    } else {
      ctxRef.current.resume();
      setOn(true);
    }
  };

  return (
    <>
      {children}
      <button
        onClick={toggle}
        aria-label={on ? "Sound off" : "Sound on"}
        title={on ? "Sound off" : "Sound on — for the full experience"}
        style={{
          position: "fixed",
          right: 18,
          bottom: 18,
          zIndex: 50,
          width: 44,
          height: 44,
          borderRadius: "50%",
          border: `1px solid ${on ? "rgba(0,212,255,0.5)" : "rgba(250,250,250,0.15)"}`,
          background: "rgba(9,9,11,0.7)",
          backdropFilter: "blur(8px)",
          color: on ? "rgba(0,212,255,0.9)" : "rgba(250,250,250,0.4)",
          fontSize: 16,
          cursor: "pointer",
          transition: "all 0.4s",
          boxShadow: on ? "0 0 24px rgba(0,212,255,0.2)" : "none",
        }}
      >
        {on ? "♪" : "♩"}
      </button>
    </>
  );
}
