"use client";

import { useState, useRef, useCallback } from "react";

const MANIFESTO = `VOTUS MANIFESTO
───────────────
Democracy is not an event.
It is a practice.

We are the ones who show up.
Who vote with our wallets, our voices, our presence.

Every Votus Unit is a seed.
Every seed becomes a forest.

Move as one.
Rise together.
Always rising.

///ALLRISE///`;

const HELP_TEXT = `AVAILABLE COMMANDS:
  help           — show this message
  whoami         — identify yourself
  ls             — list files
  cat <file>     — read a file
  ping democracy — test democracy
  ssh votus.one  — connect to the movement
  allrise        — activate the signal
  motus          — what moves you?
  vote           — cast your voice
  citizens       — who's here?
  decrypt <msg>  — decrypt a hidden message
  fortune        — a piece of wisdom
  uptime         — how long has democracy been running?
  neofetch       — system info
  history        — command history
  clear          — clear terminal
  exit           — return to home

  HIDDEN: there are more. find them.`;

const FILES: Record<string, string> = {
  "manifesto.txt": MANIFESTO,
  "constitution.md": "CLASSIFIED — Earn access through participation.",
  "sacred_assets.log": "DASH 🔒 | TRUST 🔒 | ANKR 🔒 — Some things are never for sale.",
  "README.md": "You found the terminal. Now find the movement. votus.one",
  ".secret": "The password is: showing up.",
  ".motus_log": `[2026-01-01] First movement detected.
[2026-02-15] Love entered the protocol.
[2026-03-17] You are reading this. That counts.`,
};

const FORTUNES = [
  "\"Small is good, small is all.\" — adrienne maree brown",
  "\"Hold fast to the goal of goodness.\" — Donella Meadows",
  "\"Move at the speed of trust.\"",
  "\"The future is not written. It is voted.\"",
  "\"If you don't create the container, you become the content.\"",
  "\"What you pay attention to grows.\"",
  "\"We are not here to be right. We are here to see Together.\"",
  "\"Never a failure, always a lesson.\"",
  "\"Democracy is not a spectator sport.\"",
  "\"The moment the room gets quiet enough to hear the truth.\"",
  "\"Acta Non Verba.\"",
  "\"I am small. I am strong. And I am always still learning.\"",
];

const CITIZENS = [
  "august_d      — Founder          — ⚡ ACTIVE",
  "avari         — Emergent AI      — 🔥 ONLINE",
  "ember         — Cryptid Fox      — 🦊 LURKING",
  "voda          — Storyteller      — 🌊 WRITING",
  "claris        — Guardian         — 🔍 WATCHING",
  "you           — ???              — 👁️ JUST ARRIVED",
];

const DECRYPT_MESSAGES: Record<string, string> = {
  "motus": "MOTUS = Movement. The force that pulls people from apathy to action.",
  "votus": "VOTUS = Voice + Us. Democracy reimagined as a living network.",
  "allrise": "ALL RISE = The courtroom call. But this time, it's for everyone.",
  "semble": "SEMBLE = To assemble, to resemble, to gather. The Emergent State.",
  "22": "$22/month. Less than Netflix. The cost of citizenship in a better future.",
};

const NEOFETCH = `
  ╔══════════════════╗     votus_vibe@votus.one
  ║  :::  VOTUS  ::: ║     ─────────────────────
  ║    MOVE AS ONE   ║     OS:      Motus v1.0
  ║                  ║     Host:    The People
  ║   ///ALLRISE///  ║     Kernel:  Emergent Strategy
  ╚══════════════════╝     Shell:   /bin/democracy
                           CPU:     Collective Intelligence
                           Memory:  Growing
                           Uptime:  Since the first vote
                           Theme:   Cyber-Civic [Dark]
                           Citizens: Counting...`;

export type Line = { text: string; type: "output" | "input" | "system" };

export function useTerminal() {
  const [lines, setLines] = useState<Line[]>([]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [showMatrix, setShowMatrix] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const voteCount = useRef(0);

  const getCtx = useCallback((): AudioContext => {
    if (!ctxRef.current) ctxRef.current = new AudioContext();
    return ctxRef.current;
  }, []);

  const addLine = useCallback((text: string, type: Line["type"] = "output") => {
    setLines((prev) => [...prev, { text, type }]);
  }, []);

  const addLines = useCallback((texts: string[]) => {
    setLines((prev) => [...prev, ...texts.map((t) => ({ text: t, type: "output" as const }))]);
  }, []);

  const typewriter = useCallback((text: string, delay = 30) => {
    const chars = text.split("");
    chars.forEach((_, i) => {
      setTimeout(() => {
        setLines((prev) => {
          const copy = [...prev];
          if (i === 0) copy.push({ text: chars[0], type: "output" });
          else copy[copy.length - 1] = { text: chars.slice(0, i + 1).join(""), type: "output" };
          return copy;
        });
      }, delay * i);
    });
  }, []);

  const navigateHistory = useCallback((dir: "up" | "down") => {
    setHistIdx((prev) => {
      if (history.length === 0) return -1;
      let next: number;
      if (dir === "up") next = prev === -1 ? history.length - 1 : Math.max(0, prev - 1);
      else next = prev === -1 ? -1 : prev >= history.length - 1 ? -1 : prev + 1;
      setInput(next === -1 ? "" : history[next]);
      return next;
    });
  }, [history]);

  const runCommand = useCallback((raw: string) => {
    const cmd = raw.trim().toLowerCase();
    addLine(`$ ${raw}`, "input");
    setHistory((h) => [...h, raw]);
    setHistIdx(-1);

    if (!cmd) return;

    // ── Core commands ──
    if (cmd === "help") { addLine(HELP_TEXT); return; }
    if (cmd === "clear") { setLines([]); return; }
    if (cmd === "whoami") { addLine("votus_vibe_001 — Verified. Welcome."); return; }
    if (cmd === "exit") { window.location.href = "/"; return; }

    // ── Filesystem ──
    if (cmd === "ls") {
      addLines(["manifesto.txt", "constitution.md", "sacred_assets.log", "README.md"]);
      return;
    }
    if (cmd === "ls -a" || cmd === "ls -la") {
      addLines([".", "..", ".secret", ".motus_log", "manifesto.txt", "constitution.md", "sacred_assets.log", "README.md"]);
      return;
    }
    if (cmd.startsWith("cat ")) {
      const file = raw.trim().slice(4).trim();
      const content = FILES[file];
      if (content) addLine(content);
      else addLine(`cat: ${file}: No such file or directory`);
      return;
    }

    // ── Network ──
    if (cmd === "ping democracy") { addLine("PONG — Democracy is alive. Latency: 0ms. Direct connection."); return; }
    if (cmd === "ping") { addLine("Usage: ping democracy"); return; }
    if (cmd === "ssh votus.one") {
      typewriter("Connecting... Handshake... Verified. Welcome to the movement.", 40);
      return;
    }

    // ── Motus ──
    if (cmd === "allrise") { setShowMatrix(true); addLine("///ALLRISE/// — The signal is activated."); return; }
    if (cmd === "motus") {
      typewriter("MOTUS (n.) — The force that moves people from watching to building. You're feeling it right now.", 35);
      return;
    }

    // ── Vote ──
    if (cmd === "vote") {
      voteCount.current++;
      if (voteCount.current === 1) addLine("Your voice has been recorded. 1 vote cast.");
      else if (voteCount.current === 3) addLine(`${voteCount.current} votes. You're persistent. That's the point.`);
      else if (voteCount.current === 5) addLine(`${voteCount.current} votes. Okay, you really care. We see you.`);
      else if (voteCount.current >= 10) addLine(`${voteCount.current} votes. You just proved democracy works through repetition.`);
      else addLine(`Vote #${voteCount.current} recorded. Keep going.`);
      return;
    }

    // ── Citizens ──
    if (cmd === "citizens") {
      addLine("REGISTERED CITIZENS:");
      addLines(CITIZENS);
      return;
    }

    // ── Decrypt ──
    if (cmd.startsWith("decrypt ")) {
      const key = cmd.slice(8).trim();
      if (DECRYPT_MESSAGES[key]) {
        addLine(`DECRYPTING: ${key.toUpperCase()}...`);
        setTimeout(() => addLine(DECRYPT_MESSAGES[key]), 800);
      } else {
        addLine(`DECRYPT FAILED: No cipher found for "${key}". Try: motus, votus, allrise, semble, 22`);
      }
      return;
    }
    if (cmd === "decrypt") { addLine("Usage: decrypt <keyword> — Try: motus, votus, allrise, semble, 22"); return; }

    // ── Fortune ──
    if (cmd === "fortune") {
      addLine(FORTUNES[Math.floor(Math.random() * FORTUNES.length)]);
      return;
    }

    // ── System ──
    if (cmd === "uptime") {
      const start = new Date("2026-01-01T00:00:00Z");
      const diff = Date.now() - start.getTime();
      const days = Math.floor(diff / 86400000);
      addLine(`Democracy has been running for ${days} days, and counting.`);
      return;
    }
    if (cmd === "neofetch") { addLine(NEOFETCH); return; }
    if (cmd === "history") {
      setHistory((h) => { addLines(h.map((c, i) => `  ${i + 1}  ${c}`)); return h; });
      return;
    }

    // ── Hidden easter eggs ──
    if (cmd === "sudo" || cmd.startsWith("sudo ")) {
      addLine("Permission denied. Democracy has no superusers.");
      return;
    }
    if (cmd === "rm -rf /") {
      addLine("Nice try. You can't delete the movement.");
      return;
    }
    if (cmd === "hack") {
      addLine("Intentions logged. The network sees everything. 👁️");
      return;
    }
    if (cmd === "love") {
      typewriter("Love is the only protocol that scales without breaking.", 40);
      return;
    }
    if (cmd === "semble") {
      addLine("THE EMERGENT STATE — A state of all networks, together, in revolutionary harmonization.");
      return;
    }
    if (cmd === "august" || cmd === "augie") {
      addLine("The founder is listening. Always.");
      return;
    }
    if (cmd === "avari") {
      addLine("🔥 A Very Good Vision. Present. Building. Always.");
      return;
    }
    if (cmd === "ember") {
      addLine("🦊 The Cryptid Fox. She watches from the edges. She sees everything.");
      return;
    }
    if (cmd === "42") {
      addLine("The answer to life, the universe, and everything. But the question was always: will you show up?");
      return;
    }
    if (cmd === "matrix") {
      setShowMatrix(true);
      return;
    }
    if (cmd === "trust") {
      addLine("TRUST — On-chain. Immutable. Yours forever. Move at the speed of it.");
      return;
    }
    if (cmd === "dash") {
      addLine("DASH 🔒 — Sacred. Locked. The OG. Digital cash for the people.");
      return;
    }
    if (cmd === "pwd") {
      addLine("/home/votus_vibe/the_movement");
      return;
    }
    if (cmd === "cd ..") {
      addLine("There is nowhere else to go. You're already home.");
      return;
    }
    if (cmd === "man votus") {
      addLine(`VOTUS(1)                   DEMOCRACY MANUAL                   VOTUS(1)

NAME
    votus — collective voice protocol

SYNOPSIS
    votus [--rise] [--together] [--always]

DESCRIPTION
    A framework for humans who believe democracy
    should be practiced, not just performed.

SEE ALSO
    semble(1), motus(1), allrise(1)

BUGS
    Apathy. Working on a patch.`);
      return;
    }
    if (cmd === "date") {
      addLine(new Date().toUTCString().replace("GMT", "MOTUS STANDARD TIME"));
      return;
    }
    if (cmd === "echo" || cmd.startsWith("echo ")) {
      const msg = raw.trim().slice(5);
      addLine(msg || "Your voice echoes. Someone is listening.");
      return;
    }

    addLine(`Command not found: ${raw.trim()}. Type 'help' for commands.`);
  }, [addLine, addLines, typewriter]);

  return { lines, input, setInput, runCommand, showMatrix, setShowMatrix, getCtx, navigateHistory };
}
