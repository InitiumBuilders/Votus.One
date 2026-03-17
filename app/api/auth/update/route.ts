import { NextRequest, NextResponse } from "next/server";
import kv, { keys } from "@/lib/kv";
import { getUserFromRequest, hashPassword, type VotusUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getUserFromRequest(req);
  if (!session) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  try {
    const body = await req.json();
    const { action } = body;

    const userRaw = await kv.get<string>(keys.userById(session.userId));
    if (!userRaw) return NextResponse.json({ error: "User not found." }, { status: 404 });
    const user: VotusUser & {
      backupEmail?: string;
      avatarUrl?: string;
      bio?: string;
    } = typeof userRaw === "string" ? JSON.parse(userRaw) : userRaw;

    if (action === "change_password") {
      const { currentPassword, newPassword } = body;
      if (!newPassword || newPassword.length < 8) {
        return NextResponse.json({ error: "New password must be at least 8 characters." }, { status: 400 });
      }
      // Allow setting password if user has no password yet (first time)
      if (user.passwordHash && currentPassword) {
        const hash = await hashPassword(currentPassword);
        if (hash !== user.passwordHash) {
          return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });
        }
      }
      user.passwordHash = await hashPassword(newPassword);

    } else if (action === "change_email") {
      const { newEmail, password } = body;
      if (!newEmail || !newEmail.includes("@")) {
        return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
      }
      // Verify password
      const hash = await hashPassword(password);
      if (hash !== user.passwordHash) {
        return NextResponse.json({ error: "Password incorrect." }, { status: 401 });
      }
      // Check not already taken
      const existing = await kv.get(keys.userByEmail(newEmail));
      if (existing) {
        return NextResponse.json({ error: "Email already in use." }, { status: 409 });
      }
      // Delete old email key
      await kv.del(keys.userByEmail(user.email));
      user.email = newEmail.toLowerCase();

    } else if (action === "set_backup_email") {
      const { backupEmail } = body;
      user.backupEmail = backupEmail?.toLowerCase() || "";

    } else if (action === "set_avatar") {
      const { avatarUrl } = body;
      user.avatarUrl = avatarUrl || "";

    } else if (action === "set_bio") {
      const { bio } = body;
      user.bio = (bio || "").slice(0, 200);

    } else if (action === "change_name") {
      const { name } = body;
      if (!name || name.trim().length < 2) {
        return NextResponse.json({ error: "Name too short." }, { status: 400 });
      }
      user.name = name.trim();

    } else {
      return NextResponse.json({ error: "Unknown action." }, { status: 400 });
    }

    // Save updated user to both keys
    await Promise.all([
      kv.set(keys.userById(session.userId), JSON.stringify(user)),
      kv.set(keys.userByEmail(user.email), JSON.stringify(user)),
    ]);

    return NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name, unitIds: user.unitIds },
    });
  } catch (e) {
    console.error("auth update:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
