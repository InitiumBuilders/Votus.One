import { NextRequest, NextResponse } from "next/server";
import kv, { keys } from "@/lib/kv";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const raw = await kv.get<string>(keys.media(id));
    if (!raw) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const media = typeof raw === "string" ? JSON.parse(raw) : raw;
    const [header, b64] = (media.data as string).split(",");
    const mime = header.match(/data:([^;]+)/)?.[1] || "image/jpeg";
    const buf = Buffer.from(b64, "base64");

    return new NextResponse(buf, {
      headers: {
        "Content-Type": mime,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Length": buf.length.toString(),
      },
    });
  } catch (e) {
    console.error("media GET:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
