import { NextRequest, NextResponse } from "next/server";
import kv, { keys } from "@/lib/kv";
import { getUserFromRequest } from "@/lib/auth";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  const session = await getUserFromRequest(req);
  if (!session) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File too large. Maximum 5MB." }, { status: 400 });
    }

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "video/webm"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: "File type not supported. Use JPG, PNG, WebP, GIF, MP4 or WebM." }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    const id = `MED-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const mediaRecord = {
      id,
      type: file.type,
      name: file.name,
      size: file.size,
      uploadedBy: session.userId,
      created: new Date().toISOString(),
      data: dataUrl,
    };

    // Store with no TTL — media persists
    await kv.set(keys.media(id), JSON.stringify(mediaRecord));

    return NextResponse.json({ success: true, id, url: `/api/media/${id}` });
  } catch (e) {
    console.error("media POST:", e);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
