"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

const cyan = "#00d4ff";
const dim = "rgba(250,250,250,0.4)";
const mid = "rgba(250,250,250,0.6)";

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(0,212,255,0.04)",
  border: "1px solid rgba(0,212,255,0.12)",
  borderRadius: 12,
  padding: "14px 18px",
  fontSize: 15,
  color: "#fafafa",
  outline: "none",
  fontFamily: "inherit",
  marginBottom: 14,
  transition: "border-color 0.3s, box-shadow 0.3s",
  boxSizing: "border-box" as const,
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: "0.25em",
  textTransform: "uppercase" as const,
  color: dim,
  marginBottom: 6,
  display: "block",
  textAlign: "left" as const,
};

interface UploadState {
  file: File | null;
  preview: string | null;
  uploading: boolean;
  url: string | null;
  error: string | null;
}

function MediaUploader({ label, type, onUploaded }: {
  label: string;
  type: "image" | "video";
  onUploaded: (url: string) => void;
}) {
  const [state, setState] = useState<UploadState>({ file: null, preview: null, uploading: false, url: null, error: null });
  const inputRef = useRef<HTMLInputElement>(null);
  const accept = type === "image" ? "image/jpeg,image/png,image/webp,image/gif" : "video/mp4,video/webm";

  const handleFile = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setState(s => ({ ...s, error: "Max 5MB. Please compress your file." }));
      return;
    }
    const preview = URL.createObjectURL(file);
    setState(s => ({ ...s, file, preview, uploading: true, error: null }));

    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch("/api/media", { method: "POST", body: form });
      const data = await res.json();
      if (data.url) {
        setState(s => ({ ...s, url: data.url, uploading: false }));
        onUploaded(data.url);
      } else {
        setState(s => ({ ...s, uploading: false, error: data.error || "Upload failed" }));
      }
    } catch {
      setState(s => ({ ...s, uploading: false, error: "Upload failed. Try again." }));
    }
  };

  return (
    <div style={{ marginBottom: 14 }}>
      <label style={labelStyle}>{label}</label>
      <div
        onClick={() => inputRef.current?.click()}
        style={{
          border: `1px dashed ${state.url ? "rgba(0,212,255,0.4)" : "rgba(0,212,255,0.15)"}`,
          borderRadius: 12,
          padding: "20px",
          textAlign: "center",
          cursor: "pointer",
          background: state.url ? "rgba(0,212,255,0.06)" : "rgba(0,212,255,0.02)",
          transition: "all 0.3s",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {state.preview && type === "image" && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={state.preview} alt="" style={{ width: "100%", maxHeight: 160, objectFit: "cover", borderRadius: 8, marginBottom: 8 }} />
        )}
        {state.preview && type === "video" && (
          <video src={state.preview} style={{ width: "100%", maxHeight: 120, borderRadius: 8, marginBottom: 8 }} controls />
        )}
        {state.uploading && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(9,9,11,0.7)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 12 }}>
            <p style={{ fontSize: 13, color: cyan, letterSpacing: "0.2em" }}>Uploading...</p>
          </div>
        )}
        {!state.preview && (
          <div>
            <p style={{ fontSize: 13, color: dim, marginBottom: 4 }}>
              {type === "image" ? "📷 Click to upload image" : "🎥 Click to upload video"}
            </p>
            <p style={{ fontSize: 11, color: "rgba(250,250,250,0.2)", letterSpacing: "0.1em" }}>
              {type === "image" ? "JPG, PNG, WebP, GIF · Max 5MB" : "MP4, WebM · Max 5MB"}
            </p>
          </div>
        )}
        {state.url && !state.uploading && (
          <p style={{ fontSize: 12, color: "rgba(0,212,255,0.6)", letterSpacing: "0.1em", marginTop: state.preview ? 4 : 0 }}>
            ✓ {type === "image" ? "Image" : "Video"} uploaded
          </p>
        )}
      </div>
      {state.error && <p style={{ fontSize: 12, color: "#ff6b6b", marginTop: 6, letterSpacing: "0.05em" }}>{state.error}</p>}
      <input ref={inputRef} type="file" accept={accept} style={{ display: "none" }} onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
    </div>
  );
}

export default function UnitForm() {
  const router = useRouter();
  const [step, setStep] = useState<"auth" | "unit">("auth");
  const [authMode, setAuthMode] = useState<"login" | "register">("register");
  const [authed, setAuthed] = useState(false);
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const [form, setForm] = useState({
    name: "", email: "", unitName: "", city: "", state: "",
    purpose: "", website: "", discord: "",
    imageUrl: "", videoUrl: "",
    slug: "",
    nextMeeting: "", meetingLocation: "", meetingRecurring: "",
  });
  const [slugStatus, setSlugStatus] = useState<"idle" | "checking" | "available" | "taken" | "error">("idle");
  const [slugMsg, setSlugMsg] = useState("");
  const [submitState, setSubmitState] = useState<"idle" | "sending" | "done">("idle");
  const [unit, setUnit] = useState<{ id: string; name: string; slug: string } | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const slugTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Check if already logged in
  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(data => {
      if (data.user) {
        setAuthed(true);
        setForm(f => ({ ...f, name: data.user.name, email: data.user.email }));
        setStep("unit");
      }
    }).catch(() => {});
  }, []);

  const handleAuth = async () => {
    setAuthError("");
    setAuthLoading(true);
    try {
      const endpoint = authMode === "register" ? "/api/auth/register" : "/api/auth/login";
      const body = authMode === "register"
        ? { name: authForm.name, email: authForm.email, password: authForm.password }
        : { email: authForm.email, password: authForm.password };
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setAuthed(true);
        setForm(f => ({ ...f, name: data.user.name, email: data.user.email }));
        setStep("unit");
      } else {
        setAuthError(data.error || "Something went wrong.");
      }
    } catch {
      setAuthError("Network error. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  const checkSlug = useCallback((val: string) => {
    if (!val) { setSlugStatus("idle"); return; }
    const clean = val.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    if (clean.length < 2) { setSlugStatus("error"); setSlugMsg("Too short"); return; }
    setSlugStatus("checking");
    if (slugTimer.current) clearTimeout(slugTimer.current);
    slugTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/units/slug-check?slug=${clean}`);
        const data = await res.json();
        if (data.available) { setSlugStatus("available"); setSlugMsg(`Votus.One/u/${clean}`); }
        else { setSlugStatus("taken"); setSlugMsg(data.error || "Already taken"); }
      } catch { setSlugStatus("error"); setSlugMsg("Could not check"); }
    }, 600);
  }, []);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = e.target.value;
    setForm(f => ({ ...f, [k]: val }));
    if (k === "slug") checkSlug(val);
    if (k === "unitName" && !form.slug) {
      const auto = val.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
      setForm(f => ({ ...f, slug: auto }));
      checkSlug(auto);
    }
  };

  const fs = (key: string): React.CSSProperties => ({
    ...inputStyle,
    borderColor: focused === key ? "rgba(0,212,255,0.4)" : "rgba(0,212,255,0.12)",
    boxShadow: focused === key ? "0 0 20px rgba(0,212,255,0.08)" : "none",
  });

  const submit = async () => {
    if (!form.name || !form.email || !form.unitName) return;
    if (slugStatus === "taken" || slugStatus === "error") return;
    setSubmitState("sending");
    try {
      const res = await fetch("/api/units", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setUnit(data.unit);
        setSubmitState("done");
      } else {
        setSubmitState("idle");
        alert(data.error || "Something went wrong.");
      }
    } catch {
      setSubmitState("idle");
    }
  };

  if (submitState === "done" && unit) {
    return (
      <div style={{ textAlign: "center", maxWidth: 460, margin: "0 auto" }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%",
          border: "1px solid rgba(0,212,255,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 28px",
          boxShadow: "0 0 40px rgba(0,212,255,0.2)",
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M5 12l5 5L19 7" stroke="#00d4ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <p style={{ fontSize: 12, letterSpacing: "0.35em", textTransform: "uppercase", color: cyan, marginBottom: 16 }}>Unit Registered</p>
        <p style={{ fontSize: "clamp(1.4rem, 4vw, 1.8rem)", fontWeight: 200, color: "#fafafa", marginBottom: 8 }}>{unit.name}</p>
        <p style={{ fontSize: 13, fontWeight: 300, color: dim, marginBottom: 8, letterSpacing: "0.1em" }}>
          Unit ID: <span style={{ color: cyan }}>{unit.id}</span>
        </p>
        <p style={{ fontSize: 13, fontWeight: 300, color: "rgba(0,212,255,0.5)", marginBottom: 32, letterSpacing: "0.08em" }}>
          Votus.One/u/{unit.slug}
        </p>
        <div style={{ width: 40, height: 1, background: "rgba(0,212,255,0.3)", margin: "0 auto 32px" }} />
        <p style={{ fontSize: 15, fontWeight: 300, color: mid, lineHeight: 1.9, marginBottom: 40 }}>
          Your Votus Unit is now live.<br />
          <span style={{ color: cyan }}>The movement starts with you.</span>
        </p>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
          <button onClick={() => router.push(`/u/${unit.slug}`)} style={{
            background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.25)",
            borderRadius: 100, padding: "14px 28px", fontSize: 13,
            letterSpacing: "0.18em", textTransform: "uppercase", color: cyan,
            cursor: "pointer", fontFamily: "inherit",
          }}>View My Unit &rarr;</button>
          <button onClick={() => router.push("/votus-units")} style={{
            background: "transparent", border: "1px solid rgba(0,212,255,0.12)",
            borderRadius: 100, padding: "14px 28px", fontSize: 13,
            letterSpacing: "0.18em", textTransform: "uppercase", color: dim,
            cursor: "pointer", fontFamily: "inherit",
          }}>All Units</button>
        </div>
      </div>
    );
  }

  // Auth step
  if (step === "auth") {
    return (
      <div style={{ maxWidth: 400, width: "100%", margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 0, marginBottom: 28, borderRadius: 100, overflow: "hidden", border: "1px solid rgba(0,212,255,0.12)" }}>
          {(["register", "login"] as const).map((m) => (
            <button key={m} onClick={() => setAuthMode(m)} style={{
              flex: 1, padding: "12px", fontSize: 12, letterSpacing: "0.2em",
              textTransform: "uppercase", cursor: "pointer", border: "none",
              fontFamily: "inherit", transition: "all 0.3s",
              background: authMode === m ? "rgba(0,212,255,0.12)" : "transparent",
              color: authMode === m ? cyan : dim,
            }}>{m === "register" ? "Create Account" : "Sign In"}</button>
          ))}
        </div>
        {authMode === "register" && (
          <>
            <label style={labelStyle}>Your Name</label>
            <input placeholder="Full name" value={authForm.name} onChange={e => setAuthForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} />
          </>
        )}
        <label style={labelStyle}>Email</label>
        <input placeholder="your@email.com" type="email" value={authForm.email} onChange={e => setAuthForm(f => ({ ...f, email: e.target.value }))} style={inputStyle} />
        <label style={labelStyle}>Password</label>
        <input placeholder={authMode === "register" ? "Min 8 characters" : "Password"} type="password" value={authForm.password} onChange={e => setAuthForm(f => ({ ...f, password: e.target.value }))}
          onKeyDown={e => e.key === "Enter" && handleAuth()}
          style={inputStyle} />
        {authError && <p style={{ fontSize: 13, color: "#ff6b6b", marginBottom: 12, letterSpacing: "0.05em" }}>{authError}</p>}
        <button onClick={handleAuth} disabled={authLoading} style={{
          width: "100%", background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)",
          borderRadius: 100, padding: "16px", fontSize: 13, letterSpacing: "0.2em",
          textTransform: "uppercase", color: cyan, cursor: authLoading ? "wait" : "pointer",
          fontFamily: "inherit", transition: "all 0.3s",
          boxShadow: "0 0 25px rgba(0,212,255,0.1)",
        }}>
          {authLoading ? "..." : authMode === "register" ? "Create Account & Continue" : "Sign In & Continue"}
        </button>
        <p style={{ fontSize: 12, color: dim, marginTop: 16, textAlign: "center", letterSpacing: "0.08em" }}>
          Or{" "}
          <button onClick={() => setStep("unit")} style={{ background: "none", border: "none", color: "rgba(0,212,255,0.5)", cursor: "pointer", fontSize: 12, fontFamily: "inherit", letterSpacing: "0.08em" }}>
            skip and register without an account
          </button>
        </p>
      </div>
    );
  }

  // Unit form step
  return (
    <div style={{ maxWidth: 520, width: "100%", margin: "0 auto" }}>
      {authed && (
        <div style={{ background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.12)", borderRadius: 12, padding: "12px 18px", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <p style={{ fontSize: 13, color: mid }}>Signed in as <span style={{ color: cyan }}>{form.email}</span></p>
          <button onClick={() => { fetch("/api/auth/logout", { method: "POST" }); setAuthed(false); setStep("auth"); }} style={{ background: "none", border: "none", color: dim, cursor: "pointer", fontSize: 12, fontFamily: "inherit", letterSpacing: "0.1em" }}>Log out</button>
        </div>
      )}

      {/* Identity */}
      <p style={{ ...labelStyle, color: cyan, marginBottom: 16, fontSize: 12 }}>Your Info</p>
      <label style={labelStyle}>Your Name *</label>
      <input placeholder="Full name" value={form.name} onChange={set("name")} onFocus={() => setFocused("name")} onBlur={() => setFocused(null)} style={fs("name")} />
      <label style={labelStyle}>Email *</label>
      <input placeholder="your@email.com" type="email" value={form.email} onChange={set("email")} onFocus={() => setFocused("email")} onBlur={() => setFocused(null)} style={fs("email")} />

      <div style={{ width: "100%", height: 1, background: "rgba(0,212,255,0.08)", margin: "8px 0 20px" }} />

      {/* Unit Info */}
      <p style={{ ...labelStyle, color: cyan, marginBottom: 16, fontSize: 12 }}>Your Votus Unit</p>
      <label style={labelStyle}>Unit Name *</label>
      <input placeholder="Name your Votus Unit" value={form.unitName} onChange={set("unitName")} onFocus={() => setFocused("unitName")} onBlur={() => setFocused(null)} style={fs("unitName")} />

      {/* Slug */}
      <label style={labelStyle}>Unit Handle * — your short link</label>
      <div style={{ position: "relative", marginBottom: 6 }}>
        <span style={{ position: "absolute", left: 18, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: dim, pointerEvents: "none" }}>/u/</span>
        <input
          placeholder="your-unit-name"
          value={form.slug}
          onChange={set("slug")}
          onFocus={() => setFocused("slug")}
          onBlur={() => setFocused(null)}
          style={{ ...fs("slug"), paddingLeft: 44, marginBottom: 0 }}
        />
      </div>
      <p style={{ fontSize: 12, letterSpacing: "0.08em", marginBottom: 14,
        color: slugStatus === "available" ? "rgba(0,212,255,0.6)"
          : slugStatus === "taken" || slugStatus === "error" ? "#ff6b6b"
          : slugStatus === "checking" ? "rgba(250,250,250,0.3)"
          : dim,
      }}>
        {slugStatus === "checking" ? "Checking availability..." : slugMsg || "Letters, numbers, hyphens only"}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={labelStyle}>City</label>
          <input placeholder="Chicago" value={form.city} onChange={set("city")} onFocus={() => setFocused("city")} onBlur={() => setFocused(null)} style={{ ...fs("city"), marginBottom: 0 }} />
        </div>
        <div>
          <label style={labelStyle}>State</label>
          <input placeholder="IL" value={form.state} onChange={set("state")} onFocus={() => setFocused("state")} onBlur={() => setFocused(null)} style={{ ...fs("state"), marginBottom: 0 }} />
        </div>
      </div>
      <div style={{ marginBottom: 14 }} />

      <label style={labelStyle}>Purpose / Mission</label>
      <textarea placeholder="What's the purpose of your unit? What will you vote on? Who are you fighting for?" value={form.purpose} onChange={set("purpose")} onFocus={() => setFocused("purpose")} onBlur={() => setFocused(null)} rows={4} style={{ ...fs("purpose"), resize: "none", lineHeight: 1.7 }} />

      <div style={{ width: "100%", height: 1, background: "rgba(0,212,255,0.08)", margin: "8px 0 20px" }} />

      {/* Media Upload */}
      <p style={{ ...labelStyle, color: cyan, marginBottom: 16, fontSize: 12 }}>Media</p>
      <MediaUploader label="Unit Image" type="image" onUploaded={(url) => setForm(f => ({ ...f, imageUrl: url }))} />
      <MediaUploader label="Unit Video (optional)" type="video" onUploaded={(url) => setForm(f => ({ ...f, videoUrl: url }))} />

      <div style={{ width: "100%", height: 1, background: "rgba(0,212,255,0.08)", margin: "8px 0 20px" }} />

      {/* Links */}
      <p style={{ ...labelStyle, color: cyan, marginBottom: 16, fontSize: 12 }}>Links</p>
      <label style={labelStyle}>Website</label>
      <input placeholder="https://your-site.com" value={form.website} onChange={set("website")} onFocus={() => setFocused("website")} onBlur={() => setFocused(null)} style={fs("website")} />
      <label style={labelStyle}>Discord Server Link</label>
      <input placeholder="https://discord.gg/..." value={form.discord} onChange={set("discord")} onFocus={() => setFocused("discord")} onBlur={() => setFocused(null)} style={fs("discord")} />

      <div style={{ width: "100%", height: 1, background: "rgba(0,212,255,0.08)", margin: "8px 0 20px" }} />

      {/* Meetings */}
      <p style={{ ...labelStyle, color: cyan, marginBottom: 16, fontSize: 12 }}>Next Meeting</p>
      <label style={labelStyle}>Date & Time</label>
      <input placeholder="e.g. March 25, 2026 at 6:30 PM" value={form.nextMeeting} onChange={set("nextMeeting")} onFocus={() => setFocused("nextMeeting")} onBlur={() => setFocused(null)} style={fs("nextMeeting")} />
      <label style={labelStyle}>Location</label>
      <input placeholder="e.g. 123 Main St, Chicago IL — or Zoom link" value={form.meetingLocation} onChange={set("meetingLocation")} onFocus={() => setFocused("meetingLocation")} onBlur={() => setFocused(null)} style={fs("meetingLocation")} />
      <label style={labelStyle}>Recurring?</label>
      <input placeholder="e.g. Every 2nd Tuesday at 6 PM" value={form.meetingRecurring} onChange={set("meetingRecurring")} onFocus={() => setFocused("meetingRecurring")} onBlur={() => setFocused(null)} style={fs("meetingRecurring")} />

      <button
        onClick={submit}
        disabled={submitState === "sending" || !form.name || !form.email || !form.unitName || slugStatus === "taken" || slugStatus === "error"}
        style={{
          width: "100%",
          background: (submitState === "sending" || !form.name || !form.email || !form.unitName) ? "rgba(0,212,255,0.04)" : "rgba(0,212,255,0.1)",
          border: "1px solid rgba(0,212,255,0.2)",
          borderRadius: 100, padding: "16px 24px", fontSize: 13,
          letterSpacing: "0.2em", textTransform: "uppercase", color: cyan,
          cursor: submitState === "sending" ? "wait" : "pointer",
          fontFamily: "inherit", marginTop: 16,
          opacity: (!form.name || !form.email || !form.unitName || slugStatus === "taken") ? 0.35 : 1,
          transition: "all 0.3s",
          boxShadow: (!form.name || !form.email || !form.unitName) ? "none" : "0 0 30px rgba(0,212,255,0.12)",
        }}
      >
        {submitState === "sending" ? "Registering..." : "Register Your Votus Unit"}
      </button>
      <p style={{ fontSize: 11, color: dim, marginTop: 12, letterSpacing: "0.1em", textAlign: "center" }}>
        * Required. $22/person/month after launch.
      </p>
    </div>
  );
}
