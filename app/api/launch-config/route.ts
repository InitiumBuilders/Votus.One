import { NextResponse } from "next/server";
import kv, { keys } from "@/lib/kv";

// Public endpoint: returns the launch date + announcement for the frontend
export async function GET() {
  try {
    const [customDate, announcement] = await Promise.all([
      kv.get<string>(keys.launchDate),
      kv.get<string>(keys.siteAnnouncement),
    ]);

    return NextResponse.json({
      // If admin set a custom launch date, use it; otherwise frontend uses default
      launchDate: customDate || null,
      announcement: announcement || null,
    });
  } catch {
    return NextResponse.json({ launchDate: null, announcement: null });
  }
}
