import VotusMark from "@/components/VotusMark";

// The quiet end of the page — lineage, source, and the signature.
export default function PromptFooter() {
  const faint = "rgba(250,250,250,0.25)";
  return (
    <footer style={{
      padding: "48px 24px 72px",
      display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
      gap: 18,
      position: "relative", zIndex: 1,
    }}>
      <VotusMark size={30} />
      <p style={{ fontSize: 11, letterSpacing: "0.35em", textTransform: "uppercase", color: faint }}>
        A Votus.One Transmission · Move As One
      </p>
      <div style={{ display: "flex", gap: 22, flexWrap: "wrap", justifyContent: "center" }}>
        <a href="https://github.com/InitiumBuilders/Votus.One" target="_blank" rel="noopener noreferrer"
          style={{ textDecoration: "none", color: "rgba(0,212,255,0.55)", fontSize: 12, letterSpacing: "0.14em" }}>
          Open Source ↗
        </a>
        <a href="/skill.md" download="PromptHero-SKILL.md"
          style={{ textDecoration: "none", color: "rgba(0,212,255,0.55)", fontSize: 12, letterSpacing: "0.14em" }}>
          The Skill ⚡
        </a>
        <a href="/initium.md" download="PromptHero-INITIUM.md"
          style={{ textDecoration: "none", color: "rgba(255,209,102,0.5)", fontSize: 12, letterSpacing: "0.14em" }}>
          The Initium 🫆
        </a>
      </div>
      <p style={{ fontSize: 12, letterSpacing: "0.16em", color: "rgba(250,250,250,0.35)" }}>
        Envisioned by{" "}
        <a href="https://x.com/BuiltByAugust" target="_blank" rel="noopener noreferrer" style={{ color: "rgba(0,212,255,0.5)", textDecoration: "none" }}>August James</a>
        {" "}&amp;{" "}
        <a href="https://www.linkedin.com/in/kristina-roll-2135b4114/" target="_blank" rel="noopener noreferrer" style={{ color: "rgba(0,212,255,0.5)", textDecoration: "none" }}>Kristina Roll</a>
      </p>
      <div style={{ width: 40, height: 1, background: "rgba(250,250,250,0.06)" }} />
      <p style={{ fontSize: 10, color: "rgba(250,250,250,0.15)", letterSpacing: "0.1em", lineHeight: 2 }}>
        &copy; 2026 Votus.One &middot; PromptHero Era &middot; The original site rests safe in votus-one-v0<br />
        It is always the right time for the right move. 👣
      </p>
    </footer>
  );
}
