"use client";

import { useEffect, useState } from "react";

// A copyable, expandable, locally-editable prompt vessel.
// Edits live only on this device (localStorage) — make it yours.
export default function PromptBlock({
  id,
  title,
  icon,
  text,
  note,
  editable = true,
}: {
  id: string;
  title: string;
  icon?: string;
  text: string;
  note?: string;
  editable?: boolean;
}) {
  const storageKey = `prompthero-prompt-${id}`;
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(text);
  const [customized, setCustomized] = useState(false);
  const [copied, setCopied] = useState(false);

  // Load any local customization after mount (avoids hydration mismatch).
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved !== null) { setValue(saved); setCustomized(true); }
    } catch { /* private mode — edits stay in-memory */ }
  }, [storageKey]);

  const save = (v: string) => {
    setValue(v);
    setCustomized(true);
    try { localStorage.setItem(storageKey, v); } catch { /* in-memory only */ }
  };

  const reset = () => {
    setValue(text);
    setCustomized(false);
    setEditing(false);
    try { localStorage.removeItem(storageKey); } catch { /* noop */ }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = value;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const smallBtn: React.CSSProperties = {
    cursor: "pointer",
    background: "rgba(250,250,250,0.03)",
    border: "1px solid rgba(250,250,250,0.12)",
    borderRadius: 100,
    padding: "8px 14px",
    color: "rgba(250,250,250,0.5)",
    fontSize: 11,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    transition: "all 0.3s",
    fontFamily: "inherit",
  };

  return (
    <div style={{
      width: "100%",
      border: `1px solid ${customized ? "rgba(255,158,100,0.25)" : "rgba(0,212,255,0.12)"}`,
      borderRadius: 16,
      background: customized ? "rgba(255,158,100,0.03)" : "rgba(0,212,255,0.03)",
      marginBottom: 20,
      overflow: "hidden",
      textAlign: "left",
      transition: "border-color 0.4s, background 0.4s",
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 10, padding: "16px 18px", flexWrap: "wrap",
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
          {customized && <span title="Customized on this device" style={{ color: "#ff9e64", fontSize: 11, letterSpacing: "0.12em" }}>✎ yours</span>}
        </button>
        <span style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {editable && open && (
            <button onClick={() => setEditing(!editing)} style={{
              ...smallBtn,
              color: editing ? "#ff9e64" : "rgba(250,250,250,0.5)",
              borderColor: editing ? "rgba(255,158,100,0.4)" : "rgba(250,250,250,0.12)",
            }}>
              {editing ? "Done ✓" : "✎ Edit"}
            </button>
          )}
          {customized && (
            <button onClick={reset} style={smallBtn}>Reset</button>
          )}
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
        </span>
      </div>

      {note && !open && (
        <p style={{ padding: "0 18px 14px", fontSize: 12.5, lineHeight: 1.7, color: "rgba(250,250,250,0.35)", margin: 0 }}>
          {note}
        </p>
      )}

      {open && editing ? (
        <div style={{ borderTop: "1px solid rgba(255,158,100,0.15)" }}>
          <textarea
            value={value}
            onChange={(e) => save(e.target.value)}
            spellCheck={false}
            aria-label={`Edit ${title}`}
            style={{
              display: "block",
              width: "100%",
              minHeight: 320,
              maxHeight: 460,
              padding: "14px 18px",
              background: "transparent",
              border: "none",
              outline: "none",
              resize: "vertical",
              whiteSpace: "pre-wrap",
              fontSize: 12.5,
              lineHeight: 1.75,
              color: "rgba(250,250,250,0.75)",
              fontFamily: "'SF Mono', ui-monospace, Menlo, monospace",
              boxSizing: "border-box",
            }}
          />
          <p style={{ padding: "0 18px 14px", margin: 0, fontSize: 11.5, color: "rgba(255,158,100,0.55)", letterSpacing: "0.06em" }}>
            ✎ Yours to shape — edits save to this device only. Reset brings back the original.
          </p>
        </div>
      ) : open && (
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
        }}>{value}</pre>
      )}
    </div>
  );
}
