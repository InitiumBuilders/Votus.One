"use client";

import { useState } from "react";

// A copyable, expandable prompt vessel — used across /prompthero.
export default function PromptBlock({
  title,
  icon,
  text,
  note,
}: {
  title: string;
  icon?: string;
  text: string;
  note?: string;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Clipboard API blocked — fall back to a temporary textarea.
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div style={{
      width: "100%",
      border: "1px solid rgba(0,212,255,0.12)",
      borderRadius: 16,
      background: "rgba(0,212,255,0.03)",
      marginBottom: 20,
      overflow: "hidden",
      textAlign: "left",
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 12, padding: "16px 18px", flexWrap: "wrap",
      }}>
        <button
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          style={{
            background: "none", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 10,
            color: "rgba(250,250,250,0.85)", fontSize: 15, fontWeight: 300,
            letterSpacing: "0.06em", textAlign: "left", padding: 0,
            fontFamily: "inherit",
          }}
        >
          <span style={{ color: "rgba(0,212,255,0.5)", fontSize: 12, transform: open ? "rotate(90deg)" : "none", display: "inline-block", transition: "transform 0.3s" }}>▶</span>
          {icon && <span aria-hidden>{icon}</span>}
          <span>{title}</span>
        </button>
        <button
          onClick={copy}
          style={{
            cursor: "pointer",
            background: copied ? "rgba(0,212,255,0.18)" : "rgba(0,212,255,0.07)",
            border: "1px solid rgba(0,212,255,0.25)",
            borderRadius: 100, padding: "8px 18px",
            color: "rgba(0,212,255,0.85)", fontSize: 11,
            letterSpacing: "0.18em", textTransform: "uppercase",
            transition: "all 0.3s", fontFamily: "inherit",
          }}
        >
          {copied ? "Copied ✓" : "Copy Prompt"}
        </button>
      </div>

      {note && !open && (
        <p style={{ padding: "0 18px 14px", fontSize: 12.5, lineHeight: 1.7, color: "rgba(250,250,250,0.35)", margin: 0 }}>
          {note}
        </p>
      )}

      {open && (
        <pre style={{
          margin: 0,
          padding: "4px 18px 18px",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          fontSize: 12.5,
          lineHeight: 1.75,
          color: "rgba(250,250,250,0.55)",
          fontFamily: "'SF Mono', ui-monospace, Menlo, monospace",
          maxHeight: 420,
          overflowY: "auto",
          borderTop: "1px solid rgba(0,212,255,0.08)",
        }}>{text}</pre>
      )}
    </div>
  );
}
