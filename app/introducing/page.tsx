import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import VotusMark from "@/components/VotusMark";
import SoundGate from "@/components/SoundEngine";
import PageFooter from "@/components/PageFooter";

export const metadata: Metadata = {
  title: "Introducing — The Declaration",
  description: "I want to run for office. I want to do it right. And I want to do it out of service. No ego involved. Start A Votus Unit. Start Together.",
  openGraph: { title: "The Declaration", description: "No ego involved. Start A Votus Unit. Start Together." },
};

export default function Introducing() {
  const dim = "rgba(250,250,250,0.45)";
  const mid = "rgba(250,250,250,0.65)";
  const cyan = "#00d4ff";

  return (
    <SoundGate scene="introducing">
      <style>{`
        @keyframes accent-glow {
          0%, 100% { opacity: 0.3; width: 40px; }
          50% { opacity: 0.8; width: 80px; }
        }
      `}</style>

      <main style={{
        background: "#09090b",
        color: "#fafafa",
        minHeight: "100dvh",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif",
        WebkitFontSmoothing: "antialiased",
        padding: "60px 24px",
        textAlign: "center",
        overflow: "hidden",
      }}>
        <Reveal>
          <div style={{ marginBottom: 56 }}><VotusMark size={44} /></div>
        </Reveal>

        <Reveal delay={0.2}>
          <p style={{
            fontSize: 14,
            letterSpacing: "0.5em",
            textTransform: "uppercase",
            color: dim,
            marginBottom: 56,
          }}>The Declaration</p>
        </Reveal>

        <div style={{ maxWidth: 520 }}>
          <Reveal delay={0.3}>
            <p style={{
              fontSize: "clamp(1.3rem, 3.5vw, 1.6rem)",
              fontWeight: 300,
              lineHeight: 2,
              color: mid,
              marginBottom: 20,
            }}>I want to run for office.</p>
          </Reveal>
          <Reveal delay={0.4}>
            <p style={{
              fontSize: "clamp(1.3rem, 3.5vw, 1.6rem)",
              fontWeight: 300,
              lineHeight: 2,
              color: mid,
              marginBottom: 20,
            }}>I want to do it right.</p>
          </Reveal>
          <Reveal delay={0.5}>
            <p style={{
              fontSize: "clamp(1.3rem, 3.5vw, 1.6rem)",
              fontWeight: 300,
              lineHeight: 2,
              color: mid,
              marginBottom: 20,
            }}>And I want to do it out of service.</p>
          </Reveal>
          <Reveal delay={0.6}>
            <p style={{
              fontSize: "clamp(1.4rem, 3.5vw, 1.8rem)",
              fontWeight: 200,
              lineHeight: 2,
              color: "#fafafa",
              marginBottom: 20,
              textShadow: "0 0 30px rgba(255,255,255,0.08)",
            }}>No ego involved.</p>
          </Reveal>
          <Reveal delay={0.7}>
            <p style={{
              fontSize: "clamp(1.1rem, 3vw, 1.3rem)",
              fontWeight: 300,
              lineHeight: 2,
              color: dim,
              marginBottom: 56,
            }}>With the right scaffolding, foundation, platform, and people in place.</p>
          </Reveal>

          <Reveal delay={0.9}>
            <div style={{
              height: 1,
              background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.3), transparent)",
              animation: "accent-glow 4s ease-in-out infinite",
              margin: "0 auto 56px",
            }} />
          </Reveal>

          <Reveal delay={1}>
            <p style={{
              fontSize: "clamp(1.4rem, 4vw, 1.8rem)",
              fontWeight: 200,
              color: cyan,
              marginBottom: 12,
              textShadow: `0 0 25px rgba(0,212,255,0.3)`,
            }}>Start A Votus Unit.</p>
          </Reveal>
          <Reveal delay={1.1}>
            <p style={{
              fontSize: "clamp(1.4rem, 4vw, 1.8rem)",
              fontWeight: 200,
              color: cyan,
              marginBottom: 12,
            }}>And</p>
          </Reveal>
          <Reveal delay={1.2}>
            <p style={{
              fontSize: "clamp(1.4rem, 4vw, 1.8rem)",
              fontWeight: 200,
              color: cyan,
              marginBottom: 56,
              textShadow: `0 0 25px rgba(0,212,255,0.3)`,
            }}>Start Together.</p>
          </Reveal>

          <Reveal delay={1.4}>
            <p style={{
              fontSize: 15,
              letterSpacing: "0.2em",
              color: dim,
              marginBottom: 72,
            }}>~Votus.One</p>
          </Reveal>
        </div>

        <PageFooter />
      </main>
    </SoundGate>
  );
}
