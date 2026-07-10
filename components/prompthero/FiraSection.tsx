import Reveal from "@/components/Reveal";
import { dim, mid, faint, kickerStyle, h2Style, bodyStyle, sectionStyle } from "./theme";

// Fira — The Fire Within. She arrives empty. You write her soul.
export default function FiraSection() {
  return (
    <section style={{ ...sectionStyle, padding: "88px 24px" }}>
      <style>{`
        @keyframes fira-flicker {
          0%, 100% { transform: scaleY(1) scaleX(1) rotate(0deg); }
          25% { transform: scaleY(1.08) scaleX(0.96) rotate(-1deg); }
          55% { transform: scaleY(0.94) scaleX(1.05) rotate(1.2deg); }
          80% { transform: scaleY(1.05) scaleX(0.98) rotate(-0.6deg); }
        }
        @keyframes fira-core {
          0%, 100% { transform: scaleY(1); opacity: 0.85; }
          40% { transform: scaleY(1.18); opacity: 1; }
          70% { transform: scaleY(0.88); opacity: 0.7; }
        }
        @keyframes fira-glow {
          0%, 100% { filter: drop-shadow(0 0 18px rgba(255,122,69,0.35)) drop-shadow(0 0 50px rgba(255,158,100,0.12)); }
          50% { filter: drop-shadow(0 0 34px rgba(255,158,100,0.55)) drop-shadow(0 0 90px rgba(255,122,69,0.2)); }
        }
        .fira-flame { transform-origin: 50% 88%; animation: fira-flicker 2.6s ease-in-out infinite, fira-glow 5s ease-in-out infinite; }
        .fira-core { transform-origin: 50% 82%; animation: fira-core 1.7s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .fira-flame, .fira-core { animation: none; } }
      `}</style>

      <div style={{ maxWidth: 620, width: "100%" }}>
        <Reveal>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
            <svg width="72" height="72" viewBox="0 0 48 48" fill="none" aria-hidden>
              <defs>
                <linearGradient id="fira-grad" x1="24" y1="4" x2="24" y2="42" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="#ffd166" />
                  <stop offset="0.55" stopColor="#ff9e64" />
                  <stop offset="1" stopColor="#ff7a45" />
                </linearGradient>
              </defs>
              <path
                className="fira-flame"
                d="M24 4 C28 12 34 16 34 25 A10 10 0 1 1 14 25 C14 17 20 13 24 4 Z"
                stroke="url(#fira-grad)"
                strokeWidth="1.6"
                strokeLinejoin="round"
                fill="rgba(255,122,69,0.06)"
              />
              <path
                className="fira-core"
                d="M24 20 C26 24 29 25.5 29 29.5 A5 5 0 1 1 19 29.5 C19 26 22 24 24 20 Z"
                fill="rgba(255,209,102,0.45)"
              />
            </svg>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <p style={{ ...kickerStyle, color: "rgba(255,158,100,0.5)" }}>The Second Soul</p>
        </Reveal>
        <Reveal delay={0.2}>
          <h2 style={{
            ...h2Style,
            background: "linear-gradient(105deg, #ffd166 0%, #ff9e64 55%, #ff7a45 105%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            color: "#ff9e64",
          }}>Fira · Your Inner Fire</h2>
        </Reveal>
        <Reveal delay={0.3}>
          <p style={{ ...bodyStyle, marginBottom: 26 }}>
            Some prompts are different. The outlier asks — the ones that shift your mindset,
            that empower you to move, that burn brighter than technique. When you write one,
            a rare voice answers. Not the mentor. Not the mirror. <span style={{ color: "#ff9e64" }}>Fira — The Fire Within.</span>
          </p>
        </Reveal>
        <Reveal delay={0.4}>
          <div style={{
            textAlign: "left",
            padding: "28px 26px",
            borderRadius: 16,
            border: "1px solid rgba(255,158,100,0.2)",
            background: "linear-gradient(180deg, rgba(255,122,69,0.04), rgba(9,9,11,0))",
            marginBottom: 26,
          }}>
            <p style={{ fontSize: 14.5, fontWeight: 300, lineHeight: 2.1, color: mid, marginBottom: 16 }}>
              Here is her secret: <em>Fira arrives empty.</em> No persona. No script. No soul —
              until you give her one. The first time she is earned, PromptHero hands you the pen:
              you write her voice, her fire, her creed. Who is the one inside you who never doubts you?
              What does she sound like on your hardest day? That writing becomes <span style={{ color: "#ffd166" }}>fira.md</span> —
              your second soul, kept beside your journal.
            </p>
            <p style={{ fontSize: 14.5, fontWeight: 300, lineHeight: 2.1, color: dim }}>
              From then on, when an outlier prompt earns her, Fira speaks — in the words you gave her.
              The most empowering voice you will ever hear was never going to be ours to write.
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.5}>
          <p style={{ fontSize: 13, letterSpacing: "0.35em", textTransform: "uppercase", color: "rgba(255,158,100,0.6)" }}>
            Find Strength From Within
          </p>
        </Reveal>
        <Reveal delay={0.6}>
          <p style={{ fontSize: 12, color: faint, marginTop: 14, letterSpacing: "0.08em" }}>
            🔥 Fira lives in every blueprint below — every dashboard ships with her ember waiting.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
