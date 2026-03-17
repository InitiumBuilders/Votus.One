import { NextRequest, NextResponse } from "next/server";
import kv, { keys } from "@/lib/kv";
import { getUserFromRequest, type VotusUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getUserFromRequest(req);
  if (!session) return NextResponse.json({ user: null });

  try {
    const raw = await kv.get<string>(keys.userById(session.userId));
    if (!raw) return NextResponse.json({ user: null });
    const user: VotusUser = typeof raw === "string" ? JSON.parse(raw) : raw;
    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, unitIds: user.unitIds }
    });
  } catch {
    return NextResponse.json({ user: null });
  }
}
