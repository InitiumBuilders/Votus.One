import { divine, readingToMarkup, type OracleId } from "../../../components/natari/natari";
import { systemFor } from "../../../components/natari/personas";
import { buildMessages, clip, guard, readAsk, runLive, trace } from "../../../lib/oracle-route";

// Natari speaks live. Streams a reading token-by-token from the Davara
// Baseline (Claude) when ANTHROPIC_API_KEY is set; otherwise streams the local
// engine in the identical marker language, so she is never mute. The door —
// caps, guard, leash, trace — is shared with /api/oracle (lib/oracle-route).

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const ROUTE = "natari";
const MODEL = "claude-opus-4-8";

// When the live channel breaks mid-reading, the seal she ends on.
const CUT: Record<OracleId, string> = {
  natari: "The channel thinned — ask again.",
  mentor: "The channel thinned — breathe, then ask again.",
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function streamLocal(message: string, who: OracleId, send: (c: string) => void, closed: () => boolean) {
  const markup = readingToMarkup(divine(message, who));
  const tokens = markup.match(/\s+|\S+/g) ?? [markup];
  for (const tok of tokens) {
    if (closed()) return;
    send(tok);
    await sleep(14 + Math.random() * 20);
  }
}

export async function POST(req: Request) {
  const refused = guard(req, ROUTE);
  if (refused) return refused;
  const ask = await readAsk(req);
  if (ask instanceof Response) return ask;

  const who: OracleId = ask.oracle === "mentor" ? "mentor" : "natari";
  const { message, history } = ask;

  const encoder = new TextEncoder();
  const hasKey = !!process.env.ANTHROPIC_API_KEY;
  const done = trace(ROUTE, who, message, history);
  let closed = false;
  const upstream = new AbortController();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let out = "";
      let source: "live" | "local" = "local";
      let failReason: string | null = hasKey ? null : "no_key";
      const send = (chunk: string) => {
        if (closed || !chunk) return;
        try { controller.enqueue(encoder.encode(chunk)); out += chunk; } catch { closed = true; }
      };
      const finish = () => {
        if (closed) return;
        closed = true;
        try { controller.close(); } catch { /* already closed */ }
      };

      try {
        if (hasKey) {
          const live = await runLive(ROUTE, {
            model: MODEL,
            max_tokens: 900,
            output_config: { effort: "low" },
            system: systemFor(who),
            messages: buildMessages(history, message),
          }, CUT[who], upstream, send, () => closed);
          if (live.usedLive) source = "live";
          failReason = live.failReason;
          // Only weave locally if the live model produced nothing (avoid a
          // doubled reading), and only if the client is still listening.
          if (!live.usedLive && !closed) await streamLocal(message, who, send, () => closed);
        } else {
          await streamLocal(message, who, send, () => closed);
        }
      } catch (err) {
        // the threads keep their silence — but the log does not
        failReason = failReason ?? "local_error";
        console.error(`[${ROUTE}] reading failed`, err instanceof Error ? clip(err.message, 300) : "error");
      }
      finish();
      done(source, failReason, out);
    },
    cancel() {
      closed = true;
      try { upstream.abort(); } catch { /* */ }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store, no-transform",
      "x-accel-buffering": "no",
    },
  });
}
