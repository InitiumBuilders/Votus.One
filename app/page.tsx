import fs from "fs";
import path from "path";
import Reveal from "@/components/Reveal";
import SoundVeil from "@/components/prompthero/SoundVeil";
import SparkMark from "@/components/prompthero/SparkMark";
import Starfield from "@/components/prompthero/Starfield";
import Aurora from "@/components/prompthero/Aurora";
import HeroActions from "@/components/prompthero/HeroActions";
import PromptFooter from "@/components/prompthero/PromptFooter";
import { dim, mid, faint, cyan, bodyStyle, sectionStyle, columnStyle, kickerStyle } from "@/components/prompthero/theme";
import { TheLoop, Dimensions, LeverageLadder, Progression } from "@/components/prompthero/SystemSections";
import { UniversalSkill, BuildVessels, AugustAI, Initium, Gratitude, TheCharge } from "@/components/prompthero/VesselSections";

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

export default function Home() {
  const { skill, initium } = readSkillFiles();

  return (
    <SoundVeil>
      <style>{`
        @keyframes ph-glow {
          0%, 100% { filter: drop-shadow(0 0 22px rgba(0,212,255,0.22)); }
          50% { filter: drop-shadow(0 0 44px rgba(0,212,255,0.4)) drop-shadow(0 0 90px rgba(255,209,102,0.14)); }
        }
        @keyframes ph-line {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.9; }
        }
        @keyframes ph-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
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
        <Aurora />
        <Starfield />

        <div style={{ position: "relative", zIndex: 1 }}>

          {/* ─── Hero ─── */}
          <section style={{ ...sectionStyle, minHeight: "100dvh", justifyContent: "center", padding: "80px 24px" }}>
            <Reveal>
              <div style={{ marginBottom: 36, animation: "ph-float 6s ease-in-out infinite" }}>
                <SparkMark size={64} />
              </div>
            </Reveal>
            <Reveal delay={0.15}>
              <p style={kickerStyle}>Votus.One Presents · The Universal Skill</p>
            </Reveal>
            <Reveal delay={0.3}>
              <h1 style={{
                fontSize: "clamp(2.7rem, 12vw, 6rem)",
                fontWeight: 200,
                letterSpacing: "0.14em",
                marginBottom: 24,
                background: "linear-gradient(105deg, #9beaff 0%, #00d4ff 42%, #ffd166 105%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                color: "#00d4ff",
                animation: "ph-glow 7s ease-in-out infinite",
              }}>PromptHero</h1>
            </Reveal>
            <Reveal delay={0.45}>
              <p style={{ maxWidth: 460, fontSize: "clamp(1.05rem, 3.2vw, 1.35rem)", fontWeight: 200, fontStyle: "italic", lineHeight: 1.9, color: mid, marginBottom: 20 }}>
                Every prompt is a mirror.<br />PromptHero teaches you to read it.
              </p>
            </Reveal>
            <Reveal delay={0.6}>
              <p style={{ maxWidth: 480, fontSize: 14, fontWeight: 300, lineHeight: 2, color: dim }}>
                A personal learning engine for the craft of the ask — it studies your prompts, coaches your growth, and writes your evolution as it happens. One markdown file. Works with Claude, Davara, Hermes, Openclaw, and any agent that can read.
              </p>
            </Reveal>
            <Reveal delay={0.75}>
              <HeroActions skillText={skill} />
            </Reveal>
            <Reveal delay={0.95}>
              <div style={{ marginTop: 52, width: 1, height: 60, background: "linear-gradient(180deg, rgba(0,212,255,0.5), transparent)", animation: "ph-line 3s ease-in-out infinite" }} />
            </Reveal>
          </section>

          {/* ─── Manifesto ─── */}
          <section style={{ ...sectionStyle, paddingTop: 24 }}>
            <div style={columnStyle}>
              <Reveal>
                <p style={{ ...kickerStyle, marginBottom: 36 }}>Prologue · Why The Ask Matters</p>
              </Reveal>
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
          <TheCharge />
          <Initium initiumText={initium} />
          <Gratitude />

          <PromptFooter />
        </div>
      </main>
    </SoundVeil>
  );
}
