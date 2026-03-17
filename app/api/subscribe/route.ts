import { NextRequest, NextResponse } from "next/server";
import kv, { keys } from "@/lib/kv";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // Check if already subscribed (set membership)
    const isMember = await kv.sismember(keys.subscriberEmails, email);
    if (isMember) {
      const count = await kv.scard(keys.subscriberEmails);
      return NextResponse.json({ count, already: true });
    }

    // Add to set + increment counter
    await kv.sadd(keys.subscriberEmails, email);
    const count = await kv.scard(keys.subscriberEmails);

    // Log signup with timestamp
    await kv.lpush(`votus:signups:log`, JSON.stringify({
      email, timestamp: new Date().toISOString(),
    }));

    return NextResponse.json({ count, success: true });
  } catch (e) {
    console.error("subscribe POST:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const count = await kv.scard(keys.subscriberEmails);
    return NextResponse.json({ count: count || 0 });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
