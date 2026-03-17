"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import MatrixRain from "./MatrixRain";
import { playCyberBlip, playAccessGranted, playTerminalBoot, playDecryptSound, playDenied, playHeartbeatPing } from "./SoundEngine";

// Only intentional, typed/deliberate triggers. No passive interruptions.
const KONAMI = "ArrowUp,ArrowUp,ArrowDown,ArrowDown,ArrowLeft,ArrowRight,ArrowLeft,ArrowRight,b,a";

interface Egg { id: number; title: string; message: string; style: "cyber" | "soft"; }

function getCtx(): AudioContext | null {
  return ((window as unknown as Record<string, unknown>).__votusAudioCtx as AudioContext) ?? null;
}

// Only eggs triggered by deliberate typed input or konami code
const EGGS: Egg[] = [
  { id: 0, title: "> ACCESS_GRANTED", message: "Welcome to the inner network, Vibe.", style: "cyber" },
  { id: 1, title: "> ROOT ACCESS DENIED", message: "Democracy has no superusers.", style: "cyber" },
  { id: 2, title: "> PACKET INTERCEPTED", message: "Intentions logged. We see you. 👁️", style: "cyber" },
  { id: 3, title: "> TRUST.VERIFIED", message: "On-chain. Immutable. Yours forever.", style: "cyber" },
  { id: 4, title: "> IDENTITY_RESOLVED", message: "You are a Votus Vibe. Welcome home.", style: "cyber" },
  { id: 5, title: "> PONG", message: "Democracy is alive. Latency: 0ms. Direct connection.", style: "cyber" },
  { id: 6, title: "> DECRYPTING...", message: "The future is not written. It is voted.", style: "cyber" },
  { id: 7, title: "> ALLRISE", message: "The signal is clear.", style: "cyber" },
  { id: 8, title: "> $22", message: "Less than your streaming subscription. The cost of showing up.", style: "cyber" },
  { id: 9, title: "> VIEW_SOURCE", message: "This movement is open. Always has been. Always will be.", style: "cyber" },
  // Soft philosophical — typed triggers only
  { id: 10, title: "maybe the hero...", message: "What if the person you've been waiting for to fix everything... is a team?", style: "soft" },
  { id: 11, title: "apathy", message: "The cure for apathy isn't information. It's a table. With chairs. And someone saying: sit.", style: "soft" },
  { id: 12, title: "small", message: "The large is a reflection of the small. Your block is a country in miniature.", style: "soft" },
  { id: 13, title: "together", message: "You are not here to be right. You are here to see together.", style: "soft" },
  { id: 14, title: "seed", message: "Every forest began with one seed that didn't ask permission to grow.", style: "soft" },
];

// Swipe up-down-up-down → terminal (mobile only, intentional gesture)
function useSwipeToTerminal() {
  const swipes = useRef<{ dir: "up" | "down"; t: number }[]>([]);
  const touchStart = useRef<{ y: number; t: number } | null>(null);
  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      touchStart.current = { y: e.touches[0].clientY, t: Date.now() };
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (!touchStart.current) return;
      const dy = e.changedTouches[0].clientY - touchStart.current.y;
      const dt = Date.now() - touchStart.current.t;
      if (dt > 400 || Math.abs(dy) < 40) return;
      const dir = dy < 0 ? "up" : "down";
      const now = Date.now();
      swipes.current = swipes.current.filter((s) => now - s.t < 2500);
      swipes.current.push({ dir, t: now });
      const pattern = swipes.current.slice(-4).map((s) => s.dir).join(",");
      if (pattern === "up,down,up,down") {
        swipes.current = [];
        window.location.href = "/terminal";
      }
    };
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);
}

export default function EasterEggs() {
  useSwipeToTerminal();

  const [toast, setToast] = useState<Egg | null>(null);
  const [decryptText, setDecryptText] = useState("");
  const [showMatrix, setShowMatrix] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const konamiRef = useRef<string[]>([]);
  const typeRef = useRef("");

  const show = useCallback((egg: Egg) => {
    setToast(egg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 5000);
    const ctx = getCtx();
    if (ctx) {
      if (egg.id === 0) playAccessGranted(ctx);
      else if (egg.id === 1) playDenied(ctx);
      else if (egg.id === 6) playDecryptSound(ctx);
      else if (egg.id === 7) playTerminalBoot(ctx);
      else if (egg.style === "soft") playHeartbeatPing(ctx);
      else playCyberBlip(ctx);
    }
    if (egg.id === 6) animateDecrypt();
    if (egg.id === 7) setShowMatrix(true);
  }, []);

  const animateDecrypt = () => {
    const target = "The future is not written. It is voted.";
    setDecryptText("█▓▒░ ENCRYPTED ░▒▓█");
    let i = 0;
    const interval = setInterval(() => {
      setDecryptText(target.slice(0, i) + "█▓▒░ "[Math.floor(Math.random() * 5)].repeat(Math.max(0, target.length - i)));
      i++;
      if (i > target.length) { setDecryptText(target); clearInterval(interval); }
    }, 60);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Konami code
      konamiRef.current.push(e.key);
      if (konamiRef.current.length > 10) konamiRef.current.shift();
      if (konamiRef.current.join(",") === KONAMI) { show(EGGS[0]); return; }

      // Only printable single characters for type-detection
      if (e.key.length !== 1) return;
      typeRef.current = (typeRef.current + e.key.toLowerCase()).slice(-30);
      const t = typeRef.current;

      // Cyber triggers
      if (t.endsWith("sudo")) { show(EGGS[1]); typeRef.current = ""; }
      else if (t.endsWith("hack")) { show(EGGS[2]); typeRef.current = ""; }
      else if (t.endsWith("trust")) { show(EGGS[3]); typeRef.current = ""; }
      else if (t.endsWith("whoami")) { show(EGGS[4]); typeRef.current = ""; }
      else if (t.endsWith("ping")) { show(EGGS[5]); typeRef.current = ""; }
      else if (t.endsWith("decrypt")) { show(EGGS[6]); typeRef.current = ""; }
      else if (t.endsWith("allrise")) { show(EGGS[7]); typeRef.current = ""; }
      else if (t.endsWith("22")) { show(EGGS[8]); typeRef.current = ""; }
      else if (t.endsWith("source")) { show(EGGS[9]); typeRef.current = ""; }
      // Soft triggers
      else if (t.endsWith("hero")) { show(EGGS[10]); typeRef.current = ""; }
      else if (t.endsWith("apathy")) { show(EGGS[11]); typeRef.current = ""; }
      else if (t.endsWith("small")) { show(EGGS[12]); typeRef.current = ""; }
      else if (t.endsWith("together")) { show(EGGS[13]); typeRef.current = ""; }
      else if (t.endsWith("seed")) { show(EGGS[14]); typeRef.current = ""; }
      // Terminal shortcut
      else if (t.endsWith("terminal")) { window.location.href = "/terminal"; typeRef.current = ""; }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [show]);

  if (!toast && !showMatrix) return null;

  return (
    <>
      {showMatrix && <MatrixRain onDone={() => setShowMatrix(false)} />}
      {toast && (
        <div
          onClick={() => setToast(null)}
          style={{
            position: "fixed",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 300,
            padding: "14px 20px",
            borderRadius: 12,
            maxWidth: "min(340px, 90vw)",
            background: "rgba(9,9,11,0.96)",
            border: `1px solid ${toast.style === "soft" ? "rgba(0,212,255,0.18)" : "rgba(0,255,136,0.2)"}`,
            fontFamily: toast.style === "soft"
              ? "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif"
              : "monospace",
            backdropFilter: "blur(12px)",
            cursor: "pointer",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            animation: "egg-in 0.3s ease-out",
          }}
        >
          <p style={{
            fontSize: 11,
            letterSpacing: "0.15em",
            color: toast.style === "soft" ? "rgba(0,212,255,0.5)" : "#00ff88",
            marginBottom: 7,
          }}>
            {toast.title}
            {toast.style === "cyber" && <span style={{ animation: "blink 1s step-end infinite" }}>█</span>}
          </p>
          <p style={{
            fontSize: toast.style === "soft" ? 14 : 12,
            color: toast.style === "soft" ? "rgba(250,250,250,0.65)" : "rgba(0,255,136,0.75)",
            lineHeight: 1.6,
            fontStyle: toast.style === "soft" ? "italic" : "normal",
            fontWeight: 300,
          }}>
            {toast.id === 6 ? decryptText : toast.message}
          </p>
          <p style={{ fontSize: 10, color: "rgba(250,250,250,0.15)", marginTop: 8, letterSpacing: "0.1em" }}>
            tap to dismiss
          </p>
          <style>{`
            @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
            @keyframes egg-in { 0%{opacity:0;transform:translateX(-50%) translateY(8px)} 100%{opacity:1;transform:translateX(-50%) translateY(0)} }
          `}</style>
        </div>
      )}
    </>
  );
}
