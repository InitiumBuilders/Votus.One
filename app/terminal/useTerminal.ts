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
  "README.md": "You found the terminal. Now find the movement. Votus.One",
  ".secret": "The password is: showing up.",
  ".motus_log": `[2026-01-01] First movement detected.
[2026-02-15] Love entered the protocol.
[2026-03-17] You are reading this. That counts.`,
  "flywheels.md": `THE VOTUS FLYWHEELS
───────────────────
1. UNIT: Start → Decide → Trust → Earn → Attract → Grow → Run
2. MOTUS: Serve → Recognize → Culture → Attract → Strengthen → Repeat
3. COMMUNITY: One unit → Visible results → "We could do that" → New unit → Connect → Rise
4. DISCORD: Register → Join → Discuss → Propose → Vote → Grow → Recruit → ///AllRise///`,
  "protocol.md": `THE VOTUS UNIT PROTOCOL
───────────────────────
1. Find your people (one other is enough)
2. Name your unit (it becomes your short link)
3. Register at Votus.One/start
4. Create an account (email + password)
5. Set your first meeting (physical is powerful)
6. Everyone writes before anyone speaks
7. Share Votus.One/u/your-name with the world`,
  ".love_letter": `Dear future citizen,

You found this file. That means you looked deeper
than most. That means you care about things
that are hidden. That means you understand that
the best things in a system are the ones
you have to earn the right to see.

Welcome. You belong here.

~August James, 2026`,
  ".the_question": "What if the people who cared the most had the simplest way to show up?",
  "contributors.md": `HOW TO CONTRIBUTE
─────────────────
git clone https://github.com/InitiumBuilders/Votus.One
npm install
npm run dev

Ways to contribute:
- 🐛 Fix a bug
- ✨ Build a feature
- 🥚 Hide an easter egg
- 📖 Improve docs
- 🎨 Design something beautiful
- 📣 Start a Votus Unit (that counts too)`,
  ".adrienne": "\"What you pay attention to grows.\" — adrienne maree brown",
  ".donella": "\"The goal of foreseeing the future is not to control it, but to care for it.\" — Donella Meadows",
  ".seeds": `SEED_001: Chicago
SEED_002: [YOUR CITY HERE]
SEED_003: [YOUR NEIGHBORHOOD HERE]

To plant a seed: Votus.One/start`,
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
  "\"The cure for apathy isn't louder leaders — it's a seat at the table.\"",
  "\"Maybe the hero we were looking for has been all of us over time.\"",
  "\"Every forest began with one seed that didn't ask permission to grow.\"",
  "\"Five people who show up every time will outperform a million who show up once.\"",
  "\"The large is a reflection of the small. Your block is a country in miniature.\"",
  "\"Trust the people. If you trust the people, they become trustworthy.\"",
  "\"Change is constant. Be like water.\"",
  "\"There is always enough time for the right work.\"",
  "\"Somewhere a Votus Unit is meeting tonight. Somewhere one hasn't started yet. Both are about you.\"",
  "\"The goal of foreseeing the future is not to control it, but to care for it.\" — Donella Meadows",
  "\"An ounce of practice is worth more than tons of preaching.\" — Gandhi",
  "\"You never change things by fighting the existing reality. Build a new model that makes the old one obsolete.\" — Buckminster Fuller",
  "\"When I dare to be powerful — to use my strength in the service of my vision — it becomes less important whether I am afraid.\" — Audre Lorde",
  "\"Not everything that is faced can be changed, but nothing can be changed until it is faced.\" — James Baldwin",
  "\"The only way to deal with an unfree world is to become so absolutely free that your very existence is an act of rebellion.\" — Camus",
  "\"In the middle of difficulty lies opportunity.\" — Einstein",
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
  "votus": "VOTUS = Voice + Us. Vote Us. Democracy reimagined as a living network.",
  "allrise": "ALL RISE = The courtroom call. But this time, it's for everyone.",
  "semble": "SEMBLE = To assemble, to resemble, to gather. The Emergent State.",
  "22": "$22/month. Less than Netflix. The cost of citizenship in a better future.",
  "vibe": "VIBE = A Votus team. 3-12 people who move as one. The smallest unit of change.",
  "flywheel": "FLYWHEEL = A system where every output becomes the next input. Units grow by growing others.",
  "emergent": "EMERGENT = Not planned from above. Arising from below. From relationship. From trust.",
  "sacred": "SACRED = What we protect. DASH 🔒 TRUST 🔒 ANKR 🔒 — and the belief that people can govern themselves.",
  "gift": "GIFT GEAR = Buy one, gift one. The fundraiser IS the product. Clothing that moves.",
  "trust": "TRUST = The velocity of a community. Move at the speed of it, or break trying to go faster.",
  "seed": "SEED = Every Votus Unit starts as a seed. You don't need permission to plant one.",
  "table": "TABLE = There is a seat with your name on it. The table was always meant to be bigger.",
  "fractal": "FRACTAL = The pattern of the whole reflected in each part. Fix your block, fix the country.",
  "love": "LOVE = The only protocol that scales without breaking. The substrate underneath everything.",
  "democracy": "DEMOCRACY = Not an event. A practice. Not something you watch. Something you do. Every Tuesday.",
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

    // ── Philosophical / thought-provoking ──
    if (cmd === "hero") {
      typewriter("Maybe the hero we were looking for has been all of us over time.", 40);
      return;
    }
    if (cmd === "why") {
      addLine("You came looking for something. You wouldn't be in a terminal if you didn't care.");
      return;
    }
    if (cmd === "table") {
      addLine("There is a seat at the table with your name on it. Nobody is going to pull it out for you.");
      return;
    }
    if (cmd === "apathy") {
      typewriter("The cure for apathy isn't information. It's a table. With chairs. And someone saying: sit.", 35);
      return;
    }
    if (cmd === "five") {
      addLine("Five people who show up every time will outperform a million who show up once.");
      return;
    }
    if (cmd === "seed") {
      addLine("Every forest began with one seed that didn't ask permission to grow.");
      return;
    }
    if (cmd === "small") {
      addLine("The large is a reflection of the small. Your block is a country in miniature.");
      return;
    }
    if (cmd === "together") {
      typewriter("You are not here to be right. You are here to see together.", 40);
      return;
    }
    if (cmd === "tuesday") {
      addLine("Every 4 years is not often enough to care. What if you cared every Tuesday?");
      return;
    }
    if (cmd === "midnight") {
      addLine("Someone in your neighborhood is awake right now, worrying about the same thing you are.");
      return;
    }
    if (cmd === "sat" || cmd === "saturday") {
      addLine("What if democracy felt like something you wanted to do on a Saturday morning?");
      return;
    }
    if (cmd === "mirror") {
      addLine("You scrolled past a hundred things today. You stopped at a terminal. That says something.");
      return;
    }
    if (cmd === "fractal") {
      addLine("The pattern of the whole is reflected in each part. What pattern are you making?");
      return;
    }
    if (cmd === "water") {
      typewriter("Be like water. Change is constant. The river doesn't fight the rock. It becomes the canyon.", 30);
      return;
    }
    if (cmd === "listen") {
      addLine("Everyone writes before anyone speaks. That's the protocol. That's the respect.");
      return;
    }
    if (cmd === "brave") {
      addLine("Starting something that might fail takes more courage than watching from the comments.");
      return;
    }
    if (cmd === "contribute") {
      addLine("git clone https://github.com/InitiumBuilders/Votus.One — The movement is open source.");
      return;
    }
    if (cmd === "flywheel" || cmd === "flywheels") {
      addLine(FILES["flywheels.md"]);
      return;
    }
    if (cmd === "protocol") {
      addLine(FILES["protocol.md"]);
      return;
    }
    if (cmd === "github" || cmd === "git" || cmd === "repo") {
      addLine("https://github.com/InitiumBuilders/Votus.One — Fork it. Build on it. Make democracy more human.");
      return;
    }
    if (cmd === "donate" || cmd === "fund" || cmd === "money") {
      addLine("$22/month. Per person. That's the cost. No venture capital. No gatekeepers. Just people showing up.");
      return;
    }
    if (cmd === "vibe") {
      addLine("A Vibe is a team of 3-12 people who move as one. Start one: Votus.One/start");
      return;
    }
    if (cmd === "gift" || cmd === "gear" || cmd === "giftgear") {
      typewriter("GIFT GEAR — Buy one, gift one. The fundraiser IS the product. Clothing that moves people.", 35);
      return;
    }
    if (cmd === "join") {
      addLine("Visit Votus.One/start to register your unit, or Votus.One/votus-units to find one near you.");
      return;
    }
    if (cmd === "discord") {
      addLine("https://discord.gg/BDUDhayHeX — The nerve center. Where Vibes coordinate.");
      return;
    }
    if (cmd === "dream") {
      typewriter("Year 1: 100 units. Year 2: first team runs for office. Year 5: recognized civic form. Year 10: democracy looks different.", 30);
      return;
    }
    if (cmd === "fear") {
      addLine("Fear is natural. Apathy is the enemy. The difference between them is one decision.");
      return;
    }
    if (cmd === "hope") {
      addLine("Hope is not optimism. Hope is the decision to act when the outcome is uncertain. You're here. That's hope.");
      return;
    }
    if (cmd === "vote" && voteCount.current === 0) {
      // Already handled above, but this is for the first-time special message
    }
    if (cmd === "change") {
      typewriter("Change is constant. Be like water. The river doesn't fight the rock — it becomes the canyon.", 30);
      return;
    }
    if (cmd === "patience") {
      addLine("The systems that last are the ones that grew slowly enough to grow roots.");
      return;
    }
    if (cmd === "roots") {
      addLine("Before branches, there were roots. Before movements, there were conversations. Before Votus, there was a question.");
      return;
    }
    if (cmd === "question") {
      typewriter("What if the people who cared the most had the simplest way to show up?", 40);
      return;
    }
    if (cmd === "answer") {
      addLine("The answer was always: yes, if you build the container.");
      return;
    }
    if (cmd === "show") {
      addLine("Showing up is the most radical act in a world designed to make you stay home.");
      return;
    }
    if (cmd === "home") {
      addLine("Home is not a place. It's the people who see you when you walk in. That's what a Votus Unit is.");
      return;
    }
    if (cmd === "time") {
      addLine(`Local: ${new Date().toLocaleString()} | Votus Standard Time: Always.`);
      return;
    }
    if (cmd === "count") {
      addLine("Counting the people who show up is more important than counting the ones who don't.");
      return;
    }
    if (cmd === "start") {
      typewriter("Start before you're ready. Start before you're sure. Start before you're told it's safe. Votus.One/start", 30);
      return;
    }
    if (cmd === "name") {
      addLine("VOTUS — from the Latin 'votum' (a vow, a wish, a promise). VOTE US. The team is the candidate.");
      return;
    }
    if (cmd === "color") {
      addLine("Cyan #00d4ff — the color of civic light. Not red. Not blue. Something new.");
      return;
    }
    if (cmd === "music") {
      addLine("Every page has a soundscape. Synthesized in-browser with the Web Audio API. No files. Pure frequency. Pure intention.");
      return;
    }
    if (cmd === "sound") {
      addLine("Sound on. The movement has a frequency.");
      return;
    }
    if (cmd === "kristina") {
      addLine("Co-founder. Strategist. The person who said 'this could actually work' and meant it.");
      return;
    }
    if (cmd === "chicago") {
      addLine("SEED_001: Chicago. Where it started. Where the first unit will meet. The wind knows what's coming.");
      return;
    }
    if (cmd === "emerge" || cmd === "emergence") {
      typewriter("Emergence: when the whole becomes greater than the sum of its parts. That's what happens when five people decide to govern themselves.", 25);
      return;
    }
    if (cmd === "teach") {
      addLine("The best way to learn governance is to govern. The best way to teach democracy is to practice it.");
      return;
    }
    if (cmd === "fail") {
      addLine("Never a failure, always a lesson. The unit that disbanded taught the next one how to stay.");
      return;
    }
    if (cmd === "quiet") {
      addLine("...");
      setTimeout(() => addLine("The moment the room gets quiet enough to hear the truth."), 3000);
      return;
    }
    if (cmd === "loud") {
      addLine("THE SIGNAL IS CLEAR. ///ALLRISE///");
      return;
    }
    if (cmd === "sleep") {
      addLine("Democracy never sleeps. But you should. Come back tomorrow and bring a friend.");
      return;
    }
    if (cmd === "wake") {
      addLine("You're awake now. What will you build with this clarity?");
      return;
    }
    if (cmd === "future") {
      typewriter("The future is a unit meeting in a living room. Five people with a proposal and a vote. That's it. That's everything.", 30);
      return;
    }
    if (cmd === "past") {
      addLine("The past gave us institutions that worked for their time. This is ours.");
      return;
    }
    if (cmd === "now") {
      addLine(`NOW: ${new Date().toISOString()} — The only moment that governance happens in.`);
      return;
    }
    if (cmd === "us") {
      addLine("Vote. Us. That's the whole idea. Not 'vote for me.' Vote us. Together.");
      return;
    }

    addLine(`Command not found: ${raw.trim()}. Type 'help' for commands.`);
  }, [addLine, addLines, typewriter]);

  return { lines, input, setInput, runCommand, showMatrix, setShowMatrix, getCtx, navigateHistory };
}
