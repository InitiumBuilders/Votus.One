"use client";

import { useEffect, useState, useRef } from "react";

export default function CyberHints() {
  const [showSudo, setShowSudo] = useState(false);
  const sudoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sudoInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Show "// try: sudo" every 60s for 2s
    const start = () => {
      setShowSudo(true);
      sudoTimer.current = setTimeout(() => setShowSudo(false), 2000);
    };
    sudoInterval.current = setInterval(start, 60000);
    return () => {
      if (sudoTimer.current) clearTimeout(sudoTimer.current);
      if (sudoInterval.current) clearInterval(sudoInterval.current);
    };
  }, []);

  return (
    <>
      {/* Binary background */}
      <div aria-hidden style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        overflow: "hidden", opacity: 0.03, fontFamily: "monospace", fontSize: 11,
        color: "#00ff88", lineHeight: "20px", letterSpacing: "2px",
        userSelect: "none",
      }}>
        {Array.from({ length: 30 }, (_, i) => (
          <div key={i} style={{
            position: "absolute", top: `${i * 3.4}%`, left: 0, right: 0,
            whiteSpace: "nowrap",
            animation: `binary-scroll ${18 + i * 0.7}s linear infinite`,
            animationDelay: `${-i * 1.1}s`,
          }}>
            01100101 01101101 01100101 01110010 01100111 01100101 01101110 01100011 01100101
            &nbsp;&nbsp;01110110 01101111 01110100 01110101 01110011 01110011 01110011
          </div>
        ))}
        <style>{`
          @keyframes binary-scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </div>

      {/* Blinking cursor bottom-left */}
      <div aria-hidden style={{
        position: "fixed", bottom: 16, left: 16, zIndex: 50,
        fontFamily: "monospace", fontSize: 14, color: "rgba(0,255,136,0.25)",
        pointerEvents: "none", userSelect: "none",
        animation: "cursor-blink 1.2s step-end infinite",
      }}>
        _
        <style>{`@keyframes cursor-blink{0%,100%{opacity:0.25}50%{opacity:0}}`}</style>
      </div>

      {/* "// try: sudo" hint bottom-right */}
      <div aria-hidden style={{
        position: "fixed", bottom: 16, right: 16, zIndex: 50,
        fontFamily: "monospace", fontSize: 10, color: "rgba(0,255,136,0.3)",
        pointerEvents: "none", userSelect: "none",
        opacity: showSudo ? 1 : 0,
        transition: "opacity 0.5s ease",
        letterSpacing: "0.1em",
      }}>
        // try: sudo
      </div>
    </>
  );
}
