"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import VotusMark from "@/components/VotusMark";
import PageFooter from "@/components/PageFooter";

const cyan = "#00d4ff";
const dim = "rgba(250,250,250,0.4)";
const mid = "rgba(250,250,250,0.6)";
const red = "#ff4d4d";

interface FullUser {
  id: string; email: string; name: string; unitIds: string[];
  backupEmail?: string; avatarUrl?: string; bio?: string;
  passwordHash?: string;
}
interface UnitData {
  id: string; slug: string; name: string; purpose: string;
  website: string; discord: string; imageUrl: string; videoUrl: string;
  city: string; state: string; nextMeeting: string; meetingLocation: string;
  meetingRecurring: string; votes: number; views: number; members: number; created: string;
}

const inp: React.CSSProperties = {
  width: "100%", background: "rgba(0,212,255,0.04)",
  border: "1px solid rgba(0,212,255,0.12)", borderRadius: 12,
  padding: "12px 16px", fontSize: 14, color: "#fafafa",
  outline: "none", fontFamily: "inherit", marginBottom: 12,
  transition: "border-color 0.3s", boxSizing: "border-box",
};
const lbl: React.CSSProperties = {
  fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase",
  color: dim, marginBottom: 5, display: "block",
};

function Msg({ text, ok }: { text: string; ok: boolean }) {
  return <p style={{ fontSize: 13, letterSpacing: "0.06em", color: ok ? "rgba(0,255,136,0.8)" : "#ff6b6b", marginBottom: 10 }}>{text}</p>;
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "rgba(0,212,255,0.03)", border: "1px solid rgba(0,212,255,0.09)", borderRadius: 20, padding: "28px 28px 20px", marginBottom: 24 }}>
      <p style={{ fontSize: 11, letterSpacing: "0.35em", textTransform: "uppercase", color: "rgba(0,212,255,0.5)", marginBottom: 20 }}>{title}</p>
      {children}
    </div>
  );
}

function Btn({ onClick, children, danger, disabled, small }: { onClick?: () => void; children: React.ReactNode; danger?: boolean; disabled?: boolean; small?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background: danger ? "rgba(255,77,77,0.08)" : "rgba(0,212,255,0.08)",
      border: `1px solid ${danger ? "rgba(255,77,77,0.2)" : "rgba(0,212,255,0.18)"}`,
      borderRadius: 100, padding: small ? "8px 18px" : "12px 24px",
      fontSize: small ? 11 : 12, letterSpacing: "0.2em", textTransform: "uppercase",
      color: danger ? red : cyan, cursor: disabled ? "wait" : "pointer",
      fontFamily: "inherit", transition: "all 0.3s",
      opacity: disabled ? 0.5 : 1,
    }}>{children}</button>
  );
}

export default function AccountPage() {
  const router = useRouter();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<FullUser | null>(null);
  const [units, setUnits] = useState<UnitData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"units" | "profile" | "security">("units");

  // Profile
  const [nameVal, setNameVal] = useState("");
  const [bioVal, setBioVal] = useState("");
  const [backupEmail, setBackupEmail] = useState("");
  const [profileMsg, setProfileMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  // Security
  const [curPw, setCurPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [emailPw, setEmailPw] = useState("");
  const [secMsg, setSecMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [secLoading, setSacLoading] = useState(false);

  // Units
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<UnitData>>({});
  const [saving, setSaving] = useState(false);
  const [unitMsg, setUnitMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(async data => {
        if (!data.user) { router.push("/account/login"); return; }
        setUser(data.user);
        setNameVal(data.user.name || "");
        setBioVal(data.user.bio || "");
        setBackupEmail(data.user.backupEmail || "");
        if (data.user.unitIds?.length) {
          const results = await Promise.all(
            data.user.unitIds.map((id: string) =>
              fetch(`/api/units/by-id/${id}`).then(r => r.json()).then(d => d.unit).catch(() => null)
            )
          );
          setUnits(results.filter(Boolean));
        }
      })
      .catch(() => router.push("/account/login"))
      .finally(() => setLoading(false));
  }, [router]);

  const call = async (action: string, extra: object, setter: (m: { text: string; ok: boolean } | null) => void, loadSetter?: (v: boolean) => void) => {
    loadSetter?.(true);
    setter(null);
    try {
      const res = await fetch("/api/auth/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...extra }),
      });
      const d = await res.json();
      setter({ text: d.success ? "Saved ✓" : d.error || "Error", ok: !!d.success });
      if (d.success && d.user) setUser(prev => ({ ...prev!, ...d.user }));
    } catch { setter({ text: "Network error", ok: false }); }
    finally { loadSetter?.(false); }
  };

  const handleAvatarUpload = async (file: File) => {
    if (file.size > 3 * 1024 * 1024) { setProfileMsg({ text: "Max 3MB for avatar", ok: false }); return; }
    setAvatarUploading(true);
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch("/api/media", { method: "POST", body: form });
      const data = await res.json();
      if (data.url) {
        await call("set_avatar", { avatarUrl: data.url }, setProfileMsg);
        setUser(prev => prev ? { ...prev, avatarUrl: data.url } : prev);
      } else { setProfileMsg({ text: data.error || "Upload failed", ok: false }); }
    } catch { setProfileMsg({ text: "Upload failed", ok: false }); }
    finally { setAvatarUploading(false); }
  };

  const startEdit = (unit: UnitData) => {
    setEditingId(unit.id);
    setEditForm({ name: unit.name, purpose: unit.purpose, website: unit.website, discord: unit.discord, city: unit.city, state: unit.state, nextMeeting: unit.nextMeeting, meetingLocation: unit.meetingLocation, meetingRecurring: unit.meetingRecurring });
    setUnitMsg(null);
    setConfirmDelete(null);
  };

  const saveEdit = async (id: string) => {
    setSaving(true);
    setUnitMsg(null);
    try {
      const res = await fetch(`/api/units/${id}/edit`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editForm) });
      const d = await res.json();
      if (d.success) {
        setUnits(prev => prev.map(u => u.id === id ? { ...u, ...editForm } : u));
        setEditingId(null);
        setUnitMsg({ text: "Unit updated ✓", ok: true });
        setTimeout(() => setUnitMsg(null), 3000);
      } else { setUnitMsg({ text: d.error || "Save failed", ok: false }); }
    } catch { setUnitMsg({ text: "Network error", ok: false }); }
    finally { setSaving(false); }
  };

  const deleteUnit = async (id: string) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/units/${id}/delete`, { method: "POST" });
      const d = await res.json();
      if (d.success) {
        setUnits(prev => prev.filter(u => u.id !== id));
        setConfirmDelete(null);
        setEditingId(null);
        setUnitMsg({ text: "Unit deleted.", ok: true });
        setTimeout(() => setUnitMsg(null), 3000);
      } else { setUnitMsg({ text: d.error || "Delete failed", ok: false }); }
    } catch { setUnitMsg({ text: "Network error", ok: false }); }
    finally { setDeleting(false); }
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  const setE = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setEditForm(f => ({ ...f, [k]: e.target.value }));

  if (loading) return (
    <div style={{ background: "#09090b", minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: 40, height: 40, borderRadius: "50%", border: "1px solid rgba(0,212,255,0.2)", borderTopColor: cyan, animation: "spin 1s linear infinite" }} />
    </div>
  );

  if (!user) return null;

  const tabs = [
    { id: "units", label: `My Units (${units.length})` },
    { id: "profile", label: "Profile" },
    { id: "security", label: "Security" },
  ] as const;

  return (
    <main style={{ background: "#09090b", color: "#fafafa", minHeight: "100dvh", fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', system-ui, sans-serif", WebkitFontSmoothing: "antialiased" }}>
      <style>{`
        @keyframes fade-up { 0%{opacity:0;transform:translateY(16px)} 100%{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fade-up 0.5s ease-out both; }
        .unit-card-hover { transition: all 0.3s; }
        .unit-card-hover:hover { border-color: rgba(0,212,255,0.22) !important; background: rgba(0,212,255,0.05) !important; }
      `}</style>

      {/* ─── HEADER ─── */}
      <section style={{ padding: "72px 24px 48px", textAlign: "center", borderBottom: "1px solid rgba(0,212,255,0.07)", position: "relative" }}>
        <div style={{ marginBottom: 24 }}><VotusMark size={32} /></div>

        {/* Avatar */}
        <div
          onClick={() => avatarInputRef.current?.click()}
          style={{
            width: 88, height: 88, borderRadius: "50%",
            border: "1px solid rgba(0,212,255,0.2)",
            margin: "0 auto 20px",
            overflow: "hidden",
            cursor: "pointer",
            position: "relative",
            background: "rgba(0,212,255,0.05)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          {user.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <span style={{ fontSize: 28, fontWeight: 200, color: cyan }}>{user.name.charAt(0).toUpperCase()}</span>
          )}
          {avatarUploading && (
            <div style={{ position: "absolute", inset: 0, background: "rgba(9,9,11,0.7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", border: "1px solid rgba(0,212,255,0.3)", borderTopColor: cyan, animation: "spin 1s linear infinite" }} />
            </div>
          )}
        </div>
        <input ref={avatarInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => e.target.files?.[0] && handleAvatarUpload(e.target.files[0])} />

        <h1 style={{ fontSize: "clamp(1.3rem, 3.5vw, 2rem)", fontWeight: 200, marginBottom: 6 }}>{user.name}</h1>
        <p style={{ fontSize: 13, color: dim, marginBottom: 24, letterSpacing: "0.05em" }}>{user.email}</p>

        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/start" style={{ textDecoration: "none", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: cyan, background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.18)", borderRadius: 100, padding: "9px 20px" }}>
            + New Unit
          </Link>
          <Link href="/votus-units" style={{ textDecoration: "none", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: dim, background: "transparent", border: "1px solid rgba(0,212,255,0.1)", borderRadius: 100, padding: "9px 20px" }}>
            Browse Units
          </Link>
          <button onClick={logout} style={{ background: "transparent", border: "1px solid rgba(250,250,250,0.07)", borderRadius: 100, padding: "9px 20px", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(250,250,250,0.25)", cursor: "pointer", fontFamily: "inherit" }}>
            Sign Out
          </button>
        </div>
      </section>

      {/* ─── TABS ─── */}
      <div style={{ display: "flex", justifyContent: "center", gap: 0, borderBottom: "1px solid rgba(0,212,255,0.07)", position: "sticky", top: 0, background: "#09090b", zIndex: 50 }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            background: "none", border: "none", borderBottom: `2px solid ${activeTab === tab.id ? cyan : "transparent"}`,
            padding: "16px 24px", fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase",
            color: activeTab === tab.id ? cyan : dim, cursor: "pointer", fontFamily: "inherit",
            transition: "all 0.3s",
          }}>{tab.label}</button>
        ))}
      </div>

      {/* ─── CONTENT ─── */}
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* ══ UNITS TAB ══ */}
        {activeTab === "units" && (
          <div className="fade-up">
            {unitMsg && <Msg text={unitMsg.text} ok={unitMsg.ok} />}

            {units.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <p style={{ fontSize: 15, color: mid, marginBottom: 28 }}>You haven&rsquo;t registered a unit yet.</p>
                <Link href="/start" style={{ textDecoration: "none", fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase", color: cyan, background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.18)", borderRadius: 100, padding: "14px 28px" }}>
                  Start Your First Unit &rarr;
                </Link>
              </div>
            )}

            {units.map((unit, idx) => (
              <div key={unit.id} className="unit-card-hover" style={{
                background: "rgba(0,212,255,0.03)",
                border: "1px solid rgba(0,212,255,0.1)",
                borderRadius: 20, marginBottom: 20,
                overflow: "hidden",
                animationDelay: `${idx * 0.08}s`,
              }}>
                {/* Unit header — clickable to visit */}
                <Link href={`/u/${unit.slug}`} style={{ textDecoration: "none", display: "block", padding: "24px 24px 16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {unit.imageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={unit.imageUrl} alt="" style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover", border: "1px solid rgba(0,212,255,0.15)", marginBottom: 12 }} />
                      )}
                      <h2 style={{ fontSize: "clamp(1.1rem, 2.5vw, 1.3rem)", fontWeight: 200, color: "#fafafa", marginBottom: 4 }}>{unit.name}</h2>
                      <p style={{ fontSize: 12, color: "rgba(0,212,255,0.45)", letterSpacing: "0.1em" }}>
                        /u/{unit.slug}
                      </p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end", flexShrink: 0 }}>
                      {[{ l: "Votes", v: unit.votes || 0 }, { l: "Views", v: unit.views || 0 }, { l: "Members", v: unit.members || 1 }].map(({ l, v }) => (
                        <div key={l} style={{ textAlign: "right" }}>
                          <span style={{ fontSize: 14, fontWeight: 200, color: cyan }}>{v} </span>
                          <span style={{ fontSize: 10, letterSpacing: "0.15em", textTransform: "uppercase", color: dim }}>{l}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Link>

                {/* Action bar */}
                <div style={{ padding: "0 24px 20px", display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <Btn small onClick={() => editingId === unit.id ? setEditingId(null) : startEdit(unit)}>
                    {editingId === unit.id ? "Close Editor" : "Edit Unit"}
                  </Btn>
                  <Link href={`/u/${unit.slug}`} style={{ textDecoration: "none", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: dim, background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.1)", borderRadius: 100, padding: "8px 18px" }}>
                    View Page ↗
                  </Link>
                  {confirmDelete === unit.id ? (
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: dim, letterSpacing: "0.05em" }}>Sure?</span>
                      <Btn small danger onClick={() => deleteUnit(unit.id)} disabled={deleting}>
                        {deleting ? "Deleting..." : "Yes, Delete"}
                      </Btn>
                      <Btn small onClick={() => setConfirmDelete(null)}>Cancel</Btn>
                    </div>
                  ) : (
                    <Btn small danger onClick={() => setConfirmDelete(unit.id)}>Delete Unit</Btn>
                  )}
                </div>

                {/* Inline editor */}
                {editingId === unit.id && (
                  <div style={{ padding: "0 24px 24px", borderTop: "1px solid rgba(0,212,255,0.07)" }}>
                    <div style={{ paddingTop: 20 }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div><label style={lbl}>Unit Name</label><input value={editForm.name || ""} onChange={setE("name")} style={inp} /></div>
                        <div><label style={lbl}>City</label><input value={editForm.city || ""} onChange={setE("city")} placeholder="Chicago" style={inp} /></div>
                      </div>
                      <label style={lbl}>Purpose</label>
                      <textarea value={editForm.purpose || ""} onChange={setE("purpose")} rows={3} style={{ ...inp, resize: "none", lineHeight: 1.7 }} />
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <div><label style={lbl}>Website</label><input value={editForm.website || ""} onChange={setE("website")} placeholder="https://..." style={inp} /></div>
                        <div><label style={lbl}>Discord</label><input value={editForm.discord || ""} onChange={setE("discord")} placeholder="https://discord.gg/..." style={inp} /></div>
                      </div>
                      <label style={lbl}>Next Meeting Date / Time</label>
                      <input value={editForm.nextMeeting || ""} onChange={setE("nextMeeting")} placeholder="March 25, 2026 at 6:30 PM" style={inp} />
                      <label style={lbl}>Meeting Location</label>
                      <input value={editForm.meetingLocation || ""} onChange={setE("meetingLocation")} placeholder="123 Main St Chicago IL or Zoom link" style={inp} />
                      <label style={lbl}>Recurring Schedule</label>
                      <input value={editForm.meetingRecurring || ""} onChange={setE("meetingRecurring")} placeholder="Every 2nd Tuesday at 6 PM" style={inp} />
                      <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                        <Btn onClick={() => saveEdit(unit.id)} disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Btn>
                        <Btn onClick={() => setEditingId(null)}>Cancel</Btn>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ══ PROFILE TAB ══ */}
        {activeTab === "profile" && (
          <div className="fade-up">
            {profileMsg && <Msg text={profileMsg.text} ok={profileMsg.ok} />}

            <SectionCard title="Display Name">
              <label style={lbl}>Name</label>
              <input value={nameVal} onChange={e => setNameVal(e.target.value)} placeholder="Your name" style={inp} />
              <Btn onClick={() => call("change_name", { name: nameVal }, setProfileMsg)}>Save Name</Btn>
            </SectionCard>

            <SectionCard title="Profile Photo">
              <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 16 }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", border: "1px solid rgba(0,212,255,0.2)", overflow: "hidden", background: "rgba(0,212,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {user.avatarUrl
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={user.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <span style={{ fontSize: 22, color: cyan }}>{user.name.charAt(0).toUpperCase()}</span>
                  }
                </div>
                <div>
                  <Btn onClick={() => avatarInputRef.current?.click()} disabled={avatarUploading}>
                    {avatarUploading ? "Uploading..." : "Upload Photo"}
                  </Btn>
                  <p style={{ fontSize: 11, color: dim, marginTop: 8, letterSpacing: "0.08em" }}>JPG, PNG, WebP · Max 3MB</p>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Bio">
              <label style={lbl}>Short bio (max 200 chars)</label>
              <textarea value={bioVal} onChange={e => setBioVal(e.target.value.slice(0, 200))} rows={3} placeholder="Tell the movement about yourself..." style={{ ...inp, resize: "none", lineHeight: 1.7 }} />
              <p style={{ fontSize: 11, color: dim, marginBottom: 10, letterSpacing: "0.06em" }}>{bioVal.length}/200</p>
              <Btn onClick={() => call("set_bio", { bio: bioVal }, setProfileMsg)}>Save Bio</Btn>
            </SectionCard>
          </div>
        )}

        {/* ══ SECURITY TAB ══ */}
        {activeTab === "security" && (
          <div className="fade-up">
            {secMsg && <Msg text={secMsg.text} ok={secMsg.ok} />}

            <SectionCard title="Change Password">
              <label style={lbl}>Current Password</label>
              <input type="password" value={curPw} onChange={e => setCurPw(e.target.value)} placeholder="Current password" style={inp} />
              <label style={lbl}>New Password</label>
              <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Min 8 characters" style={inp} />
              <label style={lbl}>Confirm New Password</label>
              <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Repeat new password" style={inp} />
              <Btn
                onClick={() => {
                  if (newPw !== confirmPw) { setSecMsg({ text: "Passwords don't match.", ok: false }); return; }
                  call("change_password", { currentPassword: curPw, newPassword: newPw }, setSecMsg, setSacLoading);
                  setCurPw(""); setNewPw(""); setConfirmPw("");
                }}
                disabled={secLoading || !newPw}
              >
                {secLoading ? "Saving..." : "Update Password"}
              </Btn>
            </SectionCard>

            <SectionCard title="Change Email">
              <p style={{ fontSize: 13, color: dim, marginBottom: 16, letterSpacing: "0.04em" }}>
                Current: <span style={{ color: mid }}>{user.email}</span>
              </p>
              <label style={lbl}>New Email Address</label>
              <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="new@email.com" style={inp} />
              <label style={lbl}>Confirm Password</label>
              <input type="password" value={emailPw} onChange={e => setEmailPw(e.target.value)} placeholder="Your password" style={inp} />
              <Btn
                onClick={() => {
                  call("change_email", { newEmail, password: emailPw }, setSecMsg, setSacLoading);
                  setEmailPw("");
                }}
                disabled={secLoading || !newEmail || !emailPw}
              >{secLoading ? "Saving..." : "Change Email"}</Btn>
            </SectionCard>

            <SectionCard title="Backup Email">
              <p style={{ fontSize: 13, color: dim, marginBottom: 16, letterSpacing: "0.04em" }}>
                Used for account recovery. Never shown publicly.
              </p>
              <label style={lbl}>Backup Email</label>
              <input type="email" value={backupEmail} onChange={e => setBackupEmail(e.target.value)} placeholder="backup@email.com" style={inp} />
              <Btn onClick={() => call("set_backup_email", { backupEmail }, setSecMsg)}>Save Backup Email</Btn>
            </SectionCard>

            <SectionCard title="Account Info">
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { label: "Account ID", value: user.id },
                  { label: "Email", value: user.email },
                  { label: "Active Units", value: String(units.length) },
                ].map(({ label, value }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid rgba(0,212,255,0.06)" }}>
                    <span style={{ fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: dim }}>{label}</span>
                    <span style={{ fontSize: 13, color: mid, fontFamily: "monospace" }}>{value}</span>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        )}
      </div>

      <PageFooter />
    </main>
  );
}
