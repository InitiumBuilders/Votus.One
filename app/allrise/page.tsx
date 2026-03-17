import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "///AllRise/// — A Votus.One Experience",
  description: "What if the people who cared the most had the simplest way to show up? Not once every four years. Not alone. Together. ///AllRise///",
  openGraph: { title: "///AllRise///", description: "The cure for apathy isn't louder leaders — it's a seat at the table." },
};
import VotusMark from "@/components/VotusMark";
import Waitlist from "@/components/Waitlist";
import SoundGate from "@/components/SoundEngine";
import PageFooter from "@/components/PageFooter";

export default function AllRise() {
  const dim = "rgba(250,250,250,0.45)";
  const mid = "rgba(250,250,250,0.65)";
  const cyan = "#00d4ff";

  return (
    <SoundGate scene="allrise">
      <style>{`
        @keyframes expand {
          0% { opacity: 0; letter-spacing: 0.8em; filter: blur(4px); }
          100% { opacity: 1; letter-spacing: 0.3em; filter: blur(0); }
        }
        @keyframes ring-breathe {
          0%, 100% { box-shadow: 0 0 60px rgba(0,212,255,0.1), 0 0 120px rgba(0,212,255,0.03); }
          50% { box-shadow: 0 0 100px rgba(0,212,255,0.25), 0 0 200px rgba(0,212,255,0.08); }
        }
        @keyframes ring-appear {
          0% { opacity: 0; transform: scale(0.6); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes vertical-drift {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes glow-breathe {
          0%, 100% { text-shadow: 0 0 50px rgba(0,212,255,0.3), 0 0 100px rgba(0,212,255,0.1); }
          50% { text-shadow: 0 0 80px rgba(0,212,255,0.5), 0 0 160px rgba(0,212,255,0.2); }
        }
        @keyframes line-pulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.6; }
        }
        @keyframes card-glow {
          0%, 100% { box-shadow: 0 0 25px rgba(0,212,255,0.06), inset 0 0 25px rgba(0,212,255,0.02); border-color: rgba(0,212,255,0.12); }
          50% { box-shadow: 0 0 50px rgba(0,212,255,0.15), inset 0 0 40px rgba(0,212,255,0.05); border-color: rgba(0,212,255,0.25); }
        }
        @keyframes final-rise {
          0% { opacity: 0; transform: translateY(40px) scale(0.9); filter: blur(12px); }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        .ex { opacity: 0; animation: expand 2s ease-out 2s forwards; }
        .gb { animation: glow-breathe 4s ease-in-out infinite; }
        .glow-card { animation: card-glow 5s ease-in-out infinite; }
      `}</style>

      <main style={{
        background: "#09090b",
        color: "#fafafa",
        minHeight: "100dvh",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif",
        WebkitFontSmoothing: "antialiased",
        overflow: "hidden",
      }}>

        {/* ═══ ACT I: THE ARRIVAL ═══ */}
        <section style={{
          minHeight: "100dvh",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "0 24px", textAlign: "center",
          position: "relative",
        }}>
          {/* Outer ring */}
          <div style={{
            position: "absolute",
            width: 220, height: 220,
            borderRadius: "50%",
            border: "1px solid rgba(0,212,255,0.08)",
            animation: "ring-appear 2.5s ease-out 0.3s forwards, ring-breathe 8s ease-in-out infinite 2s",
            opacity: 0,
            pointerEvents: "none",
          }} />
          {/* Inner mark */}
          <div style={{
            width: 140, height: 140,
            borderRadius: "50%",
            border: "1px solid rgba(0,212,255,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 56,
            animation: "ring-appear 2s ease-out 0.5s forwards, ring-breathe 6s ease-in-out infinite 2s",
            opacity: 0,
          }}>
            <VotusMark size={40} />
          </div>

          <h1 className="ex gb" style={{
            fontSize: "clamp(2.5rem, 10vw, 5rem)",
            fontWeight: 200,
            textTransform: "uppercase",
            color: cyan,
            marginBottom: 20,
          }}>
            ///AllRise///
          </h1>

          <p style={{
            fontSize: "clamp(0.9rem, 2.5vw, 1.1rem)",
            fontWeight: 300,
            letterSpacing: "0.4em",
            textTransform: "uppercase",
            color: dim,
            opacity: 0,
            animation: "ring-appear 1.2s ease-out 3.5s forwards",
          }}>
            A Votus.One Experience
          </p>

          {/* Scroll indicator */}
          <div style={{
            position: "absolute", bottom: 40,
            display: "flex", flexDirection: "column", alignItems: "center",
            animation: "vertical-drift 3s ease-in-out infinite",
          }}>
            <div style={{
              width: 1, height: 50,
              background: "linear-gradient(to bottom, rgba(0,212,255,0.3), transparent)",
            }} />
          </div>
        </section>

        {/* ═══ ACT II: THE WEIGHT ═══ */}
        <section style={{
          minHeight: "100dvh",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "0 24px", textAlign: "center",
        }}>
          <Reveal>
            <p style={{
              fontSize: "clamp(1.4rem, 4.5vw, 2.2rem)",
              fontWeight: 200,
              lineHeight: 1.6,
              color: mid,
              marginBottom: 48,
              maxWidth: 600,
            }}>
              We were told to wait our turn.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <p style={{
              fontSize: "clamp(1.4rem, 4.5vw, 2.2rem)",
              fontWeight: 200,
              lineHeight: 1.6,
              color: mid,
              marginBottom: 48,
              maxWidth: 600,
            }}>
              We were told the system works.
            </p>
          </Reveal>
          <Reveal delay={0.6}>
            <p style={{
              fontSize: "clamp(1.4rem, 4.5vw, 2.2rem)",
              fontWeight: 200,
              lineHeight: 1.6,
              color: mid,
              marginBottom: 64,
              maxWidth: 600,
            }}>
              We were told one voice is enough.
            </p>
          </Reveal>
          <Reveal delay={0.9}>
            <div style={{
              height: 1, width: 60,
              background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.4), transparent)",
              margin: "0 auto 64px",
            }} />
          </Reveal>
          <Reveal delay={1.1}>
            <p style={{
              fontSize: "clamp(1.8rem, 6vw, 3rem)",
              fontWeight: 200,
              color: "#fafafa",
              textShadow: "0 0 40px rgba(255,255,255,0.1)",
            }}>
              It wasn&rsquo;t.
            </p>
          </Reveal>
        </section>

        {/* ═══ ACT III: THE QUESTION ═══ */}
        <section style={{
          minHeight: "100dvh",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "0 24px", textAlign: "center",
        }}>
          <Reveal>
            <p style={{
              fontSize: 14,
              letterSpacing: "0.5em",
              textTransform: "uppercase",
              color: "rgba(0,212,255,0.4)",
              marginBottom: 56,
            }}>The Question</p>
          </Reveal>
          <Reveal delay={0.2}>
            <blockquote style={{
              maxWidth: 600,
              fontSize: "clamp(1.5rem, 5vw, 2.4rem)",
              fontWeight: 200,
              lineHeight: 1.6,
              fontStyle: "italic",
              color: "rgba(250,250,250,0.85)",
              marginBottom: 56,
            }}>
              What if the people who cared the most<br />
              had the simplest way to show up?
            </blockquote>
          </Reveal>
          <Reveal delay={0.4}>
            <div style={{
              height: 1, width: 60,
              background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.3), transparent)",
              margin: "0 auto 56px",
            }} />
          </Reveal>
          <Reveal delay={0.5}>
            <p style={{
              maxWidth: 480,
              fontSize: "clamp(1.1rem, 3vw, 1.5rem)",
              fontWeight: 300,
              lineHeight: 2.2,
              color: dim,
            }}>
              Not once every four years.<br />
              Not through a screen.<br />
              Not alone.<br />
              <span style={{ color: cyan, textShadow: `0 0 20px rgba(0,212,255,0.3)` }}>Together.</span>
            </p>
          </Reveal>
        </section>

        {/* ═══ ACT IV: THE UNIT ═══ */}
        <section style={{
          minHeight: "100dvh",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "80px 24px", textAlign: "center",
        }}>
          <Reveal>
            <p style={{
              fontSize: 14,
              letterSpacing: "0.5em",
              textTransform: "uppercase",
              color: cyan,
              marginBottom: 20,
              textShadow: `0 0 15px rgba(0,212,255,0.3)`,
            }}>Introducing</p>
          </Reveal>
          <Reveal delay={0.15}>
            <h2 style={{
              fontSize: "clamp(2rem, 7vw, 3.5rem)",
              fontWeight: 200,
              letterSpacing: "0.1em",
              marginBottom: 56,
              textShadow: "0 0 30px rgba(255,255,255,0.08)",
            }}>The Votus Unit</h2>
          </Reveal>
          <Reveal delay={0.3}>
            <p style={{
              maxWidth: 540,
              fontSize: "clamp(1.05rem, 2.8vw, 1.3rem)",
              fontWeight: 300,
              lineHeight: 2,
              color: mid,
              marginBottom: 56,
            }}>
              The smallest building block of real democracy.
              A group of people&mdash;neighbors, friends, anyone who gives a damn&mdash;who
              come together to listen, propose, and vote. Transparently. On-chain. As equals.
            </p>
          </Reveal>

          <div style={{ maxWidth: 500, width: "100%", marginBottom: 56, textAlign: "left" }}>
            {[
              ["Gather", "Find your people. Five is enough. One hundred is powerful."],
              ["Listen", "Everyone writes before anyone speaks. Every voice weighted equally."],
              ["Propose", "Anyone can surface what matters. No gatekeepers."],
              ["Vote", "On-chain. Transparent. Verifiable. Your vote is yours forever."],
              ["Delegate", "Trust someone to carry your voice\u2014or carry it yourself. Every time."],
            ].map(([title, desc], i) => (
              <Reveal key={title} delay={0.1 * i}>
                <div style={{
                  marginBottom: 28,
                  paddingLeft: 28,
                  borderLeft: `2px solid rgba(0,212,255,${0.12 + i * 0.05})`,
                }}>
                  <h3 style={{
                    fontSize: "clamp(1.1rem, 2.5vw, 1.3rem)",
                    fontWeight: 300,
                    letterSpacing: "0.12em",
                    color: cyan,
                    marginBottom: 8,
                    textShadow: `0 0 15px rgba(0,212,255,0.2)`,
                  }}>{title}</h3>
                  <p style={{
                    fontSize: "clamp(0.95rem, 2.2vw, 1.1rem)",
                    fontWeight: 300,
                    lineHeight: 1.8,
                    color: dim,
                  }}>{desc}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.5}>
            <p style={{
              fontSize: "clamp(1.1rem, 3vw, 1.4rem)",
              fontWeight: 200,
              fontStyle: "italic",
              color: mid,
            }}>
              Anyone can start one. That&rsquo;s the point.
            </p>
          </Reveal>
        </section>

        {/* ═══ ACT V: THE FRAMEWORK ═══ */}
        <section style={{
          minHeight: "100dvh",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "80px 24px", textAlign: "center",
        }}>
          <Reveal>
            <p style={{
              fontSize: 14,
              letterSpacing: "0.5em",
              textTransform: "uppercase",
              color: cyan,
              marginBottom: 56,
              textShadow: `0 0 15px rgba(0,212,255,0.3)`,
            }}>The Framework</p>
          </Reveal>
          <div style={{ maxWidth: 580 }}>
            <Reveal delay={0.15}>
              <p style={{
                fontSize: "clamp(1.05rem, 2.8vw, 1.3rem)",
                fontWeight: 300,
                lineHeight: 2.2,
                color: mid,
                marginBottom: 32,
              }}>
                A voting platform for teams. Instead of electing one representative, this is a framework for teams to come together as one and campaign for positions as a whole. Ie VOTE US. <span style={{ color: cyan }}>Votus.</span>
              </p>
            </Reveal>
            <Reveal delay={0.25}>
              <div style={{
                height: 1, width: 60,
                background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.3), transparent)",
                margin: "0 auto 40px",
              }} />
            </Reveal>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 24,
              marginBottom: 48,
            }}>
              <Reveal delay={0.3}>
                <div className="glow-card" style={{
                  background: "linear-gradient(135deg, rgba(0,212,255,0.06), rgba(0,212,255,0.02))",
                  border: "1px solid rgba(0,212,255,0.15)",
                  borderRadius: 20,
                  padding: "36px 28px",
                  textAlign: "left",
                  position: "relative",
                  overflow: "hidden",
                }}>
                  <div style={{
                    position: "absolute", top: 0, right: 0,
                    width: 80, height: 80,
                    background: "radial-gradient(circle at top right, rgba(0,212,255,0.12), transparent 70%)",
                    pointerEvents: "none",
                  }} />
                  <h3 style={{
                    fontSize: "clamp(1.4rem, 3.5vw, 1.8rem)",
                    fontWeight: 200,
                    color: cyan,
                    marginBottom: 14,
                    textShadow: `0 0 20px rgba(0,212,255,0.3)`,
                  }}>$Votus</h3>
                  <p style={{
                    fontSize: "clamp(1rem, 2.2vw, 1.1rem)",
                    fontWeight: 300,
                    lineHeight: 1.8,
                    color: mid,
                  }}>For those who show up and make decisions together.</p>
                </div>
              </Reveal>
              <Reveal delay={0.4}>
                <div className="glow-card" style={{
                  background: "linear-gradient(135deg, rgba(0,212,255,0.06), rgba(0,212,255,0.02))",
                  border: "1px solid rgba(0,212,255,0.15)",
                  borderRadius: 20,
                  padding: "36px 28px",
                  textAlign: "left",
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
                    fontSize: "clamp(1.4rem, 3.5vw, 1.8rem)",
                    fontWeight: 200,
                    color: cyan,
                    marginBottom: 14,
                    textShadow: `0 0 20px rgba(0,212,255,0.3)`,
                  }}>$Motus</h3>
                  <p style={{
                    fontSize: "clamp(1rem, 2.2vw, 1.1rem)",
                    fontWeight: 300,
                    lineHeight: 1.8,
                    color: mid,
                  }}>For those who move.</p>
                </div>
              </Reveal>
            </div>
            <Reveal delay={0.5}>
              <p style={{
                fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
                fontWeight: 300,
                color: dim,
              }}>
                Votus Units earn Motus based on how they move together. The community votes on how to award and allocate Motus.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ═══ ACT VI: THE RECKONING ═══ */}
        <section style={{
          minHeight: "100dvh",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "80px 24px", textAlign: "center",
          position: "relative",
        }}>
          {/* Ambient tension glow */}
          <div style={{
            position: "absolute",
            width: 500, height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,60,60,0.03), transparent 70%)",
            pointerEvents: "none",
          }} />

          <Reveal sound="reckoning">
            <p style={{
              fontSize: "clamp(1.4rem, 4vw, 2rem)",
              fontWeight: 300,
              lineHeight: 2,
              color: mid,
              marginBottom: 32,
              maxWidth: 540,
            }}>
              Because problems don&rsquo;t go away with ignorance.
            </p>
          </Reveal>
          <Reveal delay={0.3}>
            <p style={{
              fontSize: "clamp(1.6rem, 5vw, 2.5rem)",
              fontWeight: 200,
              color: "#fafafa",
              marginBottom: 64,
              textShadow: "0 0 30px rgba(255,255,255,0.1)",
            }}>They get worse.</p>
          </Reveal>
          <Reveal delay={0.6}>
            <p style={{
              fontSize: "clamp(1.4rem, 4vw, 2rem)",
              fontWeight: 300,
              lineHeight: 2,
              color: mid,
              marginBottom: 32,
              maxWidth: 540,
            }}>
              Because problems don&rsquo;t go away with silence.
            </p>
          </Reveal>
          <Reveal delay={0.9}>
            <p style={{
              fontSize: "clamp(1.6rem, 5vw, 2.5rem)",
              fontWeight: 200,
              color: "#fafafa",
              marginBottom: 80,
              textShadow: "0 0 30px rgba(255,255,255,0.1)",
            }}>They get worse.</p>
          </Reveal>
          <Reveal delay={1.2}>
            <div style={{
              height: 1, width: 80,
              background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.4), transparent)",
              margin: "0 auto 80px",
            }} />
          </Reveal>
          <Reveal delay={1.5} sound="allrise">
            <p className="gb" style={{
              fontSize: "clamp(2.2rem, 8vw, 4rem)",
              fontWeight: 200,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#fafafa",
              marginBottom: 24,
            }}>IT&rsquo;S TIME</p>
          </Reveal>
          <Reveal delay={1.7}>
            <p style={{
              fontSize: "clamp(1.2rem, 4vw, 1.8rem)",
              fontWeight: 200,
              letterSpacing: "0.35em",
              color: cyan,
              textShadow: `0 0 30px rgba(0,212,255,0.35)`,
            }}>VOTUS.ONE</p>
          </Reveal>
        </section>

        {/* ═══ ACT VII: THE PLEDGE ═══ */}
        <section style={{
          minHeight: "100dvh",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "80px 24px", textAlign: "center",
          position: "relative",
        }}>
          <Reveal sound="pledge">
            <blockquote style={{
              maxWidth: 520,
              fontSize: "clamp(1.4rem, 4.5vw, 2rem)",
              fontWeight: 200,
              lineHeight: 1.8,
              color: "rgba(250,250,250,0.8)",
              marginBottom: 32,
              textShadow: "0 0 30px rgba(255,255,255,0.05)",
            }}>
              I am small.<br />
              I am strong.<br />
              And I am always still learning.
            </blockquote>
          </Reveal>
          <Reveal delay={0.2}>
            <p style={{
              fontSize: 15,
              letterSpacing: "0.2em",
              color: dim,
              marginBottom: 80,
            }}>&mdash; August James</p>
          </Reveal>
          <Reveal delay={0.4}>
            <div style={{
              height: 1, width: 60,
              background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.3), transparent)",
              margin: "0 auto 80px",
            }} />
          </Reveal>
          <Reveal delay={0.5}>
            <p style={{
              fontSize: "clamp(1.2rem, 3.5vw, 1.6rem)",
              fontWeight: 300,
              lineHeight: 2.2,
              color: dim,
              marginBottom: 12,
            }}>
              We are not here to be right.
            </p>
          </Reveal>
          <Reveal delay={0.6}>
            <p style={{
              fontSize: "clamp(1.2rem, 3.5vw, 1.6rem)",
              fontWeight: 300,
              lineHeight: 2.2,
              color: dim,
              marginBottom: 20,
            }}>
              We are here to see together.
            </p>
          </Reveal>
          <Reveal delay={0.8} sound="allrise">
            <p className="gb" style={{
              fontSize: "clamp(1.8rem, 6vw, 3rem)",
              fontWeight: 200,
              color: cyan,
              letterSpacing: "0.15em",
            }}>
              All rise.
            </p>
          </Reveal>
        </section>

        {/* ═══ ACT VIII: JOIN ═══ */}
        <section style={{
          padding: "100px 24px",
          display: "flex", flexDirection: "column",
          alignItems: "center", textAlign: "center",
        }}>
          <Reveal>
            <p style={{
              fontSize: 14,
              letterSpacing: "0.5em",
              textTransform: "uppercase",
              color: dim,
              marginBottom: 20,
            }}>Be First</p>
          </Reveal>
          <Reveal delay={0.1}>
            <p style={{
              fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
              fontWeight: 300,
              color: mid,
              marginBottom: 40,
            }}>Enter your email. Join the movement.</p>
          </Reveal>
          <Reveal delay={0.2}><Waitlist /></Reveal>
          <Reveal delay={0.4}>
            <div style={{ marginTop: 40, display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
              <Link href="/start" style={{
                textDecoration: "none",
                fontSize: 14,
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: "#00d4ff",
                transition: "opacity 0.3s, text-shadow 0.3s",
                textShadow: "0 0 15px rgba(0,212,255,0.2)",
              }}>
                Start A Votus Unit &rarr;
              </Link>
              <Link href="/votus-units" style={{
                textDecoration: "none",
                fontSize: 14,
                letterSpacing: "0.25em",
                textTransform: "uppercase",
                color: "rgba(0,212,255,0.5)",
                transition: "color 0.3s",
              }}>
                View All Units &rarr;
              </Link>
            </div>
          </Reveal>
        </section>

        <PageFooter />
      </main>
    </SoundGate>
  );
}
