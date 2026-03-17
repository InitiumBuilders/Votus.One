import Reveal from "@/components/Reveal";
import VotusMark from "@/components/VotusMark";
import SoundGate from "@/components/SoundEngine";
import UnitForm from "@/components/UnitForm";
import PageFooter from "@/components/PageFooter";

export default function Start() {
  const dim = "rgba(250,250,250,0.4)";
  const mid = "rgba(250,250,250,0.6)";
  const cyan = "#00d4ff";

  return (
    <SoundGate scene="introducing">
      <main style={{
        background: "#09090b",
        color: "#fafafa",
        minHeight: "100dvh",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif",
        WebkitFontSmoothing: "antialiased",
        overflow: "hidden",
      }}>

        {/* ─── Hero ─── */}
        <section style={{
          minHeight: "100dvh",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: "80px 24px", textAlign: "center",
        }}>
          <Reveal><div style={{ marginBottom: 32 }}><VotusMark size={36} /></div></Reveal>
          <Reveal delay={0.2}>
            <p style={{ fontSize: 11, letterSpacing: "0.4em", textTransform: "uppercase", color: cyan, marginBottom: 24 }}>Begin</p>
          </Reveal>
          <Reveal delay={0.3}>
            <h1 style={{ fontSize: "clamp(1.8rem, 6vw, 3rem)", fontWeight: 200, letterSpacing: "0.1em", marginBottom: 16 }}>
              Start A Votus Unit
            </h1>
          </Reveal>
          <Reveal delay={0.4}>
            <p style={{ maxWidth: 540, fontSize: "clamp(1rem, 2.5vw, 1.2rem)", fontWeight: 300, lineHeight: 2, color: mid, marginBottom: 16 }}>
              Maybe the hero we were looking for has been all of us over time.
            </p>
          </Reveal>
          <Reveal delay={0.5}>
            <p style={{ maxWidth: 540, fontSize: "clamp(0.95rem, 2.2vw, 1.1rem)", fontWeight: 300, lineHeight: 2, color: dim }}>
              Votus Units are teams who run together, govern together, and make democracy engaging.
              Accessible. Transparent. Human. Because the cure for apathy isn&rsquo;t louder leaders —
              it&rsquo;s a seat at the table.
            </p>
          </Reveal>
        </section>

        {/* ─── How it works ─── */}
        <section style={{ padding: "40px 24px 80px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Reveal>
            <p style={{ fontSize: 11, letterSpacing: "0.4em", textTransform: "uppercase", color: dim, marginBottom: 32, textAlign: "center" }}>How It Works</p>
          </Reveal>
          <div style={{ maxWidth: 400, width: "100%" }}>
            {[
              ["01", "Name your unit", "Give it a name that represents your crew, your block, your cause."],
              ["02", "Register", "Fill out the form below. We\u2019ll set you up."],
              ["03", "Gather your people", "Five is enough. One hundred is powerful."],
              ["04", "Start deciding together", "Propose. Discuss. Vote. On-chain. Transparent."],
            ].map(([num, title, desc], i) => (
              <Reveal key={num} delay={0.1 * i}>
                <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
                  <span style={{ fontSize: 12, letterSpacing: "0.1em", color: cyan, width: 24, flexShrink: 0, paddingTop: 2 }}>{num}</span>
                  <div>
                    <h3 style={{ fontSize: 14, fontWeight: 300, color: "#fafafa", marginBottom: 4 }}>{title}</h3>
                    <p style={{ fontSize: 13, fontWeight: 300, lineHeight: 1.7, color: dim }}>{desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ─── The Form ─── */}
        <section style={{ padding: "80px 24px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <Reveal>
            <p style={{ fontSize: 11, letterSpacing: "0.4em", textTransform: "uppercase", color: cyan, marginBottom: 16 }}>Register</p>
          </Reveal>
          <Reveal delay={0.1}>
            <p style={{ fontSize: 15, fontWeight: 300, color: mid, marginBottom: 32 }}>
              Start and register your Votus Unit. $22 per person per month.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <UnitForm />
          </Reveal>
        </section>

        <PageFooter />
      </main>
    </SoundGate>
  );
}
