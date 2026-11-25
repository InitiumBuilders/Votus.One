"use client";

// Nat-Future-Insight — the full experience.
// A portal (the threshold), then the reading chamber: a live, streaming chat
// with an oracle woven on the Davara Baseline. Readings arrive token by token,
// dated calls become tracked Marks, and the heavy days have a lantern.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CosmicVeil from "./CosmicVeil";
import OracleOrb from "./OracleOrb";
import Pathways from "./Pathways";
import Marks, { type Mark } from "./Marks";
import BreathePacer from "./BreathePacer";
import { Sound } from "./SoundEngine";
import CrisisCard, { type CrisisPalette } from "../CrisisCard";
import { isCrisis, isSensitive } from "../../lib/safety";
import { dueAtFrom, mergeMarks, readMarks } from "./ledger";
import {
  divine, readingToMarkup, dailyOmen, SUGGESTED_ASKS,
  type OracleId,
} from "./oracle";
import {
  DAVARA_CHANNEL, DAVARA_CHANNEL_SHORT,
  dim, faint, gold, goldSoft, mid, moon, sans, serif, teal, veil, veilSoft,
} from "./theme";

// ── the parsed reading ───────────────────────────────────────────────────────

interface Segment {
  kind: string; // opening | cast | truth | mark | move | anchor | seal
  text: string;
  meta: Record<string, string>;
}

interface ChatMessage {
  id: number;
  role: "user" | "oracle";
  oracle?: OracleId;
  text?: string; // user turns
  raw?: string; // oracle raw markup (memory + parse source)
  segments?: Segment[];
  streaming?: boolean;
  confidence?: number;
  sigil?: string;
  crisis?: boolean; // the question carried crisis — the card stays pinned under this reading
  sensitive?: boolean; // medicine, the law — a licensed human, never a Mark
}

const STORAGE_KEY = "nat-future-insight/v2";
const MARKS_KEY = "nat-future-insight/marks/v1";
const SOUND_KEY = "nat-future-insight/sound/v1";
const KEEP_MESSAGES = 60; // a sitting remembers its last sixty turns

const ORACLE_NAMES: Record<OracleId, string> = { nat: "Nat-Future", natalie: "Natalie" };
const ORACLE_SIGILS: Record<OracleId, string> = { nat: "☉", natalie: "☾" };
const SIGILS = ["☾", "✦", "☉", "⟁", "✧", "❋", "☽", "✵"];

const SEGMENT_COLORS: Record<string, string> = {
  opening: mid,
  cast: moon,
  truth: teal,
  mark: "#fff3d6",
  move: gold,
  anchor: "#ffe9b3",
  seal: goldSoft,
  // legacy kinds from older sittings still render kindly
  sight: moon, current: teal, thread: "rgba(190,167,255,0.95)",
  counsel: gold, omen: goldSoft, bold: "#fff3d6",
};

const SEGMENT_LABELS: Record<OracleId, Record<string, string>> = {
  nat: { cast: "The Futurecast", truth: "Already True", mark: "Mark the Date", move: "The Move", anchor: "Carry This" },
  natalie: { cast: "What I See", truth: "Already True", mark: "Calling It Now", move: "Do This (Trust Me)", anchor: "Hold This" },
};

// The crisis card wears the chamber's verified ink: moon and gold both clear
// 7:1 on this near-opaque night.
const CRISIS_PALETTE: CrisisPalette = {
  ink: moon,
  accent: gold,
  surface: "rgba(16,12,36,0.92)",
  border: "1px solid rgba(255,209,102,0.4)",
  font: sans,
};
const CRISIS_VOICE: Record<OracleId, string> = {
  nat: "Before any thread: you don't have to carry this alone tonight. A real person is one tap away, any hour.",
  natalie: "Friend, please reach out right now — you don't have to carry this alone. A real person is one tap away.",
};

// Visually hidden, still spoken.
const SR_ONLY: React.CSSProperties = {
  position: "absolute", width: 1, height: 1, padding: 0, margin: -1,
  overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap", border: 0,
};

// ── helpers ──────────────────────────────────────────────────────────────────

let nextId = 1;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
const confidenceFor = (raw: string) => 94 + (hashStr(raw) % 59) / 10; // 94.0–99.8
const sigilFor = (raw: string) => SIGILS[hashStr(raw) % SIGILS.length];

const MARKER = /\[\[([A-Za-z]+)((?:\|[^\]|]*)*)\]\]/g;

function parseMeta(metaStr: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!metaStr) return out;
  for (const part of metaStr.split("|")) {
    if (!part) continue;
    const eq = part.indexOf("=");
    if (eq > 0) out[part.slice(0, eq).trim()] = part.slice(eq + 1).trim();
  }
  return out;
}

// Turn the streaming marker text into segments. Robust to a partial marker at
// the very end of the buffer (it's simply trimmed until the next chunk arrives).
function parseMarkup(raw: string): Segment[] {
  const trimTrailing = (t: string) => t.replace(/\[\[[^\]]*$/, "").trim();
  // A marker-shaped tail — "[", "[[MARK|days=12]" — is half a marker still in
  // flight, or debris from a cut channel. Either way it is never shown.
  const trimTail = (t: string) => trimTrailing(t.replace(/\[(?:\[[A-Za-z]*(?:\|[^\]\n]*)*\]?)?\s*$/, ""));
  const markers: { index: number; len: number; kind: string; meta: string }[] = [];
  let m: RegExpExecArray | null;
  MARKER.lastIndex = 0;
  while ((m = MARKER.exec(raw))) markers.push({ index: m.index, len: m[0].length, kind: m[1].toLowerCase(), meta: m[2] });

  const segs: Segment[] = [];
  if (markers.length === 0) {
    const t = trimTail(raw);
    return t ? [{ kind: "opening", text: t, meta: {} }] : [];
  }
  const pre = trimTrailing(raw.slice(0, markers[0].index));
  if (pre) segs.push({ kind: "opening", text: pre, meta: {} });
  for (let i = 0; i < markers.length; i++) {
    const start = markers[i].index + markers[i].len;
    const end = i + 1 < markers.length ? markers[i + 1].index : raw.length;
    // Before a later complete marker, a marker-shaped tail can only be debris.
    const text = trimTail(raw.slice(start, end));
    segs.push({ kind: markers[i].kind, text, meta: parseMeta(markers[i].meta) });
  }
  // A Mark with no window was voided by a cut channel — it never shows.
  return segs.filter((s) => s.kind !== "mark" || s.meta.days);
}

const segmentsToText = (segs?: Segment[]) =>
  (segs ?? []).map((s) => (s.kind === "opening" ? s.text : `[[${s.kind.toUpperCase()}]]\n${s.text}`)).join("\n");

const isReading = (segs?: Segment[]) =>
  !!segs && segs.some((s) => ["cast", "mark", "move", "truth", "sight", "bold"].includes(s.kind));

// The certainty meter belongs to forecasts only — a reading with a dated call.
const isForecast = (segs?: Segment[]) => !!segs && segs.some((s) => s.kind === "mark" || s.kind === "bold");

// A crisis or sensitive reading never shows a dated call, even if one was cast.
const shownSegments = (msg: ChatMessage) =>
  (msg.crisis || msg.sensitive ? (msg.segments ?? []).filter((s) => s.kind !== "mark" && s.kind !== "bold") : msg.segments ?? []);

// One plain passage for the screen reader, spoken once — when the reading seals.
function announceText(who: OracleId, segs: Segment[], crisis: boolean): string {
  const labels = SEGMENT_LABELS[who];
  const body = segs.filter((s) => s.text).map((s) => (labels[s.kind] ? `${labels[s.kind]}: ${s.text}` : s.text)).join(" ");
  return `${ORACLE_NAMES[who]}: ${body}${crisis ? " Crisis support is below: call or text 988, or visit findahelpline.com." : ""}`;
}

// What a sitting keeps: the words, never the parsed copy (restore re-parses raw).
const toSaved = ({ id, role, oracle, text, raw, confidence, sigil, crisis, sensitive }: ChatMessage): ChatMessage =>
  ({ id, role, oracle, text, raw, confidence, sigil, crisis, sensitive });

function vibrate(pattern: number | number[]) {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(pattern);
  } catch { /* */ }
}

function greetingMessage(oracle: OracleId): ChatMessage {
  const raw = readingToMarkup(divine("hello", oracle));
  return { id: nextId++, role: "oracle", oracle, raw, segments: parseMarkup(raw), streaming: false };
}

// ── the experience ───────────────────────────────────────────────────────────

export default function NatFutureExperience() {
  const [entered, setEntered] = useState(false);
  const [oracle, setOracle] = useState<OracleId>("nat");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [divining, setDivining] = useState(false);
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState("");
  const [omen, setOmen] = useState<string | null>(null);
  const [soundOn, setSoundOn] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [now, setNow] = useState(0);
  const [announce, setAnnounce] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef(messages);
  const oracleRef = useRef(oracle);
  const abortRef = useRef<AbortController | null>(null);
  const soundRef = useRef(soundOn);
  const followRef = useRef(true);
  const marksLoaded = useRef(false);
  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { oracleRef.current = oracle; }, [oracle]);
  useEffect(() => {
    soundRef.current = soundOn;
    if (!soundOn) Sound.humStop(); // mute means now, not after the seal
  }, [soundOn]);

  // Restore a past sitting; read today's omen and the wall clock (client-only).
  // Each key restores on its own — a broken sitting must never cost the ledger.
  useEffect(() => {
    setOmen(dailyOmen(new Date()));
    setNow(Date.now());
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { oracle: OracleId; messages: ChatMessage[] };
        if (saved.messages?.length) {
          nextId = Math.max(...saved.messages.map((m) => m.id)) + 1;
          setMessages(saved.messages.map((m, i, all) => {
            if (m.role !== "oracle") return m;
            // Older sittings carry no flags — read them again from the question.
            const q = all[i - 1]?.role === "user" ? all[i - 1].text ?? "" : "";
            return { ...m, streaming: false, segments: parseMarkup(m.raw ?? ""), crisis: m.crisis ?? isCrisis(q), sensitive: m.sensitive ?? isSensitive(q) };
          }));
          setOracle(saved.oracle === "natalie" ? "natalie" : "nat");
        }
      }
    } catch { /* a fresh sitting, then */ }
    try {
      const stored = localStorage.getItem(MARKS_KEY);
      const restored = readMarks(stored);
      if (restored) setMarks(restored);
      // The ledger is written only once it was read — or there was none to read.
      marksLoaded.current = !!restored || stored === null;
    } catch { /* storage is closed — the ledger stays untouched */ }
    try { setSoundOn(localStorage.getItem(SOUND_KEY) === "1"); } catch { /* */ }
    setHydrated(true);
    return () => { abortRef.current?.abort(); Sound.humStop(); };
  }, []);

  // A sitting is saved when a reading seals, not on every token.
  useEffect(() => {
    if (!hydrated || messages.some((m) => m.streaming)) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ oracle, messages: messages.slice(-KEEP_MESSAGES).map(toSaved) })); } catch { /* */ }
  }, [messages, oracle, hydrated]);
  // Merge, never clobber: another tab may have written since this one read.
  useEffect(() => {
    if (!hydrated || !marksLoaded.current) return;
    try {
      const stored = localStorage.getItem(MARKS_KEY);
      const merged = mergeMarks(marks, readMarks(stored) ?? []);
      const json = JSON.stringify(merged);
      if (json !== stored) localStorage.setItem(MARKS_KEY, json);
      if (json !== JSON.stringify(marks)) setMarks(merged);
    } catch { /* */ }
  }, [marks, hydrated]);
  // Another tab touched the ledger — fold its Marks in.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== MARKS_KEY || !marksLoaded.current) return;
      const incoming = readMarks(e.newValue);
      if (incoming) setMarks((prev) => mergeMarks(prev, incoming));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    try { localStorage.setItem(SOUND_KEY, soundOn ? "1" : "0"); } catch { /* */ }
  }, [soundOn, hydrated]);

  // Follow the reading only while the reader is at the end. Scrolling up to
  // re-read lets go; returning to the bottom takes hold again.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let lastTop = el.scrollTop;
    const onScroll = () => {
      if (el.scrollTop < lastTop - 2) followRef.current = false;
      if (el.scrollHeight - el.scrollTop - el.clientHeight < 80) followRef.current = true;
      lastTop = el.scrollTop;
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [entered]);

  const scrollDown = useCallback((force = false) => {
    if (force) followRef.current = true;
    requestAnimationFrame(() => {
      if (!followRef.current) return;
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    });
  }, []);

  const buildHistory = useCallback((msgs: ChatMessage[]) => {
    const turns: { role: "user" | "assistant"; content: string }[] = [];
    for (const m of msgs) {
      if (m.role === "user" && m.text) turns.push({ role: "user", content: m.text });
      else if (m.role === "oracle") {
        const content = m.raw && m.raw.trim() ? m.raw : segmentsToText(m.segments);
        if (content.trim()) turns.push({ role: "assistant", content });
      }
    }
    return turns.slice(-16);
  }, []);

  const addMark = useCallback((question: string, seg: Segment, asOracle: OracleId) => {
    const days = parseInt(seg.meta.days, 10);
    if (!days || days < 1) return;
    const created = Date.now();
    const mark: Mark = {
      id: `${created}-${Math.floor(Math.random() * 1e6)}`,
      oracle: asOracle,
      question,
      text: seg.text,
      createdAt: created,
      dueAt: dueAtFrom(created, days),
      status: "pending",
      updatedAt: created,
    };
    setMarks((prev) => [mark, ...prev]);
  }, []);

  // ── the ask: stream a live reading, then seal it ──────────────────────────
  const ask = useCallback(async (rawText: string) => {
    const text = rawText.trim();
    if (!text || busy) return;
    setInput("");
    const asOracle = oracleRef.current;
    // The floor, read before anything leaves the page: crisis pins the card and
    // hushes the ceremony; a sensitive ask never becomes a Mark.
    const crisis = isCrisis(text);
    const sensitive = isSensitive(text);
    const history = buildHistory(messagesRef.current);
    // Ids are minted eagerly so the setMessages updater stays pure — React
    // StrictMode double-invokes updaters, and a nextId++ inside one would drift.
    const uid = nextId++;
    const oid = nextId++;
    setMessages((prev) => [
      ...prev,
      { id: uid, role: "user", text },
      { id: oid, role: "oracle", oracle: asOracle, raw: "", segments: [], streaming: true, crisis, sensitive },
    ]);
    setBusy(true);
    setDivining(true);
    setAnnounce("");
    scrollDown(true);
    if (soundRef.current && !crisis) Sound.humStart();

    const controller = new AbortController();
    abortRef.current = controller;

    let acc = "";
    let firstToken = true;
    let segCount = 0;
    const onChunk = (chunk: string) => {
      acc += chunk;
      if (firstToken && acc.trim().length) { firstToken = false; setDivining(false); }
      const segs = parseMarkup(acc);
      if (segs.length > segCount) { segCount = segs.length; if (!crisis) vibrate(6); }
      setMessages((prev) => prev.map((m) => (m.id === oid ? { ...m, raw: acc, segments: segs } : m)));
      scrollDown();
    };

    // Primary: the live route (Claude when keyed, the local weave otherwise).
    // Fallback: if the route is unreachable (a static host), refuses (any
    // !ok — 400, 403, 429), or answers in silence, weave here.
    try {
      const res = await fetch("/api/oracle", {
        method: "POST",
        signal: controller.signal,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ oracle: asOracle, message: text, history }),
      });
      if (!res.ok || !res.body) throw new Error("no stream");
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        onChunk(dec.decode(value, { stream: true }));
      }
      if (!acc.trim()) throw new Error("silent stream");
    } catch (err) {
      if (!(err instanceof DOMException && err.name === "AbortError") && !acc.trim()) {
        try {
          const markup = readingToMarkup(divine(text, asOracle));
          const tokens = markup.match(/\s+|\S+/g) ?? [markup];
          for (const tok of tokens) {
            if (controller.signal.aborted) break;
            onChunk(tok);
            await sleep(15 + Math.random() * 22);
          }
        } catch { /* */ }
      }
    }

    // If the sitting was cleared (or the component unmounted) mid-stream, don't
    // seal — no stray Mark, no chime, no state writes on a discarded reading.
    if (controller.signal.aborted) { Sound.humStop(); return; }

    // Seal the reading. If the live voice heard crisis the floor missed, its
    // own 988 pins the card all the same.
    const finalSegs = parseMarkup(acc);
    const conf = confidenceFor(acc || text);
    const sig = sigilFor(acc || text);
    const pinned = crisis || /\b988\b/.test(acc);
    setMessages((prev) => prev.map((m) => (m.id === oid ? { ...m, raw: acc, segments: finalSegs, streaming: false, confidence: conf, sigil: sig, crisis: pinned } : m)));
    setBusy(false);
    setDivining(false);
    Sound.humStop();

    // Crisis and sensitive asks never become a Mark; crisis gets no chime.
    // …nor does a Mark the channel was cut inside.
    const cutAt = finalSegs.findIndex((s) => s.kind === "seal" && s.meta.cut);
    const markSeg = !pinned && !sensitive && finalSegs.find((s, i) => s.kind === "mark" && s.meta.days && s.text && i !== cutAt - 1);
    if (markSeg) addMark(text, markSeg, asOracle);
    if (!pinned && isReading(finalSegs)) { if (soundRef.current) Sound.chime(); vibrate([10, 40, 12]); }
    setAnnounce(announceText(asOracle, shownSegments({ id: oid, role: "oracle", segments: finalSegs, crisis: pinned, sensitive }), pinned));
    scrollDown();
  }, [busy, buildHistory, addMark, scrollDown]);

  const enter = useCallback(() => {
    setEntered(true);
    if (messagesRef.current.length === 0) setMessages([greetingMessage(oracleRef.current)]);
  }, []);

  const switchOracle = useCallback((next: OracleId) => {
    if (next === oracle || busy) return;
    const greeting = greetingMessage(next); // eager — keep the updater pure
    setOracle(next);
    setMessages((prev) => [...prev, greeting]);
    scrollDown(true);
  }, [oracle, busy, scrollDown]);

  const clearSitting = useCallback(() => {
    abortRef.current?.abort();
    setBusy(false);
    setDivining(false);
    Sound.humStop(); // whatever the toggle says now, no hum outlives its sitting
    setAnnounce("");
    setMessages([greetingMessage(oracleRef.current)]);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* */ }
  }, []);

  const setMarkStatus = useCallback((id: string, status: Mark["status"]) => {
    const at = Date.now();
    setNow(at);
    setMarks((prev) => prev.map((m) => (m.id === id ? { ...m, status, updatedAt: at } : m)));
    if (status === "true") { if (soundRef.current) Sound.chime(); vibrate([10, 30, 10]); }
  }, []);

  const pendingMarks = useMemo(() => marks.filter((m) => m.status === "pending").length, [marks]);

  return (
    <div style={{ minHeight: "100dvh", color: moon, fontFamily: sans, position: "relative" }}>
      <CosmicVeil />
      <style>{`
        @keyframes nf-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes nf-cast { from { opacity: 0; transform: translateY(10px); filter: blur(6px); } to { opacity: 1; transform: translateY(0); filter: blur(0); } }
        @keyframes nf-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes nf-glow { 0%, 100% { box-shadow: 0 0 24px rgba(124,77,255,0.25), inset 0 0 12px rgba(124,77,255,0.08); } 50% { box-shadow: 0 0 44px rgba(255,209,102,0.3), inset 0 0 16px rgba(255,209,102,0.1); } }
        @keyframes nf-shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        @keyframes nf-cursor { 0%, 100% { opacity: 0.15; } 50% { opacity: 1; } }
        .nf-rise { animation: nf-rise 0.7s ease both; }
        .nf-chip:active { transform: scale(0.96); }
        .nf-send:active { transform: scale(0.92); }
        .nf-cursor { display: inline-block; width: 7px; height: 1.05em; margin-left: 3px; vertical-align: -2px; background: ${gold}; border-radius: 1px; animation: nf-cursor 1s ease-in-out infinite; }
        textarea.nf-input::placeholder { color: rgba(238,233,255,0.3); }
        textarea.nf-input:focus { outline: none; border-color: rgba(124,77,255,0.6) !important; }
        @media (prefers-reduced-motion: reduce) { .nf-rise, .nf-enter-btn, .nf-cast-anim, .nf-cursor, .nf-shimmer, .nf-card { animation: none !important; } }
      `}</style>

      {/* Sealed readings are spoken here, once — the list itself stays quiet while it streams. */}
      <div role="status" aria-live="polite" aria-atomic="true" style={SR_ONLY}>{announce}</div>

      {!entered ? (
        <Portal omen={omen} onEnter={enter} />
      ) : (
        <Chamber
          oracle={oracle}
          messages={messages}
          divining={divining}
          busy={busy}
          input={input}
          setInput={setInput}
          onAsk={ask}
          onSwitch={switchOracle}
          onClear={clearSitting}
          scrollRef={scrollRef}
          marks={marks}
          now={now}
          setNow={setNow}
          onSetMark={setMarkStatus}
          pendingMarks={pendingMarks}
          soundOn={soundOn}
          setSoundOn={setSoundOn}
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
        Ask, and the oracle casts your future in a few clear lines —
        what&apos;s coming, what&apos;s already true, one dated call you can hold it to.
        Bring plans or heavy days.
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
  divining: boolean;
  busy: boolean;
  input: string;
  setInput: (v: string) => void;
  onAsk: (text: string) => void;
  onSwitch: (o: OracleId) => void;
  onClear: () => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  marks: Mark[];
  now: number;
  setNow: (n: number) => void;
  onSetMark: (id: string, status: Mark["status"]) => void;
  pendingMarks: number;
  soundOn: boolean;
  setSoundOn: (v: boolean) => void;
}) {
  const {
    oracle, messages, divining, busy, input, setInput, onAsk, onSwitch, onClear,
    scrollRef, marks, now, setNow, onSetMark, pendingMarks, soundOn, setSoundOn,
  } = props;
  const [showPathways, setShowPathways] = useState(false);
  const [showMarks, setShowMarks] = useState(false);
  const [showBreathe, setShowBreathe] = useState(false);
  const showChips = messages.filter((m) => m.role === "user").length === 0;

  const openMarks = () => { setNow(Date.now()); setShowMarks(true); };

  return (
    <div style={{ position: "relative", zIndex: 1, height: "100dvh", display: "flex", flexDirection: "column", maxWidth: 760, margin: "0 auto", animation: "nf-fade 0.8s ease both" }}>
      {/* header */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
        padding: "calc(12px + env(safe-area-inset-top)) 14px 12px",
        borderBottom: "1px solid rgba(124,77,255,0.18)",
        background: "rgba(7,5,16,0.55)", backdropFilter: "blur(12px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0, flex: 1, overflow: "hidden" }}>
          <div style={{ flexShrink: 0 }}><OracleOrb size={34} divining={divining || busy} /></div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              Nat‑Future‑<span style={{ color: gold }}>Insight</span>
            </div>
            <div style={{ fontSize: 9, letterSpacing: "0.1em", color: faint, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              Live · Davara Baseline · {DAVARA_CHANNEL_SHORT}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <div style={{ display: "flex", border: `1px solid ${veilSoft}`, borderRadius: 999, overflow: "hidden" }}>
            {(["nat", "natalie"] as OracleId[]).map((o) => (
              <button
                key={o}
                onClick={() => onSwitch(o)}
                title={ORACLE_NAMES[o]}
                style={{
                  padding: "7px 10px", fontSize: 10.5, letterSpacing: "0.04em", cursor: "pointer",
                  border: "none", fontFamily: sans, transition: "all 0.3s ease",
                  background: oracle === o ? "rgba(124,77,255,0.28)" : "transparent",
                  color: oracle === o ? moon : dim, whiteSpace: "nowrap",
                }}
              >
                {ORACLE_SIGILS[o]} {ORACLE_NAMES[o]}
              </button>
            ))}
          </div>
          <IconButton label="The Marks" onClick={openMarks} badge={pendingMarks}>⚡</IconButton>
          <IconButton label="Begin a new sitting" onClick={onClear}>⟲</IconButton>
        </div>
      </header>

      {/* messages */}
      <div ref={scrollRef} aria-busy={busy} style={{ flex: 1, overflowY: "auto", padding: "22px 16px 12px", display: "flex", flexDirection: "column", gap: 18, overscrollBehavior: "contain" }}>
        {messages.map((m) => {
          if (m.role === "user") return <UserBubble key={m.id} text={m.text ?? ""} />;
          if ((!m.segments || m.segments.length === 0) && !m.crisis) return null; // divining — shown below
          return <OracleReading key={m.id} msg={m} />;
        })}

        {divining && <Divining oracle={oracle} />}

        {showChips && !divining && !busy && (
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
        <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
          <button
            onClick={() => setShowPathways(true)}
            style={{
              flex: "0 1 auto", padding: "6px 16px", borderRadius: 999,
              border: "1px solid rgba(255,209,102,0.35)", background: "rgba(255,209,102,0.06)",
              color: goldSoft, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase",
              cursor: "pointer", fontFamily: sans, whiteSpace: "nowrap",
            }}
          >
            ☽ Inner Pathways
          </button>
          <button
            onClick={() => setSoundOn(!soundOn)}
            aria-label={soundOn ? "Mute the oracle's sound" : "Unmute the oracle's sound"}
            title={soundOn ? "Sound on" : "Sound off"}
            style={{
              width: 32, height: 32, borderRadius: "50%", cursor: "pointer", flexShrink: 0,
              border: `1px solid ${soundOn ? "rgba(255,209,102,0.4)" : veilSoft}`,
              background: soundOn ? "rgba(255,209,102,0.08)" : "transparent",
              color: soundOn ? goldSoft : dim, fontSize: 13,
            }}
          >
            {soundOn ? "♪" : "♩"}
          </button>
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); onAsk(input); }}
          style={{ display: "flex", gap: 10, alignItems: "flex-end" }}
        >
          <textarea
            className="nf-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              // Enter that confirms an IME candidate is not a send.
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && e.keyCode !== 229) { e.preventDefault(); onAsk(input); }
            }}
            placeholder={oracle === "nat" ? "Ask the oracle of tomorrow…" : "Tell Natalie what's really going on…"}
            aria-label={oracle === "nat" ? "Your question for Nat-Future" : "Your question for Natalie"}
            maxLength={4000}
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
            disabled={busy || !input.trim()}
            aria-label="Ask the oracle"
            style={{
              width: 48, height: 48, borderRadius: "50%", flexShrink: 0, cursor: busy || !input.trim() ? "default" : "pointer",
              border: `1px solid ${input.trim() && !busy ? gold : veilSoft}`,
              background: input.trim() && !busy ? "rgba(255,209,102,0.14)" : "rgba(124,77,255,0.08)",
              color: input.trim() && !busy ? gold : dim,
              fontSize: 20, transition: "all 0.3s ease, transform 0.15s ease",
            }}
          >
            ✦
          </button>
        </form>
        <p style={{ margin: "8px 2px 0", fontSize: 9, letterSpacing: "0.1em", color: faint, textAlign: "center" }}>
          The oracle offers insight &amp; foresight for guidance and delight — not medical, legal, or financial advice.
        </p>
        {/* The one line that must always be legible and tappable. */}
        <p style={{ margin: "4px 2px 0", fontSize: 11, letterSpacing: "0.06em", lineHeight: 1.6, color: goldSoft, textAlign: "center" }}>
          In crisis? US: call/text{" "}
          <a href="tel:988" style={{ color: gold, textDecoration: "underline" }}>988</a>
          {" "}· elsewhere:{" "}
          <a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer" style={{ color: gold, textDecoration: "underline" }}>findahelpline.com</a>
        </p>
      </footer>

      {showPathways && <Pathways onAsk={onAsk} busy={busy} onClose={() => setShowPathways(false)} onBreathe={() => setShowBreathe(true)} />}
      {showMarks && <Marks marks={marks} now={now} onSet={onSetMark} onClose={() => setShowMarks(false)} />}
      {showBreathe && <BreathePacer onClose={() => setShowBreathe(false)} />}
    </div>
  );
}

function IconButton({ label, onClick, badge, children }: { label: string; onClick: () => void; badge?: number; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      style={{ position: "relative", width: 32, height: 32, borderRadius: "50%", border: `1px solid ${veilSoft}`, background: "transparent", color: dim, cursor: "pointer", fontSize: 14, lineHeight: 1, flexShrink: 0 }}
    >
      {children}
      {!!badge && badge > 0 && (
        <span style={{
          position: "absolute", top: -4, right: -4, minWidth: 15, height: 15, padding: "0 3px",
          borderRadius: 999, background: gold, color: "#1a1204", fontSize: 9, fontWeight: 700,
          display: "grid", placeItems: "center", lineHeight: 1,
        }}>
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </button>
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

function OracleReading({ msg }: { msg: ChatMessage }) {
  const who = msg.oracle ?? "nat";
  const segs = shownSegments(msg);
  const labels = SEGMENT_LABELS[who];
  const streaming = !!msg.streaming;
  // A crisis reading shows its card before the first word; the bubble waits.
  const hasWords = segs.length > 0;

  return (
    <div className="nf-rise" style={{ alignSelf: "flex-start", maxWidth: "94%", width: "100%" }}>
      <div style={{ display: hasWords ? "block" : "none", fontSize: 10, letterSpacing: "0.35em", textTransform: "uppercase", color: dim, margin: "0 0 8px 4px" }}>
        {ORACLE_SIGILS[who]} {ORACLE_NAMES[who]}
      </div>
      <div style={{
        padding: "22px 22px 18px", borderRadius: "4px 20px 20px 20px",
        background: "rgba(16,12,36,0.55)", border: "1px solid rgba(124,77,255,0.16)",
        backdropFilter: "blur(10px)", display: hasWords ? "flex" : "none", flexDirection: "column", gap: 18,
      }}>
        {segs.map((seg, i) => {
          const kind = seg.kind;
          const isMark = kind === "mark" || kind === "bold";
          const isCast = kind === "cast" || kind === "sight";
          const isSeal = kind === "seal" || kind === "omen";
          const isLast = i === segs.length - 1;
          const label = labels[kind] ?? (kind === "seal" ? "" : "");
          return (
            <div
              key={i}
              className="nf-cast-anim"
              style={{
                animation: "nf-cast 0.8s ease both",
                ...(isMark && {
                  border: "1px solid rgba(255,209,102,0.4)", borderRadius: 14, padding: "12px 16px",
                  background: "rgba(255,209,102,0.05)", boxShadow: "0 0 24px rgba(255,209,102,0.07) inset",
                }),
              }}
            >
              {label && (
                <div style={{
                  fontSize: 9.5, letterSpacing: "0.34em", textTransform: "uppercase",
                  color: SEGMENT_COLORS[kind] ?? dim, opacity: isMark ? 0.95 : 0.7,
                  marginBottom: 8, fontFamily: sans,
                }}>
                  {isMark ? "⚡ " : ""}{label}
                </div>
              )}
              <div style={{
                fontFamily: serif,
                fontSize: isCast ? 17.5 : 15,
                lineHeight: isCast ? 1.9 : 1.75,
                whiteSpace: "pre-line",
                color: SEGMENT_COLORS[kind] ?? moon,
                fontStyle: isSeal || kind === "opening" ? "italic" : "normal",
                opacity: kind === "opening" ? 0.9 : 1,
                textShadow: isCast ? "0 0 30px rgba(124,77,255,0.2)" : isMark ? "0 0 18px rgba(255,209,102,0.22)" : "none",
              }}>
                {seg.text}
                {streaming && isLast && <span className="nf-cursor" />}
              </div>
            </div>
          );
        })}
        {!streaming && msg.confidence != null && !msg.crisis && !msg.sensitive && isForecast(segs) && (
          <div style={{ animation: "nf-fade 1s ease both", display: "flex", alignItems: "center", gap: 8, marginTop: 2, paddingTop: 10, borderTop: "1px solid rgba(124,77,255,0.15)" }}>
            <span style={{ color: gold, fontSize: 13 }}>{msg.sigil}</span>
            <span style={{ fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: dim }}>
              Certainty of the threads: <CountUp to={msg.confidence} />
            </span>
          </div>
        )}
      </div>
      {/* Pinned under the reading — from the first moment, and after every reload. */}
      {msg.crisis && <CrisisCard palette={CRISIS_PALETTE} voice={CRISIS_VOICE[who]} />}
    </div>
  );
}

function CountUp({ to }: { to: number }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const dur = 1100;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(to * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to]);
  return <span style={{ color: goldSoft }}>{v.toFixed(1)}%</span>;
}

function Divining({ oracle }: { oracle: OracleId }) {
  return (
    <div className="nf-rise" role="status" style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 12, padding: "6px 4px" }}>
      <OracleOrb size={40} divining />
      <span className="nf-shimmer" style={{
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

// The full channel key is woven into the page for those who view the source.
export const CHANNEL_SIGNATURE = DAVARA_CHANNEL;
