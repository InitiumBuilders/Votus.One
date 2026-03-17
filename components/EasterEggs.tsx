"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import MatrixRain from "./MatrixRain";
import { playCyberBlip, playAccessGranted, playTerminalBoot, playDecryptSound, playDenied } from "./SoundEngine";

const TOTAL = 14;
const KONAMI = "ArrowUp,ArrowUp,ArrowDown,ArrowDown,ArrowLeft,ArrowRight,ArrowLeft,ArrowRight,b,a";

interface Egg { id: number; title: string; message: string; }

function getCtx(): AudioContext | null {
  return ((window as unknown as Record<string, unknown>).__votusAudioCtx as AudioContext) ?? null;
}

const EGGS: Egg[] = [
  { id: 0, title: "> ACCESS_GRANTED", message: "Welcome to the inner network, Vibe." },
  { id: 1, title: "> ROOT ACCESS DENIED", message: "Democracy has no superusers." },
  { id: 2, title: "> PACKET INTERCEPTED", message: "Intentions logged. We see you. 👁️" },
  { id: 3, title: "> TRUST.VERIFIED", message: "On-chain. Immutable. Yours forever." },
  { id: 4, title: "> IDENTITY_RESOLVED", message: "You are a Votus Vibe. Welcome home." },
  { id: 5, title: "> PONG", message: "Democracy is alive. Latency: 0ms. Direct connection." },
  { id: 6, title: "> DECRYPTING...", message: "The future is not written. It is voted." },
  { id: 7, title: "> ALLRISE", message: "The signal is clear." },
  { id: 8, title: "> INSPECT_MODE", message: "Curious? Good. Transparency is the first protocol." },
  { id: 9, title: "> SIGNAL_DETECTED", message: "You've been still long enough to hear it." },
  { id: 10, title: "> PATIENCE_PROTOCOL", message: "Governance rewards the steady hand." },
  { id: 11, title: "> $22", message: "THE_COST_OF_SHOWING_UP :: Less than your streaming subscription." },
  { id: 12, title: "> HEADER_BREACH", message: "You found the signal in the noise." },
  { id: 13, title: "> VIEW_SOURCE", message: "This movement is open. Always has been. Always will be." },
];

/* ── Swipe-sequence detector: up-down-up-down → terminal ── */
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
      // Must be a quick flick (< 400ms) with enough distance (> 40px)
      if (dt > 400 || Math.abs(dy) < 40) return;
      const dir = dy < 0 ? "up" : "down";
      const now = Date.now();
      // Keep only swipes within last 2.5 seconds
      swipes.current = swipes.current.filter((s) => now - s.t < 2500);
      swipes.current.push({ dir, t: now });
      // Check for up-down-up-down pattern
      const seq = swipes.current.map((s) => s.dir);
      const pattern = seq.slice(-4).join(",");
      if (pattern === "up,down,up,down" && seq.length >= 4) {
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

  const [found, setFound] = useState<Set<number>>(new Set());
  const [toast, setToast] = useState<Egg | null>(null);
  const [decryptText, setDecryptText] = useState("");
  const [showMatrix, setShowMatrix] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const konamiRef = useRef<string[]>([]);
  const typeRef = useRef("");
  const idleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lpRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((egg: Egg) => {
    setFound((prev) => new Set([...prev, egg.id]));
    setToast(egg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 5000);
    const ctx = getCtx();
    if (ctx) {
      if (egg.id === 0) playAccessGranted(ctx);
      else if (egg.id === 1) playDenied(ctx);
      else if (egg.id === 6) playDecryptSound(ctx);
      else if (egg.id === 7) playTerminalBoot(ctx);
      else playCyberBlip(ctx);
    }
    if (egg.id === 6) animateDecrypt();
    if (egg.id === 7) setShowMatrix(true);
  }, []);

  const animateDecrypt = () => {
    const target = "The future is not written. It is voted.";
    const scramble = "█▓▒░ ENCRYPTED ░▒▓█";
    setDecryptText(scramble);
    let i = 0;
    const interval = setInterval(() => {
      const partial = target.slice(0, i) + scramble.slice(i, scramble.length).replace(/./g, () =>
        "█▓▒░ "[Math.floor(Math.random() * 5)]
      );
      setDecryptText(partial);
      i++;
      if (i > target.length) { setDecryptText(target); clearInterval(interval); }
    }, 60);
  };

  const reveal = useCallback((id: number) => {
    setFound((prev) => {
      if (prev.has(id)) return prev;
      show(EGGS[id]);
      return prev;
    });
  }, [show]);

  const resetIdle = useCallback(() => {
    if (idleRef.current) clearTimeout(idleRef.current);
    idleRef.current = setTimeout(() => reveal(9), 45000);
  }, [reveal]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      konamiRef.current.push(e.key);
      if (konamiRef.current.length > 10) konamiRef.current.shift();
      if (konamiRef.current.join(",") === KONAMI) reveal(0);
      typeRef.current = (typeRef.current + e.key.toLowerCase()).slice(-30);
      const t = typeRef.current;
      if (t.endsWith("sudo")) { reveal(1); typeRef.current = ""; }
      if (t.endsWith("hack")) { reveal(2); typeRef.current = ""; }
      if (t.endsWith("trust")) { reveal(3); typeRef.current = ""; }
      if (t.endsWith("whoami")) { reveal(4); typeRef.current = ""; }
      if (t.endsWith("ping")) { reveal(5); typeRef.current = ""; }
      if (t.endsWith("decrypt")) { reveal(6); typeRef.current = ""; }
      if (t.endsWith("allrise")) { reveal(7); typeRef.current = ""; }
      if (t.endsWith("22")) { reveal(11); typeRef.current = ""; }
      if (t.endsWith("source")) { reveal(13); typeRef.current = ""; }
      if (t.endsWith("terminal")) {
        window.location.href = "/terminal";
        typeRef.current = "";
      }
      resetIdle();
    };
    const onContext = (e: MouseEvent) => { e.preventDefault(); reveal(8); };
    const onDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("section") || (e.target as HTMLElement).closest("main")) {
        lpRef.current = setTimeout(() => reveal(10), 2000);
      }
    };
    const onUp = () => { if (lpRef.current) clearTimeout(lpRef.current); };
    const onDbl = (e: MouseEvent) => { if ((e.target as HTMLElement).closest("h1")) reveal(12); };
    window.addEventListener("keydown", onKey);
    window.addEventListener("contextmenu", onContext);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    window.addEventListener("dblclick", onDbl);
    resetIdle();
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("contextmenu", onContext);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("dblclick", onDbl);
      if (idleRef.current) clearTimeout(idleRef.current);
    };
  }, [reveal, resetIdle]);

  return (
    <>
      {showMatrix && <MatrixRain onDone={() => setShowMatrix(false)} />}
      {found.size > 0 && (
        <div style={{
          position: "fixed", top: 12, right: 12, zIndex: 300,
          padding: "4px 10px", borderRadius: 100,
          background: "rgba(0,0,0,0.85)", border: "1px solid rgba(0,255,136,0.2)",
          fontSize: 10, letterSpacing: "0.15em", color: "rgba(0,255,136,0.5)",
          fontFamily: "monospace",
        }}>
          DISCOVERED: {found.size}/{TOTAL}
        </div>
      )}
      {toast && (
        <div style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          zIndex: 300, padding: "14px 20px", borderRadius: 8, maxWidth: "90vw", minWidth: 260,
          background: "rgba(0,0,0,0.95)", border: "1px solid rgba(0,255,136,0.25)",
          fontFamily: "monospace",
        }}>
          <p style={{ fontSize: 11, letterSpacing: "0.15em", color: "#00ff88", marginBottom: 6 }}>
            {toast.title}<span style={{ animation: "blink 1s step-end infinite" }}>█</span>
          </p>
          <p style={{ fontSize: 12, color: "rgba(0,255,136,0.7)", lineHeight: 1.5 }}>
            {toast.id === 6 ? decryptText : toast.message}
          </p>
          <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
        </div>
      )}
    </>
  );
}
