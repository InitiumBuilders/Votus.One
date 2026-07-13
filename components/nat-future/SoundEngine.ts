// A whisper of sound for the ceremony — a low hum while the oracle divines and
// a soft chime when the reading is sealed. Pure Web Audio, no files. Off by
// default; only ever started after a user gesture (the ask).

let ctx: AudioContext | null = null;
let hum: { osc: OscillatorNode; lfo: OscillatorNode; gain: GainNode } | null = null;

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    try {
      ctx = new AC();
    } catch {
      return null;
    }
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

export const Sound = {
  humStart() {
    const c = ac();
    if (!c || hum) return;
    try {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.type = "sine";
      osc.frequency.value = 108;
      gain.gain.value = 0;
      osc.connect(gain).connect(c.destination);
      // A slow drift so the hum breathes rather than drones.
      const lfo = c.createOscillator();
      const lg = c.createGain();
      lfo.type = "sine";
      lfo.frequency.value = 0.13;
      lg.gain.value = 4;
      lfo.connect(lg).connect(osc.frequency);
      osc.start();
      lfo.start();
      gain.gain.linearRampToValueAtTime(0.028, c.currentTime + 1.4);
      hum = { osc, lfo, gain };
    } catch {
      /* the hall stays quiet */
    }
  },

  humStop() {
    const c = ac();
    if (!c || !hum) return;
    const h = hum;
    hum = null;
    try {
      h.gain.gain.cancelScheduledValues(c.currentTime);
      h.gain.gain.setValueAtTime(h.gain.gain.value, c.currentTime);
      h.gain.gain.linearRampToValueAtTime(0, c.currentTime + 0.6);
    } catch {
      /* */
    }
    setTimeout(() => {
      try {
        h.osc.stop();
        h.lfo.stop();
      } catch {
        /* */
      }
    }, 700);
  },

  chime() {
    const c = ac();
    if (!c) return;
    try {
      [528, 792, 1056].forEach((f, i) => {
        const o = c.createOscillator();
        const g = c.createGain();
        o.type = "sine";
        o.frequency.value = f;
        g.gain.value = 0;
        o.connect(g).connect(c.destination);
        const t = c.currentTime + i * 0.07;
        o.start(t);
        g.gain.linearRampToValueAtTime(0.05 / (i + 1), t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
        o.stop(t + 1.7);
      });
    } catch {
      /* */
    }
  },
};
