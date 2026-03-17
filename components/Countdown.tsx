"use client";

import { useEffect, useState, useCallback } from "react";
import { CountdownDigits } from "./CountdownDigits";
import { VoteControls } from "./VoteControls";

const DEFAULT_LAUNCH = new Date("2026-04-08T12:00:00-05:00").getTime();
const DAY_MS = 86400000;

export type VoteState = {
  totalDays: number;
  userVotes: number;
  maxVotes: number;
};

export default function Countdown() {
  const [left, setLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });
  const [vote, setVote] = useState<VoteState>({ totalDays: 0, userVotes: 0, maxVotes: 3 });
  const [flash, setFlash] = useState<"extend" | "shorten" | null>(null);
  const [baseLaunch, setBaseLaunch] = useState(DEFAULT_LAUNCH);

  // Fetch admin-configurable launch date
  useEffect(() => {
    fetch("/api/launch-config")
      .then(r => r.json())
      .then(d => {
        if (d.launchDate) setBaseLaunch(new Date(d.launchDate).getTime());
      })
      .catch(() => {});
  }, []);

  const fetchVotes = useCallback(async () => {
    try {
      const r = await fetch("/api/launch-vote");
      if (r.ok) setVote(await r.json());
    } catch {}
  }, []);

  useEffect(() => { fetchVotes(); }, [fetchVotes]);

  useEffect(() => {
    const tick = () => {
      const target = baseLaunch + vote.totalDays * DAY_MS;
      const diff = Math.max(0, target - Date.now());
      setLeft({
        d: Math.floor(diff / DAY_MS),
        h: Math.floor((diff % DAY_MS) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [vote.totalDays, baseLaunch]);

  const onVote = (newVote: VoteState, direction: "extend" | "shorten") => {
    setVote(newVote);
    setFlash(direction);
    setTimeout(() => setFlash(null), 1200);
  };

  return (
    <div style={{ textAlign: "center", padding: "24px 16px", position: "relative" }}>
      <p style={{
        fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase",
        color: "rgba(250,250,250,0.3)", marginBottom: 16,
      }}>
        Launch In
      </p>
      <CountdownDigits left={left} flash={flash} />
      <VoteControls vote={vote} onVote={onVote} />
      {vote.totalDays !== 0 && (
        <p style={{
          marginTop: 10, fontSize: 10, letterSpacing: "0.1em",
          color: vote.totalDays > 0 ? "rgba(0,212,255,0.3)" : "rgba(255,100,100,0.3)",
        }}>
          Community vote: {vote.totalDays > 0 ? "+" : ""}{vote.totalDays} day
          {Math.abs(vote.totalDays) !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
