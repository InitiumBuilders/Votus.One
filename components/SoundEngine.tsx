"use client";

import { useCallback, useRef, useState, useEffect } from "react";

type Ctx = AudioContext;

function createReverb(ctx: Ctx, duration = 2, decay = 2): ConvolverNode {
  const rate = ctx.sampleRate;
  const length = rate * duration;
  const impulse = ctx.createBuffer(2, length, rate);
  for (let ch = 0; ch < 2; ch++) {
    const data = impulse.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
  }
  const conv = ctx.createConvolver();
  conv.buffer = impulse;
  return conv;
}

function playTone(ctx: Ctx, dest: AudioNode, freq: number, start: number, dur: number, vol = 0.08, type: OscillatorType = "sine") {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(vol, start + Math.min(dur * 0.3, 0.5));
  gain.gain.linearRampToValueAtTime(0, start + dur);
  osc.connect(gain);
  gain.connect(dest);
  osc.start(start);
  osc.stop(start + dur + 0.1);
}

function playDrone(ctx: Ctx, dest: AudioNode, freq: number, start: number, dur: number, vol = 0.04) {
  // Layered drone: fundamental + fifth + octave
  playTone(ctx, dest, freq, start, dur, vol, "sine");
  playTone(ctx, dest, freq * 1.5, start, dur, vol * 0.5, "sine");
  playTone(ctx, dest, freq * 2, start, dur, vol * 0.3, "sine");
  // Sub bass
  playTone(ctx, dest, freq * 0.5, start, dur, vol * 0.6, "sine");
}

function playChime(ctx: Ctx, dest: AudioNode, freq: number, start: number, vol = 0.06) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, start);
  osc.frequency.exponentialRampToValueAtTime(freq * 1.01, start + 2);
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(vol, start + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.001, start + 3);
  osc.connect(gain);
  gain.connect(dest);
  osc.start(start);
  osc.stop(start + 3.5);
}

function playRisingChord(ctx: Ctx, dest: AudioNode, start: number, vol = 0.05) {
  // C minor to C major resolution — darkness to light
  const notes = [130.81, 155.56, 196.00, 261.63]; // C3, Eb3, G3, C4
  const resolve = [130.81, 164.81, 196.00, 261.63, 329.63]; // C3, E3, G3, C4, E4
  
  notes.forEach((f, i) => {
    playTone(ctx, dest, f, start + i * 0.15, 3, vol, "sine");
  });
  
  resolve.forEach((f, i) => {
    playTone(ctx, dest, f, start + 2, 4, vol * 0.8, "sine");
  });
  
  // High shimmer
  playChime(ctx, dest, 523.25, start + 2.5, vol * 0.4); // C5
  playChime(ctx, dest, 659.25, start + 2.8, vol * 0.3); // E5
  playChime(ctx, dest, 783.99, start + 3.1, vol * 0.2); // G5
}

function playDeepImpact(ctx: Ctx, dest: AudioNode, start: number, vol = 0.06) {
  // Sub-bass hit that swells
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(40, start);
  osc.frequency.exponentialRampToValueAtTime(30, start + 4);
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(vol, start + 0.8);
  gain.gain.linearRampToValueAtTime(vol * 0.6, start + 3);
  gain.gain.linearRampToValueAtTime(0, start + 5);
  osc.connect(gain);
  gain.connect(dest);
  osc.start(start);
  osc.stop(start + 5.5);
}

// ── Exported scene composers ──

export function playHomeScene(ctx: Ctx) {
  const reverb = createReverb(ctx, 3, 2.5);
  const master = ctx.createGain();
  master.gain.value = 0.7;
  reverb.connect(master);
  master.connect(ctx.destination);
  
  const t = ctx.currentTime;
  
  // 0.5s: Introducing — single high chime
  playChime(ctx, reverb, 880, t + 0.3, 0.04);
  
  // 2.5s: Motus — deep drone emerges
  playDrone(ctx, reverb, 65.41, t + 2, 4, 0.04); // C2
  
  // 4s: By Votus.One — crystalline
  playChime(ctx, reverb, 1046.5, t + 3.8, 0.03); // C6
  
  // 6.5s: Move As One — mid tone
  playTone(ctx, reverb, 196, t + 6, 2, 0.05, "sine"); // G3
  playTone(ctx, reverb, 261.63, t + 6.2, 2, 0.04, "sine"); // C4
  
  // 9.2s: ///AllRise/// — the rising chord
  playRisingChord(ctx, reverb, t + 8.5, 0.05);
  playDeepImpact(ctx, reverb, t + 8.5, 0.04);
}

export function playAllRiseScene(ctx: Ctx) {
  const reverb = createReverb(ctx, 4, 3);
  const master = ctx.createGain();
  master.gain.value = 0.7;
  reverb.connect(master);
  master.connect(ctx.destination);
  
  const t = ctx.currentTime;
  
  // Opening: deep space drone
  playDrone(ctx, reverb, 55, t + 0.5, 8, 0.03); // A1
  playDeepImpact(ctx, reverb, t + 0.5, 0.03);
  
  // Ring appears: high ethereal chime
  playChime(ctx, reverb, 1318.5, t + 1, 0.03); // E6
  playChime(ctx, reverb, 987.77, t + 1.5, 0.025); // B5
  
  // ///AllRise/// text: the chord
  playRisingChord(ctx, reverb, t + 2, 0.04);
}

export function createScrollSounds(ctx: Ctx) {
  const reverb = createReverb(ctx, 2.5, 2);
  const master = ctx.createGain();
  master.gain.value = 0.5;
  reverb.connect(master);
  master.connect(ctx.destination);
  
  let lastPlayed = 0;
  const tones = [
    196.00, 220.00, 261.63, 293.66, 329.63, 392.00, 440.00, 523.25
    // G3, A3, C4, D4, E4, G4, A4, C5 — pentatonic-ish
  ];
  let idx = 0;
  
  return {
    onReveal: () => {
      const now = Date.now();
      if (now - lastPlayed < 600) return; // debounce
      lastPlayed = now;
      const freq = tones[idx % tones.length];
      playChime(ctx, reverb, freq, ctx.currentTime, 0.03);
      idx++;
    },
    onReckoning: () => {
      const t = ctx.currentTime;
      playDeepImpact(ctx, reverb, t, 0.04);
      playDrone(ctx, reverb, 65.41, t, 3, 0.03);
    },
    onAllRise: () => {
      const t = ctx.currentTime;
      playRisingChord(ctx, reverb, t, 0.06);
      playDeepImpact(ctx, reverb, t, 0.05);
    },
    onPledge: () => {
      const t = ctx.currentTime;
      // Gentle arpeggio
      [261.63, 329.63, 392, 523.25].forEach((f, i) => {
        playChime(ctx, reverb, f, t + i * 0.4, 0.04);
      });
    }
  };
}

// ── Cyber sound effects ──

export function playCyberBlip(ctx: AudioContext) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(1800, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(2400, ctx.currentTime + 0.06);
  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.15);
}

export function playAccessGranted(ctx: AudioContext) {
  const t = ctx.currentTime;
  const freqs = [440, 550, 660];
  freqs.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(freq, t + i * 0.12);
    gain.gain.setValueAtTime(0, t + i * 0.12);
    gain.gain.linearRampToValueAtTime(0.07, t + i * 0.12 + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.12 + 0.18);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t + i * 0.12);
    osc.stop(t + i * 0.12 + 0.2);
  });
}

export function playTerminalBoot(ctx: AudioContext) {
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(80, t);
  osc.frequency.linearRampToValueAtTime(440, t + 1.0);
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.07, t + 0.3);
  gain.gain.linearRampToValueAtTime(0.04, t + 0.9);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 1.3);
}

export function playDecryptSound(ctx: AudioContext) {
  const t = ctx.currentTime;
  for (let i = 0; i < 12; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    const freq = 200 + Math.random() * 800;
    osc.frequency.setValueAtTime(freq, t + i * 0.06);
    gain.gain.setValueAtTime(0.04, t + i * 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.06 + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t + i * 0.06);
    osc.stop(t + i * 0.06 + 0.06);
  }
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(880, t + 0.8);
  gain.gain.setValueAtTime(0.06, t + 0.8);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t + 0.8);
  osc.stop(t + 1.3);
}

export function playKeystroke(ctx: AudioContext) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "square";
  osc.frequency.setValueAtTime(600, ctx.currentTime);
  gain.gain.setValueAtTime(0.03, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.05);
}

export function playDenied(ctx: AudioContext) {
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(300, t);
  osc.frequency.linearRampToValueAtTime(80, t + 0.3);
  gain.gain.setValueAtTime(0.08, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.4);
}

export function playHeartbeatPing(ctx: AudioContext) {
  const t = ctx.currentTime;
  [0, 0.15].forEach((offset) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(440, t + offset);
    gain.gain.setValueAtTime(0, t + offset);
    gain.gain.linearRampToValueAtTime(0.05, t + offset + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.18);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t + offset);
    osc.stop(t + offset + 0.2);
  });
}

// ── Tap to begin overlay ──

export default function SoundGate({ scene, children }: { scene: "home" | "allrise" | "motus" | "introducing"; children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [fading, setFading] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);

  const unlock = useCallback(() => {
    setFading(true);
    const ctx = new AudioContext();
    ctxRef.current = ctx;
    
    if (scene === "home") playHomeScene(ctx);
    else if (scene === "allrise") playAllRiseScene(ctx);
    else if (scene === "motus") {
      // Motus: bold, moving, ascending
      const reverb = createReverb(ctx, 3, 2.5);
      const master = ctx.createGain();
      master.gain.value = 0.6;
      reverb.connect(master);
      master.connect(ctx.destination);
      const t = ctx.currentTime;
      playDrone(ctx, reverb, 82.41, t + 0.3, 5, 0.03); // E2
      playChime(ctx, reverb, 659.25, t + 0.5, 0.035); // E5
      playChime(ctx, reverb, 783.99, t + 1.0, 0.025); // G5
      playTone(ctx, reverb, 196, t + 1.5, 2, 0.04, "sine"); // G3 — "move"
      playChime(ctx, reverb, 987.77, t + 2.0, 0.02); // B5 shimmer
    } else {
      // Introducing / ethos / start — quiet crystalline arrival
      const reverb = createReverb(ctx, 3, 2.5);
      const master = ctx.createGain();
      master.gain.value = 0.5;
      reverb.connect(master);
      master.connect(ctx.destination);
      const t = ctx.currentTime;
      playChime(ctx, reverb, 523.25, t + 0.2, 0.04);   // C5 — clean arrival
      playChime(ctx, reverb, 659.25, t + 0.6, 0.03);   // E5
      playDrone(ctx, reverb, 65.41, t + 0.5, 4, 0.025); // C2 ground
      playChime(ctx, reverb, 783.99, t + 1.2, 0.02);   // G5 shimmer
    }
    
    setTimeout(() => setUnlocked(true), 800);
  }, [scene]);

  // Expose ctx globally for scroll sounds
  useEffect(() => {
    if (ctxRef.current) {
      (window as unknown as Record<string, unknown>).__votusAudioCtx = ctxRef.current;
    }
  }, [unlocked]);

  if (!unlocked) {
    return (
      <div
        onClick={unlock}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          background: "#09090b",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif",
          WebkitFontSmoothing: "antialiased",
          opacity: fading ? 0 : 1,
          transition: "opacity 0.8s ease",
        }}
      >
        <div style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          border: "1px solid rgba(0,212,255,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 24,
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 2 L14 8 L4 14 Z" fill="rgba(0,212,255,0.6)" />
          </svg>
        </div>
        <p style={{
          fontSize: 12,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: "rgba(250,250,250,0.35)",
        }}>
          Tap to begin
        </p>
        <p style={{
          fontSize: 10,
          letterSpacing: "0.2em",
          color: "rgba(250,250,250,0.2)",
          marginTop: 8,
        }}>
          Sound on for full experience
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
