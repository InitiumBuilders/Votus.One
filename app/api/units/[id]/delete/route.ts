import { NextRequest, NextResponse } from "next/server";
import kv, { keys } from "@/lib/kv";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getUserFromRequest(req);
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  try {
    const { id } = await params;
    const raw = await kv.get<string>(keys.unit(id));
    if (!raw) return NextResponse.json({ error: "Unit not found." }, { status: 404 });

    const unit = typeof raw === "string" ? JSON.parse(raw) : raw;

    // Only founder can delete
    if (unit.founderId !== session.userId) {
      return NextResponse.json({ error: "You can only delete your own unit." }, { status: 403 });
    }

    // Delete unit record + slug mapping + members + views
    await Promise.all([
      kv.del(keys.unit(id)),
      kv.del(keys.unitBySlug(unit.slug)),
      kv.del(keys.unitMembers(id)),
      kv.del(keys.unitViews(id)),
    ]);

    // Remove from list
    const list = await kv.lrange<string>(keys.unitsList, 0, 200);
    const filtered = list.filter((item) => {
      try {
        const u = typeof item === "string" ? JSON.parse(item) : item;
        return u.id !== id;
      } catch { return false; }
    });
    await kv.del(keys.unitsList);
    for (const item of filtered) {
      await kv.lpush(keys.unitsList, item);
    }

    // Remove from user's unitIds
    const userRaw = await kv.get<string>(keys.userById(session.userId));
    if (userRaw) {
      const user = typeof userRaw === "string" ? JSON.parse(userRaw) : userRaw;
      user.unitIds = (user.unitIds || []).filter((uid: string) => uid !== id);
      await Promise.all([
        kv.set(keys.userById(session.userId), JSON.stringify(user)),
        kv.set(keys.userByEmail(user.email), JSON.stringify(user)),
      ]);
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("unit delete:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
