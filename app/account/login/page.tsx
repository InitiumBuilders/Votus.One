"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import VotusMark from "@/components/VotusMark";

const cyan = "#00d4ff";
const dim = "rgba(250,250,250,0.4)";

const inp: React.CSSProperties = {
  width: "100%", background: "rgba(0,212,255,0.04)",
  border: "1px solid rgba(0,212,255,0.12)", borderRadius: 12,
  padding: "14px 18px", fontSize: 15, color: "#fafafa",
  outline: "none", fontFamily: "inherit", marginBottom: 14,
  transition: "border-color 0.3s", boxSizing: "border-box",
};
const lbl: React.CSSProperties = {
  fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase",
  color: dim, marginBottom: 6, display: "block",
};

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    setError("");
    if (mode === "register") {
      if (form.password !== form.confirm) { setError("Passwords don't match."); return; }
      if (form.password.length < 8) { setError("Password must be at least 8 characters."); return; }
    }
    setLoading(true);
    try {
      const endpoint = mode === "register" ? "/api/auth/register" : "/api/auth/login";
      const body = mode === "register"
        ? { name: form.name, email: form.email, password: form.password }
        : { email: form.email, password: form.password };
      const res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (data.success) { router.push("/account"); }
      else { setError(data.error || "Something went wrong."); }
    } catch { setError("Network error. Try again."); }
    finally { setLoading(false); }
  };

  return (
    <main style={{
      background: "#09090b", color: "#fafafa", minHeight: "100dvh",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif",
      WebkitFontSmoothing: "antialiased", padding: "40px 24px",
    }}>
      <style>{`
        @keyframes fade-in { 0%{opacity:0;transform:translateY(16px)} 100%{opacity:1;transform:translateY(0)} }
        .fade-in { animation: fade-in 0.6s ease-out both; }
      `}</style>

      <div className="fade-in" style={{ maxWidth: 420, width: "100%", textAlign: "center" }}>
        <div style={{ marginBottom: 32 }}><VotusMark size={36} /></div>

        <p style={{ fontSize: 11, letterSpacing: "0.4em", textTransform: "uppercase", color: "rgba(0,212,255,0.5)", marginBottom: 12 }}>
          My Votus Account
        </p>
        <h1 style={{ fontSize: "clamp(1.4rem, 4vw, 1.8rem)", fontWeight: 200, marginBottom: 8 }}>
          {mode === "register" ? "Create Your Account" : "Welcome Back"}
        </h1>
        <p style={{ fontSize: 14, color: dim, marginBottom: 40, letterSpacing: "0.04em" }}>
          {mode === "register" ? "Start your Votus journey." : "Sign in to manage your units."}
        </p>

        {/* Mode toggle */}
        <div style={{ display: "flex", gap: 0, marginBottom: 32, borderRadius: 100, overflow: "hidden", border: "1px solid rgba(0,212,255,0.1)" }}>
          {(["login", "register"] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setError(""); }} style={{
              flex: 1, padding: "13px", fontSize: 12, letterSpacing: "0.2em",
              textTransform: "uppercase", cursor: "pointer", border: "none", fontFamily: "inherit",
              background: mode === m ? "rgba(0,212,255,0.12)" : "transparent",
              color: mode === m ? cyan : dim, transition: "all 0.3s",
            }}>{m === "register" ? "Create Account" : "Sign In"}</button>
          ))}
        </div>

        <div style={{ textAlign: "left" }}>
          {mode === "register" && (
            <>
              <label style={lbl}>Your Name</label>
              <input placeholder="Full name" value={form.name} onChange={set("name")} style={inp} />
            </>
          )}
          <label style={lbl}>Email</label>
          <input placeholder="your@email.com" type="email" value={form.email} onChange={set("email")} style={inp} />
          <label style={lbl}>Password {mode === "register" && <span style={{ color: dim, letterSpacing: "0.05em", textTransform: "none" }}>— min 8 characters</span>}</label>
          <input placeholder="Password" type="password" value={form.password} onChange={set("password")} onKeyDown={e => e.key === "Enter" && !form.confirm && submit()} style={inp} />
          {mode === "register" && (
            <>
              <label style={lbl}>Confirm Password</label>
              <input placeholder="Repeat password" type="password" value={form.confirm} onChange={set("confirm")} onKeyDown={e => e.key === "Enter" && submit()} style={inp} />
            </>
          )}
        </div>

        {error && (
          <p style={{ fontSize: 13, color: "#ff6b6b", marginBottom: 16, textAlign: "left", letterSpacing: "0.04em" }}>{error}</p>
        )}

        <button onClick={submit} disabled={loading} style={{
          width: "100%", background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.22)",
          borderRadius: 100, padding: "16px", fontSize: 13, letterSpacing: "0.2em",
          textTransform: "uppercase", color: cyan, cursor: loading ? "wait" : "pointer",
          fontFamily: "inherit", transition: "all 0.3s", boxShadow: "0 0 30px rgba(0,212,255,0.08)",
        }}>
          {loading ? "..." : mode === "register" ? "Create Account" : "Sign In"}
        </button>

        <div style={{ marginTop: 32, display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/" style={{ textDecoration: "none", fontSize: 12, letterSpacing: "0.15em", color: dim }}>← Home</Link>
          <Link href="/votus-units" style={{ textDecoration: "none", fontSize: 12, letterSpacing: "0.15em", color: dim }}>Browse Units</Link>
          <Link href="/start" style={{ textDecoration: "none", fontSize: 12, letterSpacing: "0.15em", color: "rgba(0,212,255,0.4)" }}>Register A Unit</Link>
                </div>
      </div>
    </main>
  );
}
