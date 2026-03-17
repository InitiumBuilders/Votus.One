import { NextRequest, NextResponse } from "next/server";
import kv, { keys } from "@/lib/kv";
import { getUserFromRequest, type VotusUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getUserFromRequest(req);
    const body = await req.json();
    const {
      name, email, unitName, city, state: st, purpose,
      website, discord, imageUrl, videoUrl, slug,
      nextMeeting, meetingLocation, meetingRecurring,
    } = body;

    if (!name || !email || !unitName) {
      return NextResponse.json({ error: "Name, email, and unit name required." }, { status: 400 });
    }

    // Validate + reserve slug
    const cleanSlug = (slug || unitName).toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    if (cleanSlug.length < 2) {
      return NextResponse.json({ error: "Unit handle too short." }, { status: 400 });
    }
    const slugExists = await kv.get(keys.unitBySlug(cleanSlug));
    if (slugExists) {
      return NextResponse.json({ error: "That handle is already taken. Choose another." }, { status: 409 });
    }

    const count = await kv.incr(keys.unitsCount);
    const id = `VU-${String(count).padStart(4, "0")}`;

    const unit = {
      id,
      slug: cleanSlug,
      name: unitName,
      founder: name,
      founderId: session?.userId || null,
      email,
      city: city || "",
      state: st || "",
      purpose: purpose || "",
      website: website || "",
      discord: discord || "",
      imageUrl: imageUrl || "",
      videoUrl: videoUrl || "",
      votes: 0,
      members: 1,
      views: 0,
      nextMeeting: nextMeeting || "",
      meetingLocation: meetingLocation || "",
      meetingRecurring: meetingRecurring || "",
      created: new Date().toISOString(),
      status: "active",
    };

    await Promise.all([
      kv.set(keys.unit(id), JSON.stringify(unit)),
      kv.set(keys.unitBySlug(cleanSlug), id),
      kv.lpush(keys.unitsList, JSON.stringify(unit)),
      kv.sadd(keys.subscriberEmails, email),
      // Initialize member list with founder
      kv.lpush(keys.unitMembers(id), JSON.stringify({ name, email, role: "Founder", joined: new Date().toISOString() })),
    ]);

    // Link unit to user account
    if (session?.userId) {
      const userRaw = await kv.get<string>(keys.userById(session.userId));
      if (userRaw) {
        const user: VotusUser = typeof userRaw === "string" ? JSON.parse(userRaw) : userRaw;
        user.unitIds = [...(user.unitIds || []), id];
        await Promise.all([
          kv.set(keys.userById(session.userId), JSON.stringify(user)),
          kv.set(keys.userByEmail(user.email), JSON.stringify(user)),
        ]);
      }
    }

    await kv.lpush("votus:units:log", JSON.stringify({ id, unitName, founder: name, email, created: unit.created }));

    return NextResponse.json({ success: true, unit });
  } catch (e) {
    console.error("units POST:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const raw = await kv.lrange<string>(keys.unitsList, 0, 200);
    const units = raw.map((item) => {
      try { return typeof item === "string" ? JSON.parse(item) : item; } catch { return null; }
    }).filter(Boolean);

    const seen = new Set<string>();
    const deduped = units.filter((u: { id: string }) => {
      if (seen.has(u.id)) return false;
      seen.add(u.id);
      return true;
    });

    // Fetch fresh vote counts from individual unit records
    const fresh = await Promise.all(
      deduped.map(async (u: { id: string }) => {
        try {
          const r = await kv.get<string>(keys.unit(u.id));
          return r ? (typeof r === "string" ? JSON.parse(r) : r) : u;
        } catch { return u; }
      })
    );

    fresh.sort((a: { votes?: number; created?: string }, b: { votes?: number; created?: string }) =>
      (b.votes || 0) - (a.votes || 0) ||
      new Date(b.created || 0).getTime() - new Date(a.created || 0).getTime()
    );

    const count = (await kv.get<number>(keys.unitsCount)) || fresh.length;
    return NextResponse.json({ units: fresh, count });
  } catch (e) {
    console.error("units GET:", e);
    return NextResponse.json({ units: [], count: 0 });
  }
}
