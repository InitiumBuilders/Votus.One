import Anthropic from "@anthropic-ai/sdk";
import { divine, readingToMarkup, type OracleId } from "../../../components/natari/natari";
import { systemFor } from "../../../components/natari/personas";

// Natari speaks live. Streams a reading token-by-token from the Davara
// Baseline (Claude) when ANTHROPIC_API_KEY is set; otherwise streams the local
// engine in the identical marker language, so she is never mute.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MODEL = "claude-opus-4-8";

interface Turn { role: "user" | "assistant"; content: string }
interface Req { oracle?: OracleId; message?: string; history?: Turn[] }

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

// The Messages API requires a leading user turn; the client's history opens
// with Natari's greeting.
function buildMessages(history: Turn[], message: string): Turn[] {
  const h = [...history];
  while (h.length && h[0].role === "assistant") h.shift();
  return [...h, { role: "user", content: message }];
}

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
  let body: Req;
  try { body = (await req.json()) as Req; } catch { return new Response("Bad request", { status: 400 }); }

  const who: OracleId = body.oracle === "mentor" ? "mentor" : "natari";
  const message = (body.message ?? "").toString().slice(0, 4000).trim();
  if (!message) return new Response("Empty question", { status: 400 });
  const history = cleanHistory(body.history);

  const encoder = new TextEncoder();
  const hasKey = !!process.env.ANTHROPIC_API_KEY;
  let closed = false;
  const upstream = new AbortController();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (chunk: string) => {
        if (closed || !chunk) return;
        try { controller.enqueue(encoder.encode(chunk)); } catch { closed = true; }
      };
      const finish = () => {
        if (closed) return;
        closed = true;
        try { controller.close(); } catch { /* already closed */ }
      };

      try {
        let usedLive = false;
        if (hasKey) {
          try {
            const client = new Anthropic();
            const aiStream = client.messages.stream(
              {
                model: MODEL,
                max_tokens: 900,
                output_config: { effort: "low" },
                system: systemFor(who),
                messages: buildMessages(history, message),
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
          } catch { /* the channel wavered — fall to the local weave */ }
          if (!usedLive && !closed) await streamLocal(message, who, send, () => closed);
        } else {
          await streamLocal(message, who, send, () => closed);
        }
      } catch { /* the threads keep their silence */ }
      finish();
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
