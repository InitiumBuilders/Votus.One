import { NextRequest, NextResponse } from "next/server";
import kv, { keys } from "@/lib/kv";
import { hashPassword, createSession, type VotusUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password required." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const emailKey = keys.userByEmail(email);
    const existing = await kv.get(emailKey);
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const id = `USR-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const passwordHash = await hashPassword(password);

    const user: VotusUser = {
      id, email: email.toLowerCase(), name,
      passwordHash, created: new Date().toISOString(), unitIds: [],
    };

    await Promise.all([
      kv.set(emailKey, JSON.stringify(user)),
      kv.set(keys.userById(id), JSON.stringify(user)),
      kv.lpush(keys.usersList, id),
    ]);

    const token = await createSession(user);

    const res = NextResponse.json({ success: true, user: { id, email: user.email, name } });
    res.cookies.set("votus_session", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });
    return res;
  } catch (e) {
    console.error("register:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
