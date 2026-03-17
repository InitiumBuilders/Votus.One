import { NextRequest, NextResponse } from "next/server";
import kv, { keys } from "@/lib/kv";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const raw = await kv.get<string>(keys.unit(id));
    if (!raw) {
      return NextResponse.json({ error: "Unit not found" }, { status: 404 });
    }

    const unit = typeof raw === "string" ? JSON.parse(raw) : raw;
    unit.votes = (unit.votes || 0) + 1;

    // Update the unit record
    await kv.set(keys.unit(id), JSON.stringify(unit));

    // Also update the list entry — rebuild the list item
    // We store votes separately for quick access
    await kv.set(`votus:units:votes:${id}`, unit.votes);

    return NextResponse.json({ success: true, votes: unit.votes });
  } catch (e) {
    console.error("vote POST:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
