import { CRISIS_LINES } from "../lib/safety";

// The card pinned under any reading whose question carried crisis. Real,
// tappable lines to a human — never plain text. Each experience passes its
// own verified ink so the card speaks in that room's palette.

export interface CrisisPalette {
  ink: string; // body text — must clear 7:1 on `surface`
  accent: string; // link text — must clear 7:1 on `surface`
  surface: string;
  border: string;
  font?: string;
}

export default function CrisisCard({ palette, voice }: { palette: CrisisPalette; voice?: string }) {
  return (
    <aside
      role="note"
      aria-label="Crisis support"
      style={{
        margin: "14px 0 4px",
        padding: "16px 18px",
        borderRadius: 16,
        background: palette.surface,
        border: palette.border,
        color: palette.ink,
        fontFamily: palette.font,
      }}
    >
      <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6 }}>
        {voice ?? "You don't have to carry this alone tonight. A real person is one tap away."}
      </p>
      <ul style={{ listStyle: "none", margin: "12px 0 0", padding: 0, display: "flex", flexWrap: "wrap", gap: 10 }}>
        {CRISIS_LINES.map((l) => (
          <li key={l.href}>
            <a
              href={l.href}
              {...(l.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              style={{
                display: "inline-flex",
                flexDirection: "column",
                minHeight: 44,
                justifyContent: "center",
                padding: "8px 14px",
                borderRadius: 12,
                border: `1px solid ${palette.accent}`,
                color: palette.accent,
                textDecoration: "none",
                fontSize: 15,
                fontWeight: 600,
                lineHeight: 1.25,
              }}
            >
              {l.label}
              <span style={{ fontSize: 12, fontWeight: 400, color: palette.ink }}>{l.note}</span>
            </a>
          </li>
        ))}
      </ul>
      <p style={{ margin: "12px 0 0", fontSize: 14, lineHeight: 1.6 }}>
        Took something, or in danger right now? Call your local emergency number —{" "}
        <a href="tel:911" style={{ color: palette.accent, fontWeight: 600 }}>911</a> in the US.
      </p>
    </aside>
  );
}
