"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import MatrixRain from "./MatrixRain";
import { playCyberBlip, playAccessGranted, playTerminalBoot, playDecryptSound, playDenied, playHeartbeatPing } from "./SoundEngine";

const TOTAL = 28;
const KONAMI = "ArrowUp,ArrowUp,ArrowDown,ArrowDown,ArrowLeft,ArrowRight,ArrowLeft,ArrowRight,b,a";

interface Egg { id: number; title: string; message: string; }

function getCtx(): AudioContext | null {
  return ((window as unknown as Record<string, unknown>).__votusAudioCtx as AudioContext) ?? null;
}

const EGGS: Egg[] = [
  // ── Original 14 ──
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
  // ── New thought-provoking eggs 14-27 ──
  { id: 14, title: "> QUESTION_01", message: "What if the person you've been waiting for to fix everything... is a team?" },
  { id: 15, title: "> MIRROR", message: "You scrolled past a hundred things today. You stopped here. Why?" },
  { id: 16, title: "> FREQUENCY", message: "Every 4 years is not often enough to care. What if you cared every Tuesday?" },
  { id: 17, title: "> SMALL_IS_ALL", message: "The large is a reflection of the small. Your block is a country in miniature." },
  { id: 18, title: "> APATHY_ANTIDOTE", message: "The cure for apathy isn't information. It's a table. With chairs. And someone saying: sit." },
  { id: 19, title: "> MIDNIGHT_THOUGHT", message: "Someone in your neighborhood is awake right now, worrying about the same thing you are." },
  { id: 20, title: "> FIVE_PEOPLE", message: "Five people who show up every time will outperform a million who show up once." },
  { id: 21, title: "> SPEED_OF_TRUST", message: "You can't move faster than the relationships can hold. That's not a bug." },
  { id: 22, title: "> THE_TABLE", message: "There is a seat at the table with your name on it. Nobody's going to pull it out for you." },
  { id: 23, title: "> EMERGENT", message: "You didn't find this by following a guide. You found it by being curious. That's emergent strategy." },
  { id: 24, title: "> WHAT_IF", message: "What if democracy felt like something you wanted to do on a Saturday morning?" },
  { id: 25, title: "> THE_SEED", message: "Every forest began with one seed that didn't ask permission to grow." },
  { id: 26, title: "> YOUR_MOVE", message: "Somewhere a Votus Unit is meeting tonight. Somewhere one hasn't been started yet. Both of those are about you." },
  { id: 27, title: "> TOGETHER", message: "You are not here to be right. You are here to see together." },
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
      if (dt > 400 || Math.abs(dy) < 40) return;
      const dir = dy < 0 ? "up" : "down";
      const now = Date.now();
      swipes.current = swipes.current.filter((s) => now - s.t < 2500);
      swipes.current.push({ dir, t: now });
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
  const scrollDepthRef = useRef(0);
  const scrollMilestones = useRef<Set<number>>(new Set());
  const clickCountRef = useRef(0);
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resizeCountRef = useRef(0);
  const tabSwitchRef = useRef(0);
  const hoverTimeRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectRef = useRef(false);

  const show = useCallback((egg: Egg) => {
    setFound((prev) => new Set([...prev, egg.id]));
    setToast(egg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 6000);
    const ctx = getCtx();
    if (ctx) {
      if (egg.id === 0) playAccessGranted(ctx);
      else if (egg.id === 1) playDenied(ctx);
      else if (egg.id === 6) playDecryptSound(ctx);
      else if (egg.id === 7) playTerminalBoot(ctx);
      else if (egg.id >= 14 && egg.id <= 27) playHeartbeatPing(ctx);
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
    // Idle 45s → SIGNAL_DETECTED
    idleRef.current = setTimeout(() => reveal(9), 45000);
  }, [reveal]);

  useEffect(() => {
    // ── Keyboard-typed triggers ──
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
      // New typed triggers
      if (t.endsWith("hero")) { reveal(14); typeRef.current = ""; }
      if (t.endsWith("why")) { reveal(15); typeRef.current = ""; }
      if (t.endsWith("tuesday")) { reveal(16); typeRef.current = ""; }
      if (t.endsWith("small")) { reveal(17); typeRef.current = ""; }
      if (t.endsWith("apathy")) { reveal(18); typeRef.current = ""; }
      if (t.endsWith("midnight")) { reveal(19); typeRef.current = ""; }
      if (t.endsWith("five")) { reveal(20); typeRef.current = ""; }
      if (t.endsWith("speed")) { reveal(21); typeRef.current = ""; }
      if (t.endsWith("seat")) { reveal(22); typeRef.current = ""; }
      if (t.endsWith("seed")) { reveal(25); typeRef.current = ""; }
      if (t.endsWith("together")) { reveal(27); typeRef.current = ""; }
      if (t.endsWith("terminal")) {
        window.location.href = "/terminal";
        typeRef.current = "";
      }
      resetIdle();
    };

    // ── Right-click → INSPECT_MODE ──
    const onContext = (e: MouseEvent) => { e.preventDefault(); reveal(8); };

    // ── Long-press 2s → PATIENCE_PROTOCOL ──
    const onDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("section") || (e.target as HTMLElement).closest("main")) {
        lpRef.current = setTimeout(() => reveal(10), 2000);
      }
    };
    const onUp = () => { if (lpRef.current) clearTimeout(lpRef.current); };

    // ── Double-click h1 → HEADER_BREACH ──
    const onDbl = (e: MouseEvent) => { if ((e.target as HTMLElement).closest("h1")) reveal(12); };

    // ── Scroll depth triggers ──
    const onScroll = () => {
      const depth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
      scrollDepthRef.current = depth;
      // 100% scroll → EMERGENT (you explored everything)
      if (depth >= 98 && !scrollMilestones.current.has(23)) {
        scrollMilestones.current.add(23);
        reveal(23);
      }
      // 50% scroll → THE_TABLE
      if (depth >= 48 && depth <= 55 && !scrollMilestones.current.has(22)) {
        scrollMilestones.current.add(22);
        setTimeout(() => reveal(22), 3000); // delayed — feels like a thought arriving
      }
      resetIdle();
    };

    // ── Triple-click → YOUR_MOVE ──
    const onClick = () => {
      clickCountRef.current++;
      if (clickTimer.current) clearTimeout(clickTimer.current);
      clickTimer.current = setTimeout(() => { clickCountRef.current = 0; }, 600);
      if (clickCountRef.current >= 3) {
        reveal(26);
        clickCountRef.current = 0;
      }
    };

    // ── Tab visibility change → MIDNIGHT_THOUGHT ──
    const onVisibility = () => {
      if (document.hidden) {
        tabSwitchRef.current = Date.now();
      } else {
        const away = Date.now() - tabSwitchRef.current;
        // Came back after 30+ seconds → MIDNIGHT_THOUGHT
        if (away > 30000 && tabSwitchRef.current > 0) {
          reveal(19);
        }
        // Came back after 5-30 seconds → WHAT_IF
        if (away > 5000 && away < 30000 && tabSwitchRef.current > 0) {
          reveal(24);
        }
      }
    };

    // ── Window resize (making space) → FIVE_PEOPLE ──
    const onResize = () => {
      resizeCountRef.current++;
      if (resizeCountRef.current >= 5) {
        reveal(20);
        resizeCountRef.current = 0;
      }
    };

    // ── Hover on any link for 4 seconds → SPEED_OF_TRUST ──
    const onMouseOver = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      if (el.tagName === "A" || el.closest("a")) {
        if (hoverTimeRef.current) clearTimeout(hoverTimeRef.current);
        hoverTimeRef.current = setTimeout(() => reveal(21), 4000);
      }
    };
    const onMouseOut = () => {
      if (hoverTimeRef.current) clearTimeout(hoverTimeRef.current);
    };

    // ── Text selection → MIRROR ──
    const onSelect = () => {
      const selected = window.getSelection()?.toString().trim();
      if (selected && selected.length > 20 && !selectRef.current) {
        selectRef.current = true;
        reveal(15);
      }
    };

    // ── Time-based: if you're here between midnight and 5 AM ──
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 5) {
      setTimeout(() => reveal(19), 12000);
    }

    // ── Time-based: if it's a Tuesday ──
    if (new Date().getDay() === 2) {
      setTimeout(() => reveal(16), 20000);
    }

    window.addEventListener("keydown", onKey);
    window.addEventListener("contextmenu", onContext);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    window.addEventListener("dblclick", onDbl);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("click", onClick);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("resize", onResize);
    window.addEventListener("mouseover", onMouseOver);
    window.addEventListener("mouseout", onMouseOut);
    document.addEventListener("selectionchange", onSelect);
    resetIdle();
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("contextmenu", onContext);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("dblclick", onDbl);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("click", onClick);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mouseover", onMouseOver);
      window.removeEventListener("mouseout", onMouseOut);
      document.removeEventListener("selectionchange", onSelect);
      if (idleRef.current) clearTimeout(idleRef.current);
      if (hoverTimeRef.current) clearTimeout(hoverTimeRef.current);
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
          zIndex: 300, padding: "16px 22px", borderRadius: 12, maxWidth: "90vw", minWidth: 280,
          background: toast.id >= 14 ? "rgba(0,0,0,0.95)" : "rgba(0,0,0,0.95)",
          border: `1px solid ${toast.id >= 14 ? "rgba(0,212,255,0.2)" : "rgba(0,255,136,0.25)"}`,
          fontFamily: toast.id >= 14 ? "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif" : "monospace",
          backdropFilter: "blur(8px)",
        }}>
          <p style={{ fontSize: 11, letterSpacing: "0.15em", color: toast.id >= 14 ? "rgba(0,212,255,0.6)" : "#00ff88", marginBottom: 8 }}>
            {toast.title}<span style={{ animation: "blink 1s step-end infinite" }}>█</span>
          </p>
          <p style={{
            fontSize: toast.id >= 14 ? 14 : 12,
            color: toast.id >= 14 ? "rgba(250,250,250,0.7)" : "rgba(0,255,136,0.7)",
            lineHeight: 1.6,
            fontStyle: toast.id >= 14 ? "italic" : "normal",
            fontWeight: toast.id >= 14 ? 300 : 400,
          }}>
            {toast.id === 6 ? decryptText : toast.message}
          </p>
          <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
        </div>
      )}
    </>
  );
}
