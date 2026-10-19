import Anthropic from "@anthropic-ai/sdk";
import { isCrisis } from "./safety";

// The plumbing both oracle routes share — /api/natari and /api/oracle. Each
// route keeps its own persona, its own weave, its own stream; this file keeps
// the door: what may come in, how much, from where, how often, how the live
// channel is leashed, and the one line each sitting leaves in the log. Never
// the words themselves.

export interface Turn { role: "user" | "assistant"; content: string }

// Caps, in UTF-16 units. Roomy for a person, dull for a script.
const MAX_MESSAGE = 4000;
const MAX_TURN = 3000;
const MAX_TURNS = 12;
const MAX_HISTORY = 16000;

/** Slice to n UTF-16 units without leaving half a surrogate pair behind. */
export function clip(s: string, n: number): string {
  if (s.length <= n) return s;
  const c = s.charCodeAt(n - 1);
  return s.slice(0, c >= 0xd800 && c <= 0xdbff ? n - 1 : n);
}

/** The newest turns that fit: 12 at most, each clipped, oldest falling away first. */
export function cleanHistory(history: unknown): Turn[] {
  if (!Array.isArray(history)) return [];
  const kept: Turn[] = [];
  let total = 0;
  for (let i = history.length - 1; i >= 0 && kept.length < MAX_TURNS; i--) {
    const t = history[i];
    if (!t || typeof t !== "object") continue;
    const { role, content } = t as Partial<Turn>;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string" || !content.trim()) continue;
    const c = clip(content, MAX_TURN);
    if (!c.trim()) continue;
    if (total + c.length > MAX_HISTORY) break;
    total += c.length;
    kept.unshift({ role, content: c });
  }
  return kept;
}

// The Messages API requires a leading user turn; the client's history opens
// with the oracle's greeting (an assistant turn), so drop any leading ones.
export function buildMessages(history: Turn[], message: string): Turn[] {
  const h = [...history];
  while (h.length && h[0].role === "assistant") h.shift();
  return [...h, { role: "user", content: message }];
}

export interface Ask { oracle: unknown; message: string; history: Turn[] }

/** Read the body: an object, a string question, a clean history — or a 400. */
export async function readAsk(req: Request): Promise<Ask | Response> {
  let body: unknown;
  try { body = await req.json(); } catch { return new Response("Bad request", { status: 400 }); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return new Response("Bad request", { status: 400 });
  const { oracle, message, history } = body as Record<string, unknown>;
  if (typeof message !== "string") return new Response("Bad request", { status: 400 });
  const m = clip(message, MAX_MESSAGE).trim();
  if (!m) return new Response("Empty question", { status: 400 });
  return { oracle, message: m, history: cleanHistory(history) };
}

// ── the guard ───────────────────────────────────────────────────────────────
// Best-effort, per instance: each warm function keeps its own small ledger,
// so this only blunts one hot loop from one address. The real ceiling is a
// Vercel WAF rate-limit rule on /api/natari + /api/oracle, and the spend
// limit on the Anthropic workspace that owns the key.
const WINDOW_MS = 60_000;
const PER_WINDOW = 20;
const MAX_IPS = 5000;
const ledger = new Map<string, { start: number; n: number }>();

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for")?.split(",")[0].trim();
  return fwd || req.headers.get("x-real-ip")?.trim() || "unknown";
}

/** Same-site and rate checks. Returns the refusal, or null to let the asker in. */
export function guard(req: Request, route: string): Response | null {
  // Anti-embedding only — curl sends any Origin it likes, but a page on
  // another site cannot, so it can't spend the key through a visitor.
  const origin = req.headers.get("origin");
  if (origin) {
    let from = "";
    try { from = new URL(origin).host; } catch { /* "null", or noise */ }
    const host = (req.headers.get("host") ?? "").toLowerCase();
    if (from !== host) {
      console.warn(JSON.stringify({ route, refused: 403, from, host }));
      return new Response("Forbidden", { status: 403 });
    }
  }

  const now = Date.now();
  // Entries sit in window order, so the stale (and any overflow) sweep off the front.
  for (const [k, w] of ledger) {
    if (now - w.start < WINDOW_MS && ledger.size < MAX_IPS) break;
    ledger.delete(k);
  }
  const ip = clientIp(req);
  const w = ledger.get(ip);
  if (!w || now - w.start >= WINDOW_MS) {
    ledger.delete(ip);
    ledger.set(ip, { start: now, n: 1 });
    return null;
  }
  if (++w.n <= PER_WINDOW) return null;
  if (w.n === PER_WINDOW + 1) console.warn(JSON.stringify({ route, refused: 429 }));
  const wait = Math.max(1, Math.ceil((w.start + WINDOW_MS - now) / 1000));
  return new Response("Too many requests", { status: 429, headers: { "retry-after": String(wait) } });
}

// ── the live channel ────────────────────────────────────────────────────────
// A short leash: 20s to answer, no retry — the local weave is the retry — and
// a first-token watchdog: past 15s of silence the call is cut and the local
// weave still lands well inside maxDuration. (A retry would sleep out any
// retry-after the API names, deaf to the watchdog.) Once words flow, the same
// watchdog guards each gap, and a hard deadline keeps the seal inside 60s.
const FIRST_TOKEN_MS = 15_000;
const STALL_MS = 12_000;
const DEADLINE_MS = 48_000;

function reasonOf(err: unknown): string {
  if (err instanceof Anthropic.APIUserAbortError) return "aborted";
  if (err instanceof Anthropic.APIConnectionTimeoutError) return "timeout";
  if (err instanceof Anthropic.APIConnectionError) return "connection";
  if (err instanceof Anthropic.APIError) return err.status ? String(err.status) : err.type ?? "stream_error";
  return "error";
}

// A reading cut mid-stream still ends where the eye can see it. If the cut
// fell inside a [[MARKER|…, void its numbers before closing it; the seal is
// marked |cut=1 so the clients never file a Mark the cut landed inside.
export function cutSeal(said: string, line: string): string {
  if (/\[\[SEAL[\]|]/i.test(said)) return "";
  const open = said.lastIndexOf("[[");
  const dangling = open > said.lastIndexOf("]]") && said.slice(open).includes("|") && !said.endsWith("]");
  return `${dangling ? "|days=|n=]]" : ""}\n[[SEAL|cut=1]]\n${line}`;
}

/**
 * Stream the live model into `send`. Every failure is logged — status and SDK
 * message, never the asker's words — and named for the trace. If the channel
 * breaks after words were sent, `cutLine` seals the reading in its own voice.
 */
export async function runLive(
  route: string,
  params: Anthropic.MessageStreamParams,
  cutLine: string,
  upstream: AbortController,
  send: (chunk: string) => void,
  isClosed: () => boolean,
): Promise<{ usedLive: boolean; failReason: string | null }> {
  let said = "";
  let failReason: string | null = null;
  let err: unknown;
  let timedOut = false;
  const cut = () => { timedOut = true; upstream.abort(); };
  let watchdog = setTimeout(cut, FIRST_TOKEN_MS);
  const deadline = setTimeout(cut, DEADLINE_MS);
  try {
    const client = new Anthropic({ timeout: 20_000, maxRetries: 0 });
    const aiStream = client.messages.stream(params, { signal: upstream.signal });
    for await (const event of aiStream) {
      if (isClosed()) break;
      if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
        clearTimeout(watchdog);
        watchdog = setTimeout(cut, STALL_MS);
        said += event.delta.text;
        send(event.delta.text);
      } else if (event.type === "message_delta" && (event.delta.stop_reason === "max_tokens" || event.delta.stop_reason === "refusal")) {
        failReason = event.delta.stop_reason;
      }
    }
  } catch (e) {
    err = e;
    failReason = reasonOf(e);
  } finally {
    clearTimeout(watchdog);
    clearTimeout(deadline);
  }

  const usedLive = !!said.trim();
  // A status the API did send outranks the silence that followed it.
  if (timedOut && !said && !(err instanceof Anthropic.APIError && err.status)) failReason = "first_token_timeout";
  else if (timedOut && said && !isClosed()) failReason = "stall";
  else if (isClosed()) return { usedLive, failReason: "client_closed" };
  else if (!usedLive && !failReason) failReason = "empty";

  if (failReason) {
    console.error(`[${route}] live failed`, JSON.stringify({
      reason: failReason,
      status: err instanceof Anthropic.APIError ? err.status ?? null : null,
      message: err instanceof Error ? clip(err.message, 300) : null,
    }));
    if (usedLive) send(cutSeal(said, cutLine));
  }
  return { usedLive, failReason };
}

// ── the trace ───────────────────────────────────────────────────────────────
// One JSON line per sitting, written as it closes: counts and shapes only.
const MARKER = /\[\[([A-Za-z]+)((?:\|[^\]|]*)*)\]\]/g;

// Last key wins, as in the clients' parseMeta.
function metaNum(meta: string, key: string): number | null {
  let n: number | null = null;
  for (const part of meta.split("|")) {
    const i = part.indexOf("=");
    if (i > 0 && part.slice(0, i).trim() === key) {
      const v = parseInt(part.slice(i + 1), 10);
      n = Number.isFinite(v) ? v : null;
    }
  }
  return n;
}

export function trace(route: string, who: string, message: string, history: Turn[]) {
  const t0 = Date.now();
  const inChars = history.reduce((n, t) => n + t.content.length, message.length);
  return (source: "live" | "local", failReason: string | null, out: string) => {
    const kinds: string[] = [];
    let lever: number | null = null;
    let markDays: number | null = null;
    for (const m of out.matchAll(MARKER)) {
      const kind = m[1].toUpperCase();
      kinds.push(kind);
      if (kind === "LEVERAGE" && lever === null) lever = metaNum(m[2], "n");
      if (kind === "MARK" && markDays === null) markDays = metaNum(m[2], "days");
    }
    console.log(JSON.stringify({
      route, who, source, failReason, crisis: isCrisis(message),
      ms: Date.now() - t0, histTurns: history.length, inChars, outChars: out.length,
      kinds, lever, markDays,
    }));
  };
}
