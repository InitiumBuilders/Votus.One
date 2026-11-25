"use client";

import { useState } from "react";
import { copyText, srOnly } from "./copyText";

// The two acts of adoption: take the skill now, or carry it with you.
export default function HeroActions({ skillText }: { skillText: string }) {
  const [copied, setCopied] = useState<"idle" | "done" | "failed">("idle");

  // Only claim the copy when it landed; if the browser refused, point at
  // the download beside it instead of a false ✓.
  const copy = async () => {
    const ok = await copyText(skillText);
    setCopied(ok ? "done" : "failed");
    setTimeout(() => setCopied("idle"), ok ? 2400 : 4200);
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
          background: copied === "done" ? "rgba(255,209,102,0.9)" : copied === "failed" ? "rgba(255,158,100,0.9)" : "rgba(0,212,255,0.85)",
          border: "1px solid transparent",
          boxShadow: copied === "done" ? "0 0 40px rgba(255,209,102,0.35)" : copied === "failed" ? "0 0 40px rgba(255,158,100,0.3)" : "0 0 34px rgba(0,212,255,0.3)",
          fontWeight: 500,
        }}
      >
        {copied === "done" ? "Skill Copied ✓" : copied === "failed" ? "Copy Blocked · Download →" : "⚡ Copy The Skill"}
      </button>
      <span role="status" style={srOnly}>
        {copied === "done" ? "The PromptHero skill is copied to your clipboard." : copied === "failed" ? "This browser blocked the copy. Use Download SKILL.md instead." : ""}
      </span>
      <a
        href="/skill.md"
        download="PromptHero-SKILL.md"
        style={{
          ...pill,
          color: "rgba(0,212,255,0.8)",
          background: "rgba(0,212,255,0.05)",
          border: "1px solid rgba(0,212,255,0.25)",
        }}
      >
        Download SKILL.md
      </a>
    </div>
  );
}
