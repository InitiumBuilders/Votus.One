import { NextRequest, NextResponse } from "next/server";
import kv, { keys } from "@/lib/kv";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug")?.toLowerCase().replace(/[^a-z0-9-]/g, "-");
  if (!slug || slug.length < 2) {
    return NextResponse.json({ available: false, error: "Slug must be at least 2 characters." });
  }
  if (slug.length > 40) {
    return NextResponse.json({ available: false, error: "Slug must be 40 characters or less." });
  }
  const reserved = ["admin", "api", "start", "allrise", "ethos", "introducing", "motus", "terminal", "votus-units", "u", "account", "login", "register"];
  if (reserved.includes(slug)) {
    return NextResponse.json({ available: false, error: "This name is reserved." });
  }
  const existing = await kv.get(keys.unitBySlug(slug));
  return NextResponse.json({ available: !existing, slug });
}
