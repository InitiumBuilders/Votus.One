import { divine, readingToMarkup, type OracleId } from "../../../components/nat-future/oracle";
import { systemFor } from "../../../components/nat-future/personas";
import { buildMessages, clip, guard, readAsk, runLive, trace } from "../../../lib/oracle-route";

// The oracle speaks live. This route streams a reading token-by-token:
//   • If ANTHROPIC_API_KEY is set → the real Davara Baseline (Claude), adaptive
//     and remembering the conversation.
//   • If not → the local divination engine, streamed the same way, so the site
//     is never mute. Either way the client receives the same marker format.
// The door — caps, guard, leash, trace — is shared with /api/natari
// (lib/oracle-route).

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const ROUTE = "oracle";
const MODEL = "claude-opus-4-8";

// When the live channel breaks mid-cast, the seal each voice ends on.
const CUT: Record<OracleId, string> = {
  nat: "The thread thinned before the weave was done — ask again.",
  natalie: "Ugh — the signal dropped mid-vision. Ask me again.",
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function streamLocalReading(
  message: string,
  oracle: OracleId,
  send: (chunk: string) => void,
  isClosed: () => boolean,
) {
  const markup = readingToMarkup(divine(message, oracle));
  const tokens = markup.match(/\s+|\S+/g) ?? [markup];
  for (const tok of tokens) {
    if (isClosed()) return;
    send(tok);
    await sleep(16 + Math.random() * 22);
  }
}

export async function POST(req: Request) {
  const refused = guard(req, ROUTE);
  if (refused) return refused;
  const ask = await readAsk(req);
  if (ask instanceof Response) return ask;

  const oracle: OracleId = ask.oracle === "natalie" ? "natalie" : "nat";
  const { message, history } = ask;

  const encoder = new TextEncoder();
  const hasKey = !!process.env.ANTHROPIC_API_KEY;
  const done = trace(ROUTE, oracle, message, history);
  let closed = false;
  const upstream = new AbortController();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let out = "";
      let source: "live" | "local" = "local";
      let failReason: string | null = hasKey ? null : "no_key";
      // Every write and the final close are guarded: once the client
      // disconnects, the controller is cancelled and any enqueue/close throws.
      const send = (chunk: string) => {
        if (closed || !chunk) return;
        try {
          controller.enqueue(encoder.encode(chunk));
          out += chunk;
        } catch {
          closed = true;
        }
      };
      const finish = () => {
        if (closed) return;
        closed = true;
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      };

      try {
        if (hasKey) {
          const live = await runLive(
            ROUTE,
            {
              model: MODEL,
              max_tokens: 700,
              output_config: { effort: "low" },
              system: systemFor(oracle),
              messages: buildMessages(history, message),
            },
            CUT[oracle],
            upstream,
            send,
            () => closed,
          );
          if (live.usedLive) source = "live";
          failReason = live.failReason;
          // Only weave locally if the live model produced nothing (avoid a
          // doubled reading), and only if the client is still listening.
          if (!live.usedLive && !closed) {
            await streamLocalReading(message, oracle, send, () => closed);
          }
        } else {
          await streamLocalReading(message, oracle, send, () => closed);
        }
      } catch (err) {
        /* the threads keep their silence — but the log does not */
        failReason = failReason ?? "local_error";
        console.error(`[${ROUTE}] reading failed`, err instanceof Error ? clip(err.message, 300) : "error");
      }
      finish();
      done(source, failReason, out);
    },
    cancel() {
      closed = true;
      try {
        upstream.abort();
      } catch {
        /* */
      }
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
