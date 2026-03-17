import { NextRequest, NextResponse } from "next/server";
import kv, { keys } from "@/lib/kv";
import { createHash } from "crypto";

const LIVE_TTL = 300; // 5 minutes

function hashVisitor(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "unknown";
  return createHash("sha256").update(`votus-salt-${ip}`).digest("hex").slice(0, 16);
}

function today(): string {
  return new Date().toISOString().split("T")[0];
}

export async function POST(req: NextRequest) {
  try {
    const hash = hashVisitor(req);
    const dateKey = today();

    // Check if new unique visitor
    const isNew = await kv.sadd(keys.visitorSet, hash);
    if (isNew) {
      await kv.incr(keys.visitorTotal);
      await kv.incr(keys.visitorDaily(dateKey));
    }

    // Track live presence (expires in 5 min)
    await kv.set(`votus:visitors:live:${hash}`, 1, { ex: LIVE_TTL });

    // Get counts
    const [total, dailyCount] = await Promise.all([
      kv.get<number>(keys.visitorTotal),
      kv.get<number>(keys.visitorDaily(dateKey)),
    ]);

    // Estimate live count from recent set size
    // We'll use a sorted set with timestamps for accurate live count
    const now = Date.now();
    await kv.zadd("votus:visitors:live_zset", { score: now, member: hash });
    // Remove entries older than 5 min
    await kv.zremrangebyscore("votus:visitors:live_zset", 0, now - LIVE_TTL * 1000);
    const live = await kv.zcard("votus:visitors:live_zset");

    return NextResponse.json({
      total: total || 1,
      today: dailyCount || 1,
      live: live || 1,
    });
  } catch (e) {
    console.error("visitors POST:", e);
    return NextResponse.json({ total: 0, today: 0, live: 0 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const dateKey = today();
    const now = Date.now();

    // Clean stale live entries
    await kv.zremrangebyscore("votus:visitors:live_zset", 0, now - LIVE_TTL * 1000);

    const [total, dailyCount, live] = await Promise.all([
      kv.get<number>(keys.visitorTotal),
      kv.get<number>(keys.visitorDaily(dateKey)),
      kv.zcard("votus:visitors:live_zset"),
    ]);

    return NextResponse.json({
      total: total || 0,
      today: dailyCount || 0,
      live: live || 0,
    });
  } catch {
    return NextResponse.json({ total: 0, today: 0, live: 0 });
  }
}
