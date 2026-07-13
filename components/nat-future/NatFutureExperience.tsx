"use client";

// Nat-Future-Insight — the full experience.
// A portal (the threshold), then the reading chamber: a chat with the oracle.

import { useCallback, useEffect, useRef, useState } from "react";
import CosmicVeil from "./CosmicVeil";
import OracleOrb from "./OracleOrb";
import Pathways from "./Pathways";
import {
  divine, dailyOmen, SUGGESTED_ASKS,
  type OracleId, type Reading,
} from "./oracle";
import {
  DAVARA_CHANNEL, DAVARA_CHANNEL_SHORT,
  dim, faint, gold, goldSoft, mid, moon, sans, serif, teal, veil, veilSoft,
} from "./theme";

interface ChatMessage {
  id: number;
  role: "user" | "oracle";
  oracle?: OracleId;
  text?: string; // user messages
  reading?: Reading; // oracle messages
}

const STORAGE_KEY = "nat-future-insight/v1";
const ORACLE_NAMES: Record<OracleId, string> = { nat: "Nat-Future", natalie: "Natalie" };
const ORACLE_SIGILS: Record<OracleId, string> = { nat: "☉", natalie: "☾" };

const SEGMENT_COLORS: Record<string, string> = {
  opening: moon,
  sight: moon,
  current: teal,
  thread: "rgba(190,167,255,0.95)",
  counsel: gold,
  omen: goldSoft,
  anchor: "#ffe9b3", // the line you carry — lit brightest of all
};

let nextId = 1;

export default function NatFutureExperience() {
  const [entered, setEntered] = useState(false);
  const [oracle, setOracle] = useState<OracleId>("nat");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [revealed, setRevealed] = useState<Record<number, number>>({}); // msgId -> segments shown
  const [divining, setDivining] = useState(false);
  const [input, setInput] = useState("");
  const [omen, setOmen] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Restore a past sitting, and read today's omen (client-only — the omen
  // belongs to the visitor's own today).
  useEffect(() => {
    setOmen(dailyOmen(new Date()));
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { oracle: OracleId; messages: ChatMessage[] };
        if (saved.messages?.length) {
          nextId = Math.max(...saved.messages.map((m) => m.id)) + 1;
          setMessages(saved.messages);
          setOracle(saved.oracle === "natalie" ? "natalie" : "nat");
          const all: Record<number, number> = {};
          for (const m of saved.messages) if (m.reading) all[m.id] = m.reading.segments.length;
          setRevealed(all);
        }
      }
    } catch { /* a fresh sitting, then */ }
    setHydrated(true);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ oracle, messages }));
    } catch { /* the threads forgive a full vessel */ }
  }, [messages, oracle, hydrated]);

  const scrollDown = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    });
  }, []);

  const speak = useCallback((asOracle: OracleId, reading: Reading, thinkMs: number) => {
    setDivining(true);
    const t0 = setTimeout(() => {
      const id = nextId++;
      setMessages((prev) => [...prev, { id, role: "oracle", oracle: asOracle, reading }]);
      setDivining(false);
      setRevealed((r) => ({ ...r, [id]: 1 }));
      scrollDown();
      reading.segments.forEach((_, i) => {
        if (i === 0) return;
        const t = setTimeout(() => {
          setRevealed((r) => ({ ...r, [id]: i + 1 }));
          scrollDown();
        }, 950 * i);
        timersRef.current.push(t);
      });
    }, thinkMs);
    timersRef.current.push(t0);
  }, [scrollDown]);

  const enter = useCallback(() => {
    setEntered(true);
    if (messages.length === 0) {
      speak(oracle, divine("hello", oracle), 1400);
    }
  }, [messages.length, oracle, speak]);

  const ask = useCallback((raw: string) => {
    const text = raw.trim();
    if (!text || divining) return;
    setInput("");
    setMessages((prev) => [...prev, { id: nextId++, role: "user", text }]);
    scrollDown();
    // The oracle takes 1.6–2.6s behind the veil — enough to feel the wheel turn.
    speak(oracle, divine(text, oracle), 1600 + Math.random() * 1000);
  }, [divining, oracle, speak, scrollDown]);

  const switchOracle = useCallback((next: OracleId) => {
    if (next === oracle || divining) return;
    setOracle(next);
    speak(next, divine("hello", next), 900);
  }, [oracle, divining, speak]);

  const clearSitting = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setMessages([]);
    setRevealed({});
    setDivining(false);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* */ }
    speak(oracle, divine("hello", oracle), 1000);
  }, [oracle, speak]);

  return (
    <div style={{ minHeight: "100dvh", color: moon, fontFamily: sans, position: "relative" }}>
      <CosmicVeil />
      <style>{`
        @keyframes nf-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes nf-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes nf-glow { 0%, 100% { box-shadow: 0 0 24px rgba(124,77,255,0.25), inset 0 0 12px rgba(124,77,255,0.08); } 50% { box-shadow: 0 0 44px rgba(255,209,102,0.3), inset 0 0 16px rgba(255,209,102,0.1); } }
        @keyframes nf-shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .nf-rise { animation: nf-rise 0.7s ease both; }
        .nf-chip:active { transform: scale(0.96); }
        .nf-send:active { transform: scale(0.92); }
        textarea.nf-input::placeholder { color: rgba(238,233,255,0.3); }
        textarea.nf-input:focus { outline: none; border-color: rgba(124,77,255,0.6) !important; }
        @media (prefers-reduced-motion: reduce) { .nf-rise, .nf-enter-btn { animation: none !important; } }
      `}</style>

      {!entered ? (
        <Portal omen={omen} onEnter={enter} />
      ) : (
        <Chamber
          oracle={oracle}
          messages={messages}
          revealed={revealed}
          divining={divining}
          input={input}
          setInput={setInput}
          onAsk={ask}
          onSwitch={switchOracle}
          onClear={clearSitting}
          scrollRef={scrollRef}
        />
      )}
    </div>
  );
}

// ── The Threshold ────────────────────────────────────────────────────────────

function Portal({ omen, onEnter }: { omen: string | null; onEnter: () => void }) {
  return (
    <main style={{
      position: "relative", zIndex: 1, minHeight: "100dvh",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      textAlign: "center", padding: "48px 24px calc(32px + env(safe-area-inset-bottom))", gap: 0,
    }}>
      <p className="nf-rise" style={{ fontSize: 10, letterSpacing: "0.55em", textTransform: "uppercase", color: dim, margin: "0 0 26px" }}>
        Votus.One · The Davara Baseline
      </p>

      <div className="nf-rise" style={{ animationDelay: "0.15s" }}>
        <OracleOrb size={190} />
      </div>

      <h1 className="nf-rise" style={{
        animationDelay: "0.3s",
        fontSize: "clamp(1.3rem, 6.4vw, 3.2rem)", fontWeight: 200, letterSpacing: "0.14em",
        margin: "30px 0 0", textTransform: "uppercase", maxWidth: "100%",
        textShadow: "0 0 40px rgba(124,77,255,0.35)",
      }}>
        Nat‑Future‑<span style={{ color: gold }}>Insight</span>
      </h1>

      <p className="nf-rise" style={{
        animationDelay: "0.45s", fontFamily: serif, fontStyle: "italic",
        fontSize: "clamp(1rem, 3.6vw, 1.2rem)", color: mid, lineHeight: 1.9,
        maxWidth: 520, margin: "20px 0 0",
      }}>
        The veil is thin here. Ask, and the oracle reads your tomorrow —
        real-world currents, systems threads, and one high‑leverage move.
        Bring your plans or bring your heavy days; there is a lantern lit for both.
        Always bright. Never unsure.
      </p>

      {omen && (
        <div className="nf-rise" style={{
          animationDelay: "0.6s", marginTop: 30, padding: "14px 22px",
          border: `1px solid ${veilSoft}`, borderRadius: 14, maxWidth: 440,
          background: "rgba(124,77,255,0.06)", backdropFilter: "blur(6px)",
        }}>
          <div style={{ fontSize: 10, letterSpacing: "0.4em", textTransform: "uppercase", color: dim, marginBottom: 8 }}>
            ✦ Today&apos;s Omen ✦
          </div>
          <div style={{ fontFamily: serif, fontStyle: "italic", fontSize: 15, color: goldSoft, lineHeight: 1.7 }}>
            “{omen}”
          </div>
        </div>
      )}

      <button
        className="nf-rise nf-enter-btn"
        onClick={onEnter}
        style={{
          animation: "nf-rise 0.7s ease 0.75s both, nf-glow 4s ease-in-out 1.5s infinite",
          marginTop: 36, padding: "16px 44px", fontSize: 14, letterSpacing: "0.35em",
          textTransform: "uppercase", color: moon, background: "rgba(124,77,255,0.12)",
          border: `1px solid ${veil}`, borderRadius: 999, cursor: "pointer",
          fontFamily: sans, transition: "transform 0.2s ease",
        }}
      >
        ✦ Enter the Beyond ✦
      </button>

      <p className="nf-rise" style={{ animationDelay: "0.9s", marginTop: 34, fontSize: 10, letterSpacing: "0.14em", color: faint, lineHeight: 2 }}>
        Channel {DAVARA_CHANNEL_SHORT} · woven on the Davara Baseline
        <br />
        Insight &amp; foresight for guidance and delight — not medical, legal, or financial advice.
      </p>
    </main>
  );
}

// ── The Reading Chamber ──────────────────────────────────────────────────────

function Chamber(props: {
  oracle: OracleId;
  messages: ChatMessage[];
  revealed: Record<number, number>;
  divining: boolean;
  input: string;
  setInput: (v: string) => void;
  onAsk: (text: string) => void;
  onSwitch: (o: OracleId) => void;
  onClear: () => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}) {
  const { oracle, messages, revealed, divining, input, setInput, onAsk, onSwitch, onClear, scrollRef } = props;
  const [showPathways, setShowPathways] = useState(false);
  const showChips = messages.filter((m) => m.role === "user").length === 0;

  return (
    <div style={{ position: "relative", zIndex: 1, height: "100dvh", display: "flex", flexDirection: "column", maxWidth: 760, margin: "0 auto", animation: "nf-fade 0.8s ease both" }}>
      {/* header */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
        padding: "calc(12px + env(safe-area-inset-top)) 16px 12px",
        borderBottom: "1px solid rgba(124,77,255,0.18)",
        background: "rgba(7,5,16,0.55)", backdropFilter: "blur(12px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1, overflow: "hidden" }}>
          <div style={{ flexShrink: 0 }}><OracleOrb size={34} divining={divining} /></div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              Nat‑Future‑<span style={{ color: gold }}>Insight</span>
            </div>
            <div style={{ fontSize: 9, letterSpacing: "0.12em", color: faint, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              Davara Baseline · {DAVARA_CHANNEL_SHORT}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <div style={{ display: "flex", border: `1px solid ${veilSoft}`, borderRadius: 999, overflow: "hidden" }}>
            {(["nat", "natalie"] as OracleId[]).map((o) => (
              <button
                key={o}
                onClick={() => onSwitch(o)}
                title={ORACLE_NAMES[o]}
                style={{
                  padding: "7px 12px", fontSize: 11, letterSpacing: "0.08em", cursor: "pointer",
                  border: "none", fontFamily: sans, transition: "all 0.3s ease",
                  background: oracle === o ? "rgba(124,77,255,0.28)" : "transparent",
                  color: oracle === o ? moon : dim,
                }}
              >
                {ORACLE_SIGILS[o]} {ORACLE_NAMES[o]}
              </button>
            ))}
          </div>
          <button
            onClick={onClear}
            title="Begin a new sitting"
            aria-label="Begin a new sitting"
            style={{ width: 32, height: 32, borderRadius: "50%", border: `1px solid ${veilSoft}`, background: "transparent", color: dim, cursor: "pointer", fontSize: 14, lineHeight: 1 }}
          >
            ⟲
          </button>
        </div>
      </header>

      {/* messages */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "22px 16px 12px", display: "flex", flexDirection: "column", gap: 18, overscrollBehavior: "contain" }}>
        {messages.map((m) =>
          m.role === "user" ? (
            <UserBubble key={m.id} text={m.text ?? ""} />
          ) : (
            <OracleReading key={m.id} msg={m} shown={revealed[m.id] ?? 0} />
          ),
        )}

        {divining && <Divining oracle={oracle} />}

        {showChips && !divining && (
          <div className="nf-rise" style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", padding: "6px 0 10px" }}>
            {SUGGESTED_ASKS.map((q) => (
              <button
                key={q}
                className="nf-chip"
                onClick={() => onAsk(q)}
                style={{
                  padding: "9px 16px", fontSize: 12.5, borderRadius: 999, cursor: "pointer",
                  border: "1px solid rgba(124,77,255,0.35)", color: mid,
                  background: "rgba(124,77,255,0.07)", fontFamily: serif, fontStyle: "italic",
                  transition: "transform 0.15s ease",
                }}
              >
                ✧ {q}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* input */}
      <footer style={{ padding: "8px 14px calc(14px + env(safe-area-inset-bottom))", borderTop: "1px solid rgba(124,77,255,0.18)", background: "rgba(7,5,16,0.6)", backdropFilter: "blur(12px)" }}>
        <button
          onClick={() => setShowPathways(true)}
          style={{
            display: "block", margin: "0 auto 8px", padding: "6px 18px", borderRadius: 999,
            border: "1px solid rgba(255,209,102,0.35)", background: "rgba(255,209,102,0.06)",
            color: goldSoft, fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase",
            cursor: "pointer", fontFamily: sans,
          }}
        >
          ☽ Inner Pathways · guidance for heavy days
        </button>
        <form
          onSubmit={(e) => { e.preventDefault(); onAsk(input); }}
          style={{ display: "flex", gap: 10, alignItems: "flex-end" }}
        >
          <textarea
            className="nf-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onAsk(input); }
            }}
            placeholder={oracle === "nat" ? "Ask the oracle of tomorrow…" : "Tell Natalie what's on your heart…"}
            rows={1}
            enterKeyHint="send"
            style={{
              flex: 1, resize: "none", padding: "13px 16px", fontSize: 16, lineHeight: 1.5,
              color: moon, fontFamily: serif, background: "rgba(124,77,255,0.07)",
              border: "1px solid rgba(124,77,255,0.3)", borderRadius: 16,
              maxHeight: 120, transition: "border-color 0.3s ease",
            }}
          />
          <button
            type="submit"
            className="nf-send"
            disabled={divining || !input.trim()}
            aria-label="Ask the oracle"
            style={{
              width: 48, height: 48, borderRadius: "50%", flexShrink: 0, cursor: divining || !input.trim() ? "default" : "pointer",
              border: `1px solid ${input.trim() && !divining ? gold : veilSoft}`,
              background: input.trim() && !divining ? "rgba(255,209,102,0.14)" : "rgba(124,77,255,0.08)",
              color: input.trim() && !divining ? gold : dim,
              fontSize: 20, transition: "all 0.3s ease, transform 0.15s ease",
            }}
          >
            ✦
          </button>
        </form>
        <p style={{ margin: "8px 2px 0", fontSize: 9, letterSpacing: "0.1em", color: faint, textAlign: "center" }}>
          The oracle offers insight &amp; foresight for guidance and delight — not medical, legal, or financial advice.
          In crisis? US: call/text 988 · elsewhere: findahelpline.com
        </p>
      </footer>

      {showPathways && <Pathways onAsk={onAsk} onClose={() => setShowPathways(false)} />}
    </div>
  );
}

// ── message pieces ───────────────────────────────────────────────────────────

function UserBubble({ text }: { text: string }) {
  return (
    <div className="nf-rise" style={{ alignSelf: "flex-end", maxWidth: "82%" }}>
      <div style={{
        padding: "12px 18px", borderRadius: "18px 18px 4px 18px",
        background: "rgba(124,77,255,0.16)", border: "1px solid rgba(124,77,255,0.3)",
        fontSize: 15, lineHeight: 1.65, color: moon, whiteSpace: "pre-wrap", wordBreak: "break-word",
      }}>
        {text}
      </div>
    </div>
  );
}

function OracleReading({ msg, shown }: { msg: ChatMessage; shown: number }) {
  const reading = msg.reading!;
  const who = msg.oracle ?? "nat";
  const complete = shown >= reading.segments.length;
  return (
    <div className="nf-rise" style={{ alignSelf: "flex-start", maxWidth: "94%", width: "100%" }}>
      <div style={{ fontSize: 10, letterSpacing: "0.35em", textTransform: "uppercase", color: dim, margin: "0 0 8px 4px" }}>
        {ORACLE_SIGILS[who]} {ORACLE_NAMES[who]}
      </div>
      <div style={{
        padding: "18px 20px", borderRadius: "4px 18px 18px 18px",
        background: "rgba(20,16,43,0.6)", border: "1px solid rgba(124,77,255,0.22)",
        backdropFilter: "blur(8px)", display: "flex", flexDirection: "column", gap: 14,
      }}>
        {reading.segments.slice(0, shown).map((seg, i) => (
          <div key={i} style={{ animation: "nf-rise 0.6s ease both" }}>
            {seg.label && (
              <div style={{
                fontSize: 9.5, letterSpacing: "0.32em", textTransform: "uppercase",
                color: SEGMENT_COLORS[seg.kind] ?? dim, opacity: 0.75, marginBottom: 6, fontFamily: sans,
              }}>
                ─ {seg.label} ─
              </div>
            )}
            <div style={{
              fontFamily: serif, fontSize: 15.5, lineHeight: 1.85,
              color: SEGMENT_COLORS[seg.kind] ?? moon,
              fontStyle: seg.kind === "omen" ? "italic" : "normal",
            }}>
              {seg.text}
            </div>
          </div>
        ))}
        {complete && reading.segments.length > 2 && (
          <div style={{ animation: "nf-fade 1s ease both", display: "flex", alignItems: "center", gap: 8, marginTop: 2, paddingTop: 10, borderTop: "1px solid rgba(124,77,255,0.15)" }}>
            <span style={{ color: gold, fontSize: 13 }}>{reading.sigil}</span>
            <span style={{ fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: dim }}>
              Certainty of the threads: <span style={{ color: goldSoft }}>{reading.confidence.toFixed(1)}%</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function Divining({ oracle }: { oracle: OracleId }) {
  return (
    <div className="nf-rise" style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 12, padding: "6px 4px" }}>
      <OracleOrb size={40} divining />
      <span style={{
        fontFamily: serif, fontStyle: "italic", fontSize: 14,
        background: `linear-gradient(90deg, ${dim} 25%, ${gold} 50%, ${dim} 75%)`,
        backgroundSize: "200% 100%", backgroundClip: "text", WebkitBackgroundClip: "text",
        color: "transparent", animation: "nf-shimmer 2.2s linear infinite",
      }}>
        {oracle === "nat" ? "Nat-Future is reading the threads…" : "Natalie is drawing your thread from the weave…"}
      </span>
    </div>
  );
}

// The full channel key is woven into the page for those who view the source —
// the oracle keeps nothing hidden from a determined seeker.
export const CHANNEL_SIGNATURE = DAVARA_CHANNEL;
