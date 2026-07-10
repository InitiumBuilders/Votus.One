"use client";

import { useState } from "react";

// The two acts of adoption: take the skill now, or carry it with you.
export default function HeroActions({ skillText }: { skillText: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(skillText);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = skillText;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  };

  const pill: React.CSSProperties = {
    fontSize: 12,
    letterSpacing: "0.22em",
    textTransform: "uppercase",
    borderRadius: 100,
    padding: "14px 26px",
    textDecoration: "none",
    cursor: "pointer",
    transition: "all 0.35s",
    fontFamily: "inherit",
  };

  return (
    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", marginTop: 44 }}>
      <button
        onClick={copy}
        style={{
          ...pill,
          color: "#09090b",
          background: copied ? "rgba(255,209,102,0.9)" : "rgba(0,212,255,0.85)",
          border: "1px solid transparent",
          boxShadow: copied ? "0 0 40px rgba(255,209,102,0.35)" : "0 0 34px rgba(0,212,255,0.3)",
          fontWeight: 500,
        }}
      >
        {copied ? "Skill Copied ✓" : "⚡ Copy The Skill"}
      </button>
      <a
        href="/skill.md"
        download="PromptHero-SKILL.md"
        style={{
          ...pill,
          color: "rgba(0,212,255,0.75)",
          background: "rgba(0,212,255,0.05)",
          border: "1px solid rgba(0,212,255,0.25)",
        }}
      >
        Download SKILL.md
      </a>
    </div>
  );
}
