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

const RANKS: [string, string][] = [
  ["Spark Seeker", "The journey begins. Everyone starts here — that is the point."],
  ["Apprentice of Asking", "Ten prompts reviewed. You revise when the mirror asks you to."],
  ["Wordsmith", "Clarity becomes habit. The filler is disappearing from your asks."],
  ["Context Architect", "Context and structure arrive by default, not by accident."],
  ["Leverage Conductor", "You delegate outcomes. One ask of yours moves whole systems."],
  ["Motus Mind", "Your prompts move people, not just machines. Depth compounds."],
  ["PromptHero", "You teach it. Your asks are indistinguishable from leadership."],
];

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
    <Section kicker="Lesson I · The Practice" title="The Loop">
      <Reveal delay={0.15}>
        <p style={{ ...bodyStyle, marginBottom: 48 }}>
          Six moves, every review. The work still gets done — but alongside the work, a quieter craft is being taught.
        </p>
      </Reveal>
      {LOOP.map(([t, d], i) => (
        <Reveal key={t} delay={0.06 * i}>
          <div style={{ display: "flex", gap: 20, textAlign: "left", marginBottom: 34, alignItems: "flex-start" }}>
            <span style={{
              minWidth: 36, height: 36, borderRadius: "50%",
              border: "1px solid rgba(0,212,255,0.35)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: cyan, fontSize: 15, fontWeight: 300, flexShrink: 0,
              boxShadow: "0 0 16px rgba(0,212,255,0.12), inset 0 0 10px rgba(0,212,255,0.05)",
              marginTop: 2,
            }}>{i + 1}</span>
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
    <Section kicker="Lesson II · The Measure" title="Five Dimensions. One Mirror.">
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
    <Section kicker="Lesson III · The Curriculum" title="The Leverage Ladder">
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
    <Section kicker="Lesson IV · The Journey" title="Chapters. Badges. Promotions. EVOs.">
      <style>{`
        @keyframes badge-twinkle {
          0%, 100% { opacity: 0.45; }
          50% { opacity: 1; }
        }
        @keyframes node-pulse {
          0%, 100% { box-shadow: 0 0 10px rgba(255,209,102,0.4); }
          50% { box-shadow: 0 0 24px rgba(255,209,102,0.8), 0 0 40px rgba(255,209,102,0.25); }
        }
      `}</style>
      <Reveal delay={0.1}>
        <p style={{ ...bodyStyle, marginBottom: 48 }}>
          Growth you can see. Your journey is written as a book about you — and PromptHero is taking notes.
        </p>
      </Reveal>

      <Reveal>
        <div style={{ textAlign: "left", marginBottom: 48 }}>
          <h3 style={{ fontSize: 15, letterSpacing: "0.3em", textTransform: "uppercase", color: cyan, marginBottom: 14 }}>📖 Chapters</h3>
          <p style={{ fontSize: 14.5, fontWeight: 300, lineHeight: 2, color: dim }}>
            Auto-named eras of your growth. When <em>how</em> you prompt genuinely shifts, a chapter closes with a short narrative — what you learned, how you changed, one line you wrote that captures the era — and the next one opens. <span style={{ color: mid, fontStyle: "italic" }}>&ldquo;Chapter II: The Discovery of Constraints.&rdquo;</span>
          </p>
        </div>
      </Reveal>

      <Reveal>
        <div style={{ textAlign: "left", marginBottom: 48 }}>
          <h3 style={{ fontSize: 15, letterSpacing: "0.3em", textTransform: "uppercase", color: cyan, marginBottom: 18 }}>🎖 The Badge Constellation</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {BADGES.map((b, i) => (
              <span key={b} style={{
                fontSize: 12, letterSpacing: "0.08em", padding: "8px 16px", borderRadius: 100,
                display: "inline-flex", alignItems: "center", gap: 8,
                border: `1px solid ${i < 3 ? "rgba(255,209,102,0.3)" : "rgba(0,212,255,0.14)"}`,
                color: i < 3 ? gold : "rgba(0,212,255,0.6)",
                background: i < 3 ? "rgba(255,209,102,0.04)" : "rgba(0,212,255,0.03)",
              }}>
                <span aria-hidden style={{ fontSize: 10, animation: "badge-twinkle 3.6s ease-in-out infinite", animationDelay: `${(i % 6) * 0.55}s` }}>✦</span>
                {b}
              </span>
            ))}
          </div>
          <p style={{ fontSize: 13, fontWeight: 300, lineHeight: 1.9, color: faint, marginTop: 14 }}>
            Earned once, recorded with the exact prompt that earned them — bright when earned, dim until then. New stars are minted whenever something worth naming happens.
          </p>
        </div>
      </Reveal>

      <Reveal>
        <div style={{ textAlign: "left", marginBottom: 48 }}>
          <h3 style={{ fontSize: 15, letterSpacing: "0.3em", textTransform: "uppercase", color: cyan, marginBottom: 22 }}>⬆ Prompt Promotions — The Seven Ranks</h3>
          <div style={{ position: "relative", paddingLeft: 30 }}>
            <div aria-hidden style={{
              position: "absolute", left: 8, top: 10, bottom: 10, width: 1,
              background: "linear-gradient(180deg, rgba(0,212,255,0.12), rgba(0,212,255,0.4) 70%, rgba(255,209,102,0.65))",
            }} />
            {RANKS.map(([r, c], i) => (
              <div key={r} style={{ position: "relative", marginBottom: i === 6 ? 0 : 24 }}>
                <span aria-hidden style={{
                  position: "absolute", left: -26, top: 6, width: 9, height: 9, borderRadius: "50%",
                  background: i === 6 ? "rgba(255,209,102,0.9)" : `rgba(0,212,255,${0.25 + i * 0.1})`,
                  boxShadow: i === 6 ? "0 0 14px rgba(255,209,102,0.6)" : `0 0 8px rgba(0,212,255,${0.15 + i * 0.06})`,
                  animation: i === 6 ? "node-pulse 3.2s ease-in-out infinite" : undefined,
                }} />
                <p style={{
                  fontSize: i === 6 ? 17 : 14.5, fontWeight: 300, letterSpacing: "0.12em", marginBottom: 4,
                  color: i === 6 ? gold : `rgba(250,250,250,${0.45 + i * 0.07})`,
                  textShadow: i === 6 ? "0 0 20px rgba(255,209,102,0.3)" : "none",
                }}>
                  <span style={{ color: faint, fontSize: 11, letterSpacing: "0.2em", marginRight: 10 }}>0{i + 1}</span>
                  {r}
                </p>
                <p style={{ fontSize: 12.5, fontWeight: 300, lineHeight: 1.8, color: faint }}>{c}</p>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 13, fontWeight: 300, lineHeight: 1.9, color: faint, marginTop: 18 }}>
            Promoted when the record shows it sustained — not glimpsed. The climb is the curriculum.
          </p>
        </div>
      </Reveal>

      <Reveal>
        <div style={{ textAlign: "left", padding: "28px 24px", border: "1px solid rgba(255,209,102,0.15)", borderRadius: 16, background: "rgba(255,209,102,0.03)" }}>
          <h3 style={{ fontSize: 15, letterSpacing: "0.3em", textTransform: "uppercase", color: gold, marginBottom: 14 }}>🧬 EVOs</h3>
          <p style={{ fontSize: 14.5, fontWeight: 300, lineHeight: 2, color: mid, marginBottom: 22 }}>
            The rare, major milestones — evolutions, not improvements. An EVO marks the day your <em>model of prompting itself</em> changes: the day you stopped writing commands and started writing briefs. Numbered, auto-named, recorded like plot points. If there are more than a few a year, they aren&rsquo;t EVOs.
          </p>
          <div aria-hidden style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(255,209,102,0.9)", boxShadow: "0 0 12px rgba(255,209,102,0.5)", flexShrink: 0 }} />
            <span style={{ fontSize: 11, letterSpacing: "0.15em", color: gold, marginRight: 4 }}>EVO‑I</span>
            <span style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(255,209,102,0.4), rgba(255,209,102,0.15))" }} />
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "rgba(255,209,102,0.45)", flexShrink: 0 }} />
            <span style={{ fontSize: 11, letterSpacing: "0.15em", color: "rgba(255,209,102,0.5)", marginRight: 4 }}>EVO‑II</span>
            <span style={{ flex: 1, height: 1, background: "linear-gradient(90deg, rgba(255,209,102,0.12), transparent)" }} />
            <span style={{ width: 7, height: 7, borderRadius: "50%", border: "1px dashed rgba(255,209,102,0.35)", flexShrink: 0 }} />
            <span style={{ fontSize: 11, letterSpacing: "0.15em", color: "rgba(255,209,102,0.3)" }}>yours to write</span>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
