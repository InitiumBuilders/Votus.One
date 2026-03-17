"use client";

import { useState } from "react";

export default function Waitlist() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "exists">("idle");

  const submit = async () => {
    if (!email.includes("@")) return;
    setState("sending");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setState(data.already ? "exists" : "done");
    } catch {
      setState("done");
    }
  };

  if (state === "done") {
    return (
      <p style={{ fontSize: 14, fontWeight: 300, letterSpacing: "0.15em", color: "#00d4ff" }}>
        You&rsquo;re in. We&rsquo;ll be in touch.
      </p>
    );
  }

  if (state === "exists") {
    return (
      <p style={{ fontSize: 14, fontWeight: 300, letterSpacing: "0.15em", color: "#00d4ff" }}>
        You&rsquo;re already on the list. We see you.
      </p>
    );
  }

  return (
    <div style={{ display: "flex", gap: 0, maxWidth: 360, width: "100%", margin: "0 auto" }}>
      <input
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        style={{
          flex: 1,
          background: "rgba(0,212,255,0.04)",
          border: "1px solid rgba(0,212,255,0.12)",
          borderRight: "none",
          borderRadius: "100px 0 0 100px",
          padding: "10px 16px",
          fontSize: 13,
          color: "#fafafa",
          outline: "none",
          fontFamily: "inherit",
        }}
      />
      <button
        onClick={submit}
        disabled={state === "sending"}
        style={{
          background: "rgba(0,212,255,0.08)",
          border: "1px solid rgba(0,212,255,0.12)",
          borderRadius: "0 100px 100px 0",
          padding: "10px 20px",
          fontSize: 12,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "#00d4ff",
          cursor: state === "sending" ? "wait" : "pointer",
          fontFamily: "inherit",
          opacity: state === "sending" ? 0.5 : 1,
        }}
      >
        {state === "sending" ? "..." : "Join"}
      </button>
    </div>
  );
}
