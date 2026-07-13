"use client";

// The Inner Pathways — a lantern-lit hall off the main chamber. One door for
// every weather of the heart; behind each door, asks that open the exact
// reading a heavy day needs. The anxiety door also offers the breath.

import { PATHWAYS } from "./oracle";
import { dim, faint, gold, goldSoft, mid, moon, sans, serif, veilSoft } from "./theme";

export default function Pathways({
  onAsk,
  onClose,
  onBreathe,
}: {
  onAsk: (text: string) => void;
  onClose: () => void;
  onBreathe: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Inner Pathways"
      style={{
        position: "fixed", inset: 0, zIndex: 50, display: "flex", flexDirection: "column",
        background: "rgba(7,5,16,0.96)", backdropFilter: "blur(16px)",
        animation: "nf-fade 0.4s ease both",
      }}
    >
      <header style={{
        padding: "calc(14px + env(safe-area-inset-top)) 18px 14px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid rgba(124,77,255,0.2)",
      }}>
        <div>
          <div style={{ fontSize: 13, letterSpacing: "0.3em", textTransform: "uppercase", color: moon }}>
            ☽ Inner Pathways
          </div>
          <div style={{ fontSize: 11, color: dim, marginTop: 4, fontFamily: serif, fontStyle: "italic" }}>
            Real talk and hype for heavy days. All states welcome here.
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close pathways"
          style={{
            width: 36, height: 36, borderRadius: "50%", border: `1px solid ${veilSoft}`,
            background: "transparent", color: mid, cursor: "pointer", fontSize: 16, flexShrink: 0,
          }}
        >
          ✕
        </button>
      </header>

      <div style={{ flex: 1, overflowY: "auto", padding: "18px 16px calc(20px + env(safe-area-inset-bottom))", overscrollBehavior: "contain" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 320px), 1fr))", gap: 14, maxWidth: 900, margin: "0 auto" }}>
          {PATHWAYS.map((p, i) => (
            <div
              key={p.id}
              style={{
                border: "1px solid rgba(124,77,255,0.25)", borderRadius: 18,
                background: "rgba(20,16,43,0.55)", padding: "18px 18px 14px",
                animation: `nf-rise 0.5s ease ${i * 0.06}s both`,
              }}
            >
              <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                <span style={{ fontSize: 20 }}>{p.sigil}</span>
                <span style={{ fontSize: 13, letterSpacing: "0.18em", textTransform: "uppercase", color: moon }}>
                  {p.title}
                </span>
              </div>
              <p style={{ fontFamily: serif, fontStyle: "italic", fontSize: 13.5, lineHeight: 1.75, color: goldSoft, margin: "10px 0 12px" }}>
                “{p.whisper}”
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {p.id === "anxiety" && (
                  <button
                    className="nf-chip"
                    onClick={() => { onBreathe(); onClose(); }}
                    style={{
                      textAlign: "left", padding: "10px 14px", borderRadius: 12, cursor: "pointer",
                      border: "1px solid rgba(255,209,102,0.4)", background: "rgba(255,209,102,0.08)",
                      color: gold, fontFamily: serif, fontSize: 13.5, lineHeight: 1.5,
                      transition: "transform 0.15s ease",
                    }}
                  >
                    ☾ Breathe with me · a 4-2-8 pacer
                  </button>
                )}
                {p.asks.map((ask) => (
                  <button
                    key={ask}
                    className="nf-chip"
                    onClick={() => { onAsk(ask); onClose(); }}
                    style={{
                      textAlign: "left", padding: "10px 14px", borderRadius: 12, cursor: "pointer",
                      border: "1px solid rgba(124,77,255,0.3)", background: "rgba(124,77,255,0.08)",
                      color: mid, fontFamily: serif, fontSize: 13.5, lineHeight: 1.5,
                      transition: "transform 0.15s ease", fontStyle: "normal",
                    }}
                  >
                    ✧ {ask}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p style={{
          maxWidth: 640, margin: "24px auto 0", textAlign: "center",
          fontSize: 11, lineHeight: 1.9, color: dim, fontFamily: sans,
        }}>
          The oracle brings encouragement, foresight, and small brave steps — it is a lantern,
          not a clinician, and it is proud to walk beside professional care, never instead of it.
          <br />
          <span style={{ color: goldSoft }}>
            If you are in crisis or thinking of harming yourself: in the US, call or text{" "}
            <a href="tel:988" style={{ color: gold, textDecoration: "underline" }}>988</a> any hour —
            elsewhere, your local emergency number or{" "}
            <a href="https://findahelpline.com" target="_blank" rel="noopener noreferrer" style={{ color: gold, textDecoration: "underline" }}>
              findahelpline.com
            </a>. You matter more than any prophecy.
          </span>
        </p>
        <p style={{ textAlign: "center", fontSize: 10, letterSpacing: "0.3em", color: faint, marginTop: 18 }}>
          ✦ EVERY THREAD BENDS TOWARD LIGHT ✦
        </p>
      </div>
    </div>
  );
}
