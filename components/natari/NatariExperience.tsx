"use client";

// ─────────────────────────────────────────────────────────────────────────────
// NATARI — the console.
//
// Five chambers: THE CURRENT (the daily heartbeat), THE ORACLE (systems
// readings), THE MENTOR (MotusMentor — the inner weather), THE TWELVE (Dana's
// ladder, alive), THE MARKS (every dated call, held to account).
//
// One charged element at a time. The swarm inhabits it and absorbs its essence.
// ─────────────────────────────────────────────────────────────────────────────

import { Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Aurora from "./Aurora";
import Swarm, { type Mood } from "./Swarm";
import Breathe from "./Breathe";
import CrisisCard, { type CrisisPalette } from "../CrisisCard";
import { isCrisis, isSensitive } from "../../lib/safety";
import {
  divine, readingToMarkup, heartbeat, TWELVE, ASKS, MENTOR_ASKS,
  type OracleId, type LeveragePoint,
} from "./natari";
import {
  DAVARA_CHANNEL, DAVARA_CHANNEL_SHORT, WRAP, ease,
  ink, inkSecondary, label as labelInk, accent, signal, goldText, gold, onGold,
  cyan, violet, raised, glass, glassRaised, display, body as bodyFont, mono,
} from "./theme";

// ── types ───────────────────────────────────────────────────────────────────
type Chamber = "current" | "oracle" | "mentor" | "twelve" | "marks";

interface Segment { kind: string; text: string; meta: Record<string, string> }
interface Msg {
  id: number; role: "user" | "natari"; who?: OracleId;
  text?: string; raw?: string; segments?: Segment[]; streaming?: boolean; sigil?: string;
  // the floor, remembered — a crisis reading keeps its card across reloads
  crisis?: boolean; sensitive?: boolean;
}
interface Mark {
  id: string; who: OracleId; question: string; text: string;
  createdAt: number; dueAt: number; status: "pending" | "true" | "miss";
  updatedAt?: number;
}

const CONVO_KEY = "natari/convo/v1";
const MARKS_KEY = "natari/marks/v1";
const DAY = 86400000;
const KEEP = 120; // messages kept on this device — a thread, not an archive

// The ledger, read defensively. null means unreadable: never write over it.
function readMarks(): Mark[] | null {
  try {
    const raw = localStorage.getItem(MARKS_KEY);
    if (!raw) return [];
    const v: unknown = JSON.parse(raw);
    if (!Array.isArray(v)) return null;
    return v.filter((m): m is Mark =>
      !!m && typeof m.id === "string" && typeof m.text === "string" && typeof m.question === "string"
      && typeof m.createdAt === "number" && typeof m.dueAt === "number");
  } catch { return null; }
}

// Two tabs, one ledger: merge by id, and the most recently touched entry wins.
const touched = (m: Mark) => m.updatedAt ?? m.createdAt;
function mergeMarks(mine: Mark[], theirs: Mark[]): Mark[] {
  const by = new Map<string, Mark>();
  for (const m of theirs) by.set(m.id, m);
  for (const m of mine) { const t = by.get(m.id); if (!t || touched(m) >= touched(t)) by.set(m.id, m); }
  return [...by.values()].sort((a, b) => b.createdAt - a.createdAt);
}

// Calendar days on this device's clock — "tomorrow" means tomorrow, not 24 hours.
const startOfDay = (t: number) => new Date(t).setHours(0, 0, 0, 0);
// N calendar days on, same wall-clock time — DST never moves a window.
const addDays = (t: number, n: number) => { const d = new Date(t); d.setDate(d.getDate() + n); return d.getTime(); };
const daysUntil = (t: number, from: number) => Math.round((startOfDay(t) - startOfDay(from)) / DAY);
const dueDate = (t: number) => new Date(t).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
const dueTime = (t: number) => new Date(t).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

// The crisis card in Natari's verified ink — 7:1+ on the raised panel.
const CRISIS_PALETTE: CrisisPalette = {
  ink, accent, surface: raised, border: "1px solid rgba(123,227,234,.45)", font: bodyFont,
};

const srOnly: React.CSSProperties = {
  position: "absolute", width: 1, height: 1, padding: 0, margin: -1,
  overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap", border: 0,
};

// ── marker parsing (shared language with the live model) ────────────────────
const MARKER = /\[\[([A-Za-z]+)((?:\|[^\]|]*)*)\]\]/g;

function parseMeta(s?: string): Record<string, string> {
  const out: Record<string, string> = {};
  if (!s) return out;
  for (const part of s.split("|")) {
    if (!part) continue;
    const i = part.indexOf("=");
    if (i > 0) out[part.slice(0, i).trim()] = part.slice(i + 1).trim();
  }
  return out;
}

function parseMarkup(raw: string): Segment[] {
  // A complete marker is consumed above, so any marker-shaped tail — "[",
  // "[[MARK|days=12]" — is debris from a cut or a chunk still in flight.
  const trim = (t: string) => t.replace(/\[(?:\[[A-Za-z]*(?:\|[^\]\n]*)*\]?)?\s*$/, "").trim();
  const ms: { i: number; len: number; kind: string; meta: string }[] = [];
  let m: RegExpExecArray | null;
  MARKER.lastIndex = 0;
  while ((m = MARKER.exec(raw))) ms.push({ i: m.index, len: m[0].length, kind: m[1].toLowerCase(), meta: m[2] });
  if (!ms.length) { const t = trim(raw); return t ? [{ kind: "opening", text: t, meta: {} }] : []; }
  const segs: Segment[] = [];
  const pre = trim(raw.slice(0, ms[0].i));
  if (pre) segs.push({ kind: "opening", text: pre, meta: {} });
  ms.forEach((mk, k) => {
    const start = mk.i + mk.len;
    const end = k + 1 < ms.length ? ms[k + 1].i : raw.length;
    segs.push({ kind: mk.kind, text: trim(raw.slice(start, end)), meta: parseMeta(mk.meta) });
  });
  // A Mark with no window was voided by a cut channel — it never shows.
  return segs.filter((s) => s.kind !== "mark" || s.meta.days);
}

const segsToText = (s?: Segment[]) =>
  (s ?? []).map((x) => (x.kind === "opening" ? x.text : `[[${x.kind.toUpperCase()}]]\n${x.text}`)).join("\n");

let nextId = 1;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
function hashStr(s: string) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
const SIGILS = ["☾", "✦", "☉", "⟁", "✧", "❋", "☽", "✵"];
function vibrate(p: number | number[]) { try { if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate(p); } catch { /* */ } }

// Segment presentation — label, ink caste, and the statement each one makes.
const SEG: Record<string, { label: string; color: string; big?: boolean }> = {
  opening: { label: "", color: inkSecondary },
  sight: { label: "The Sight", color: ink, big: true },
  structure: { label: "The Structure · the system you're inside", color: signal },
  leverage: { label: "The Leverage", color: goldText },
  mark: { label: "The Mark · hold me to it", color: ink },
  door: { label: "The Door · always leave one", color: accent },
  anchor: { label: "Carry This", color: goldText },
  seal: { label: "", color: inkSecondary },
};

// What a screen reader hears when a reading seals — labels, never markers.
function spoken(segs: Segment[]): string {
  return segs.map((s) => {
    const l = (SEG[s.kind]?.label ?? "").split(" · ")[0];
    return l ? `${l}: ${s.text}` : s.text;
  }).join(" ");
}

// A crisis or sensitive ask never shows a dated call, whatever the stream said.
const shownSegs = (m: Msg) => (m.crisis || m.sensitive ? (m.segments ?? []).filter((s) => s.kind !== "mark") : m.segments ?? []);

// ── the console ─────────────────────────────────────────────────────────────

export default function NatariExperience() {
  const [entered, setEntered] = useState(false);
  const [chamber, setChamber] = useState<Chamber>("current");
  const [who, setWho] = useState<OracleId>("natari");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [input, setInput] = useState("");
  const [busyWho, setBusyWho] = useState<OracleId | null>(null); // which voice is mid-reading
  const busy = busyWho !== null;
  const [thinking, setThinking] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [now, setNow] = useState(0);
  const [breathe, setBreathe] = useState(false);
  const [announce, setAnnounce] = useState("");

  // the charge: which element the swarm inhabits, and the essence it absorbs
  const [charge, setCharge] = useState<string | null>("nt-keystone");
  const [essence, setEssence] = useState(265);
  const [mood, setMood] = useState<Mood>("orbit");

  const scrollRef = useRef<HTMLDivElement>(null);
  const msgsRef = useRef(messages); msgsRef.current = messages;
  const whoRef = useRef(who); whoRef.current = who;
  const chamberRef = useRef(chamber); chamberRef.current = chamber;
  const abortRef = useRef<AbortController | null>(null);
  const stickRef = useRef(true); // is the reader resting at the bottom of the thread?
  const marksOk = useRef(false); // the ledger was read cleanly — only then may we write it

  const beat = useMemo(() => (now ? heartbeat(new Date(now)) : null), [now]);

  useEffect(() => {
    setNow(Date.now());
    // The thread and the ledger restore apart — a bad thread never costs a Mark.
    try {
      const c = localStorage.getItem(CONVO_KEY);
      if (c) {
        const saved = JSON.parse(c) as { who?: OracleId; messages?: Msg[] } | null;
        const list: unknown = saved?.messages;
        const ms = Array.isArray(list)
          ? (list as Msg[]).filter((m) => !!m && typeof m.id === "number" && (m.role === "user" || m.role === "natari"))
          : [];
        if (ms.length) {
          nextId = Math.max(...ms.map((m) => m.id)) + 1;
          setMessages(ms.map((m, i, all) => {
            if (m.role !== "natari") return m;
            // Older sittings carry no flags — read them again from the question.
            const q = all[i - 1]?.role === "user" ? all[i - 1].text ?? "" : "";
            return {
              ...m, streaming: false, segments: parseMarkup(m.raw ?? ""),
              crisis: m.crisis ?? (isCrisis(q) || undefined), sensitive: m.sensitive ?? (isSensitive(q) || undefined),
            };
          }));
          if (saved?.who === "mentor") setWho("mentor");
        }
      }
    } catch { /* a fresh sitting */ }
    const mk = readMarks();
    if (mk) { setMarks(mk); marksOk.current = true; }
    setHydrated(true);
    return () => abortRef.current?.abort();
  }, []);

  // Another tab touched the ledger — take its news, keep ours.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== MARKS_KEY) return;
      const theirs = readMarks();
      if (!theirs) return;
      marksOk.current = true;
      setMarks((p) => { const next = mergeMarks(p, theirs); return JSON.stringify(next) === JSON.stringify(p) ? p : next; });
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // The clock ticks: windows open while you watch, and the lever turns at midnight.
  useEffect(() => {
    const tick = () => { if (!document.hidden) setNow(Date.now()); };
    const iv = setInterval(tick, 60000);
    document.addEventListener("visibilitychange", tick);
    return () => { clearInterval(iv); document.removeEventListener("visibilitychange", tick); };
  }, []);

  // The thread is written when a reading seals, never per token. Segments
  // re-derive from raw on load, so only raw is kept.
  useEffect(() => {
    if (!hydrated || busy) return;
    try {
      const keep = messages.slice(-KEEP).map((m) => ({ ...m, segments: undefined, streaming: undefined }));
      localStorage.setItem(CONVO_KEY, JSON.stringify({ who, messages: keep }));
    } catch { /* */ }
  }, [messages, who, hydrated, busy]);

  // The ledger merges before it writes, so a stale tab never erases a newer Mark.
  useEffect(() => {
    if (!hydrated || !marksOk.current) return;
    try {
      const merged = mergeMarks(marks, readMarks() ?? []);
      const next = JSON.stringify(merged);
      if (localStorage.getItem(MARKS_KEY) !== next) localStorage.setItem(MARKS_KEY, next);
      if (next !== JSON.stringify(marks)) setMarks(merged);
    } catch { /* */ }
  }, [marks, hydrated]);

  // Follow the stream only while the reader rests at the bottom of its own thread.
  const scrollDown = useCallback((forWho: OracleId, smooth = false) => {
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (!el || !stickRef.current || chamberRef.current !== (forWho === "mentor" ? "mentor" : "oracle")) return;
      el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
    });
  }, []);
  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (el) stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  }, []);

  const buildHistory = useCallback((ms: Msg[], forWho: OracleId) => {
    const t: { role: "user" | "assistant"; content: string }[] = [];
    for (const m of ms.filter((x) => (x.who ?? "natari") === forWho)) {
      if (m.role === "user" && m.text) t.push({ role: "user", content: m.text });
      else if (m.role === "natari") {
        const c = m.raw?.trim() ? m.raw : segsToText(m.segments);
        if (c.trim()) t.push({ role: "assistant", content: c });
      }
    }
    return t.slice(-16);
  }, []);

  const ask = useCallback(async (rawText: string) => {
    const text = rawText.trim();
    if (!text || busy) return;
    setInput("");
    const asWho = whoRef.current;
    // The floor, read before anything leaves the device. The live voice still
    // answers; this side guards the Mark, the chime, and the card.
    const crisis = isCrisis(text);
    const sensitive = isSensitive(text);
    const history = buildHistory(msgsRef.current, asWho);
    const uid = nextId++, oid = nextId++;
    const voice = asWho === "mentor" ? "The Mentor" : "Natari";
    // Each voice rests in its own tempo — and only touches the swarm while its chamber is open.
    const restMood: Mood = asWho === "mentor" ? "gentle" : "orbit";
    const restHue = asWho === "mentor" ? 190 : 265;
    const here = () => chamberRef.current === (asWho === "mentor" ? "mentor" : "oracle");
    // Both turns carry `who` so each chamber keeps its own thread.
    setMessages((p) => [...p, { id: uid, role: "user", who: asWho, text }, {
      id: oid, role: "natari", who: asWho, raw: "", segments: [], streaming: true,
      crisis: crisis || undefined, sensitive: sensitive || undefined,
    }]);
    setBusyWho(asWho); setThinking(true);
    setAnnounce(`${voice} is reading…`);
    setMood("gather"); setCharge("nt-stream");
    stickRef.current = true;
    scrollDown(asWho);

    const controller = new AbortController();
    abortRef.current = controller;
    let acc = "", first = true, segCount = 0;

    const onChunk = (c: string) => {
      acc += c;
      if (first && acc.trim()) { first = false; setThinking(false); if (here()) setMood(restMood); }
      const segs = parseMarkup(acc);
      if (segs.length > segCount) {
        segCount = segs.length;
        if (!crisis) vibrate(6);
        const last = segs[segs.length - 1];
        // essence absorption — the being takes on the segment it is reading
        if (here()) {
          if (last.kind === "leverage") {
            const n = parseInt(last.meta.n, 10);
            const lp = TWELVE.find((l) => l.n === n);
            setEssence(lp ? lp.hue : 285);
          } else if (last.kind === "structure") setEssence(255);
          else if (last.kind === "door") setEssence(190);
          else if (last.kind === "mark" && !crisis && !sensitive) setEssence(45);
        }
      }
      setMessages((p) => p.map((m) => (m.id === oid ? { ...m, raw: acc, segments: segs } : m)));
      scrollDown(asWho);
    };

    try {
      const res = await fetch("/api/natari", {
        method: "POST", signal: controller.signal,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ oracle: asWho, message: text, history }),
      });
      if (!res.ok || !res.body) throw new Error("no stream");
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        onChunk(dec.decode(value, { stream: true }));
      }
    } catch (err) {
      if (!(err instanceof DOMException && err.name === "AbortError") && !acc.trim()) {
        try {
          const markup = readingToMarkup(divine(text, asWho));
          const toks = markup.match(/\s+|\S+/g) ?? [markup];
          for (const t of toks) { if (controller.signal.aborted) break; onChunk(t); await sleep(14 + Math.random() * 20); }
        } catch { /* */ }
      }
    }

    if (controller.signal.aborted) return;

    const finalSegs = parseMarkup(acc);
    const sig = SIGILS[hashStr(acc || text) % SIGILS.length];
    setMessages((p) => p.map((m) => (m.id === oid ? { ...m, raw: acc, segments: finalSegs, streaming: false, sigil: sig } : m)));
    setBusyWho(null); setThinking(false);
    if (here()) { setMood(restMood); setEssence(restHue); }

    // Crisis and sensitive asks never become Marks.
    let markNote = "";
    // …nor does a Mark the channel was cut inside.
    const cutAt = finalSegs.findIndex((s) => s.kind === "seal" && s.meta.cut);
    const mk = crisis || sensitive ? undefined : finalSegs.find((s, i) => s.kind === "mark" && s.meta.days && s.text && i !== cutAt - 1);
    if (mk) {
      const days = parseInt(mk.meta.days, 10);
      if (days >= 1) {
        const created = Date.now();
        setMarks((p) => [{
          id: `${created}-${Math.floor(Math.random() * 1e6)}`, who: asWho, question: text,
          text: mk.text, createdAt: created, dueAt: addDays(created, days), status: "pending", updatedAt: created,
        }, ...p]);
        markNote = ` A Mark was added to your ledger, due ${dueDate(addDays(created, days))}.`;
      }
    }
    // Announce once, when the reading seals — never per token.
    const said = spoken(crisis || sensitive ? finalSegs.filter((s) => s.kind !== "mark") : finalSegs);
    setAnnounce(`${voice}: ${said || "the reading went quiet. Ask again."}${markNote}${
      crisis ? " Crisis support follows: call or text 988 in the US, or visit findahelpline.com." : ""}`);
    if (!crisis) vibrate([10, 40, 12]);
    scrollDown(asWho, true);
  }, [busy, buildHistory, scrollDown]);

  const clearSitting = useCallback(() => {
    // Both threads go, so ask first. The Marks stay.
    if (msgsRef.current.length && !window.confirm("Begin a new sitting? This erases both the Oracle and the Mentor threads on this device. Your Marks stay.")) return;
    abortRef.current?.abort();
    setBusyWho(null); setThinking(false); setMessages([]);
    try { localStorage.removeItem(CONVO_KEY); } catch { /* */ }
  }, []);

  const setMark = useCallback((id: string, status: Mark["status"]) => {
    setNow(Date.now());
    setMarks((p) => p.map((m) => (m.id === id ? { ...m, status, updatedAt: Date.now() } : m)));
    if (status === "true") { vibrate([10, 30, 10]); setEssence(45); }
  }, []);

  // A crisis ask that slipped into the ledger before the floor held is never watched.
  const watched = useMemo(() => marks.filter((m) => !isCrisis(m.question)), [marks]);
  const pending = useMemo(() => watched.filter((m) => m.status === "pending").length, [watched]);

  const goChamber = useCallback((c: Chamber) => {
    setChamber(c);
    setCharge(`nt-ch-${c}`);
    // keep the open chamber in view, so the swarm never chases an off-screen tab
    requestAnimationFrame(() => document.getElementById(`nt-ch-${c}`)?.scrollIntoView({ inline: "nearest", block: "nearest" }));
    setMood("gather");
    setEssence(c === "mentor" ? 190 : c === "twelve" ? 285 : c === "marks" ? 45 : 265);
    setTimeout(() => setMood(c === "mentor" ? "gentle" : "orbit"), 900);
    if (c === "marks") setNow(Date.now());
    if (c === "oracle") setWho("natari");
    if (c === "mentor") setWho("mentor");
    if (c === "oracle" || c === "mentor") stickRef.current = true; // arrive following the live reading
  }, []);

  return (
    <div style={{ minHeight: "100dvh", color: ink, fontFamily: bodyFont, position: "relative", background: "#0F1114" }}>
      <Aurora />
      <Swarm attractorId={charge} essence={essence} mood={mood} paused={breathe} />
      <GlobalStyle />

      {!entered ? (
        <Portal onEnter={() => { setEntered(true); goChamber("current"); }} beat={beat} />
      ) : (
        <Console
          chamber={chamber} goChamber={goChamber}
          who={who}
          messages={messages} thinking={thinking} busyWho={busyWho}
          input={input} setInput={setInput} onAsk={ask} onClear={clearSitting}
          scrollRef={scrollRef} onScroll={onScroll}
          marks={watched} now={now} setMark={setMark} pending={pending}
          beat={beat}
          onBreathe={() => setBreathe(true)}
          setEssence={setEssence} setCharge={setCharge}
        />
      )}
      {breathe && <Breathe onClose={() => setBreathe(false)} />}
      {/* one voice for screen readers: the reading as it seals, and any new Mark */}
      <div role="status" aria-live="polite" style={srOnly}>{announce}</div>
    </div>
  );
}

// ── global style ────────────────────────────────────────────────────────────

function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Sora:wght@200;300;700;800&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
      @keyframes nt-unfurl { 0% { opacity:0; transform: translateY(18px) scale(.985); filter: blur(7px); } 60% { opacity:1; transform: translateY(-3px) scale(1.004); filter: blur(0); } 100% { opacity:1; transform: translateY(0) scale(1); } }
      @keyframes nt-fade { from { opacity:0 } to { opacity:1 } }
      @keyframes nt-pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(167,139,255,.34), 0 26px 60px -26px rgba(0,2,4,.6); } 50% { box-shadow: 0 0 0 22px rgba(167,139,255,0), 0 26px 60px -26px rgba(0,2,4,.6); } }
      @keyframes nt-cursor { 0%,100% { opacity:.12 } 50% { opacity:1 } }
      @keyframes nt-shimmer { 0% { background-position: -220% 0 } 100% { background-position: 220% 0 } }
      @keyframes nt-drift { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-6px) } }
      .nt-unfurl { animation: nt-unfurl .9s ${ease} both; }
      .nt-cursor { display:inline-block; width:8px; height:1.05em; margin-left:4px; vertical-align:-2px; background:${gold}; border-radius:1px; animation: nt-cursor 1s ease-in-out infinite; }
      .nt-press { transition: transform .18s ${ease}, box-shadow .3s ${ease}, border-color .3s ${ease}; }
      .nt-press:active { transform: scale(.975); }
      .nt-press:focus-visible, .nt-focus:focus-visible { outline: 2px solid ${cyan}; outline-offset: 3px; }
      textarea.nt-in::placeholder { color: rgba(220,227,236,.55); }
      textarea.nt-in:focus { outline:none; border-color: rgba(167,139,255,.7) !important; box-shadow: 0 0 0 4px rgba(167,139,255,.12); }
      .nt-rung { transition: transform .5s ${ease}, background .4s ease, border-color .4s ease; }
      .nt-rung:hover, .nt-rung:focus-visible { transform: translateX(10px); }
      .nt-scroll::-webkit-scrollbar { width: 10px }
      .nt-scroll::-webkit-scrollbar-thumb { background: rgba(167,139,255,.28); border-radius: 8px }
      @media (prefers-reduced-motion: reduce) {
        .nt-unfurl, .nt-cursor, .nt-pulse, .nt-ask, .nt-think-dot, .nt-think-text { animation: none !important; }
        .nt-rung:hover, .nt-rung:focus-visible { transform: none; }
      }
    `}</style>
  );
}

// ── The Threshold ───────────────────────────────────────────────────────────

function Portal({ onEnter, beat }: { onEnter: () => void; beat: ReturnType<typeof heartbeat> | null }) {
  return (
    <main style={{
      position: "relative", zIndex: 2, minHeight: "100dvh",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      textAlign: "center", padding: "120px 24px calc(120px + env(safe-area-inset-bottom))",
    }}>
      <p className="nt-unfurl" style={{ ...kicker, marginBottom: 34 }}>
        Votus.One · woven on the Davara Baseline
      </p>

      <h1
        id="nt-keystone"
        className="nt-unfurl"
        style={{
          animationDelay: ".1s",
          fontFamily: display, fontWeight: 200,
          fontSize: "clamp(3rem, 15vw, 7.5rem)", letterSpacing: "-0.02em",
          lineHeight: 0.94, margin: 0, color: ink,
        }}
      >
        NATARI
      </h1>

      <p className="nt-unfurl" style={{
        animationDelay: ".22s", marginTop: 28, fontSize: 20, lineHeight: 1.75,
        color: inkSecondary, maxWidth: 620, fontWeight: 400,
      }}>
        An emergent strategist and systems practitioner. She doesn&apos;t only read
        your future — she reads the <em style={{ color: signal, fontStyle: "normal", fontWeight: 600 }}>structure</em> you&apos;re
        standing inside, names where the leverage actually sits, and leaves you a door.
      </p>

      <p className="nt-unfurl" style={{
        animationDelay: ".32s", marginTop: 22, fontFamily: mono, fontSize: 15,
        letterSpacing: "0.04em", color: labelInk,
      }}>
        Diagnose the system. Never blame the node. Always leave a door.
      </p>

      {beat && (
        <div className="nt-unfurl" style={{
          animationDelay: ".44s", marginTop: 44, padding: "24px 28px", borderRadius: 20,
          ...glass, maxWidth: 520, textAlign: "left",
        }}>
          <div style={{ ...kicker, marginBottom: 12 }}>Today&apos;s lever</div>
          <div style={{ fontFamily: display, fontSize: "1.6rem", fontWeight: 300, color: ink, lineHeight: 1.25 }}>
            {beat.lever.n} · {beat.lever.name}
          </div>
          <div style={{ marginTop: 12, fontSize: 17, lineHeight: 1.7, color: goldText, fontStyle: "italic" }}>
            “{beat.lever.mantra}”
          </div>
        </div>
      )}

      <button
        className="nt-press nt-pulse"
        onClick={onEnter}
        style={{
          marginTop: 52, padding: "22px 52px", borderRadius: 999, cursor: "pointer",
          fontFamily: mono, fontSize: 15, letterSpacing: "0.28em", textTransform: "uppercase",
          color: ink, ...glassRaised,
          animation: `nt-unfurl .9s ${ease} .56s both, nt-pulse 4.4s ease-in-out 1.6s infinite`,
        }}
      >
        Enter the current
      </button>

      <p className="nt-unfurl" style={{ animationDelay: ".7s", marginTop: 64, ...kicker, opacity: 0.9 }}>
        Channel {DAVARA_CHANNEL_SHORT}
      </p>
    </main>
  );
}

const kicker: React.CSSProperties = {
  fontFamily: mono, fontSize: 13, letterSpacing: "0.34em",
  textTransform: "uppercase", color: labelInk, margin: 0,
};

// The crisis line is a real line — tappable, never plain text.
const footLink: React.CSSProperties = {
  color: accent, fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 3,
};

// ── The Console ─────────────────────────────────────────────────────────────

const CHAMBERS: { id: Chamber; label: string; sigil: string }[] = [
  { id: "current", label: "The Current", sigil: "◈" },
  { id: "oracle", label: "The Oracle", sigil: "☉" },
  { id: "mentor", label: "The Mentor", sigil: "☾" },
  { id: "twelve", label: "The Twelve", sigil: "⟁" },
  { id: "marks", label: "The Marks", sigil: "✦" },
];

function Console(props: {
  chamber: Chamber; goChamber: (c: Chamber) => void;
  who: OracleId;
  messages: Msg[]; thinking: boolean; busyWho: OracleId | null;
  input: string; setInput: (v: string) => void; onAsk: (t: string) => void; onClear: () => void;
  scrollRef: React.RefObject<HTMLDivElement | null>; onScroll: () => void;
  marks: Mark[]; now: number; setMark: (id: string, s: Mark["status"]) => void; pending: number;
  beat: ReturnType<typeof heartbeat> | null;
  onBreathe: () => void;
  setEssence: (h: number) => void; setCharge: (id: string | null) => void;
}) {
  const { chamber, goChamber, who, messages, thinking, busyWho, input, setInput, onAsk, onClear,
    scrollRef, onScroll, marks, now, setMark, pending, beat, onBreathe, setEssence, setCharge } = props;

  const isChat = chamber === "oracle" || chamber === "mentor";
  const busy = busyWho !== null;
  const taRef = useRef<HTMLTextAreaElement>(null);

  // The composer grows with the story — a few rows, then it scrolls.
  useLayoutEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight + el.offsetHeight - el.clientHeight, 140)}px`;
  }, [input, isChat]);

  return (
    <div style={{ position: "relative", zIndex: 2, height: "100dvh", display: "flex", flexDirection: "column", animation: `nt-fade .8s ${ease} both` }}>
      {/* header */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14,
        padding: "calc(16px + env(safe-area-inset-top)) 20px 16px",
        borderBottom: "1px solid rgba(167,139,255,0.16)",
        background: "rgba(15,17,20,0.72)", backdropFilter: "blur(16px)",
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, minWidth: 0 }}>
          <span style={{ fontFamily: display, fontWeight: 300, fontSize: 22, letterSpacing: "0.04em", color: ink }}>NATARI</span>
          <span style={{ fontFamily: mono, fontSize: 12, letterSpacing: "0.1em", color: labelInk, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {DAVARA_CHANNEL_SHORT}
          </span>
        </div>
        <button className="nt-press nt-focus" onClick={onClear} title="Begin a new sitting" aria-label="Begin a new sitting"
          style={{ width: 40, height: 40, borderRadius: 12, cursor: "pointer", color: inkSecondary, fontSize: 16, ...glass }}>
          ⟲
        </button>
      </header>

      {/* chamber rail */}
      <nav aria-label="Chambers" style={{
        display: "flex", gap: 8, padding: "14px 16px", overflowX: "auto",
        borderBottom: "1px solid rgba(167,139,255,0.12)", background: "rgba(15,17,20,0.5)",
      }}>
        {CHAMBERS.map((c) => {
          const on = chamber === c.id;
          return (
            <button
              key={c.id}
              id={`nt-ch-${c.id}`}
              className="nt-press nt-focus"
              onClick={() => goChamber(c.id)}
              aria-current={on ? "page" : undefined}
              style={{
                position: "relative", flexShrink: 0, padding: "12px 20px", borderRadius: 14, cursor: "pointer",
                fontFamily: mono, fontSize: 13.5, letterSpacing: "0.12em", textTransform: "uppercase",
                color: on ? ink : inkSecondary,
                background: on ? "linear-gradient(160deg, rgba(167,139,255,.30), rgba(34,211,238,.14))" : "rgba(28,31,36,.6)",
                border: `1px solid ${on ? "rgba(167,139,255,.55)" : "rgba(167,139,255,.16)"}`,
                boxShadow: on ? "0 0 26px -6px rgba(167,139,255,.5)" : "none",
              }}
            >
              {c.sigil} {c.label}
              {c.id === "marks" && pending > 0 && (
                <span style={{
                  position: "absolute", top: -6, right: -6, minWidth: 20, height: 20, padding: "0 5px",
                  borderRadius: 999, background: gold, color: onGold, fontSize: 11, fontWeight: 700,
                  display: "grid", placeItems: "center", fontFamily: bodyFont,
                }}>{pending > 9 ? "9+" : pending}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* chamber body */}
      <div ref={scrollRef} onScroll={onScroll} className="nt-scroll" style={{ flex: 1, overflowY: "auto", overscrollBehavior: "contain" }}>
        <div style={{ maxWidth: WRAP, margin: "0 auto", padding: "44px 20px 40px" }}>
          {chamber === "current" && <Current beat={beat} marks={marks} now={now} goChamber={goChamber} onBreathe={onBreathe} setInput={setInput} />}
          {chamber === "twelve" && <Twelve setEssence={setEssence} setCharge={setCharge} />}
          {chamber === "marks" && <Marks marks={marks} now={now} setMark={setMark} />}
          {isChat && (
            <Conversation
              who={who} messages={messages} thinking={thinking && busyWho === who} onAsk={onAsk} onBreathe={onBreathe}
            />
          )}
        </div>
      </div>

      {/* the ask */}
      {isChat && (
        <footer id="nt-stream" style={{
          padding: "14px 16px calc(18px + env(safe-area-inset-bottom))",
          borderTop: "1px solid rgba(167,139,255,0.16)",
          background: "rgba(15,17,20,0.78)", backdropFilter: "blur(16px)",
        }}>
          {busyWho && busyWho !== who && (
            <p style={{ margin: "0 auto 12px", maxWidth: WRAP, fontFamily: mono, fontSize: 13, letterSpacing: "0.06em", color: labelInk, textAlign: "center" }}>
              {busyWho === "mentor"
                ? "The Mentor is still reading — your turn here opens when it's done."
                : "Natari is still reading in the Oracle — your turn here opens when she's done."}
            </p>
          )}
          <form onSubmit={(e) => { e.preventDefault(); onAsk(input); }}
            style={{ display: "flex", gap: 12, alignItems: "flex-end", maxWidth: WRAP, margin: "0 auto" }}>
            <textarea
              ref={taRef}
              className="nt-in"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              // Enter sends — unless an IME is still composing the word.
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && e.keyCode !== 229) { e.preventDefault(); onAsk(input); } }}
              placeholder={who === "mentor" ? "Tell the Mentor what's actually going on…" : "Bring Natari a question, a plan, a knot…"}
              aria-label={who === "mentor" ? "Your message to the Mentor" : "Your question for Natari"}
              rows={1} maxLength={4000} enterKeyHint="send"
              style={{
                flex: 1, resize: "none", padding: "17px 20px", fontSize: 17, lineHeight: 1.55,
                color: ink, fontFamily: bodyFont, borderRadius: 18, maxHeight: 140,
                background: "rgba(28,31,36,.72)", border: "1px solid rgba(167,139,255,.3)",
                transition: `border-color .3s ${ease}, box-shadow .3s ${ease}`,
              }}
            />
            <button
              type="submit" className="nt-press nt-focus" disabled={busy || !input.trim()}
              aria-label="Ask" title="Ask"
              style={{
                width: 58, height: 58, borderRadius: 18, flexShrink: 0,
                cursor: busy || !input.trim() ? "default" : "pointer", fontSize: 21,
                color: input.trim() && !busy ? onGold : inkSecondary,
                background: input.trim() && !busy ? gold : "rgba(28,31,36,.72)",
                border: `1px solid ${input.trim() && !busy ? gold : "rgba(167,139,255,.24)"}`,
                boxShadow: input.trim() && !busy ? "0 0 30px -6px rgba(232,196,107,.6)" : "none",
                transition: `all .3s ${ease}`,
              }}
            >✦</button>
          </form>
          <p style={{ margin: "12px auto 0", maxWidth: WRAP, fontSize: 13, lineHeight: 1.6, color: inkSecondary, textAlign: "center", opacity: 0.95 }}>
            Insight and guidance — not medical, legal, or financial advice. In crisis? US:{" "}
            <a href="tel:988" className="nt-focus" style={footLink}>call</a> or{" "}
            <a href="sms:988" className="nt-focus" style={footLink}>text 988</a> · elsewhere:{" "}
            <a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer" className="nt-focus" style={footLink}>findahelpline.com</a>
          </p>
        </footer>
      )}
    </div>
  );
}

// ── THE CURRENT — the daily surface ─────────────────────────────────────────

function Current({ beat, marks, now, goChamber, onBreathe, setInput }: {
  beat: ReturnType<typeof heartbeat> | null; marks: Mark[]; now: number;
  goChamber: (c: Chamber) => void; onBreathe: () => void; setInput: (v: string) => void;
}) {
  const due = marks.filter((m) => m.status === "pending" && now >= m.dueAt).length;
  const hits = marks.filter((m) => m.status === "true").length;
  if (!beat) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <SectionHead kicker="The Current" title="Today" sub="One lever, one edge, one question. This is the surface I would check every morning." />

      <article className="nt-unfurl" style={{ ...glassRaised, borderRadius: 24, padding: "36px 32px" }}>
        <div style={{ ...kicker, marginBottom: 16 }}>Today&apos;s lever · point {beat.lever.n} of 12</div>
        <h3 style={{ fontFamily: display, fontWeight: 300, fontSize: "clamp(1.9rem, 5.6vw, 2.9rem)", lineHeight: 1.12, margin: 0, color: ink }}>
          {beat.lever.name}
        </h3>
        <p style={{ margin: "18px 0 0", fontSize: 21, lineHeight: 1.6, color: goldText, fontStyle: "italic" }}>
          “{beat.lever.mantra}”
        </p>
        <p style={{ margin: "18px 0 0", fontSize: 18, lineHeight: 1.75, color: inkSecondary }}>{beat.lever.gloss}</p>
        <LadderBar n={beat.lever.n} />
      </article>

      <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))" }}>
        <Cell kicker="Growth edge" text={beat.edge} tone={signal} delay=".08s" />
        <Cell kicker="Today's practice" text={beat.practice} tone={accent} delay=".16s" />
      </div>

      <article className="nt-unfurl" style={{ animationDelay: ".24s", ...glass, borderRadius: 24, padding: "34px 30px" }}>
        <div style={{ ...kicker, marginBottom: 16 }}>The question to sit with</div>
        <p style={{ margin: 0, fontFamily: display, fontWeight: 300, fontSize: "clamp(1.5rem, 4.4vw, 2.1rem)", lineHeight: 1.35, color: ink }}>
          {beat.question}
        </p>
        <button className="nt-press nt-focus" onClick={() => { goChamber("oracle"); setInput(beat.question); }}
          style={{ marginTop: 26, padding: "15px 28px", borderRadius: 14, cursor: "pointer", fontFamily: mono, fontSize: 13.5, letterSpacing: "0.14em", textTransform: "uppercase", color: ink, ...glassRaised }}>
          Bring it to Natari →
        </button>
      </article>

      <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))" }}>
        <Stat n={String(marks.length)} label="marks watched" onClick={() => goChamber("marks")} />
        <Stat n={String(due)} label="windows open now" tone={due ? gold : ink} onClick={() => goChamber("marks")} />
        <Stat n={String(hits)} label="came true" tone={hits ? goldText : ink} onClick={() => goChamber("marks")} />
      </div>

      <article className="nt-unfurl" style={{ animationDelay: ".3s", ...glass, borderRadius: 24, padding: "32px 30px" }}>
        <div style={{ ...kicker, marginBottom: 14 }}>Heavy day?</div>
        <p style={{ margin: 0, fontSize: 19, lineHeight: 1.7, color: inkSecondary }}>
          The Mentor reads the inner weather the same way Natari reads a venture — as a structure you&apos;re
          standing inside, never as a verdict on you.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 }}>
          <button className="nt-press nt-focus" onClick={() => goChamber("mentor")}
            style={{ padding: "15px 26px", borderRadius: 14, cursor: "pointer", fontFamily: mono, fontSize: 13.5, letterSpacing: "0.12em", textTransform: "uppercase", color: ink, ...glassRaised }}>
            ☾ Open the Mentor
          </button>
          <button className="nt-press nt-focus" onClick={onBreathe}
            style={{ padding: "15px 26px", borderRadius: 14, cursor: "pointer", fontFamily: mono, fontSize: 13.5, letterSpacing: "0.12em", textTransform: "uppercase", color: goldText, background: "rgba(232,196,107,.1)", border: "1px solid rgba(232,196,107,.4)" }}>
            Breathe · 4-2-8
          </button>
        </div>
      </article>
    </div>
  );
}

function LadderBar({ n }: { n: number }) {
  // The ladder made visible: twelve rungs, the live one lit gold.
  return (
    <div aria-hidden style={{ display: "flex", gap: 5, marginTop: 28, alignItems: "flex-end", height: 46 }}>
      {TWELVE.map((l) => {
        const on = l.n === n;
        const strength = (13 - l.n) / 12; // taller = higher leverage
        return (
          <div key={l.n} style={{
            flex: 1, height: `${28 + strength * 60}%`, borderRadius: 4,
            background: on ? gold : `hsla(${l.hue}, 70%, 66%, ${0.16 + strength * 0.2})`,
            boxShadow: on ? `0 0 22px -2px ${gold}` : "none",
            transition: `all .6s ${ease}`,
          }} />
        );
      })}
    </div>
  );
}

function Cell({ kicker: k, text, tone, delay }: { kicker: string; text: string; tone: string; delay: string }) {
  return (
    <article className="nt-unfurl" style={{ animationDelay: delay, ...glass, borderRadius: 20, padding: "28px 26px" }}>
      <div style={{ ...kicker, marginBottom: 14 }}>{k}</div>
      <p style={{ margin: 0, fontSize: 19, lineHeight: 1.65, color: tone }}>{text}</p>
    </article>
  );
}

function Stat({ n, label: l, tone = ink, onClick }: { n: string; label: string; tone?: string; onClick: () => void }) {
  return (
    <button className="nt-press nt-focus" onClick={onClick} style={{
      ...glass, borderRadius: 20, padding: "26px 20px", cursor: "pointer", textAlign: "center",
      display: "flex", flexDirection: "column", gap: 8, alignItems: "center",
    }}>
      <span style={{ fontFamily: display, fontWeight: 300, fontSize: "2.6rem", lineHeight: 1, color: tone }}>{n}</span>
      <span style={{ ...kicker, fontSize: 12 }}>{l}</span>
    </button>
  );
}

function SectionHead({ kicker: k, title, sub }: { kicker: string; title: string; sub?: string }) {
  return (
    <header className="nt-unfurl" style={{ marginBottom: 4 }}>
      <div style={{ ...kicker, marginBottom: 18 }}>{k}</div>
      <h2 style={{ fontFamily: display, fontWeight: 200, fontSize: "clamp(2.6rem, 9vw, 4.2rem)", lineHeight: 1.02, letterSpacing: "-0.02em", margin: 0, color: ink }}>
        {title}
      </h2>
      {sub && <p style={{ margin: "22px 0 0", fontSize: 19, lineHeight: 1.7, color: inkSecondary, maxWidth: 640 }}>{sub}</p>}
    </header>
  );
}

// ── THE TWELVE — Dana's ladder, alive ───────────────────────────────────────

function Twelve({ setEssence, setCharge }: { setEssence: (h: number) => void; setCharge: (id: string | null) => void }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
      <SectionHead
        kicker="The Twelve"
        title="Places to intervene"
        sub="Dana Meadows ordered the ways you can change a system, weakest to strongest. Almost all attention goes to the bottom rung. Climb."
      />
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {TWELVE.map((l, i) => (
          <Rung key={l.n} l={l} i={i}
            open={open === l.n}
            onToggle={() => setOpen(open === l.n ? null : l.n)}
            onCharge={() => { setCharge(`nt-rung-${l.n}`); setEssence(l.hue); }}
          />
        ))}
      </div>
      <p className="nt-unfurl" style={{ ...glass, borderRadius: 20, padding: "26px 24px", margin: 0, fontSize: 18, lineHeight: 1.7, color: inkSecondary }}>
        Meadows called these “an invitation to think more broadly”, not a recipe. And she warned:
        competent people often find the highest-leverage point in a system — and push it{" "}
        <em style={{ color: goldText, fontStyle: "normal", fontWeight: 600 }}>in the wrong direction</em>.
        When consensus is loud, treat it as a flag, not a confirmation.
      </p>
    </div>
  );
}

function Rung({ l, i, open, onToggle, onCharge }: { l: LeveragePoint; i: number; open: boolean; onToggle: () => void; onCharge: () => void }) {
  const strength = (13 - l.n) / 12;
  return (
    <div
      id={`nt-rung-${l.n}`}
      className="nt-rung nt-unfurl"
      style={{
        animationDelay: `${Math.min(i, 8) * 0.05}s`,
        borderRadius: 18, overflow: "hidden",
        background: open
          ? `linear-gradient(120deg, hsla(${l.hue},58%,36%,.42), rgba(28,31,36,.82))`
          : `linear-gradient(120deg, hsla(${l.hue},48%,30%,${0.1 + strength * 0.2}), rgba(21,23,27,.78))`,
        border: `1px solid hsla(${l.hue}, 62%, 68%, ${open ? 0.5 : 0.2})`,
        backdropFilter: "blur(14px)",
      }}
      onMouseEnter={onCharge}
      onFocus={onCharge}
    >
      <button
        className="nt-focus"
        onClick={() => { onToggle(); onCharge(); }}
        aria-expanded={open}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 18, textAlign: "left",
          padding: "22px 24px", background: "transparent", border: "none", cursor: "pointer", color: ink,
        }}
      >
        <span style={{
          fontFamily: display, fontWeight: 200, fontSize: "2.4rem", lineHeight: 1, minWidth: 58,
          color: l.n <= 3 ? goldText : ink,
        }}>{l.n}</span>
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontFamily: display, fontWeight: 300, fontSize: "1.55rem", lineHeight: 1.2, color: ink }}>
            {l.name}
          </span>
          <span style={{ display: "block", marginTop: 8, fontSize: 16.5, lineHeight: 1.5, color: goldText, fontStyle: "italic" }}>
            {l.mantra}
          </span>
        </span>
        <span aria-hidden style={{ fontSize: 20, color: inkSecondary, transform: open ? "rotate(90deg)" : "none", transition: `transform .4s ${ease}` }}>›</span>
      </button>
      {open && (
        <div className="nt-unfurl" style={{ padding: "0 24px 26px 100px" }}>
          <p style={{ margin: 0, fontSize: 18.5, lineHeight: 1.75, color: inkSecondary }}>{l.gloss}</p>
          <div aria-hidden style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 20 }}>
            <span style={{ ...kicker, fontSize: 12 }}>Leverage</span>
            <span style={{ flex: 1, height: 8, borderRadius: 999, background: "rgba(255,255,255,.08)", overflow: "hidden" }}>
              <span style={{
                display: "block", height: "100%", width: `${strength * 100}%`, borderRadius: 999,
                background: l.n <= 3 ? gold : `hsl(${l.hue}, 72%, 64%)`,
                boxShadow: l.n <= 3 ? `0 0 18px -2px ${gold}` : "none",
                transition: `width .8s ${ease}`,
              }} />
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── THE MARKS ───────────────────────────────────────────────────────────────

function Marks({ marks, now, setMark }: { marks: Mark[]; now: number; setMark: (id: string, s: Mark["status"]) => void }) {
  const sorted = [...marks].sort((a, b) => b.createdAt - a.createdAt);
  const hits = marks.filter((m) => m.status === "true").length;
  // An honest rate: only Marks whose window has arrived, and that you've reckoned.
  // An early hit waits for its window like a miss must.
  const matured = marks.filter((m) => now >= m.dueAt);
  const reckoned = matured.filter((m) => m.status !== "pending");
  const unreckoned = matured.length - reckoned.length;
  const maturedHits = reckoned.filter((m) => m.status === "true").length;
  const rate = reckoned.length ? Math.round((maturedHits / reckoned.length) * 100) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
      <SectionHead kicker="The Marks" title="Held to account" sub="Every dated call Natari makes lands here with a countdown. When its window arrives, you tell her the truth. This is your scorecard, kept on this device." />

      {marks.length > 0 && (
        <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 180px), 1fr))" }}>
          <MiniStat n={String(marks.length)} l="watched" />
          <MiniStat n={String(hits)} l="came true" tone={goldText} />
          <MiniStat n={rate === null ? "—" : `${rate}%`} l="hit rate" tone={accent} />
          <MiniStat n={String(unreckoned)} l="unreckoned" tone={unreckoned ? gold : ink} />
        </div>
      )}
      {marks.length > 0 && (
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: inkSecondary }}>
          The hit rate counts only Marks whose window has arrived and been reckoned.
          {unreckoned > 0 && ` ${unreckoned} ${unreckoned === 1 ? "is" : "are"} waiting for your verdict.`}
        </p>
      )}

      {sorted.length === 0 && (
        <div className="nt-unfurl" style={{ ...glass, borderRadius: 24, padding: "56px 30px", textAlign: "center" }}>
          <div style={{ fontSize: 44, marginBottom: 18 }}>✦</div>
          <p style={{ margin: 0, fontSize: 19, lineHeight: 1.75, color: inkSecondary, maxWidth: 420, marginInline: "auto" }}>
            No marks yet. Ask Natari about something real, and every dated call she makes appears here — with a countdown, and one honest question when its window arrives.
          </p>
        </div>
      )}

      {sorted.map((m, i) => {
        const dueNow = now >= m.dueAt;
        const days = daysUntil(m.dueAt, now);
        const status = m.status === "true" ? { t: "Came true ✦", c: goldText }
          : m.status === "miss" ? { t: "The window passed — not this time", c: inkSecondary }
          : dueNow ? { t: "The window is open — did it land?", c: accent }
          : {
            t: days <= 0 ? `Comes due today · ${dueTime(m.dueAt)}`
              : days === 1 ? `Comes due tomorrow · ${dueDate(m.dueAt)}`
              : `Comes due in ${days} days · ${dueDate(m.dueAt)}`,
            c: signal,
          };
        return (
          <article key={m.id} className="nt-unfurl" style={{
            animationDelay: `${Math.min(i, 8) * 0.05}s`, borderRadius: 20, padding: "26px 24px",
            ...(m.status === "true"
              ? { background: "linear-gradient(160deg, rgba(232,196,107,.14), rgba(28,31,36,.8))", border: `1px solid rgba(232,196,107,.42)`, backdropFilter: "blur(16px)" }
              : glass),
          }}>
            <div style={{ ...kicker, fontSize: 12, marginBottom: 12 }}>
              {m.who === "mentor" ? "☾ Mentor" : "☉ Natari"} · on “{m.question.length > 46 ? m.question.slice(0, 46) + "…" : m.question}”
            </div>
            <p style={{ margin: 0, fontSize: 19.5, lineHeight: 1.65, color: m.status === "true" ? goldText : ink }}>{m.text}</p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, marginTop: 20, flexWrap: "wrap" }}>
              <span style={{ fontFamily: mono, fontSize: 13.5, letterSpacing: "0.06em", color: status.c }}>{status.t}</span>
              {m.status === "pending" ? (
                <span style={{ display: "flex", gap: 10 }}>
                  <button className="nt-press nt-focus" onClick={() => setMark(m.id, "true")}
                    style={{ padding: "11px 20px", borderRadius: 12, cursor: "pointer", fontFamily: mono, fontSize: 13, color: onGold, background: gold, border: `1px solid ${gold}` }}>
                    It came true ✦
                  </button>
                  {dueNow && (
                    <button className="nt-press nt-focus" onClick={() => setMark(m.id, "miss")}
                      style={{ padding: "11px 20px", borderRadius: 12, cursor: "pointer", fontFamily: mono, fontSize: 13, color: inkSecondary, background: "transparent", border: "1px solid rgba(167,139,255,.28)" }}>
                      Didn&apos;t happen
                    </button>
                  )}
                </span>
              ) : (
                <button className="nt-focus" onClick={() => setMark(m.id, "pending")}
                  style={{ padding: "8px 12px", borderRadius: 10, cursor: "pointer", fontFamily: mono, fontSize: 12, color: inkSecondary, background: "transparent", border: "none", letterSpacing: "0.08em" }}>
                  reopen
                </button>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}

function MiniStat({ n, l, tone = ink }: { n: string; l: string; tone?: string }) {
  return (
    <div style={{ ...glass, borderRadius: 18, padding: "20px 16px", textAlign: "center" }}>
      <div style={{ fontFamily: display, fontWeight: 300, fontSize: "2.1rem", lineHeight: 1, color: tone }}>{n}</div>
      <div style={{ ...kicker, fontSize: 12, marginTop: 8 }}>{l}</div>
    </div>
  );
}

// ── THE CONVERSATION ────────────────────────────────────────────────────────

function Conversation({ who, messages, thinking, onAsk, onBreathe }: {
  who: OracleId; messages: Msg[]; thinking: boolean; onAsk: (t: string) => void; onBreathe: () => void;
}) {
  // Each voice keeps its own thread — the Mentor never inherits the Oracle's.
  const mine = messages.filter((m) => (m.who ?? "natari") === who);
  const fresh = mine.filter((m) => m.role === "user").length === 0;
  const asks = who === "mentor" ? MENTOR_ASKS : ASKS;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {fresh && (
        <>
          <SectionHead
            kicker={who === "mentor" ? "The Mentor" : "The Oracle"}
            title={who === "mentor" ? "What's really going on?" : "Bring her the knot"}
            sub={who === "mentor"
              ? "Tell it plainly — not the tidy version. The Mentor will show you the shape you're standing inside and hand you one door you cannot fail at."
              : "A situation, a plan, a decision, a question about the years ahead. Natari reads the structure first, then casts."}
          />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {asks.map((q, i) => (
              <button key={q} className="nt-press nt-focus nt-ask" onClick={() => onAsk(q)}
                style={{
                  animation: `nt-unfurl .8s ${ease} ${i * 0.05}s both`,
                  padding: "14px 20px", borderRadius: 14, cursor: "pointer", textAlign: "left",
                  fontSize: 16.5, lineHeight: 1.45, color: inkSecondary, ...glass,
                }}>
                {q}
              </button>
            ))}
          </div>
          {who === "mentor" && (
            <button className="nt-press nt-focus" onClick={onBreathe}
              style={{ alignSelf: "flex-start", padding: "14px 24px", borderRadius: 14, cursor: "pointer", fontFamily: mono, fontSize: 13.5, letterSpacing: "0.12em", textTransform: "uppercase", color: goldText, background: "rgba(232,196,107,.1)", border: "1px solid rgba(232,196,107,.4)" }}>
              Or just breathe · 4-2-8
            </button>
          )}
        </>
      )}

      {mine.map((m) => m.role === "user"
        ? <UserTurn key={m.id} text={m.text ?? ""} />
        : (
          <Fragment key={m.id}>
            {m.segments?.length ? <Reading msg={m} /> : null}
            {/* pinned under the reading, live or local — and still there after a reload */}
            {m.crisis && (
              <CrisisCard palette={CRISIS_PALETTE} voice={who === "mentor"
                ? "You don't have to carry this alone. A real person is one tap away, any hour — reaching for them is strength, not defeat."
                : "Stay with me a moment. A real person is one tap away, any hour — and your story is longer than tonight."} />
            )}
          </Fragment>
        ))}

      {thinking && <Thinking who={who} />}
    </div>
  );
}

function UserTurn({ text }: { text: string }) {
  return (
    <div className="nt-unfurl" style={{ alignSelf: "flex-end", maxWidth: "86%" }}>
      <div style={{
        padding: "16px 22px", borderRadius: "20px 20px 6px 20px",
        background: "linear-gradient(160deg, rgba(167,139,255,.26), rgba(96,165,250,.14))",
        border: "1px solid rgba(167,139,255,.4)",
        fontSize: 17.5, lineHeight: 1.6, color: ink, whiteSpace: "pre-wrap", wordBreak: "break-word",
      }}>{text}</div>
    </div>
  );
}

function Reading({ msg }: { msg: Msg }) {
  const segs = shownSegs(msg);
  const streaming = !!msg.streaming;
  return (
    <article className="nt-unfurl" aria-busy={streaming} style={{ width: "100%" }}>
      <div style={{ ...kicker, fontSize: 12, marginBottom: 12 }}>
        {msg.who === "mentor" ? "☾ MotusMentor" : "☉ Natari"}
      </div>
      <div style={{ ...glass, borderRadius: "6px 24px 24px 24px", padding: "30px 28px", display: "flex", flexDirection: "column", gap: 26 }}>
        {segs.map((s, i) => {
          const spec = SEG[s.kind] ?? { label: s.kind, color: ink };
          const isLev = s.kind === "leverage";
          const isMark = s.kind === "mark";
          const n = isLev ? parseInt(s.meta.n, 10) : NaN;
          return (
            <div key={i} className="nt-unfurl" style={{
              ...(isMark || isLev ? {
                padding: "20px 22px", borderRadius: 16,
                background: isMark ? "rgba(232,196,107,.08)" : "rgba(167,139,255,.09)",
                border: `1px solid ${isMark ? "rgba(232,196,107,.35)" : "rgba(167,139,255,.3)"}`,
              } : {}),
            }}>
              {spec.label && (
                <div style={{ ...kicker, fontSize: 12, marginBottom: 12, color: isMark ? goldText : labelInk }}>
                  {isMark ? "✦ " : isLev ? "⟁ " : ""}{spec.label}
                </div>
              )}
              <p style={{
                margin: 0, whiteSpace: "pre-line",
                fontFamily: spec.big ? display : bodyFont,
                fontWeight: spec.big ? 300 : 400,
                fontSize: spec.big ? "clamp(1.35rem, 4.2vw, 1.75rem)" : 18.5,
                lineHeight: spec.big ? 1.5 : 1.75,
                color: spec.color,
                fontStyle: s.kind === "seal" ? "italic" : "normal",
              }}>
                {s.text}
                {streaming && i === segs.length - 1 && <span className="nt-cursor" />}
              </p>
              {isLev && n >= 1 && n <= 12 && <LadderBar n={n} />}
            </div>
          );
        })}
        {!streaming && msg.sigil && segs.length > 2 && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 14, borderTop: "1px solid rgba(167,139,255,.16)" }}>
            <span style={{ color: gold, fontSize: 15 }}>{msg.sigil}</span>
            <span style={{ ...kicker, fontSize: 11.5 }}>Read on the Davara Baseline</span>
          </div>
        )}
      </div>
    </article>
  );
}

function Thinking({ who }: { who: OracleId }) {
  return (
    <div className="nt-unfurl" style={{ display: "flex", alignItems: "center", gap: 14, padding: "8px 4px" }}>
      <span aria-hidden className="nt-think-dot" style={{ width: 12, height: 12, borderRadius: 999, background: violet, boxShadow: `0 0 22px ${violet}`, animation: "nt-drift 1.8s ease-in-out infinite" }} />
      <span className="nt-think-text" style={{
        fontFamily: mono, fontSize: 15, letterSpacing: "0.06em",
        background: `linear-gradient(90deg, ${inkSecondary} 25%, ${goldText} 50%, ${inkSecondary} 75%)`,
        backgroundSize: "220% 100%", backgroundClip: "text", WebkitBackgroundClip: "text",
        color: "transparent", animation: "nt-shimmer 2.4s linear infinite",
      }}>
        {who === "mentor" ? "Reading the shape you're inside…" : "Mapping the structure…"}
      </span>
    </div>
  );
}

export const CHANNEL_SIGNATURE = DAVARA_CHANNEL;
