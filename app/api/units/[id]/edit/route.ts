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

    // Only founder or admin can edit
    if (unit.founderId !== session.userId) {
      return NextResponse.json({ error: "You can only edit your own unit." }, { status: 403 });
    }

    const body = await req.json();
    const allowed = ["purpose", "website", "discord", "imageUrl", "videoUrl", "nextMeeting", "meetingLocation", "meetingRecurring", "name", "city", "state"];
    const updates: Record<string, string> = {};
    for (const key of allowed) {
      if (body[key] !== undefined) updates[key] = body[key];
    }

    const updated = { ...unit, ...updates, updatedAt: new Date().toISOString() };
    await kv.set(keys.unit(id), JSON.stringify(updated));

    return NextResponse.json({ success: true, unit: updated });
  } catch (e) {
    console.error("unit edit:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
