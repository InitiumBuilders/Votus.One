import Reveal from "@/components/Reveal";
import { dim, mid, faint, cyan, gold, kickerStyle, h2Style, bodyStyle, sectionStyle, columnStyle } from "./theme";

const LOOP = [
  ["Observe", "Your prompt is quoted back to you, verbatim. You almost never re-read your own asks. Seeing your own words is the first lesson."],
  ["Analyze", "Five dimensions, scored 1–10 — each score pointing at the exact sentence that earned it. Never in the abstract."],
  ["Teach", "Exactly one lesson per review, proven with a Before / After rewrite of your own prompt. Plus one Spark — a tip you can reuse tomorrow."],
  ["Reflect", "The Mirror: what this prompt reveals about how you think, what you value, what you trust yourself with — and one hard question worth sitting with."],
  ["Record", "Everything is written to your journey — a ledger, a journal, a mirror. Local. Human-readable. Yours."],
  ["Celebrate", "Badges, Prompt Promotions, Chapters, EVOs — awarded with ceremony and total specificity. Never inflated."],
];

const DIMENSIONS = [
  ["Clarity", "Could a stranger execute this? One readable ask, success defined."],
  ["Structure", "Does the prompt have architecture? Context → task → constraints → format."],
  ["Depth", "Does it engage the real problem — the goal behind the goal?"],
  ["Leverage", "Does one ask move many things? Outcomes delegated, initiative invited."],
  ["Beauty", "Would you frame this prompt? Economy, rhythm, intention. Nothing wasted."],
];

const LEVERAGES = [
  ["Context", "Give the model your world. Context is the cheapest multiplier that exists."],
  ["Constraint", "Boundaries create quality. A constraint is a decision made once."],
  ["Structure", "Architecture beats volume. A structured ask returns a structured answer."],
  ["Iteration", "The first prompt is a draft. Treat the conversation as the prompt."],
  ["Delegation", "The summit. Stop prescribing steps. Describe outcomes and grant judgment."],
];

const RANKS = ["Spark Seeker", "Apprentice of Asking", "Wordsmith", "Context Architect", "Leverage Conductor", "Motus Mind", "PromptHero"];

const BADGES = [
  "First Light", "The First Constraint", "Context Weaver", "The Socratic Turn",
  "One Ask, One Aim", "The Refactorer", "Beautiful Brief", "The Delegator",
  "The Verifier", "The Hard Question", "Return of the Hero", "The Teacher Appears",
];

function Section({ kicker, title, children }: { kicker: string; title: string; children: React.ReactNode }) {
  return (
    <section style={sectionStyle}>
      <div style={columnStyle}>
        <Reveal><p style={kickerStyle}>{kicker}</p></Reveal>
        <Reveal delay={0.1}><h2 style={h2Style}>{title}</h2></Reveal>
        {children}
      </div>
    </section>
  );
}

export function TheLoop() {
  return (
    <Section kicker="The Practice" title="The Loop">
      <Reveal delay={0.15}>
        <p style={{ ...bodyStyle, marginBottom: 48 }}>
          Six moves, every review. The work still gets done — but alongside the work, a quieter craft is being taught.
        </p>
      </Reveal>
      {LOOP.map(([t, d], i) => (
        <Reveal key={t} delay={0.06 * i}>
          <div style={{ display: "flex", gap: 20, textAlign: "left", marginBottom: 36, alignItems: "baseline" }}>
            <span style={{ color: cyan, fontWeight: 200, fontSize: 22, opacity: 0.7, minWidth: 28 }}>{i + 1}</span>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 300, letterSpacing: "0.2em", textTransform: "uppercase", color: cyan, marginBottom: 8 }}>{t}</h3>
              <p style={{ fontSize: 14.5, fontWeight: 300, lineHeight: 1.9, color: dim }}>{d}</p>
            </div>
          </div>
        </Reveal>
      ))}
    </Section>
  );
}

export function Dimensions() {
  return (
    <Section kicker="The Measure" title="Five Dimensions. One Mirror.">
      {DIMENSIONS.map(([t, d], i) => (
        <Reveal key={t} delay={0.07 * i}>
          <div style={{ borderLeft: "2px solid rgba(0,212,255,0.18)", paddingLeft: 24, marginBottom: 32, textAlign: "left" }}>
            <h3 style={{ fontSize: 19, fontWeight: 200, color: cyan, letterSpacing: "0.1em", marginBottom: 6 }}>{t}</h3>
            <p style={{ fontSize: 14.5, fontWeight: 300, lineHeight: 1.9, color: dim }}>{d}</p>
          </div>
        </Reveal>
      ))}
      <Reveal delay={0.4}>
        <div style={{ marginTop: 24, padding: "28px 24px", border: "1px solid rgba(255,209,102,0.15)", borderRadius: 16, background: "rgba(255,209,102,0.03)" }}>
          <h3 style={{ fontSize: 17, fontWeight: 300, letterSpacing: "0.25em", textTransform: "uppercase", color: gold, marginBottom: 12 }}>The Mirror</h3>
          <p style={{ fontSize: 14.5, fontWeight: 300, lineHeight: 2, color: mid }}>
            The sixth reading — never scored. <em>What does this prompt say about who is asking?</em> Courage or hedging. Curiosity or checklist. Service or ego. This is where prompting stops being a technique and becomes self-knowledge.
          </p>
        </div>
      </Reveal>
    </Section>
  );
}

export function LeverageLadder() {
  return (
    <Section kicker="The Curriculum" title="The Leverage Ladder">
      <Reveal delay={0.15}>
        <p style={{ ...bodyStyle, marginBottom: 44 }}>Five leverages, taught one at a time. Find the deeper leverage.</p>
      </Reveal>
      {LEVERAGES.map(([t, d], i) => (
        <Reveal key={t} delay={0.06 * i}>
          <div style={{ marginBottom: 30, textAlign: "left", display: "flex", gap: 16, alignItems: "baseline" }}>
            <span style={{ color: faint, fontSize: 12, letterSpacing: "0.15em", minWidth: 24 }}>{["I", "II", "III", "IV", "V"][i]}</span>
            <p style={{ fontSize: 15, fontWeight: 300, lineHeight: 1.9, color: mid }}>
              <span style={{ color: cyan, letterSpacing: "0.08em" }}>{t}</span>
              <span style={{ color: faint }}> — </span>{d}
            </p>
          </div>
        </Reveal>
      ))}
    </Section>
  );
}

export function Progression() {
  return (
    <Section kicker="The Journey" title="Chapters. Badges. Promotions. EVOs.">
      <Reveal delay={0.1}>
        <p style={{ ...bodyStyle, marginBottom: 48 }}>
          Growth you can see. Your journey is written as a book about you — and PromptHero is taking notes.
        </p>
      </Reveal>

      <Reveal>
        <div style={{ textAlign: "left", marginBottom: 44 }}>
          <h3 style={{ fontSize: 15, letterSpacing: "0.3em", textTransform: "uppercase", color: cyan, marginBottom: 14 }}>📖 Chapters</h3>
          <p style={{ fontSize: 14.5, fontWeight: 300, lineHeight: 2, color: dim }}>
            Auto-named eras of your growth. When <em>how</em> you prompt genuinely shifts, a chapter closes with a short narrative — what you learned, how you changed, one line you wrote that captures the era — and the next one opens. <span style={{ color: mid, fontStyle: "italic" }}>&ldquo;Chapter II: The Discovery of Constraints.&rdquo;</span>
          </p>
        </div>
      </Reveal>

      <Reveal>
        <div style={{ textAlign: "left", marginBottom: 44 }}>
          <h3 style={{ fontSize: 15, letterSpacing: "0.3em", textTransform: "uppercase", color: cyan, marginBottom: 18 }}>🎖 Badges</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {BADGES.map((b, i) => (
              <span key={b} style={{
                fontSize: 12, letterSpacing: "0.08em", padding: "8px 16px", borderRadius: 100,
                border: `1px solid ${i < 3 ? "rgba(255,209,102,0.3)" : "rgba(0,212,255,0.14)"}`,
                color: i < 3 ? gold : "rgba(0,212,255,0.6)",
                background: i < 3 ? "rgba(255,209,102,0.04)" : "rgba(0,212,255,0.03)",
              }}>{b}</span>
            ))}
          </div>
          <p style={{ fontSize: 13, fontWeight: 300, lineHeight: 1.9, color: faint, marginTop: 14 }}>
            Earned once, recorded with the exact prompt that earned them. New ones are minted whenever something worth naming happens.
          </p>
        </div>
      </Reveal>

      <Reveal>
        <div style={{ textAlign: "left", marginBottom: 44 }}>
          <h3 style={{ fontSize: 15, letterSpacing: "0.3em", textTransform: "uppercase", color: cyan, marginBottom: 18 }}>⬆ Prompt Promotions</h3>
          {RANKS.map((r, i) => (
            <div key={r} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 10 }}>
              <div style={{ width: `${16 + i * 13}%`, maxWidth: 200, height: 1, background: `linear-gradient(90deg, rgba(0,212,255,${0.1 + i * 0.1}), transparent)` }} />
              <span style={{
                fontSize: i === 6 ? 16 : 13.5, fontWeight: i === 6 ? 300 : 300, letterSpacing: "0.12em",
                color: i === 6 ? gold : `rgba(250,250,250,${0.35 + i * 0.08})`,
                textShadow: i === 6 ? "0 0 20px rgba(255,209,102,0.3)" : "none",
              }}>{r}</span>
            </div>
          ))}
          <p style={{ fontSize: 13, fontWeight: 300, lineHeight: 1.9, color: faint, marginTop: 14 }}>
            Seven ranks. Promoted when the record shows it sustained — not glimpsed. The last one is earned when your asks are indistinguishable from leadership.
          </p>
        </div>
      </Reveal>

      <Reveal>
        <div style={{ textAlign: "left", padding: "28px 24px", border: "1px solid rgba(255,209,102,0.15)", borderRadius: 16, background: "rgba(255,209,102,0.03)" }}>
          <h3 style={{ fontSize: 15, letterSpacing: "0.3em", textTransform: "uppercase", color: gold, marginBottom: 14 }}>🧬 EVOs</h3>
          <p style={{ fontSize: 14.5, fontWeight: 300, lineHeight: 2, color: mid }}>
            The rare, major milestones — evolutions, not improvements. An EVO marks the day your <em>model of prompting itself</em> changes: the day you stopped writing commands and started writing briefs. Numbered, auto-named, recorded like plot points. <span style={{ color: gold }}>EVO‑I. EVO‑II.</span> If there are more than a few a year, they aren&rsquo;t EVOs.
          </p>
        </div>
      </Reveal>
    </Section>
  );
}
