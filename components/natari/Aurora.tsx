"use client";

// The aurora — emergence made visible: separate hues becoming one light.
// Crown placement, slow drift, heavy blur. Artwork caste only; no text lives here.

export default function Aurora() {
  return (
    <div
      aria-hidden
      style={{
        position: "fixed", inset: 0, zIndex: 0, overflow: "hidden",
        pointerEvents: "none",
        background:
          "radial-gradient(ellipse 120% 80% at 50% -10%, #1B1630 0%, #121320 42%, #0F1114 100%)",
      }}
    >
      <style>{`
        @keyframes nt-aur-a { 0%,100% { transform: translate(-6%,-4%) scale(1); } 50% { transform: translate(7%,5%) scale(1.16); } }
        @keyframes nt-aur-b { 0%,100% { transform: translate(5%,6%) scale(1.08); } 50% { transform: translate(-7%,-5%) scale(0.94); } }
        @keyframes nt-aur-c { 0%,100% { transform: translate(0,0) scale(1); opacity:.7; } 50% { transform: translate(-5%,7%) scale(1.2); opacity:1; } }
        @keyframes nt-aur-d { 0%,100% { transform: translate(3%,-3%) scale(1.05); } 50% { transform: translate(-4%,4%) scale(0.96); } }
        @media (prefers-reduced-motion: reduce) { .nt-aur { animation: none !important; } }
      `}</style>
      {/* crown — the aurora sits above the reader, never behind the words */}
      <div className="nt-aur" style={blob("-28%", "-14%", "78vmax", "rgba(167,139,255,0.20)", "nt-aur-a 26s")} />
      <div className="nt-aur" style={blob("-20%", "48%", "62vmax", "rgba(34,211,238,0.13)", "nt-aur-b 34s")} />
      <div className="nt-aur" style={blob("-34%", "22%", "70vmax", "rgba(96,165,250,0.11)", "nt-aur-c 42s")} />
      <div className="nt-aur" style={blob("34%", "62%", "54vmax", "rgba(232,121,201,0.08)", "nt-aur-d 38s")} />
      {/* seat the content — vignette */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse at 50% 40%, transparent 34%, rgba(15,17,20,0.72) 100%)",
      }} />
    </div>
  );
}

function blob(top: string, left: string, size: string, color: string, animation: string): React.CSSProperties {
  return {
    position: "absolute", top, left, width: size, height: size,
    borderRadius: "50%",
    background: `radial-gradient(circle, ${color}, transparent 62%)`,
    filter: "blur(80px) saturate(1.4)",
    animation: `${animation} ease-in-out infinite`,
    willChange: "transform",
  };
}
