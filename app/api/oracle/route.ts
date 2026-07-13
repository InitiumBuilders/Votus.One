import Anthropic from "@anthropic-ai/sdk";
import { divine, readingToMarkup, type OracleId } from "../../../components/nat-future/oracle";
import { systemFor } from "../../../components/nat-future/personas";

// The oracle speaks live. This route streams a reading token-by-token:
//   • If ANTHROPIC_API_KEY is set → the real Davara Baseline (Claude), adaptive
//     and remembering the conversation.
//   • If not → the local divination engine, streamed the same way, so the site
//     is never mute. Either way the client receives the same marker format.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MODEL = "claude-opus-4-8";

interface Turn {
  role: "user" | "assistant";
  content: string;
}

interface OracleRequest {
  oracle?: OracleId;
  message?: string;
  history?: Turn[];
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function cleanHistory(history: unknown): Turn[] {
  if (!Array.isArray(history)) return [];
  const turns: Turn[] = [];
  for (const t of history) {
    if (!t || typeof t !== "object") continue;
    const role = (t as Turn).role;
    const content = (t as Turn).content;
    if ((role === "user" || role === "assistant") && typeof content === "string" && content.trim()) {
      turns.push({ role, content: content.slice(0, 4000) });
    }
  }
  return turns.slice(-16);
}

// The Messages API requires the first turn to be role "user". The client's
// history opens with the oracle's greeting (an assistant turn), so drop any
// leading assistant turns before appending the new question.
function buildMessages(history: Turn[], message: string): Turn[] {
  const h = [...history];
  while (h.length && h[0].role === "assistant") h.shift();
  return [...h, { role: "user", content: message }];
}

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
  let body: OracleRequest;
  try {
    body = (await req.json()) as OracleRequest;
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  const oracle: OracleId = body.oracle === "natalie" ? "natalie" : "nat";
  const message = (body.message ?? "").toString().slice(0, 4000).trim();
  if (!message) return new Response("Empty question", { status: 400 });
  const history = cleanHistory(body.history);

  const encoder = new TextEncoder();
  const hasKey = !!process.env.ANTHROPIC_API_KEY;
  let closed = false;
  const upstream = new AbortController();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      // Every write and the final close are guarded: once the client
      // disconnects, the controller is cancelled and any enqueue/close throws.
      const send = (chunk: string) => {
        if (closed || !chunk) return;
        try {
          controller.enqueue(encoder.encode(chunk));
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
        let usedLive = false;
        if (hasKey) {
          try {
            const client = new Anthropic();
            const messages = buildMessages(history, message);
            const aiStream = client.messages.stream(
              {
                model: MODEL,
                max_tokens: 700,
                output_config: { effort: "low" },
                system: systemFor(oracle),
                messages,
              },
              { signal: upstream.signal },
            );
            for await (const event of aiStream) {
              if (closed) break;
              if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
                usedLive = true;
                send(event.delta.text);
              }
            }
          } catch {
            /* the channel wavered — fall to the local weave below */
          }
          // Only weave locally if the live model produced nothing (avoid a
          // doubled reading), and only if the client is still listening.
          if (!usedLive && !closed) {
            await streamLocalReading(message, oracle, send, () => closed);
          }
        } else {
          await streamLocalReading(message, oracle, send, () => closed);
        }
      } catch {
        /* the threads keep their silence */
      }
      finish();
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
