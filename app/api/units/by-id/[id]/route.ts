import { NextRequest, NextResponse } from "next/server";
import kv, { keys } from "@/lib/kv";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const raw = await kv.get<string>(keys.unit(id));
    if (!raw) return NextResponse.json({ error: "Unit not found." }, { status: 404 });
    const unit = typeof raw === "string" ? JSON.parse(raw) : raw;
    return NextResponse.json({ unit });
  } catch (e) {
    console.error("by-id GET:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
