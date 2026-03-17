"use client";

import { useState, useRef } from "react";
import type { VoteState } from "./Countdown";

type Props = {
  vote: VoteState;
  onVote: (newVote: VoteState, direction: "extend" | "shorten") => void;
};

export function VoteControls({ vote, onVote }: Props) {
  const [toast, setToast] = useState<string | null>(null);
  const [shake, setShake] = useState(false);
  const [busy, setBusy] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const showToast = (msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  };

  const castVote = async (direction: "extend" | "shorten") => {
    if (busy) return;
    setBusy(true);
    try {
      const r = await fetch("/api/launch-vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction }),
      });
      const data = await r.json();

      if (!r.ok) {
        setShake(true);
        setTimeout(() => setShake(false), 600);
        showToast(data.error === "max_extend"
          ? "⚡ All 3 extend votes used"
          : data.error === "max_shorten"
          ? "⚡ All 3 shorten votes used"
          : "Something went wrong");
        return;
      }

      // Play vote sound if audio context available
      try {
        const ctx = (window as unknown as Record<string, unknown>).__votusAudioCtx as AudioContext | undefined;
        if (ctx?.state === "running") {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(direction === "extend" ? 880 : 440, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(
            direction === "extend" ? 1760 : 220, ctx.currentTime + 0.15
          );
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
          osc.connect(gain).connect(ctx.destination);
          osc.start(); osc.stop(ctx.currentTime + 0.35);
        }
      } catch {}

      const newVote = { totalDays: data.totalDays, userVotes: data.userVotes, maxVotes: data.maxVotes };
      onVote(newVote, direction);
      const rem = data.maxVotes - Math.abs(data.userVotes);
      showToast(direction === "extend"
        ? `+1 day · ${rem} vote${rem !== 1 ? "s" : ""} remaining`
        : `−1 day · ${rem} vote${rem !== 1 ? "s" : ""} remaining`);
    } catch {
      showToast("Network error — try again");
    } finally {
      setBusy(false);
    }
  };

  const canExtend = vote.userVotes < vote.maxVotes;
  const canShorten = vote.userVotes > -vote.maxVotes;

  return (
    <>
      <style>{`
        @keyframes vc-shake {
          0%,100%{transform:translateX(0)} 20%{transform:translateX(-4px)}
          40%{transform:translateX(4px)} 60%{transform:translateX(-3px)} 80%{transform:translateX(3px)}
        }
        @keyframes vc-toast {
          0%{opacity:0;transform:translateX(-50%) translateY(8px) scale(0.95)}
          100%{opacity:1;transform:translateX(-50%) translateY(0) scale(1)}
        }
        @keyframes vc-pip-fill {
          0%{transform:scale(0)} 60%{transform:scale(1.4)} 100%{transform:scale(1)}
        }
        .vc-btn {
          background:none; border:1px solid rgba(0,212,255,0.15); border-radius:100px;
          padding:10px 20px; font-size:11px; letter-spacing:0.12em; text-transform:uppercase;
          cursor:pointer; font-family:inherit; transition:all 0.3s ease; position:relative; overflow:hidden;
        }
        .vc-btn:not(:disabled):hover { border-color:rgba(0,212,255,0.4); transform:scale(1.04); }
        .vc-btn:not(:disabled):active { transform:scale(0.95); }
        .vc-btn:disabled { opacity:0.2; cursor:not-allowed; }
        .vc-ext { color:rgba(0,212,255,0.5); }
        .vc-shr { color:rgba(255,100,100,0.5); }
        .vc-shr:not(:disabled):hover { border-color:rgba(255,100,100,0.3); }
      `}</style>

      <div style={{ animation: shake ? "vc-shake 0.5s ease" : undefined }}>
        <div style={{ marginTop: 20, display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <button className="vc-btn vc-shr" onClick={() => castVote("shorten")} disabled={!canShorten || busy}>
            − 1 Day · Launch Sooner
          </button>
          <button className="vc-btn vc-ext" onClick={() => castVote("extend")} disabled={!canExtend || busy}>
            + 1 Day · We Need More Time
          </button>
        </div>

        {/* Vote pips */}
        <div style={{ marginTop: 12, display: "flex", justifyContent: "center", gap: 5, alignItems: "center" }}>
          <span style={{ fontSize: 9, color: "rgba(250,250,250,0.2)", letterSpacing: "0.1em", marginRight: 4 }}>
            YOUR VOTES
          </span>
          {Array.from({ length: vote.maxVotes * 2 }, (_, i) => {
            const voteVal = i < vote.maxVotes ? -(vote.maxVotes - i) : i - vote.maxVotes + 1;
            const isUsed = voteVal < 0 ? vote.userVotes <= voteVal : vote.userVotes >= voteVal;
            const isNeg = voteVal < 0;
            return (
              <div key={i} style={{
                width: 7, height: 7, borderRadius: "50%",
                border: `1px solid ${isNeg ? "rgba(255,100,100,0.25)" : "rgba(0,212,255,0.25)"}`,
                background: isUsed ? (isNeg ? "rgba(255,100,100,0.6)" : "rgba(0,212,255,0.6)") : "transparent",
                transition: "all 0.3s ease",
                animation: isUsed ? "vc-pip-fill 0.3s ease" : undefined,
              }} />
            );
          })}
        </div>
      </div>

      {toast && (
        <div style={{
          position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)",
          background: "rgba(15,15,20,0.95)", border: "1px solid rgba(0,212,255,0.15)",
          borderRadius: 12, padding: "10px 20px", fontSize: 12, letterSpacing: "0.05em",
          color: "rgba(250,250,250,0.7)", animation: "vc-toast 0.3s ease forwards",
          backdropFilter: "blur(12px)", zIndex: 100, whiteSpace: "nowrap",
        }}>
          {toast}
        </div>
      )}
    </>
  );
}
