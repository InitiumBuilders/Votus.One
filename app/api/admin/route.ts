import { NextRequest, NextResponse } from "next/server";
import kv, { keys } from "@/lib/kv";

// Simple admin auth — set VOTUS_ADMIN_KEY in Vercel env
function isAuthed(req: NextRequest): boolean {
  const key = process.env.VOTUS_ADMIN_KEY?.trim();
  if (!key) return false;
  const provided = (req.headers.get("x-admin-key") || req.nextUrl.searchParams.get("key") || "").trim();
  return provided === key;
}

export async function GET(req: NextRequest) {
  if (!isAuthed(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [
      totalDays, voterCount, subscriberCount,
      unitsCount, visitorTotal, launchDate,
    ] = await Promise.all([
      kv.get<number>(keys.launchVotes),
      kv.get<number>(keys.launchVoterCount),
      kv.scard(keys.subscriberEmails),
      kv.get<number>(keys.unitsCount),
      kv.get<number>(keys.visitorTotal),
      kv.get<string>(keys.launchDate),
    ]);

    // Get recent signups
    const recentSignups = await kv.lrange("votus:signups:log", 0, 19);
    const recentUnits = await kv.lrange("votus:units:log", 0, 19);

    // Get subscriber emails
    const emails = await kv.smembers(keys.subscriberEmails);

    return NextResponse.json({
      stats: {
        launchVoteDays: totalDays || 0,
        totalVoters: voterCount || 0,
        subscribers: subscriberCount || 0,
        units: unitsCount || 0,
        visitors: visitorTotal || 0,
        customLaunchDate: launchDate || null,
      },
      emails,
      recentSignups: recentSignups.map(s => typeof s === "string" ? JSON.parse(s) : s),
      recentUnits: recentUnits.map(u => typeof u === "string" ? JSON.parse(u) : u),
    });
  } catch (e) {
    console.error("admin GET:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST: admin actions (set launch date, set announcement, etc.)
export async function POST(req: NextRequest) {
  if (!isAuthed(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { action, value } = await req.json();

    switch (action) {
      case "set_launch_date":
        // ISO string like "2026-04-15T12:00:00-05:00"
        await kv.set(keys.launchDate, value);
        return NextResponse.json({ success: true, launchDate: value });

      case "set_announcement":
        if (value) {
          await kv.set(keys.siteAnnouncement, value);
        } else {
          await kv.del(keys.siteAnnouncement);
        }
        return NextResponse.json({ success: true });

      case "reset_votes":
        // Nuclear option — reset all vote data
        const voterKeys = await kv.keys("votus:launch:voter:*");
        if (voterKeys.length > 0) {
          for (const k of voterKeys) await kv.del(k);
        }
        await kv.set(keys.launchVotes, 0);
        await kv.set(keys.launchVoterCount, 0);
        return NextResponse.json({ success: true, message: "Votes reset" });

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (e) {
    console.error("admin POST:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
