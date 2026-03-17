"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import VotusMark from "@/components/VotusMark";
import PageFooter from "@/components/PageFooter";

interface Member {
  name: string;
  email?: string;
  role: string;
  joined: string;
}

interface VotusUnit {
  id: string;
  slug: string;
  name: string;
  founder: string;
  city: string;
  state: string;
  purpose: string;
  website: string;
  discord: string;
  imageUrl: string;
  videoUrl: string;
  votes: number;
  members: number;
  views: number;
  nextMeeting: string;
  meetingLocation: string;
  meetingRecurring: string;
  created: string;
  status: string;
}

const cyan = "#00d4ff";
const dim = "rgba(250,250,250,0.4)";
const mid = "rgba(250,250,250,0.65)";

export default function UnitPage() {
  const { slug } = useParams<{ slug: string }>();
  const [unit, setUnit] = useState<VotusUnit | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [voted, setVoted] = useState(false);
  const [votes, setVotes] = useState(0);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/units/by-slug/${slug}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setNotFound(true); }
        else {
          setUnit(data.unit);
          setVotes(data.unit.votes || 0);
          setMembers(data.members || []);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleVote = async () => {
    if (voted || !unit) return;
    setVoted(true);
    setVotes(v => v + 1);
    try { await fetch(`/api/units/${unit.id}/vote`, { method: "POST" }); }
    catch { /* best effort */ }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`https://Votus.One/u/${slug}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading) return (
    <div style={{
      background: "#09090b", minHeight: "100dvh", display: "flex",
      alignItems: "center", justifyContent: "center",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif",
    }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{
        width: 40, height: 40, borderRadius: "50%",
        border: "1px solid rgba(0,212,255,0.2)",
        borderTopColor: cyan,
        animation: "spin 1s linear infinite",
      }} />
    </div>
  );

  if (notFound || !unit) return (
    <div style={{
      background: "#09090b", minHeight: "100dvh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", textAlign: "center", padding: "40px 24px",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif",
      color: "#fafafa",
    }}>
      <VotusMark size={36} />
      <p style={{ fontSize: "clamp(1.5rem, 4vw, 2rem)", fontWeight: 200, marginTop: 32, marginBottom: 12 }}>Unit not found</p>
      <p style={{ fontSize: 15, color: dim, marginBottom: 32 }}>
        <span style={{ color: cyan }}>/u/{slug}</span> doesn&rsquo;t exist yet.
      </p>
      <Link href="/start" style={{
        textDecoration: "none", fontSize: 13, letterSpacing: "0.2em",
        textTransform: "uppercase", color: cyan,
        background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)",
        borderRadius: 100, padding: "14px 28px",
      }}>Start This Unit &rarr;</Link>
    </div>
  );

  const location = [unit.city, unit.state].filter(Boolean).join(", ");
  const joinedDate = new Date(unit.created).toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const hasMeeting = unit.nextMeeting || unit.meetingLocation || unit.meetingRecurring;

  return (
    <main style={{
      background: "#09090b", color: "#fafafa", minHeight: "100dvh",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif",
      WebkitFontSmoothing: "antialiased",
    }}>
      <style>{`
        @keyframes hero-enter {
          0% { opacity: 0; transform: translateY(30px) scale(0.97); filter: blur(8px); }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @keyframes ring-breathe {
          0%, 100% { box-shadow: 0 0 60px rgba(0,212,255,0.08); border-color: rgba(0,212,255,0.12); }
          50% { box-shadow: 0 0 100px rgba(0,212,255,0.2); border-color: rgba(0,212,255,0.25); }
        }
        @keyframes card-enter {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes stat-glow {
          0%, 100% { text-shadow: 0 0 30px rgba(0,212,255,0.2); }
          50% { text-shadow: 0 0 50px rgba(0,212,255,0.4); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .hero-section { animation: hero-enter 1.2s ease-out forwards; }
        .card-animate { animation: card-enter 0.7s ease-out both; }
        .stat-num { animation: stat-glow 4s ease-in-out infinite; }
        .ring-card { animation: ring-breathe 6s ease-in-out infinite; }
      `}</style>

      {/* ─── HERO ─── */}
      <section className="hero-section" style={{
        minHeight: "70dvh",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "100px 24px 60px", textAlign: "center", position: "relative",
        overflow: "hidden",
      }}>
        {/* Background media */}
        {unit.imageUrl && (
          <div style={{
            position: "absolute", inset: 0, zIndex: 0,
            backgroundImage: `url(${unit.imageUrl})`,
            backgroundSize: "cover", backgroundPosition: "center",
            opacity: 0.08, filter: "blur(20px)",
          }} />
        )}
        {/* Ambient glow */}
        <div style={{
          position: "absolute", top: "30%", left: "50%", transform: "translate(-50%, -50%)",
          width: 600, height: 400,
          background: "radial-gradient(ellipse, rgba(0,212,255,0.07), transparent 70%)",
          pointerEvents: "none", zIndex: 0,
        }} />

        {/* Back + share */}
        <div style={{
          position: "absolute", top: 24, left: 24, right: 24,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          zIndex: 2,
        }}>
          <Link href="/votus-units" style={{
            textDecoration: "none", fontSize: 12, letterSpacing: "0.2em",
            color: "rgba(0,212,255,0.4)", transition: "color 0.3s",
          }}>
            &larr; All Units
          </Link>
          <button onClick={copyLink} style={{
            background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.12)",
            borderRadius: 100, padding: "8px 16px", fontSize: 11, letterSpacing: "0.15em",
            textTransform: "uppercase", color: copied ? cyan : dim,
            cursor: "pointer", fontFamily: "inherit", transition: "all 0.3s",
          }}>
            {copied ? "Copied ✓" : "Share /u/" + slug}
          </button>
        </div>

        {/* Unit image */}
        {unit.imageUrl && (
          <div className="ring-card" style={{
            width: 120, height: 120, borderRadius: "50%",
            border: "1px solid rgba(0,212,255,0.15)",
            overflow: "hidden", marginBottom: 32, zIndex: 1, position: "relative",
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={unit.imageUrl} alt={unit.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        )}
        {!unit.imageUrl && (
          <div className="ring-card" style={{
            width: 100, height: 100, borderRadius: "50%",
            border: "1px solid rgba(0,212,255,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 32, zIndex: 1, position: "relative",
          }}>
            <VotusMark size={32} />
          </div>
        )}

        {/* Status badge */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8, marginBottom: 16, zIndex: 1,
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: "50%",
            background: unit.status === "active" ? "#00ff88" : "#888",
            animation: unit.status === "active" ? "pulse-dot 2s ease-in-out infinite" : "none",
          }} />
          <p style={{ fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", color: dim }}>
            {unit.status === "active" ? "Active Unit" : unit.status}
          </p>
        </div>

        {/* Unit name */}
        <h1 style={{
          fontSize: "clamp(2rem, 8vw, 4.5rem)",
          fontWeight: 200,
          letterSpacing: "0.08em",
          marginBottom: 12,
          textShadow: "0 0 50px rgba(0,212,255,0.15)",
          zIndex: 1, position: "relative",
        }}>{unit.name}</h1>

        {/* Short URL */}
        <p style={{
          fontSize: "clamp(0.85rem, 2vw, 1rem)",
          color: "rgba(0,212,255,0.5)",
          letterSpacing: "0.15em",
          marginBottom: 20,
          zIndex: 1, position: "relative",
        }}>
          Votus.One/u/{unit.slug}
        </p>

        {/* Location + founded */}
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center", marginBottom: 40, zIndex: 1 }}>
          {location && (
            <span style={{ fontSize: 14, color: dim, letterSpacing: "0.1em" }}>📍 {location}</span>
          )}
          <span style={{ fontSize: 14, color: "rgba(250,250,250,0.25)", letterSpacing: "0.1em" }}>
            Founded {joinedDate}
          </span>
        </div>

        {/* Stats row */}
        <div style={{
          display: "flex", gap: 48, flexWrap: "wrap", justifyContent: "center",
          zIndex: 1, position: "relative", marginBottom: 40,
        }}>
          {[
            { label: "Members", value: unit.members || 1 },
            { label: "Votes", value: votes },
            { label: "Views", value: unit.views || 1 },
          ].map(({ label, value }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <p className="stat-num" style={{
                fontSize: "clamp(1.6rem, 4vw, 2.2rem)",
                fontWeight: 200, color: cyan,
              }}>{value.toLocaleString()}</p>
              <p style={{ fontSize: 11, letterSpacing: "0.25em", textTransform: "uppercase", color: dim }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Vote button */}
        <button onClick={handleVote} style={{
          background: voted ? "rgba(0,212,255,0.15)" : "rgba(0,212,255,0.06)",
          border: `1px solid ${voted ? "rgba(0,212,255,0.4)" : "rgba(0,212,255,0.15)"}`,
          borderRadius: 100,
          padding: "14px 32px",
          display: "flex", alignItems: "center", gap: 10,
          cursor: voted ? "default" : "pointer",
          transition: "all 0.3s",
          boxShadow: voted ? "0 0 25px rgba(0,212,255,0.15)" : "none",
          fontFamily: "inherit", zIndex: 1, position: "relative",
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill={voted ? cyan : "rgba(0,212,255,0.5)"}>
            <path d="M12 4l8 16H4L12 4z"/>
          </svg>
          <span style={{ fontSize: 14, color: voted ? cyan : mid, letterSpacing: "0.15em" }}>
            {voted ? "Voted" : "Support This Unit"}
          </span>
        </button>
      </section>

      {/* ─── CONTENT ─── */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px 80px" }}>

        {/* Purpose */}
        {unit.purpose && (
          <section className="card-animate" style={{ animationDelay: "0.1s", marginBottom: 40 }}>
            <div style={{
              background: "linear-gradient(135deg, rgba(0,212,255,0.05), rgba(0,212,255,0.02))",
              border: "1px solid rgba(0,212,255,0.1)",
              borderRadius: 20, padding: "36px 32px",
            }}>
              <p style={{ fontSize: 12, letterSpacing: "0.35em", textTransform: "uppercase", color: cyan, marginBottom: 20 }}>
                Our Purpose
              </p>
              <p style={{
                fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
                fontWeight: 300, lineHeight: 2, color: mid,
                fontStyle: "italic",
              }}>&ldquo;{unit.purpose}&rdquo;</p>
            </div>
          </section>
        )}

        {/* Video */}
        {unit.videoUrl && (
          <section className="card-animate" style={{ animationDelay: "0.2s", marginBottom: 40 }}>
            <p style={{ fontSize: 12, letterSpacing: "0.35em", textTransform: "uppercase", color: dim, marginBottom: 16 }}>
              Our Story
            </p>
            <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid rgba(0,212,255,0.1)" }}>
              <video src={unit.videoUrl} controls style={{ width: "100%", display: "block", background: "#000" }} />
            </div>
          </section>
        )}

        {/* Next Meeting */}
        {hasMeeting && (
          <section className="card-animate" style={{ animationDelay: "0.25s", marginBottom: 40 }}>
            <div style={{
              background: "linear-gradient(135deg, rgba(0,255,136,0.04), rgba(0,212,255,0.02))",
              border: "1px solid rgba(0,255,136,0.12)",
              borderRadius: 20, padding: "32px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                <div style={{
                  width: 10, height: 10, borderRadius: "50%",
                  background: "#00ff88",
                  animation: "pulse-dot 2s ease-in-out infinite",
                }} />
                <p style={{ fontSize: 12, letterSpacing: "0.35em", textTransform: "uppercase", color: "#00ff88" }}>
                  Next Meeting
                </p>
              </div>
              {unit.nextMeeting && (
                <p style={{
                  fontSize: "clamp(1.1rem, 3vw, 1.4rem)",
                  fontWeight: 200, color: "#fafafa",
                  marginBottom: 12,
                  textShadow: "0 0 20px rgba(0,255,136,0.1)",
                }}>{unit.nextMeeting}</p>
              )}
              {unit.meetingLocation && (
                <p style={{ fontSize: 14, color: mid, marginBottom: 8, letterSpacing: "0.05em" }}>
                  📍 {unit.meetingLocation}
                </p>
              )}
              {unit.meetingRecurring && (
                <p style={{
                  fontSize: 13, color: dim, letterSpacing: "0.08em",
                  marginTop: 8,
                  background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.1)",
                  borderRadius: 8, padding: "8px 14px", display: "inline-block",
                }}>
                  🔁 {unit.meetingRecurring}
                </p>
              )}
            </div>
          </section>
        )}

        {/* Members */}
        <section className="card-animate" style={{ animationDelay: "0.3s", marginBottom: 40 }}>
          <p style={{ fontSize: 12, letterSpacing: "0.35em", textTransform: "uppercase", color: dim, marginBottom: 24 }}>
            Members · {members.length}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {members.map((m, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 16,
                background: "rgba(0,212,255,0.03)", border: "1px solid rgba(0,212,255,0.08)",
                borderRadius: 12, padding: "16px 20px",
              }}>
                {/* Avatar */}
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: `hsl(${(i * 67) % 360}, 50%, 25%)`,
                  border: "1px solid rgba(0,212,255,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 15, fontWeight: 300, color: cyan, flexShrink: 0,
                }}>
                  {m.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 15, fontWeight: 300, color: "#fafafa", marginBottom: 2 }}>{m.name}</p>
                  <p style={{ fontSize: 12, color: "rgba(0,212,255,0.5)", letterSpacing: "0.08em" }}>{m.role}</p>
                </div>
                <p style={{ fontSize: 11, color: dim, letterSpacing: "0.08em", flexShrink: 0 }}>
                  {new Date(m.joined).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                </p>
              </div>
            ))}
            {members.length === 0 && (
              <p style={{ fontSize: 14, color: dim, textAlign: "center", padding: "24px" }}>
                No members listed yet.
              </p>
            )}
          </div>
        </section>

        {/* Links */}
        {(unit.discord || unit.website) && (
          <section className="card-animate" style={{ animationDelay: "0.35s", marginBottom: 40 }}>
            <p style={{ fontSize: 12, letterSpacing: "0.35em", textTransform: "uppercase", color: dim, marginBottom: 20 }}>
              Connect
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {unit.discord && (
                <a href={unit.discord.startsWith("http") ? unit.discord : `https://${unit.discord}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{
                    textDecoration: "none", display: "flex", alignItems: "center", gap: 10,
                    background: "rgba(88,101,242,0.1)", border: "1px solid rgba(88,101,242,0.2)",
                    borderRadius: 12, padding: "14px 20px", fontSize: 14, color: "rgba(88,101,242,0.9)",
                    transition: "all 0.3s", letterSpacing: "0.05em",
                  }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="rgba(88,101,242,0.8)">
                    <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z"/>
                  </svg>
                  Join Discord
                </a>
              )}
              {unit.website && (
                <a href={unit.website.startsWith("http") ? unit.website : `https://${unit.website}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{
                    textDecoration: "none", display: "flex", alignItems: "center", gap: 8,
                    background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.15)",
                    borderRadius: 12, padding: "14px 20px", fontSize: 14, color: "rgba(0,212,255,0.7)",
                    transition: "all 0.3s", letterSpacing: "0.05em",
                  }}>
                  🌐 Visit Website ↗
                </a>
              )}
            </div>
          </section>
        )}

        {/* Founder */}
        <section className="card-animate" style={{ animationDelay: "0.4s", marginBottom: 40 }}>
          <div style={{
            borderLeft: "2px solid rgba(0,212,255,0.2)",
            paddingLeft: 24, paddingTop: 4, paddingBottom: 4,
          }}>
            <p style={{ fontSize: 12, letterSpacing: "0.25em", textTransform: "uppercase", color: dim, marginBottom: 8 }}>
              Founded by
            </p>
            <p style={{ fontSize: "clamp(1rem, 2.5vw, 1.2rem)", fontWeight: 200, color: "#fafafa" }}>
              {unit.founder}
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="card-animate" style={{ animationDelay: "0.5s", textAlign: "center", padding: "40px 0" }}>
          <div style={{ width: 60, height: 1, background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.3), transparent)", margin: "0 auto 40px" }} />
          <p style={{ fontSize: "clamp(1.2rem, 3vw, 1.5rem)", fontWeight: 200, color: mid, marginBottom: 8 }}>
            Move As One.
          </p>
          <p style={{ fontSize: 14, color: dim, marginBottom: 40 }}>Start your own unit or join the movement.</p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/start" style={{
              textDecoration: "none", fontSize: 13, letterSpacing: "0.2em",
              textTransform: "uppercase", color: cyan,
              background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)",
              borderRadius: 100, padding: "14px 28px", transition: "all 0.3s",
            }}>Start A Unit &rarr;</Link>
            <Link href="/votus-units" style={{
              textDecoration: "none", fontSize: 13, letterSpacing: "0.2em",
              textTransform: "uppercase", color: dim,
              background: "transparent", border: "1px solid rgba(0,212,255,0.1)",
              borderRadius: 100, padding: "14px 28px", transition: "all 0.3s",
            }}>Browse Units</Link>
          </div>
        </section>
      </div>

      <PageFooter back="/votus-units" />
    </main>
  );
}
