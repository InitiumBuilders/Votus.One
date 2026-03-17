import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Motus — Move As One",
  description: "Our clothing brand for Gift Gear. Send Motus when someone goes above and beyond. $Votus for decisions. $Motus for those who move.",
  openGraph: { title: "Motus — Move As One", description: "Gift Gear. $Votus for decisions. $Motus for those who move." },
};
import VotusMark from "@/components/VotusMark";
import Waitlist from "@/components/Waitlist";
import SoundGate from "@/components/SoundEngine";
import AnimatedSlogans from "@/components/AnimatedSlogans";
import PageFooter from "@/components/PageFooter";

export default function Motus() {
  const dim = "rgba(250,250,250,0.45)";
  const mid = "rgba(250,250,250,0.65)";
  const cyan = "#00d4ff";

  return (
    <SoundGate scene="motus">
      <style>{`
        @keyframes breathe-glow {
          0%, 100% { text-shadow: 0 0 40px rgba(0,212,255,0.25), 0 0 80px rgba(0,212,255,0.08); }
          50% { text-shadow: 0 0 70px rgba(0,212,255,0.5), 0 0 140px rgba(0,212,255,0.18); }
        }
        @keyframes card-glow {
          0%, 100% { box-shadow: 0 0 30px rgba(0,212,255,0.08), inset 0 0 30px rgba(0,212,255,0.03); border-color: rgba(0,212,255,0.15); }
          50% { box-shadow: 0 0 60px rgba(0,212,255,0.18), inset 0 0 50px rgba(0,212,255,0.06); border-color: rgba(0,212,255,0.3); }
        }
        @keyframes accent-line {
          0%, 100% { opacity: 0.3; width: 40px; }
          50% { opacity: 0.8; width: 80px; }
        }
        .bg { animation: breathe-glow 4s ease-in-out infinite; }
        .glow-card { animation: card-glow 5s ease-in-out infinite; }
        .glow-accent { animation: accent-line 4s ease-in-out infinite; }
      `}</style>

      <main style={{
        background: "#09090b",
        color: "#fafafa",
        minHeight: "100dvh",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif",
        WebkitFontSmoothing: "antialiased",
        overflow: "hidden",
      }}>

        {/* ─── ACT I: Motus Title ─── */}
        <section style={{
          minHeight: "100dvh",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: "80px 24px", textAlign: "center",
        }}>
          <Reveal><div style={{ marginBottom: 40 }}><VotusMark size={44} /></div></Reveal>
          <Reveal delay={0.2}>
            <p style={{ fontSize: 14, letterSpacing: "0.5em", textTransform: "uppercase", color: dim, marginBottom: 28 }}>The Brand</p>
          </Reveal>
          <Reveal delay={0.3}>
            <h1 className="bg" style={{
              fontSize: "clamp(3rem, 11vw, 6rem)",
              fontWeight: 200,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              marginBottom: 12,
            }}>Motus</h1>
          </Reveal>
          <Reveal delay={0.4}>
            <p style={{
              fontSize: "clamp(1rem, 3vw, 1.3rem)",
              fontWeight: 300,
              letterSpacing: "0.35em",
              color: cyan,
              marginBottom: 56,
              textShadow: `0 0 20px rgba(0,212,255,0.3)`,
            }}>Move As One</p>
          </Reveal>
          <Reveal delay={0.5}>
            <div className="glow-accent" style={{ height: 1, background: `linear-gradient(90deg, transparent, ${cyan}, transparent)`, margin: "0 auto 56px" }} />
          </Reveal>
          <Reveal delay={0.6}>
            <p style={{ maxWidth: 520, fontSize: "clamp(1rem, 2.5vw, 1.2rem)", fontWeight: 300, lineHeight: 2, color: mid, marginBottom: 16 }}>
              Our Clothing Brand For Motus Gear Or What We Call Gift Gear
            </p>
          </Reveal>
          <Reveal delay={0.7}>
            <p style={{ maxWidth: 520, fontSize: "clamp(1rem, 2.5vw, 1.2rem)", fontWeight: 300, lineHeight: 2, color: dim }}>
              Send MOTUS gear when you want to deeply or meaningfully thank or recognize someone.
            </p>
          </Reveal>
        </section>

        {/* ─── ACT II: Animated Slogans — DRAMATIC ─── */}
        <section style={{
          padding: "40px 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}>
          <Reveal>
            <p style={{
              fontSize: 14,
              letterSpacing: "0.5em",
              textTransform: "uppercase",
              color: cyan,
              marginBottom: 24,
              textShadow: `0 0 15px rgba(0,212,255,0.3)`,
            }}>Ethos</p>
          </Reveal>
          <Reveal delay={0.15}>
            <AnimatedSlogans />
          </Reveal>
          <Reveal delay={0.3}>
            <div style={{ marginTop: 40 }}>
              <Link href="/ethos" style={{
                textDecoration: "none",
                fontSize: 14,
                letterSpacing: "0.25em",
                color: "rgba(0,212,255,0.5)",
                transition: "color 0.3s, text-shadow 0.3s",
                textShadow: "0 0 10px rgba(0,212,255,0.1)",
              }}>
                Explore Our Ethos &rarr;
              </Link>
            </div>
          </Reveal>
        </section>

        {/* ─── ACT III: Building Blocks — MASSIVE ─── */}
        <section style={{
          padding: "100px 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}>
          <Reveal>
            <p style={{
              fontSize: 14,
              letterSpacing: "0.5em",
              textTransform: "uppercase",
              color: cyan,
              marginBottom: 64,
              textShadow: `0 0 15px rgba(0,212,255,0.3)`,
            }}>Our Building Blocks</p>
          </Reveal>
          <div style={{
            maxWidth: 700,
            width: "100%",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 24,
            marginBottom: 64,
          }}>
            <Reveal>
              <div className="glow-card" style={{
                background: "linear-gradient(135deg, rgba(0,212,255,0.06), rgba(0,212,255,0.02))",
                border: "1px solid rgba(0,212,255,0.15)",
                borderRadius: 20,
                padding: "40px 32px",
                textAlign: "left",
                backdropFilter: "blur(10px)",
                position: "relative",
                overflow: "hidden",
              }}>
                {/* Corner accent */}
                <div style={{
                  position: "absolute", top: 0, right: 0,
                  width: 80, height: 80,
                  background: "radial-gradient(circle at top right, rgba(0,212,255,0.12), transparent 70%)",
                  pointerEvents: "none",
                }} />
                <h3 style={{
                  fontSize: "clamp(1.5rem, 4vw, 2rem)",
                  fontWeight: 200,
                  color: cyan,
                  marginBottom: 16,
                  letterSpacing: "0.08em",
                  textShadow: `0 0 25px rgba(0,212,255,0.3)`,
                }}>$Votus</h3>
                <p style={{
                  fontSize: "clamp(1rem, 2.5vw, 1.15rem)",
                  fontWeight: 300,
                  lineHeight: 1.9,
                  color: mid,
                }}>
                  A universal decision making energy system. Votus Vibes earn $Votus for all onchain decisions they make.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="glow-card" style={{
                background: "linear-gradient(135deg, rgba(0,212,255,0.06), rgba(0,212,255,0.02))",
                border: "1px solid rgba(0,212,255,0.15)",
                borderRadius: 20,
                padding: "40px 32px",
                textAlign: "left",
                backdropFilter: "blur(10px)",
                position: "relative",
                overflow: "hidden",
                animationDelay: "2.5s",
              }}>
                <div style={{
                  position: "absolute", top: 0, right: 0,
                  width: 80, height: 80,
                  background: "radial-gradient(circle at top right, rgba(0,212,255,0.12), transparent 70%)",
                  pointerEvents: "none",
                }} />
                <h3 style={{
                  fontSize: "clamp(1.5rem, 4vw, 2rem)",
                  fontWeight: 200,
                  color: cyan,
                  marginBottom: 16,
                  letterSpacing: "0.08em",
                  textShadow: `0 0 25px rgba(0,212,255,0.3)`,
                }}>$Motus</h3>
                <p style={{
                  fontSize: "clamp(1rem, 2.5vw, 1.15rem)",
                  fontWeight: 300,
                  lineHeight: 1.9,
                  color: mid,
                }}>
                  Send motus when someone goes above and beyond, send motus when someone moves you. Send motus when words are not enough. Send Motus to those who move.
                </p>
              </div>
            </Reveal>
          </div>
          <Reveal delay={0.2}>
            <div className="glow-accent" style={{ height: 1, background: `linear-gradient(90deg, transparent, ${cyan}, transparent)`, margin: "0 auto 40px" }} />
          </Reveal>
          <Reveal delay={0.3}>
            <p style={{
              fontSize: "clamp(1.1rem, 3vw, 1.35rem)",
              fontWeight: 300,
              color: mid,
              marginBottom: 12,
            }}>$Votus is for those who show up and make decisions together.</p>
          </Reveal>
          <Reveal delay={0.4}>
            <p style={{
              fontSize: "clamp(1.1rem, 3vw, 1.35rem)",
              fontWeight: 300,
              color: cyan,
              textShadow: `0 0 20px rgba(0,212,255,0.25)`,
            }}>$Motus is for those who move.</p>
          </Reveal>
        </section>

        {/* ─── ACT IV: $22 ─── */}
        <section style={{
          minHeight: "50dvh",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: "80px 24px", textAlign: "center",
        }}>
          <Reveal>
            <p style={{
              fontSize: "clamp(3.5rem, 12vw, 6rem)",
              fontWeight: 200,
              color: cyan,
              marginBottom: 20,
              textShadow: `0 0 50px rgba(0,212,255,0.3), 0 0 100px rgba(0,212,255,0.1)`,
            }}>$22</p>
          </Reveal>
          <Reveal delay={0.2}>
            <p style={{
              fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
              fontWeight: 300,
              letterSpacing: "0.2em",
              color: mid,
              marginBottom: 12,
            }}>per person &middot; per month</p>
          </Reveal>
          <Reveal delay={0.3}>
            <p style={{
              fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
              fontWeight: 300,
              color: dim,
              maxWidth: 440,
            }}>Because showing up shouldn&rsquo;t cost more than showing up.</p>
          </Reveal>
        </section>

        {/* ─── ACT V: Reckoning ─── */}
        <section style={{
          minHeight: "100dvh",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: "80px 24px", textAlign: "center",
        }}>
          <Reveal sound="reckoning">
            <p style={{
              fontSize: "clamp(1.3rem, 3.5vw, 1.7rem)",
              fontWeight: 300,
              lineHeight: 2.2,
              color: mid,
              marginBottom: 28,
              maxWidth: 520,
            }}>Because problems don&rsquo;t go away with ignorance.</p>
          </Reveal>
          <Reveal delay={0.2}>
            <p style={{
              fontSize: "clamp(1.4rem, 4vw, 2rem)",
              fontWeight: 200,
              color: "#fafafa",
              marginBottom: 56,
              textShadow: "0 0 30px rgba(255,255,255,0.1)",
            }}>They get worse.</p>
          </Reveal>
          <Reveal delay={0.4}>
            <p style={{
              fontSize: "clamp(1.3rem, 3.5vw, 1.7rem)",
              fontWeight: 300,
              lineHeight: 2.2,
              color: mid,
              marginBottom: 28,
              maxWidth: 520,
            }}>Because problems don&rsquo;t go away with silence.</p>
          </Reveal>
          <Reveal delay={0.6}>
            <p style={{
              fontSize: "clamp(1.4rem, 4vw, 2rem)",
              fontWeight: 200,
              color: "#fafafa",
              marginBottom: 72,
              textShadow: "0 0 30px rgba(255,255,255,0.1)",
            }}>They get worse.</p>
          </Reveal>
          <Reveal delay={0.8}>
            <div className="glow-accent" style={{ height: 1, background: `linear-gradient(90deg, transparent, ${cyan}, transparent)`, margin: "0 auto 72px" }} />
          </Reveal>
          <Reveal delay={1} sound="allrise">
            <p style={{
              fontSize: "clamp(2rem, 7vw, 3.5rem)",
              fontWeight: 200,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              marginBottom: 20,
              textShadow: "0 0 40px rgba(255,255,255,0.15)",
            }}>IT&rsquo;S TIME</p>
          </Reveal>
          <Reveal delay={1.1}>
            <p style={{
              fontSize: "clamp(1.2rem, 3.5vw, 1.6rem)",
              fontWeight: 200,
              letterSpacing: "0.3em",
              color: cyan,
              textShadow: `0 0 25px rgba(0,212,255,0.3)`,
            }}>VOTUS.ONE</p>
          </Reveal>
        </section>

        {/* ─── Waitlist ─── */}
        <section style={{
          padding: "80px 24px",
          display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
        }}>
          <Reveal>
            <p style={{ fontSize: 14, letterSpacing: "0.4em", textTransform: "uppercase", color: dim, marginBottom: 20 }}>Be First</p>
          </Reveal>
          <Reveal delay={0.1}>
            <p style={{ fontSize: "clamp(1rem, 2.5vw, 1.15rem)", fontWeight: 300, color: mid, marginBottom: 36 }}>Enter your email. Join the movement.</p>
          </Reveal>
          <Reveal delay={0.2}><Waitlist /></Reveal>
        </section>

        <PageFooter />
      </main>
    </SoundGate>
  );
}
