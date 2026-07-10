import VotusMark from "@/components/VotusMark";

// The quiet end of the page — the lineage, the support lines, and the ember.
export default function PromptFooter() {
  const faint = "rgba(250,250,250,0.25)";
  return (
    <footer style={{
      padding: "48px 24px 72px",
      display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
      gap: 18,
      position: "relative", zIndex: 1,
    }}>
      <style>{`
        @keyframes ember-remember {
          0%, 100% { opacity: 0.55; text-shadow: 0 0 10px rgba(255,158,100,0.3); }
          50% { opacity: 1; text-shadow: 0 0 22px rgba(255,158,100,0.6), 0 0 44px rgba(255,122,69,0.25); }
        }
      `}</style>

      <VotusMark size={30} />
      <p style={{ fontSize: 11, letterSpacing: "0.35em", textTransform: "uppercase", color: faint }}>
        A Votus.One Transmission
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
        <a href="https://Davara.DEV" target="_blank" rel="noopener noreferrer"
          style={{ textDecoration: "none", color: "rgba(255,158,100,0.55)", fontSize: 12, letterSpacing: "0.14em" }}>
          Davara.DEV ↗
        </a>
      </div>

      <div style={{ width: 60, height: 1, background: "linear-gradient(90deg, transparent, rgba(255,158,100,0.25), transparent)", margin: "10px 0" }} />

      {/* Support the movement */}
      <p style={{ fontSize: 12.5, fontWeight: 300, lineHeight: 2.1, color: "rgba(250,250,250,0.4)", maxWidth: 440, letterSpacing: "0.04em" }}>
        If This Prompt Made You Move, Send Some <span style={{ color: "rgba(0,212,255,0.7)" }}>$ETH</span> To{" "}
        <span style={{ color: "rgba(0,212,255,0.85)", letterSpacing: "0.08em" }}>Motus.Mov</span>
      </p>
      <p style={{ fontSize: 12.5, fontWeight: 300, lineHeight: 2.1, color: "rgba(250,250,250,0.4)", maxWidth: 460, letterSpacing: "0.04em" }}>
        Driven By <span style={{ color: "rgba(0,212,255,0.7)" }}>$DASH</span>? Send Some $Dash To{" "}
        <span style={{ color: "rgba(0,212,255,0.85)", letterSpacing: "0.08em" }}>August.Dash</span>{" "}
        And Pass This Prompt Along To A Heart That Has Made You Strong
      </p>

      <p style={{ fontSize: 12, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,209,102,0.55)", marginTop: 8, lineHeight: 2.2 }}>
        Lead The Difference · Foster Change · Make Your Move Hero
      </p>

      <p style={{ fontSize: 13, color: faint, letterSpacing: "0.2em", fontStyle: "italic" }}>~a</p>

      <p style={{ fontSize: 12, letterSpacing: "0.16em", color: "rgba(250,250,250,0.35)" }}>
        Envisioned by{" "}
        <a href="https://x.com/BuiltByAugust" target="_blank" rel="noopener noreferrer" style={{ color: "rgba(0,212,255,0.5)", textDecoration: "none" }}>August James</a>
      </p>

      <div style={{ width: 40, height: 1, background: "rgba(250,250,250,0.06)" }} />
      <p style={{ fontSize: 10, color: "rgba(250,250,250,0.15)", letterSpacing: "0.1em" }}>
        &copy; 2026 Votus.One &middot; PromptHero Era
      </p>

      <p aria-label="An Ember To Remember" style={{
        marginTop: 10,
        fontSize: 13,
        letterSpacing: "0.4em",
        textTransform: "uppercase",
        color: "rgba(255,158,100,0.8)",
        animation: "ember-remember 5s ease-in-out infinite",
      }}>
        🔥 An Ember To Remember
      </p>
    </footer>
  );
}
