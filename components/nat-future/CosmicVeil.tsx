"use client";

// The night behind the oracle — seeded stars (stable across server/client),
// slow violet-and-gold aurora, and a drifting veil of mist. Pure CSS motion.

function seededStars(count: number) {
  // Deterministic pseudo-random so SSR and client agree on every star.
  let a = 987654321;
  const rnd = () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: rnd() * 100,
    y: rnd() * 100,
    size: 0.8 + rnd() * 1.6,
    delay: rnd() * 8,
    dur: 3 + rnd() * 6,
    gold: rnd() > 0.85,
  }));
}

const STARS = seededStars(90);

export default function CosmicVeil() {
  return (
    <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden", background: "radial-gradient(ellipse at 50% -20%, #14102b 0%, #0a0716 45%, #070510 100%)" }}>
      <style>{`
        @keyframes nf-twinkle { 0%, 100% { opacity: 0.15; } 50% { opacity: 0.9; } }
        @keyframes nf-aur-a { 0%, 100% { transform: translate(-6%, -4%) scale(1); } 50% { transform: translate(8%, 6%) scale(1.15); } }
        @keyframes nf-aur-b { 0%, 100% { transform: translate(5%, 8%) scale(1.08); } 50% { transform: translate(-8%, -6%) scale(0.95); } }
        @keyframes nf-aur-c { 0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.7; } 50% { transform: translate(-4%, 8%) scale(1.2); opacity: 1; } }
        @media (prefers-reduced-motion: reduce) { .nf-anim { animation: none !important; } }
      `}</style>
      {/* aurora */}
      <div className="nf-anim" style={{ position: "absolute", top: "-25%", left: "-15%", width: "80vmax", height: "80vmax", borderRadius: "50%", filter: "blur(70px)", background: "radial-gradient(circle, rgba(124,77,255,0.10), transparent 60%)", animation: "nf-aur-a 30s ease-in-out infinite", willChange: "transform" }} />
      <div className="nf-anim" style={{ position: "absolute", bottom: "-30%", right: "-20%", width: "85vmax", height: "85vmax", borderRadius: "50%", filter: "blur(70px)", background: "radial-gradient(circle, rgba(255,209,102,0.05), transparent 58%)", animation: "nf-aur-b 38s ease-in-out infinite", willChange: "transform" }} />
      <div className="nf-anim" style={{ position: "absolute", top: "35%", left: "30%", width: "55vmax", height: "55vmax", borderRadius: "50%", filter: "blur(80px)", background: "radial-gradient(circle, rgba(103,232,249,0.035), transparent 60%)", animation: "nf-aur-c 44s ease-in-out infinite", willChange: "transform" }} />
      {/* stars */}
      {STARS.map((s) => (
        <div
          key={s.id}
          className="nf-anim"
          style={{
            position: "absolute",
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            borderRadius: "50%",
            background: s.gold ? "rgba(255,209,102,0.9)" : "rgba(238,233,255,0.85)",
            boxShadow: s.gold ? "0 0 6px rgba(255,209,102,0.8)" : "0 0 4px rgba(238,233,255,0.6)",
            animation: `nf-twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
          }}
        />
      ))}
      {/* vignette to seat the content */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 60%, transparent 40%, rgba(7,5,16,0.55) 100%)" }} />
    </div>
  );
}
