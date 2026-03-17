import { NextRequest, NextResponse } from "next/server";
import kv, { keys } from "@/lib/kv";
import { hashPassword, createSession, type VotusUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required." }, { status: 400 });
    }

    const raw = await kv.get<string>(keys.userByEmail(email));
    if (!raw) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const user: VotusUser = typeof raw === "string" ? JSON.parse(raw) : raw;
    const hash = await hashPassword(password);
    if (hash !== user.passwordHash) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const token = await createSession(user);

    const res = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name, unitIds: user.unitIds }
    });
    res.cookies.set("votus_session", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });
    return res;
  } catch (e) {
    console.error("login:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
