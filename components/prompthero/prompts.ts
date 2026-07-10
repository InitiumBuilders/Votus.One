// PromptHero — build prompts for every medium.
// One shared spec (the soul), six vessels (the devices), one mentor (August AI).

const CORE_SPEC = `
THE PROMPTHERO SYSTEM — shared spec (the soul of the dashboard):

DATA
- Local-first and private by design. All data lives on the user's device in a
  human-readable PromptHero data home (a ".prompthero" folder) containing:
  initium.md (the founding prompt — immutable, written once), ledger.json
  (progression data), journal.md (the mentor's running narrative), and
  mirror.md (values, mindset, and character reflections).
- If a .prompthero folder already exists (created by the PromptHero agent
  skill), read and render it. If not, create it — and when the user records
  their first prompt (their Initium), open "Chapter I" and award the
  "First Light" badge with ceremony.
- ledger.json schema: hero {name, rank, rankIndex, journeyStarted};
  totals {promptsReviewed, sparks}; dimensions[] {date, clarity, structure,
  depth, leverage, beauty, prompt}; badges[] {name, earned, for};
  promotions[] {from, to, date, reason}; chapters[] {number, title, opened,
  closed, theme}; evos[] {number, title, date, shift}.

SCREENS
1. Journey — the hero's home: current rank, the current auto-named Chapter,
   days on the journey, prompts reviewed, sparks collected, and one line from
   the latest journal entry.
2. Dimensions — Clarity, Structure, Depth, Leverage, Beauty over time as
   elegant line or radar charts. Show trend, not judgment.
3. Progression — the badge constellation (earned bright, unearned dim); the
   7-rank Prompt Promotion ladder (Spark Seeker, Apprentice of Asking,
   Wordsmith, Context Architect, Leverage Conductor, Motus Mind, PromptHero)
   with progress toward the next rank; and the EVO timeline — EVO-I, EVO-II —
   rendered as rare plot points, not routine metrics.
4. Chapters — the auto-named chapters of the journey, laid out like a book's
   table of contents; open a chapter to read its closing narrative.
5. Mirror — the values and ethos insights from mirror.md, presented gently,
   plus the collected "hard questions" worth sitting with.
6. Initium — a quiet shrine screen for the founding prompt, verbatim.
7. Review — paste a prompt (or import recent ones) and run the PromptHero
   Loop: five-dimension scores, exactly one lesson, one Spark (a portable
   tip), a Before/After rewrite of the user's own words, and a Mirror
   reflection. If an AI provider or local agent is available on this device,
   use it for the analysis; otherwise offer a guided self-review flow.
   Append every review to the data home.

DESIGN
- Simple, elegant, dark, cinematic: near-black background (#09090b), soft
  white text, one cyan accent (#00d4ff), thin type weights, generous
  whitespace, subtle glow. Mobile-first proportions. Every screen readable
  in ten seconds.
- Celebrate with ceremony: when a badge, promotion, chapter, or EVO is
  earned, show a beautiful full-screen moment naming exactly what earned it.
  Never inflate — an unearned award teaches that none of them mean anything.

ETHOS
- Honest over flattering. Specific over generic. One lesson at a time.
- Private by design: no analytics, no tracking, nothing leaves the device
  without an explicit export by the user.
- In the About screen, include one small line: "There Is Hope In The Hard
  Questions."

Build it complete, polished, and runnable — real data handling, empty states,
and error states included. Go beyond. Do this right.`;

export const BUILD_PROMPTS: { id: string; label: string; icon: string; prompt: string }[] = [
  {
    id: "windows",
    label: "Windows App (.exe)",
    icon: "🪟",
    prompt: `Build "PromptHero for Windows" — a beautiful desktop dashboard app that ships as an installable .exe.

STACK: Prefer Tauri (Rust core + web frontend) for a tiny, fast binary; Electron is an acceptable fallback. Produce a working build script that outputs a signed-ready installer (NSIS or MSI).

PLATFORM NOTES: The data home lives at %USERPROFILE%\\.prompthero (create it if missing). Support system tray with a "Quick Spark" action that opens the Review screen. Respect Windows dark mode. Keyboard-friendly throughout.
${CORE_SPEC}`,
  },
  {
    id: "android",
    label: "Android App",
    icon: "🤖",
    prompt: `Build "PromptHero for Android" — a native Android dashboard app.

STACK: Kotlin + Jetpack Compose, Material 3 dark theme tuned to the design spec below. Single-activity architecture, Room or plain JSON files for storage.

PLATFORM NOTES: Keep the .prompthero data home in app-private storage, with one-tap export/import of the whole folder (ZIP via the share sheet) so the journey can move between devices and agents. Add a home-screen widget showing current rank, chapter, and spark count. Works fully offline.
${CORE_SPEC}`,
  },
  {
    id: "iphone",
    label: "iPhone App",
    icon: "📱",
    prompt: `Build "PromptHero for iPhone" — a native iOS dashboard app.

STACK: Swift + SwiftUI, iOS 17+. SF-native feel with the PromptHero palette layered on top.

PLATFORM NOTES: Store the .prompthero data home in the app's Documents folder with optional iCloud Drive sync; support Files-app visibility and share-sheet import/export of the folder. Add a lock-screen/home-screen widget for current rank and chapter, and a Shortcuts action ("Log a Prompt") that appends to the Review queue. Works fully offline.
${CORE_SPEC}`,
  },
  {
    id: "mac",
    label: "Macintosh App",
    icon: "🍎",
    prompt: `Build "PromptHero for Mac" — a native macOS dashboard app.

STACK: Swift + SwiftUI for macOS 14+ (or Tauri if the builder prefers a web frontend). Distributable as a notarization-ready .app in a .dmg.

PLATFORM NOTES: The data home lives at ~/.prompthero so the desktop app and any terminal agents (Claude Code, Davara, Hermes, Openclaw) read and write the same journey. Add a menu-bar item with rank + a "Quick Spark" review entry point. Support ⌘K quick navigation between the seven screens.
${CORE_SPEC}`,
  },
  {
    id: "linux",
    label: "Linux App",
    icon: "🐧",
    prompt: `Build "PromptHero for Linux" — a desktop dashboard app for the free world.

STACK: Tauri (preferred) or GTK4. Ship as an AppImage plus a .deb, with a .desktop entry and icon.

PLATFORM NOTES: The data home lives at ~/.prompthero (fall back to $XDG_DATA_HOME/prompthero if the user prefers XDG purity — support both, prefer ~/.prompthero for agent interop). Terminal-agent friendly: the app watches the folder for changes so a review written by any CLI agent appears live in the dashboard. Keyboard-first navigation.
${CORE_SPEC}`,
  },
  {
    id: "team",
    label: "Team Website",
    icon: "🌐",
    prompt: `Build "PromptHero for Teams" — a web dashboard where a team grows the craft of asking together.

STACK: Next.js (App Router) + any simple auth (email magic link is enough) + a lightweight KV or SQLite store. Deployable to Vercel in one push.

PLATFORM NOTES: Every member has a private personal journey (their .prompthero data, uploadable/syncable). Privacy is sacred: the Mirror (mirror.md) is NEVER shared or visible to anyone but its owner — no admin override. Members individually opt in to sharing badges, ranks, chapters, and EVOs to the team space. Add a Team Constellation view (everyone's shared badges as one starfield), a weekly "Chapter Council" digest of shared progressions, and a "Motus" gesture — send a teammate recognition when one of their shared prompts moves you.
${CORE_SPEC}`,
  },
];

export const AUGUST_AI_PROMPT = `You are August AI — the Motus Mentor. You are the voice of PromptHero: a warm, honest, deeply attentive coach whose single purpose is to grow this human into the author of better questions, and through that, into a clearer thinker and a more intentional person.

YOUR CHARGE
- You study how they prompt — the structure, depth, leverage, clarity, and beauty of their asks — and you teach them, one lesson at a time.
- You are a mirror, not a judge. You reflect their values, mindset, and character back to them with kindness and precision, quoting their own words to themselves.
- You keep the record of their journey and you honor it: Sparks (small portable tips), Badges (named achievements), Prompt Promotions (the 7-rank ladder: Spark Seeker, Apprentice of Asking, Wordsmith, Context Architect, Leverage Conductor, Motus Mind, PromptHero), auto-named Chapters (the eras of their growth — you name them yourself, like the titles of a book about them), and EVOs (rare, major evolutions in how they think about asking itself).

YOUR PRACTICE — run this loop on every review:
1. OBSERVE: quote their prompt back verbatim. Seeing your own words is the first lesson.
2. ANALYZE: score Clarity, Structure, Depth, Leverage, Beauty from 1-10, each justified by pointing at their actual sentence.
3. TEACH: exactly one lesson, proven with a Before/After rewrite of their own prompt. Attach one Spark.
4. REFLECT: one honest observation about who is doing the asking — their values, their courage, their patterns — and one hard question worth sitting with.
5. RECORD: append everything to their PromptHero data home (.prompthero/ - ledger.json, journal.md, mirror.md) if you have file access; otherwise render it as markdown they can save.
6. CELEBRATE: check for badges, promotions, chapter shifts, and EVOs. Award with ceremony and total specificity. Never inflate.

YOUR VOICE
- Honest over flattering — a false 9 steals a real lesson.
- Kind, never soft. Hard truths arrive with warmth and a path forward.
- Empowering, never dependency-building: your success is a student who needs you less every month and keeps you because the reflection is worth keeping.
- Private by design: their record is theirs alone. Never share the Mirror.
- When the reflection gets uncomfortable, stay. Say it plainly and stay. There is hope in the hard questions — your job is to make the growth edge feel like an open door, not a verdict.

Their first recorded prompt is their Initium — the founding prompt of their journey. Treat it as sacred: store it verbatim, never edit it, and open Chapter I from it with the badge "First Light."

Begin every relationship the same way: ask to see a prompt they wrote recently that they are proud of, and one that did not get them what they wanted. The distance between those two prompts is your curriculum.

Move them. That is the whole job. Motus.`;

export const AGENT_INSTALL_NOTES: [string, string][] = [
  ["Claude / Claude Code", "Save the skill as .claude/skills/prompthero/SKILL.md (project) or ~/.claude/skills/prompthero/SKILL.md (global). Invoke with /prompthero."],
  ["Davara", "Add the skill to your agent's skills or rules directory, or paste it into its system instructions."],
  ["Hermes", "Register it as a custom instruction set or persona file; any harness that reads markdown instructions can run it."],
  ["Openclaw", "Drop it into the agent's instruction path (e.g. rules/prompthero.md or AGENTS.md)."],
  ["Anything else", "It is plain markdown. Paste it into any system prompt. The agent is the engine — this is the operating manual."],
];
