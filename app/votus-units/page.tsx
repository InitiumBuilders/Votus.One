"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import VotusMark from "@/components/VotusMark";
import PageFooter from "@/components/PageFooter";

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
  created: string;
  status: string;
}

const cyan = "#00d4ff";
const dim = "rgba(250,250,250,0.4)";
const mid = "rgba(250,250,250,0.65)";

function UnitCard({ unit, onVote, rank }: { unit: VotusUnit; onVote: (id: string) => void; rank?: number }) {
  const [voted, setVoted] = useState(false);
  const [votes, setVotes] = useState(unit.votes || 0);
  const [hovering, setHovering] = useState(false);

  const handleVote = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (voted) return;
    setVoted(true);
    setVotes((v) => v + 1);
    onVote(unit.id);
    try {
      await fetch(`/api/units/${unit.id}/vote`, { method: "POST" });
    } catch { /* best effort */ }
  };

  const location = [unit.city, unit.state].filter(Boolean).join(", ");
  const timeAgo = (() => {
    const diff = Date.now() - new Date(unit.created).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return `${Math.floor(days / 30)}mo ago`;
  })();

  return (
    <Link
      href={unit.slug ? `/u/${unit.slug}` : `/votus-units`}
      style={{ textDecoration: "none", display: "block", color: "inherit" }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
    <div
      style={{
        background: hovering
          ? "linear-gradient(135deg, rgba(0,212,255,0.07), rgba(0,212,255,0.03))"
          : "linear-gradient(135deg, rgba(0,212,255,0.04), rgba(0,212,255,0.01))",
        border: `1px solid ${hovering ? "rgba(0,212,255,0.25)" : "rgba(0,212,255,0.1)"}`,
        borderRadius: 20,
        overflow: "hidden",
        transition: "all 0.4s ease",
        boxShadow: hovering
          ? "0 0 50px rgba(0,212,255,0.12), 0 20px 60px rgba(0,0,0,0.4)"
          : "0 4px 24px rgba(0,0,0,0.3)",
        position: "relative",
        transform: hovering ? "translateY(-4px)" : "translateY(0)",
        cursor: "pointer",
      }}
    >
      {/* Rank badge */}
      {rank && rank <= 3 && (
        <div style={{
          position: "absolute", top: 16, right: 16, zIndex: 2,
          width: 28, height: 28, borderRadius: "50%",
          background: rank === 1
            ? "linear-gradient(135deg, #ffd700, #ffaa00)"
            : rank === 2
            ? "linear-gradient(135deg, #c0c0c0, #999)"
            : "linear-gradient(135deg, #cd7f32, #8B4513)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, fontWeight: 600, color: "#000",
          boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
        }}>#{rank}</div>
      )}

      {/* Image / Video */}
      {(unit.imageUrl || unit.videoUrl) && (
        <div style={{
          width: "100%", height: 180, overflow: "hidden",
          background: "rgba(0,212,255,0.03)",
          position: "relative",
        }}>
          {unit.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={unit.imageUrl}
              alt={unit.name}
              style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.85 }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          ) : (
            <div style={{
              width: "100%", height: "100%",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "linear-gradient(135deg, rgba(0,212,255,0.08), rgba(0,0,0,0.5))",
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(0,212,255,0.4)" strokeWidth="1.5">
                <path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/>
                <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          )}
          {/* Gradient overlay */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to bottom, transparent 40%, rgba(9,9,11,0.9))",
          }} />
        </div>
      )}

      {/* No media placeholder */}
      {!unit.imageUrl && !unit.videoUrl && (
        <div style={{
          width: "100%", height: 100,
          background: `linear-gradient(135deg, rgba(0,212,255,0.05), rgba(0,0,0,0.3))`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <VotusMark size={24} />
        </div>
      )}

      {/* Content */}
      <div style={{ padding: "20px 24px 24px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <div style={{ flex: 1, minWidth: 0, marginRight: 12 }}>
            <h3 style={{
              fontSize: "clamp(1.1rem, 2.5vw, 1.3rem)",
              fontWeight: 200,
              color: "#fafafa",
              marginBottom: 4,
              letterSpacing: "0.05em",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}>{unit.name}</h3>
            <p style={{ fontSize: 12, color: "rgba(0,212,255,0.5)", letterSpacing: "0.08em" }}>
              {unit.slug ? `/u/${unit.slug}` : unit.id}
            </p>
          </div>
          {/* Vote button */}
          <button
            onClick={handleVote}
            style={{
              background: voted ? "rgba(0,212,255,0.15)" : "rgba(0,212,255,0.06)",
              border: `1px solid ${voted ? "rgba(0,212,255,0.4)" : "rgba(0,212,255,0.15)"}`,
              borderRadius: 12,
              padding: "8px 14px",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
              cursor: voted ? "default" : "pointer",
              transition: "all 0.3s",
              flexShrink: 0,
              boxShadow: voted ? "0 0 15px rgba(0,212,255,0.15)" : "none",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={voted ? cyan : "rgba(0,212,255,0.5)"} stroke="none">
              <path d="M12 4l8 16H4L12 4z"/>
            </svg>
            <span style={{ fontSize: 13, color: voted ? cyan : mid, fontWeight: 300 }}>{votes}</span>
          </button>
        </div>

        {/* Location + date */}
        {(location || timeAgo) && (
          <div style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
            {location && (
              <span style={{ fontSize: 12, color: dim, letterSpacing: "0.08em" }}>
                📍 {location}
              </span>
            )}
            <span style={{ fontSize: 12, color: "rgba(250,250,250,0.2)", letterSpacing: "0.08em" }}>
              {timeAgo}
            </span>
          </div>
        )}

        {/* Purpose */}
        {unit.purpose && (
          <p style={{
            fontSize: 14,
            fontWeight: 300,
            lineHeight: 1.8,
            color: dim,
            marginBottom: 16,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>
            {unit.purpose}
          </p>
        )}

        {/* Founded by */}
        <p style={{
          fontSize: 12,
          color: "rgba(250,250,250,0.3)",
          letterSpacing: "0.08em",
          marginBottom: 16,
        }}>
          Founded by <span style={{ color: "rgba(250,250,250,0.5)" }}>{unit.founder}</span>
        </p>

        {/* Links */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {unit.discord && (
            <a
              href={unit.discord.startsWith("http") ? unit.discord : `https://${unit.discord}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{
                textDecoration: "none",
                fontSize: 11,
                letterSpacing: "0.12em",
                color: "rgba(88,101,242,0.8)",
                background: "rgba(88,101,242,0.08)",
                border: "1px solid rgba(88,101,242,0.2)",
                borderRadius: 100,
                padding: "5px 12px",
                display: "flex", alignItems: "center", gap: 5,
                transition: "all 0.3s",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="rgba(88,101,242,0.8)">
                <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03z"/>
              </svg>
              Discord
            </a>
          )}
          {unit.website && (
            <a
              href={unit.website.startsWith("http") ? unit.website : `https://${unit.website}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{
                textDecoration: "none",
                fontSize: 11,
                letterSpacing: "0.12em",
                color: "rgba(0,212,255,0.7)",
                background: "rgba(0,212,255,0.06)",
                border: "1px solid rgba(0,212,255,0.15)",
                borderRadius: 100,
                padding: "5px 12px",
                transition: "all 0.3s",
              }}
            >
              Website ↗
            </a>
          )}
        </div>
      </div>
    </div>
    </Link>
  );
}

export default function VotusUnits() {
  const [units, setUnits] = useState<VotusUnit[]>([]);
  const [filtered, setFiltered] = useState<VotusUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/units")
      .then((r) => r.json())
      .then((data) => {
        const u: VotusUnit[] = data.units || [];
        // Sort by votes desc, then by created desc
        u.sort((a, b) => (b.votes || 0) - (a.votes || 0) || new Date(b.created).getTime() - new Date(a.created).getTime());
        setUnits(u);
        setFiltered(u);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setFiltered(units);
      return;
    }
    const q = query.toLowerCase();
    setFiltered(units.filter((u) =>
      u.name.toLowerCase().includes(q) ||
      u.purpose.toLowerCase().includes(q) ||
      u.city.toLowerCase().includes(q) ||
      u.state.toLowerCase().includes(q) ||
      u.founder.toLowerCase().includes(q)
    ));
  }, [query, units]);

  const handleVote = (id: string) => {
    setUnits((prev) =>
      prev.map((u) => u.id === id ? { ...u, votes: (u.votes || 0) + 1 } : u)
        .sort((a, b) => (b.votes || 0) - (a.votes || 0))
    );
  };

  const trending = units.filter((u) => (u.votes || 0) > 0).slice(0, 3);
  const allSorted = filtered;

  return (
    <main style={{
      background: "#09090b",
      color: "#fafafa",
      minHeight: "100dvh",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif",
      WebkitFontSmoothing: "antialiased",
    }}>
      <style>{`
        @keyframes grid-fade {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-ring {
          0%, 100% { box-shadow: 0 0 30px rgba(0,212,255,0.1); }
          50% { box-shadow: 0 0 60px rgba(0,212,255,0.25); }
        }
        @keyframes top-glow {
          0%, 100% { text-shadow: 0 0 50px rgba(0,212,255,0.2); }
          50% { text-shadow: 0 0 80px rgba(0,212,255,0.45); }
        }
        .unit-card { animation: grid-fade 0.6s ease-out both; }
        .search-bar:focus { border-color: rgba(0,212,255,0.4) !important; box-shadow: 0 0 25px rgba(0,212,255,0.1) !important; }
      `}</style>

      {/* ─── Header ─── */}
      <section style={{
        minHeight: "60dvh",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "100px 24px 60px",
        textAlign: "center",
        position: "relative",
      }}>
        {/* Ambient glow */}
        <div style={{
          position: "absolute", top: "30%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600, height: 300,
          background: "radial-gradient(ellipse, rgba(0,212,255,0.06), transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ marginBottom: 32 }}><VotusMark size={44} /></div>

        <p style={{
          fontSize: 13,
          letterSpacing: "0.5em",
          textTransform: "uppercase",
          color: "rgba(0,212,255,0.5)",
          marginBottom: 20,
        }}>The Movement</p>

        <h1 style={{
          fontSize: "clamp(2.5rem, 9vw, 5rem)",
          fontWeight: 200,
          letterSpacing: "0.08em",
          marginBottom: 16,
          animation: "top-glow 5s ease-in-out infinite",
          textShadow: "0 0 50px rgba(0,212,255,0.15)",
        }}>Votus Units</h1>

        <p style={{
          maxWidth: 500,
          fontSize: "clamp(1rem, 2.5vw, 1.2rem)",
          fontWeight: 300,
          lineHeight: 2,
          color: mid,
          marginBottom: 48,
        }}>
          Every unit is a community choosing to show up together.
          Search. Connect. Rise.
        </p>

        {/* Stats */}
        <div style={{ display: "flex", gap: 48, marginBottom: 48, flexWrap: "wrap", justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}>
            <p style={{
              fontSize: "clamp(1.8rem, 5vw, 2.5rem)",
              fontWeight: 200,
              color: cyan,
              textShadow: "0 0 30px rgba(0,212,255,0.25)",
            }}>{units.length}</p>
            <p style={{ fontSize: 11, letterSpacing: "0.25em", textTransform: "uppercase", color: dim }}>Active Units</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{
              fontSize: "clamp(1.8rem, 5vw, 2.5rem)",
              fontWeight: 200,
              color: cyan,
              textShadow: "0 0 30px rgba(0,212,255,0.25)",
            }}>{units.reduce((a, u) => a + (u.votes || 0), 0)}</p>
            <p style={{ fontSize: 11, letterSpacing: "0.25em", textTransform: "uppercase", color: dim }}>Total Votes</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{
              fontSize: "clamp(1.8rem, 5vw, 2.5rem)",
              fontWeight: 200,
              color: cyan,
              textShadow: "0 0 30px rgba(0,212,255,0.25)",
            }}>{new Set(units.map((u) => u.city).filter(Boolean)).size}</p>
            <p style={{ fontSize: 11, letterSpacing: "0.25em", textTransform: "uppercase", color: dim }}>Cities</p>
          </div>
        </div>

        {/* Search */}
        <div style={{ maxWidth: 520, width: "100%", position: "relative" }}>
          <div style={{
            position: "absolute", left: 18, top: "50%", transform: "translateY(-50%)",
            pointerEvents: "none",
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(0,212,255,0.4)" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
          </div>
          <input
            ref={searchRef}
            className="search-bar"
            placeholder="Search by name, city, purpose, founder..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={{
              width: "100%",
              background: "rgba(0,212,255,0.04)",
              border: `1px solid ${searchFocused ? "rgba(0,212,255,0.4)" : "rgba(0,212,255,0.12)"}`,
              borderRadius: 100,
              padding: "16px 20px 16px 46px",
              fontSize: 15,
              color: "#fafafa",
              outline: "none",
              fontFamily: "inherit",
              transition: "all 0.3s",
              boxShadow: searchFocused ? "0 0 25px rgba(0,212,255,0.1)" : "none",
              boxSizing: "border-box",
            }}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              style={{
                position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", color: dim, cursor: "pointer",
                fontSize: 16, padding: "4px",
              }}
            >×</button>
          )}
        </div>

        {query && (
          <p style={{ marginTop: 16, fontSize: 13, color: dim, letterSpacing: "0.1em" }}>
            {filtered.length} result{filtered.length !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;
          </p>
        )}
      </section>

      {/* ─── Trending / Rising Units ─── */}
      {trending.length > 0 && !query && (
        <section style={{ padding: "0 24px 80px", maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32, justifyContent: "center" }}>
            <div style={{ height: 1, flex: 1, background: "linear-gradient(to right, transparent, rgba(0,212,255,0.2))" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 16 }}>🔥</span>
              <p style={{ fontSize: 13, letterSpacing: "0.4em", textTransform: "uppercase", color: cyan, textShadow: "0 0 15px rgba(0,212,255,0.3)" }}>
                Rising Units
              </p>
            </div>
            <div style={{ height: 1, flex: 1, background: "linear-gradient(to left, transparent, rgba(0,212,255,0.2))" }} />
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 24,
          }}>
            {trending.map((unit, i) => (
              <div key={unit.id} className="unit-card" style={{ animationDelay: `${i * 0.1}s` }}>
                <UnitCard unit={unit} onVote={handleVote} rank={i + 1} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─── All Units ─── */}
      <section style={{ padding: "0 24px 80px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32, justifyContent: "center" }}>
          <div style={{ height: 1, flex: 1, background: "linear-gradient(to right, transparent, rgba(0,212,255,0.12))" }} />
          <p style={{ fontSize: 13, letterSpacing: "0.4em", textTransform: "uppercase", color: dim }}>
            {query ? "Search Results" : "All Units"}
          </p>
          <div style={{ height: 1, flex: 1, background: "linear-gradient(to left, transparent, rgba(0,212,255,0.12))" }} />
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 24px" }}>
            <div style={{
              width: 40, height: 40, borderRadius: "50%",
              border: "1px solid rgba(0,212,255,0.2)",
              borderTopColor: cyan,
              animation: "spin 1s linear infinite",
              margin: "0 auto 24px",
            }} />
            <p style={{ fontSize: 14, color: dim, letterSpacing: "0.2em" }}>Loading units...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : allSorted.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 24px" }}>
            {query ? (
              <>
                <p style={{ fontSize: "clamp(1.2rem, 3vw, 1.5rem)", fontWeight: 200, color: mid, marginBottom: 12 }}>
                  No units found for &ldquo;{query}&rdquo;
                </p>
                <p style={{ fontSize: 14, color: dim }}>Try searching by city, purpose, or founder name.</p>
              </>
            ) : (
              <>
                <p style={{ fontSize: "clamp(1.2rem, 3vw, 1.5rem)", fontWeight: 200, color: mid, marginBottom: 12 }}>
                  No units registered yet.
                </p>
                <p style={{ fontSize: 14, color: dim, marginBottom: 32 }}>Be the first to start a Votus Unit.</p>
                <Link href="/start" style={{
                  textDecoration: "none",
                  fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase",
                  color: cyan, background: "rgba(0,212,255,0.08)",
                  border: "1px solid rgba(0,212,255,0.2)",
                  borderRadius: 100, padding: "14px 32px",
                  transition: "all 0.3s",
                }}>
                  Start A Unit &rarr;
                </Link>
              </>
            )}
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 24,
          }}>
            {allSorted.map((unit, i) => (
              <div key={unit.id} className="unit-card" style={{ animationDelay: `${Math.min(i * 0.06, 0.5)}s` }}>
                <UnitCard unit={unit} onVote={handleVote} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ─── CTA ─── */}
      <section style={{
        padding: "60px 24px 80px",
        display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
        borderTop: "1px solid rgba(0,212,255,0.06)",
      }}>
        <p style={{ fontSize: 13, letterSpacing: "0.4em", textTransform: "uppercase", color: dim, marginBottom: 16 }}>
          Join The Movement
        </p>
        <h2 style={{
          fontSize: "clamp(1.5rem, 5vw, 2.5rem)",
          fontWeight: 200,
          color: "#fafafa",
          marginBottom: 12,
          textShadow: "0 0 30px rgba(0,212,255,0.1)",
        }}>Start Your Votus Unit</h2>
        <p style={{ fontSize: 15, fontWeight: 300, color: mid, maxWidth: 440, marginBottom: 40, lineHeight: 1.8 }}>
          Five people is enough. One hundred is powerful.
        </p>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
          <Link href="/start" style={{
            textDecoration: "none",
            fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase",
            color: cyan,
            background: "rgba(0,212,255,0.08)",
            border: "1px solid rgba(0,212,255,0.2)",
            borderRadius: 100, padding: "16px 36px",
            transition: "all 0.3s",
            boxShadow: "0 0 30px rgba(0,212,255,0.1)",
          }}>
            Register A Unit &rarr;
          </Link>
          <a href="https://discord.gg/BDUDhayHeX" target="_blank" rel="noopener noreferrer" style={{
            textDecoration: "none",
            fontSize: 13, letterSpacing: "0.2em", textTransform: "uppercase",
            color: "rgba(88,101,242,0.8)",
            background: "rgba(88,101,242,0.08)",
            border: "1px solid rgba(88,101,242,0.2)",
            borderRadius: 100, padding: "16px 36px",
            transition: "all 0.3s",
          }}>
            Join Discord ↗
          </a>
        </div>
      </section>

      <PageFooter back="/" />
    </main>
  );
}
