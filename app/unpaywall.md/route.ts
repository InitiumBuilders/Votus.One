import fs from "fs";
import path from "path";

// Serve the Unpaywall Research skill as a downloadable markdown file at /unpaywall.md.
// Prerendered at build time — the artifact ships with the site.
export const dynamic = "force-static";

export async function GET() {
  const file = fs.readFileSync(
    path.join(process.cwd(), "skills", "unpaywall-research", "SKILL.md"),
    "utf8"
  );
  return new Response(file, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": 'inline; filename="Unpaywall-Research-SKILL.md"',
    },
  });
}
