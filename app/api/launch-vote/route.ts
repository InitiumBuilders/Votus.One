import { NextRequest, NextResponse } from "next/server";
import kv, { keys } from "@/lib/kv";

const MAX_VOTES = 3;

function getVisitorId(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "unknown";
  const ua = req.headers.get("user-agent") || "";
  let hash = 0;
  const str = ip + "|" + ua;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
  }
  return `v_${Math.abs(hash).toString(36)}`;
}

export async function POST(req: NextRequest) {
  try {
    const { direction } = await req.json();
    const delta = direction === "shorten" ? -1 : 1;
    const visitorId = getVisitorId(req);

    // Get current user votes
    const currentVotes = (await kv.get<number>(keys.launchVoter(visitorId))) || 0;
    const newVotes = currentVotes + delta;

    if (newVotes > MAX_VOTES) {
      const totalDays = (await kv.get<number>(keys.launchVotes)) || 0;
      return NextResponse.json({
        error: "max_extend", totalDays, userVotes: currentVotes, maxVotes: MAX_VOTES,
      }, { status: 429 });
    }
    if (newVotes < -MAX_VOTES) {
      const totalDays = (await kv.get<number>(keys.launchVotes)) || 0;
      return NextResponse.json({
        error: "max_shorten", totalDays, userVotes: currentVotes, maxVotes: MAX_VOTES,
      }, { status: 429 });
    }

    // Atomic updates
    await kv.set(keys.launchVoter(visitorId), newVotes);
    const totalDays = await kv.incrby(keys.launchVotes, delta);

    // Track voter count (only on first vote)
    if (currentVotes === 0) await kv.incr(keys.launchVoterCount);

    return NextResponse.json({
      success: true, totalDays, userVotes: newVotes,
      maxVotes: MAX_VOTES, direction,
    });
  } catch (e) {
    console.error("launch-vote POST:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const visitorId = getVisitorId(req);
    const [totalDays, userVotes, voterCount] = await Promise.all([
      kv.get<number>(keys.launchVotes),
      kv.get<number>(keys.launchVoter(visitorId)),
      kv.get<number>(keys.launchVoterCount),
    ]);
    return NextResponse.json({
      totalDays: totalDays || 0,
      userVotes: userVotes || 0,
      maxVotes: MAX_VOTES,
      totalVoters: voterCount || 0,
    });
  } catch (e) {
    console.error("launch-vote GET:", e);
    return NextResponse.json({ totalDays: 0, userVotes: 0, maxVotes: MAX_VOTES, totalVoters: 0 });
  }
}
