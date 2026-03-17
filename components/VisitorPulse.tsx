"use client";

import { useEffect, useState, useRef } from "react";

interface VisitorCounts {
  total: number;
  today: number;
  live: number;
}

function useTicker(value: number) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);

  useEffect(() => {
    if (value === prev.current) return;
    const start = prev.current;
    const end = value;
    const diff = end - start;
    const steps = Math.min(Math.abs(diff), 20);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplay(Math.round(start + (diff * i) / steps));
      if (i >= steps) {
        clearInterval(interval);
        prev.current = end;
      }
    }, 30);
    return () => clearInterval(interval);
  }, [value]);

  return display;
}

export default function VisitorPulse() {
  const [counts, setCounts] = useState<VisitorCounts | null>(null);
  const liveDisplay = useTicker(counts?.live ?? 0);
  const totalDisplay = useTicker(counts?.total ?? 0);

  useEffect(() => {
    fetch("/api/visitors", { method: "POST" })
      .then((r) => r.json())
      .then((d: VisitorCounts) => setCounts(d))
      .catch(() => {});

    const interval = setInterval(() => {
      fetch("/api/visitors")
        .then((r) => r.json())
        .then((d: VisitorCounts) => setCounts(d))
        .catch(() => {});
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (!counts) return null;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", padding: "8px 0" }}>
      <span style={{
        width: 7, height: 7, borderRadius: "50%", background: "#00ff88", display: "inline-block",
        boxShadow: "0 0 6px #00ff88",
        animation: "pulse-dot 1.8s ease-in-out infinite",
      }} />
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.7); }
        }
      `}</style>
      <span style={{ fontSize: 11, letterSpacing: "0.12em", color: "rgba(0,255,136,0.6)" }}>
        {liveDisplay} live now
      </span>
      <span style={{ fontSize: 11, color: "rgba(250,250,250,0.2)" }}>·</span>
      <span style={{ fontSize: 11, letterSpacing: "0.12em", color: "rgba(0,212,255,0.35)" }}>
        {totalDisplay.toLocaleString()} visitors
      </span>
    </div>
  );
}
