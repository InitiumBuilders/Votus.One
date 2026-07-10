import Reveal from "@/components/Reveal";
import PromptBlock from "@/components/PromptBlock";
import { dim, mid, faint, cyan, gold, kickerStyle, h2Style, bodyStyle, sectionStyle, columnStyle } from "./theme";
import { BUILD_PROMPTS, AUGUST_AI_PROMPT, AGENT_INSTALL_NOTES } from "./prompts";

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

export function UniversalSkill({ skillText }: { skillText: string }) {
  return (
    <Section kicker="The Artifact" title="The Universal Skill">
      <Reveal delay={0.15}>
        <p style={{ ...bodyStyle, marginBottom: 40 }}>
          One markdown file. Any agent. Claude, Davara, Hermes, Openclaw — the agent is the engine; this is the operating manual. Copy it, install it, and your agent becomes your mentor of asking.
        </p>
      </Reveal>
      <Reveal delay={0.2}>
        <PromptBlock
          title="PromptHero — SKILL.md (the complete skill)"
          icon="⚡"
          text={skillText}
          note="The full universal skill: the Loop, the Five Dimensions, the Leverage Ladder, Badges, Prompt Promotions, Chapters, EVOs, voice & ethics, and installation for every harness."
        />
      </Reveal>
      <Reveal delay={0.22}>
        <p style={{ fontSize: 13, color: faint, marginBottom: 8 }}>
          Prefer a file?{" "}
          <a href="/skill.md" download="PromptHero-SKILL.md" style={{ color: cyan, textDecoration: "none", letterSpacing: "0.06em" }}>
            Download SKILL.md ↓
          </a>
        </p>
      </Reveal>
      <Reveal delay={0.25}>
        <div style={{ textAlign: "left", marginTop: 24 }}>
          <h3 style={{ fontSize: 13, letterSpacing: "0.3em", textTransform: "uppercase", color: dim, marginBottom: 18 }}>Install It Anywhere</h3>
          {AGENT_INSTALL_NOTES.map(([agent, note]) => (
            <p key={agent} style={{ fontSize: 13.5, fontWeight: 300, lineHeight: 1.9, color: faint, marginBottom: 12 }}>
              <span style={{ color: cyan, letterSpacing: "0.06em" }}>{agent}</span>
              <span> — {note}</span>
            </p>
          ))}
        </div>
      </Reveal>
    </Section>
  );
}

export function BuildVessels() {
  return (
    <Section kicker="The Forge · Build Your Dashboard" title="Six Complete Blueprints.">
      <Reveal delay={0.15}>
        <p style={{ ...bodyStyle, marginBottom: 24 }}>
          Deep, ironed-out, production-grade build prompts. Copy one into any capable coding agent on the device of your choice and receive a finished PromptHero dashboard — your system, your data, your context. Local-first. Private by design. Yours.
        </p>
      </Reveal>
      <Reveal delay={0.2}>
        <p style={{ fontSize: 13.5, fontWeight: 300, lineHeight: 2, color: faint, marginBottom: 40 }}>
          Each blueprint carries the full system: the exact stack, the project scaffold, the data home and schema, all seven screens, the Review engine, the celebration ceremonies, privacy rules, and a testable definition of done. Paste it. Build it. Begin.
        </p>
      </Reveal>
      {BUILD_PROMPTS.map((p, i) => (
        <Reveal key={p.id} delay={0.05 * i}>
          <PromptBlock title={p.label} icon={p.icon} text={p.prompt} note={p.note} />
        </Reveal>
      ))}
    </Section>
  );
}

export function TheCharge() {
  return (
    <section style={{ ...sectionStyle, padding: "88px 24px" }}>
      <div style={{ maxWidth: 560, width: "100%" }}>
        <Reveal>
          <p style={kickerStyle}>The Charge</p>
        </Reveal>
        <Reveal delay={0.15}>
          <h2 style={{ ...h2Style, marginBottom: 28 }}>Evolve. Go Beyond.</h2>
        </Reveal>
        <Reveal delay={0.3}>
          <p style={{ fontSize: "clamp(1.05rem, 3vw, 1.3rem)", fontWeight: 200, fontStyle: "italic", lineHeight: 2, color: mid, marginBottom: 24 }}>
            You are not late to AI.<br />You are early to the craft.
          </p>
        </Reveal>
        <Reveal delay={0.45}>
          <p style={{ fontSize: 14.5, fontWeight: 300, lineHeight: 2.1, color: dim, marginBottom: 28 }}>
            Every prompt you write from today forward is a rep. Every hard question is a door.
            The mirror is already in your hands — and the next chapter of your journey names itself
            the moment you begin. It is always the right time for the right move.
          </p>
        </Reveal>
        <Reveal delay={0.6}>
          <p style={{ fontSize: 13, letterSpacing: "0.35em", textTransform: "uppercase", color: cyan }}>
            We Got This 💪 · Look Within · Move As One
          </p>
        </Reveal>
      </div>
    </section>
  );
}

export function AugustAI() {
  return (
    <Section kicker="The Mentor · Your Coach" title="August AI — The Motus Mentor">
      <Reveal delay={0.15}>
        <p style={{ ...bodyStyle, marginBottom: 40 }}>
          Give any AI this soul, and it becomes your coach: feedback, shared learnings, reflections, evolutions, badges, EVOs, new chapters. Honest over flattering. Kind, never soft. Its whole job is to move you. <span style={{ color: cyan }}>Motus.</span>
        </p>
      </Reveal>
      <Reveal delay={0.2}>
        <PromptBlock
          title="August AI — system prompt"
          icon="🧭"
          text={AUGUST_AI_PROMPT}
          note="Paste as the system prompt of any assistant — or run it inside your dashboard — to summon your Motus Mentor."
        />
      </Reveal>
    </Section>
  );
}

export function Initium({ initiumText }: { initiumText: string }) {
  return (
    <Section kicker="The Origin · The Founding Prompt" title="Initium">
      <Reveal delay={0.15}>
        <p style={{ ...bodyStyle, marginBottom: 36 }}>
          Every journey keeps its first prompt. This is the one that created PromptHero — preserved verbatim, momentum and all, because your prompts as they truly are, are the record of how you think. Chapter I opens here.
        </p>
      </Reveal>
      <Reveal delay={0.2}>
        <PromptBlock
          title="The Initium — recorded 2026·07·10, never edited"
          icon="🫆"
          text={initiumText}
          note="First Light. 🎖 The origin point of this journey."
        />
      </Reveal>
      <Reveal delay={0.25}>
        <p style={{ fontSize: 13, color: faint, marginBottom: 8 }}>
          <a href="/initium.md" download="PromptHero-INITIUM.md" style={{ color: gold, textDecoration: "none", letterSpacing: "0.06em" }}>
            Download the Initium ↓
          </a>
        </p>
      </Reveal>
      <Reveal delay={0.3}>
        <p style={{ fontSize: 14, fontStyle: "italic", color: dim, letterSpacing: "0.06em", marginTop: 16, lineHeight: 2 }}>
          It is always the right time for the right move.<br />Look Within. 💪➰👣🤝
        </p>
      </Reveal>
    </Section>
  );
}

export function Gratitude() {
  return (
    <section style={{ ...sectionStyle, padding: "88px 24px 40px" }}>
      <div style={{ maxWidth: 560, width: "100%" }}>
        <Reveal>
          <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(255,209,102,0.3), transparent)", marginBottom: 56 }} />
        </Reveal>
        <Reveal delay={0.1}>
          <p style={{ fontSize: 12, letterSpacing: "0.5em", textTransform: "uppercase", color: faint, marginBottom: 28 }}>A Thank You Note To Anthropic</p>
        </Reveal>
        <Reveal delay={0.2}>
          <h2 style={{ fontSize: "clamp(1.6rem, 6vw, 2.3rem)", fontWeight: 200, letterSpacing: "0.1em", color: gold, marginBottom: 20, textShadow: "0 0 30px rgba(255,209,102,0.15)" }}>
            Hope For PromptHeros
          </h2>
        </Reveal>
        <Reveal delay={0.3}>
          <p style={{ fontSize: "clamp(1.1rem, 3.5vw, 1.4rem)", fontWeight: 200, fontStyle: "italic", lineHeight: 1.9, color: mid, marginBottom: 28 }}>
            &ldquo;There Is Hope In The Hard Questions&rdquo;
          </p>
        </Reveal>
        <Reveal delay={0.4}>
          <p style={{ fontSize: 14.5, fontWeight: 300, lineHeight: 2.1, color: dim, marginBottom: 24 }}>
            This skill was inspired by Dario the founder from Anthropic.<br />
            This is a skill worth sharing 👀
          </p>
        </Reveal>
        <Reveal delay={0.5}>
          <p style={{ fontSize: 13, letterSpacing: "0.35em", textTransform: "uppercase", color: cyan, marginBottom: 12 }}>Prompt Change.</p>
        </Reveal>
        <Reveal delay={0.6}>
          <p style={{ fontSize: 12.5, color: faint, letterSpacing: "0.15em", lineHeight: 2 }}>
            Gratus En Minus. 🎶 We Got This. 👷💫🫆
          </p>
        </Reveal>
      </div>
    </section>
  );
}
