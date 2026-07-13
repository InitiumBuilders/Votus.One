"use client";

// The Marks — every dated call the oracle has made, held to account. A living
// ledger: a countdown to each prediction's window, and one honest question when
// it arrives — did it come true? The oracle keeps its own scorecard.

import type { OracleId } from "./oracle";
import { dim, faint, gold, goldSoft, mid, moon, sans, serif, teal, veilSoft } from "./theme";

export interface Mark {
  id: string;
  oracle: OracleId;
  question: string;
  text: string;
  createdAt: number;
  dueAt: number;
  status: "pending" | "true" | "miss";
}

const DAY = 86400000;

function countdown(m: Mark, now: number): { label: string; color: string } {
  if (m.status === "true") return { label: "Came true ✦", color: gold };
  if (m.status === "miss") return { label: "Still waiting on the weave", color: dim };
  const diff = m.dueAt - now;
  if (diff <= 0) return { label: "The window has arrived — watch closely", color: teal };
  const days = Math.ceil(diff / DAY);
  if (days <= 1) return { label: "Comes due today", color: goldSoft };
  return { label: `Comes due in ${days} days`, color: goldSoft };
}

export default function Marks({
  marks,
  now,
  onSet,
  onClose,
}: {
  marks: Mark[];
  now: number;
  onSet: (id: string, status: Mark["status"]) => void;
  onClose: () => void;
}) {
  const sorted = [...marks].sort((a, b) => b.createdAt - a.createdAt);
  const fulfilled = marks.filter((m) => m.status === "true").length;
  const resolved = marks.filter((m) => m.status !== "pending").length;
  const rate = resolved ? Math.round((fulfilled / resolved) * 100) : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="The Marks"
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
            ⚡ The Marks
          </div>
          <div style={{ fontSize: 11, color: dim, marginTop: 4, fontFamily: serif, fontStyle: "italic" }}>
            Every dated call, held to account.
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close the Marks"
          style={{
            width: 36, height: 36, borderRadius: "50%", border: `1px solid ${veilSoft}`,
            background: "transparent", color: mid, cursor: "pointer", fontSize: 16, flexShrink: 0,
          }}
        >
          ✕
        </button>
      </header>

      {marks.length > 0 && (
        <div style={{ display: "flex", gap: 10, padding: "14px 16px 4px", maxWidth: 760, width: "100%", margin: "0 auto" }}>
          <Stat n={String(marks.length)} label="watched" />
          <Stat n={String(fulfilled)} label="came true" accent={gold} />
          <Stat n={rate === null ? "—" : `${rate}%`} label="hit rate" accent={teal} />
        </div>
      )}

      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px calc(24px + env(safe-area-inset-bottom))", overscrollBehavior: "contain" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}>
          {sorted.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 20px", color: dim }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>⚡</div>
              <p style={{ fontFamily: serif, fontStyle: "italic", fontSize: 15, lineHeight: 1.8, color: mid, maxWidth: 340, margin: "0 auto" }}>
                No marks yet. Ask the oracle about your future, and every dated call it makes lands here — with a countdown, and one honest question when its window arrives.
              </p>
            </div>
          )}

          {sorted.map((m, i) => {
            const c = countdown(m, now);
            return (
              <div
                key={m.id}
                style={{
                  border: `1px solid ${m.status === "true" ? "rgba(255,209,102,0.4)" : "rgba(124,77,255,0.22)"}`,
                  borderRadius: 16, padding: "16px 18px",
                  background: m.status === "true" ? "rgba(255,209,102,0.05)" : "rgba(20,16,43,0.55)",
                  animation: `nf-rise 0.5s ease ${Math.min(i, 8) * 0.05}s both`,
                }}
              >
                <div style={{ fontSize: 9.5, letterSpacing: "0.2em", textTransform: "uppercase", color: dim, marginBottom: 8, fontFamily: sans }}>
                  {m.oracle === "natalie" ? "☾ Natalie" : "☉ Nat-Future"} · on “{m.question.length > 44 ? m.question.slice(0, 44) + "…" : m.question}”
                </div>
                <div style={{ fontFamily: serif, fontSize: 15.5, lineHeight: 1.7, color: m.status === "true" ? "#fff3d6" : moon }}>
                  {m.text}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 14, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, letterSpacing: "0.12em", color: c.color, fontFamily: sans }}>
                    {c.label}
                  </span>
                  {m.status === "pending" ? (
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        className="nf-chip"
                        onClick={() => onSet(m.id, "true")}
                        style={{
                          padding: "7px 14px", borderRadius: 999, cursor: "pointer", fontFamily: sans, fontSize: 12,
                          border: `1px solid ${gold}`, background: "rgba(255,209,102,0.12)", color: gold,
                        }}
                      >
                        It came true ✦
                      </button>
                      <button
                        className="nf-chip"
                        onClick={() => onSet(m.id, "miss")}
                        style={{
                          padding: "7px 14px", borderRadius: 999, cursor: "pointer", fontFamily: sans, fontSize: 12,
                          border: `1px solid ${veilSoft}`, background: "transparent", color: dim,
                        }}
                      >
                        Not yet
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => onSet(m.id, "pending")}
                      style={{ padding: "6px 10px", borderRadius: 999, cursor: "pointer", fontFamily: sans, fontSize: 10.5, border: "none", background: "transparent", color: faint, letterSpacing: "0.1em" }}
                    >
                      reopen
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Stat({ n, label, accent = moon }: { n: string; label: string; accent?: string }) {
  return (
    <div style={{ flex: 1, textAlign: "center", padding: "12px 8px", border: "1px solid rgba(124,77,255,0.18)", borderRadius: 14, background: "rgba(124,77,255,0.05)" }}>
      <div style={{ fontSize: 22, fontWeight: 300, color: accent, fontFamily: serif }}>{n}</div>
      <div style={{ fontSize: 9.5, letterSpacing: "0.2em", textTransform: "uppercase", color: dim, marginTop: 4 }}>{label}</div>
    </div>
  );
}
