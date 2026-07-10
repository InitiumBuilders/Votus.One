// Slow-drifting light behind the starfield — cyan for the craft, gold for
// the earned, one whisper of violet for the future. Pure CSS, zero JS.
export default function Aurora() {
  const blob = (extra: React.CSSProperties): React.CSSProperties => ({
    position: "absolute",
    borderRadius: "50%",
    filter: "blur(60px)",
    willChange: "transform",
    ...extra,
  });

  return (
    <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
      <style>{`
        @keyframes aur-a { 0%, 100% { transform: translate(-8%, -4%) scale(1); } 50% { transform: translate(9%, 7%) scale(1.18); } }
        @keyframes aur-b { 0%, 100% { transform: translate(6%, 9%) scale(1.1); } 50% { transform: translate(-9%, -7%) scale(0.94); } }
        @keyframes aur-c { 0%, 100% { transform: translate(0, 0) scale(1); } 50% { transform: translate(5%, -9%) scale(1.22); } }
        @media (prefers-reduced-motion: reduce) { .aur { animation: none !important; } }
      `}</style>
      <div className="aur" style={blob({
        top: "-22%", left: "-12%", width: "72vmax", height: "72vmax",
        background: "radial-gradient(circle, rgba(0,212,255,0.075), transparent 62%)",
        animation: "aur-a 28s ease-in-out infinite",
      })} />
      <div className="aur" style={blob({
        bottom: "-28%", right: "-16%", width: "80vmax", height: "80vmax",
        background: "radial-gradient(circle, rgba(255,209,102,0.05), transparent 60%)",
        animation: "aur-b 34s ease-in-out infinite",
      })} />
      <div className="aur" style={blob({
        top: "30%", left: "35%", width: "55vmax", height: "55vmax",
        background: "radial-gradient(circle, rgba(124,77,255,0.04), transparent 60%)",
        animation: "aur-c 40s ease-in-out infinite",
      })} />
    </div>
  );
}
