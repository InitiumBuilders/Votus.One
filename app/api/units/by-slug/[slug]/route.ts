import { NextRequest, NextResponse } from "next/server";
import kv, { keys } from "@/lib/kv";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const idRaw = await kv.get<string>(keys.unitBySlug(slug.toLowerCase()));
    if (!idRaw) return NextResponse.json({ error: "Unit not found." }, { status: 404 });

    // idRaw could be the unit id string directly, or a stringified object
    let unitId: string;
    try {
      const parsed = typeof idRaw === "string" ? JSON.parse(idRaw) : idRaw;
      unitId = typeof parsed === "object" ? parsed.id : parsed;
    } catch {
      unitId = idRaw as string;
    }

    const unitRaw = await kv.get<string>(keys.unit(unitId));
    if (!unitRaw) return NextResponse.json({ error: "Unit not found." }, { status: 404 });

    const unit = typeof unitRaw === "string" ? JSON.parse(unitRaw) : unitRaw;

    // Increment view count
    const views = await kv.incr(keys.unitViews(unit.id));
    const updatedUnit = { ...unit, views };
    await kv.set(keys.unit(unit.id), JSON.stringify(updatedUnit));

    // Get members
    const membersRaw = await kv.lrange<string>(keys.unitMembers(unit.id), 0, 100);
    const members = membersRaw
      .map((m) => { try { return typeof m === "string" ? JSON.parse(m) : m; } catch { return null; } })
      .filter(Boolean);

    return NextResponse.json({ unit: updatedUnit, members });
  } catch (e) {
    console.error("by-slug GET:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
