import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import Reveal from "@/components/Reveal";
import VotusMark from "@/components/VotusMark";
import SoundGate from "@/components/SoundEngine";
import PageFooter from "@/components/PageFooter";
import { dim, mid, faint, cyan, bodyStyle, sectionStyle, columnStyle, kickerStyle } from "./theme";
import { TheLoop, Dimensions, LeverageLadder, Progression } from "./SystemSections";
import { UniversalSkill, BuildVessels, AugustAI, Initium, Gratitude } from "./VesselSections";

export const metadata: Metadata = {
  title: "PromptHero — The Universal Skill",
  description: "Every prompt is a mirror. PromptHero is a universal skill for any AI agent that studies how you prompt, teaches you the craft of asking, and tracks your growth through Chapters, Badges, Prompt Promotions, and EVOs. Build your own dashboard on any device.",
  openGraph: {
    title: "PromptHero — The Universal Skill",
    description: "Become the author of better questions. A personal learning engine for the craft of the ask — with auto-named Chapters, Badges, Prompt Promotions, and EVOs. There is hope in the hard questions.",
  },
};

// The skill and the founding prompt live as real files in the repo —
// the page reads them at build time so the site and the artifact never drift.
function readSkillFiles() {
  const root = path.join(process.cwd(), "skills", "prompthero");
  const skill = fs.readFileSync(path.join(root, "SKILL.md"), "utf8");
  const initiumRaw = fs.readFileSync(path.join(root, "INITIUM.md"), "utf8");
  const initium = (initiumRaw.split("\n---\n")[1] ?? initiumRaw).trim();
  return { skill, initium };
}

const MANIFESTO = [
  "You will write thousands of prompts in your lifetime. To agents, to teams, to yourself. Each one is a small act of leadership: here is what I see, here is what I want, here is what good looks like.",
  "Most tools improve the answers. PromptHero improves the asker.",
  "It studies how you prompt — the structure, the depth, the leverage, the beauty — and teaches you, one lesson at a time, with your own words as the textbook. It reflects your values and mindset back to you. It writes your growth as a book about you: auto-named Chapters, earned Badges, Prompt Promotions, and rare EVOs.",
  "The prompt is the smallest unit of intention. Master the ask, and everything downstream gets better — your code, your teams, your thinking, your questions. Especially the hard ones.",
];

export default function PromptHero() {
  const { skill, initium } = readSkillFiles();

  return (
    <SoundGate scene="introducing">
      <style>{`
        @keyframes ph-glow {
          0%, 100% { text-shadow: 0 0 40px rgba(0,212,255,0.15); }
          50% { text-shadow: 0 0 70px rgba(0,212,255,0.35), 0 0 120px rgba(255,209,102,0.08); }
        }
        @keyframes ph-line {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.9; }
        }
      `}</style>

      <main style={{
        background: "#09090b",
        color: "#fafafa",
        minHeight: "100dvh",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif",
        WebkitFontSmoothing: "antialiased",
        overflow: "hidden",
      }}>

        {/* ─── Hero ─── */}
        <section style={{ ...sectionStyle, minHeight: "100dvh", justifyContent: "center", padding: "80px 24px" }}>
          <Reveal><div style={{ marginBottom: 40 }}><VotusMark size={44} /></div></Reveal>
          <Reveal delay={0.15}>
            <p style={kickerStyle}>The Universal Skill · For Every Agent</p>
          </Reveal>
          <Reveal delay={0.3}>
            <h1 style={{
              fontSize: "clamp(2.6rem, 11vw, 5.5rem)",
              fontWeight: 200,
              letterSpacing: "0.14em",
              marginBottom: 24,
              animation: "ph-glow 7s ease-in-out infinite",
            }}>PromptHero</h1>
          </Reveal>
          <Reveal delay={0.45}>
            <p style={{ maxWidth: 460, fontSize: "clamp(1.05rem, 3vw, 1.3rem)", fontWeight: 200, fontStyle: "italic", lineHeight: 1.9, color: mid, marginBottom: 20 }}>
              Every prompt is a mirror.<br />PromptHero teaches you to read it.
            </p>
          </Reveal>
          <Reveal delay={0.6}>
            <p style={{ maxWidth: 480, fontSize: 14, fontWeight: 300, lineHeight: 2, color: dim }}>
              A personal learning engine for the craft of the ask — it studies your prompts, coaches your growth, and writes your evolution as it happens. Works with Claude, Davara, Hermes, Openclaw, and any agent that can read.
            </p>
          </Reveal>
          <Reveal delay={0.8}>
            <div style={{ marginTop: 48, width: 1, height: 60, background: "linear-gradient(180deg, rgba(0,212,255,0.5), transparent)", animation: "ph-line 3s ease-in-out infinite" }} />
          </Reveal>
        </section>

        {/* ─── Manifesto ─── */}
        <section style={{ ...sectionStyle, paddingTop: 24 }}>
          <div style={columnStyle}>
            {MANIFESTO.map((p, i) => (
              <Reveal key={i} delay={0.1 * i}>
                <p style={{ ...bodyStyle, marginBottom: 28, color: i === 1 ? cyan : mid, fontSize: i === 1 ? "clamp(1.15rem, 3.2vw, 1.4rem)" : bodyStyle.fontSize, fontWeight: i === 1 ? 200 : 300 }}>
                  {p}
                </p>
              </Reveal>
            ))}
            <Reveal delay={0.5}>
              <p style={{ fontSize: 13, letterSpacing: "0.4em", textTransform: "uppercase", color: faint, marginTop: 16 }}>
                Go Beyond · Look Within
              </p>
            </Reveal>
          </div>
        </section>

        <TheLoop />
        <Dimensions />
        <LeverageLadder />
        <Progression />
        <UniversalSkill skillText={skill} />
        <BuildVessels />
        <AugustAI />
        <Initium initiumText={initium} />
        <Gratitude />

        <PageFooter />
      </main>
    </SoundGate>
  );
}
