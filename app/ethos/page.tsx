import type { Metadata } from "next";
import Reveal from "@/components/Reveal";
import VotusMark from "@/components/VotusMark";

export const metadata: Metadata = {
  title: "Ethos — What We Stand For",
  description: "Service over ego. Move as one. Transparency on-chain. Problems don't wait. The speed of trust. These are the beliefs that move us.",
  openGraph: { title: "Ethos — What We Stand For", description: "The principles stitched into every thread, coded into every vote." },
};
import SoundGate from "@/components/SoundEngine";
import PageFooter from "@/components/PageFooter";
import EthosCarousel from "@/components/EthosCarousel";

const principles = [
  ["Service Over Ego", "We run for office, campaign for positions, and build communities out of service. No ego involved."],
  ["Move As One", "We don\u2019t act alone. Votus is a framework for teams to come together and campaign as a whole. Ie VOTE US."],
  ["Learn To Earn", "Votus Vibes are vessels of curiosity. Make decisions with your team, earn from what you learn."],
  ["Transparency On Chain", "All votes and decisions are on chain and get documented and logged. Trust is verifiable."],
  ["Gift Over Transaction", "Send Motus when words are not enough. When someone goes above and beyond. When someone moves you."],
  ["Start Where You Are", "Anyone can start a Votus Unit. That\u2019s the point. Five people is enough. One hundred is powerful."],
  ["Problems Don\u2019t Wait", "Because problems don\u2019t go away with ignorance. They get worse. Because they don\u2019t go away with silence. They get worse."],
  ["The Speed Of Trust", "Not elected once\u2014trusted continuously. Democracy as a living system, not a periodic event."],
];

export default function Ethos() {
  const dim = "rgba(250,250,250,0.45)";
  const mid = "rgba(250,250,250,0.65)";
  const cyan = "#00d4ff";

  return (
    <SoundGate scene="introducing">
      <style>{`
        @keyframes principle-glow {
          0%, 100% { border-color: rgba(0,212,255,0.1); }
          50% { border-color: rgba(0,212,255,0.25); }
        }
        @keyframes accent-pulse {
          0%, 100% { opacity: 0.3; width: 40px; }
          50% { opacity: 0.8; width: 80px; }
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

        {/* ─── Title ─── */}
        <section style={{
          minHeight: "100dvh",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: "80px 24px", textAlign: "center",
        }}>
          <Reveal><div style={{ marginBottom: 40 }}><VotusMark size={44} /></div></Reveal>
          <Reveal delay={0.2}>
            <p style={{
              fontSize: 14,
              letterSpacing: "0.5em",
              textTransform: "uppercase",
              color: dim,
              marginBottom: 28,
            }}>What We Stand For</p>
          </Reveal>
          <Reveal delay={0.3}>
            <h1 style={{
              fontSize: "clamp(2.5rem, 9vw, 4.5rem)",
              fontWeight: 200,
              letterSpacing: "0.12em",
              marginBottom: 24,
              textShadow: "0 0 40px rgba(0,212,255,0.15)",
            }}>Ethos</h1>
          </Reveal>
          <Reveal delay={0.4}>
            <p style={{
              maxWidth: 480,
              fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
              fontWeight: 300,
              lineHeight: 2,
              color: mid,
            }}>
              These are the beliefs that move us. The principles stitched into every thread, coded into every vote, carried in every unit.
            </p>
          </Reveal>
        </section>

        {/* ─── Principles ─── */}
        <section style={{ padding: "40px 24px 100px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ maxWidth: 600, width: "100%" }}>
            {principles.map(([title, desc], i) => (
              <Reveal key={title} delay={0.08 * i} sound={i === 6 ? "reckoning" : "reveal"}>
                <div style={{
                  borderLeft: `2px solid rgba(0,212,255,${0.12 + (i % 4) * 0.04})`,
                  paddingLeft: 28,
                  marginBottom: 48,
                  animation: "principle-glow 6s ease-in-out infinite",
                  animationDelay: `${i * 0.5}s`,
                }}>
                  <h3 style={{
                    fontSize: "clamp(1.2rem, 3vw, 1.5rem)",
                    fontWeight: 200,
                    color: cyan,
                    marginBottom: 12,
                    letterSpacing: "0.08em",
                    textShadow: `0 0 20px rgba(0,212,255,0.2)`,
                  }}>{title}</h3>
                  <p style={{
                    fontSize: "clamp(0.95rem, 2.2vw, 1.1rem)",
                    fontWeight: 300,
                    lineHeight: 1.9,
                    color: dim,
                  }}>{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ─── The Words We Wear — CINEMATIC CAROUSEL ─── */}
        <section style={{
          padding: "60px 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}>
          <Reveal>
            <p style={{
              fontSize: "clamp(1rem, 3vw, 1.3rem)",
              letterSpacing: "0.5em",
              textTransform: "uppercase",
              color: dim,
              marginBottom: 24,
              textShadow: "0 0 15px rgba(255,255,255,0.05)",
            }}>The Words We Wear</p>
          </Reveal>
          <EthosCarousel />
        </section>

        {/* ─── Close ─── */}
        <section style={{ padding: "80px 24px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Reveal>
            <div style={{
              height: 1,
              background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.3), transparent)",
              animation: "accent-pulse 4s ease-in-out infinite",
              margin: "0 auto 56px",
            }} />
          </Reveal>
          <Reveal delay={0.2}>
            <blockquote style={{
              maxWidth: 500,
              fontSize: "clamp(1.3rem, 4vw, 1.8rem)",
              fontWeight: 200,
              lineHeight: 1.8,
              fontStyle: "italic",
              color: mid,
              marginBottom: 20,
              textShadow: "0 0 30px rgba(255,255,255,0.05)",
            }}>
              I am small. I am strong.<br />And I am always still learning.
            </blockquote>
          </Reveal>
          <Reveal delay={0.3} sound="pledge">
            <p style={{
              fontSize: 15,
              letterSpacing: "0.2em",
              color: dim,
            }}>&mdash; August James</p>
          </Reveal>
        </section>

        <PageFooter />
      </main>
    </SoundGate>
  );
}
