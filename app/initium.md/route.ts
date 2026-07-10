import fs from "fs";
import path from "path";

// Serve the founding prompt, verbatim, at /initium.md.
export const dynamic = "force-static";

export async function GET() {
  const file = fs.readFileSync(
    path.join(process.cwd(), "skills", "prompthero", "INITIUM.md"),
    "utf8"
  );
  return new Response(file, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": 'inline; filename="PromptHero-INITIUM.md"',
    },
  });
}
