# Votus.One

> *"Maybe the hero we were looking for has been all of us over time."*

**Votus Units** are teams who run together, govern together, and make democracy engaging.  
Accessible. Transparent. Human.

Because the cure for apathy isn't louder leaders — it's a seat at the table.

**///AllRise///**

---

## What Is Votus.One?

Democracy was built for one voice per person, once every few years.  
Votus was built for teams. For neighborhoods. For now.

A **Votus Unit** is the smallest building block of real democracy.  
A group of people — neighbors, friends, anyone who gives a damn — who come together to **listen, propose, vote, and move.** Transparently. On-chain. As equals.

Five people is enough. One hundred is powerful.

---

## The Flywheels

Understanding how Votus grows helps you know where to contribute.

### 🔁 Flywheel 1 — The Unit Flywheel

```
Someone starts a unit
    → Unit makes decisions together
    → Decisions build trust (on-chain, verifiable)
    → Trust earns $Votus
    → $Votus attracts more members
    → More members → richer decisions → stronger unit
    → Unit runs for something
    → Win or lose, the trust is permanent
```

### 🔁 Flywheel 2 — The Motus Flywheel

```
A member goes above and beyond
    → Team sends them $Motus ("You moved me")
    → $Motus is visible, public, permanent
    → Recognition builds culture
    → Culture attracts the right people
    → Right people make the unit stronger
    → Stronger units send more Motus
```

### 🔁 Flywheel 3 — The Community Flywheel

```
One unit forms in a city
    → They vote on something real
    → Other people see the result
    → "We could do that too"
    → New unit forms in the same city
    → Two units connect, share Motus
    → City-level coordination emerges
    → ///AllRise///
```

### 🔁 Flywheel 4 — The Discord Flywheel

```
Unit registers → Discord link required
    → Members join the Discord
    → Discord becomes the nerve center
    → Community votes, proposes, discusses
    → Discord activity boosts unit visibility
    → Trending units recruit new members
    → Movement grows organically
```

---

## The Stack

Built lean. Built to last. Built to move.

| Layer | Tech | Why |
|-------|------|-----|
| **Frontend** | Next.js 15 (App Router) | Fast, static where possible, server where needed <!-- Psst: try /terminal --> |
| **Styling** | Inline styles | Zero CSS conflicts, zero framework lock-in |
| **Database** | Vercel KV (Upstash Redis) | Serverless, instant, no schema migrations |
| **Auth** | Custom JWT-less session (KV cookies) | No external auth service needed |
| **Media** | Stored in KV as base64 | No S3 required for MVP |
| **Deployment** | Vercel | Push to main → live in 30s |
| **Domain** | [Votus.One](https://Votus.One) | The movement has a home |
| **On-chain (roadmap)** | Dash Platform + Intuition | Verifiable votes, $Votus/$Motus tokens |

---

## Project Structure

```
votus-one/
│
├── app/                        # Next.js App Router pages
│   ├── page.tsx                # Homepage — the cinematic reveal
│   ├── introducing/            # The Declaration
│   ├── motus/                  # The Brand — Motus & Gift Gear
│   ├── ethos/                  # What We Stand For
│   ├── allrise/                # The AllRise Experience
│   ├── prompthero/             # PromptHero — The Universal Skill (see below)
│   ├── start/                  # Register Your Votus Unit
│   ├── votus-units/            # Browse all active units
│   ├── u/[slug]/               # Individual unit pages (Votus.One/u/semble)
│   ├── account/                # User account dashboard
│   │   └── login/              # Auth page (register + sign in)
│   ├── terminal/               # Hidden terminal easter egg
│   └── api/
│       ├── auth/               # register / login / logout / me / update
│       ├── units/              # CRUD for Votus Units
│       │   ├── by-slug/[slug]  # Fetch unit by short handle
│       │   ├── by-id/[id]      # Fetch unit by ID
│       │   ├── slug-check/     # Availability check
│       │   └── [id]/
│       │       ├── vote/       # Upvote a unit
│       │       ├── edit/       # Edit unit (owner only)
│       │       └── delete/     # Delete unit (owner only)
│       ├── media/              # Upload + serve images/video
│       └── visitors/           # Live visitor tracking
│
├── components/
│   ├── AnimatedSlogans.tsx     # Cycling slogans (Motus page)
│   ├── EthosCarousel.tsx       # Words We Wear (Ethos page)
│   ├── UnitForm.tsx            # Full unit registration form
│   ├── PageFooter.tsx          # Site-wide footer
│   ├── Reveal.tsx              # Scroll-triggered reveal animation
│   ├── SoundEngine.tsx         # Web Audio API ambient soundscapes
│   ├── VotusMark.tsx           # The V logo mark
│   ├── Countdown.tsx           # Launch countdown
│   ├── Waitlist.tsx            # Email capture
│   ├── EasterEggs.tsx          # Hidden interactions ← see below
│   └── CyberHints.tsx          # Terminal hints
│
├── lib/
│   ├── kv.ts                   # Vercel KV client + all key definitions
│   └── auth.ts                 # Auth utilities (hash, session, verify)
│
└── README.md                   # You are here
```

---

## The Votus Unit Protocol

### How To Start A Votus Unit

A Votus Unit isn't filed with the government. It's filed with your community.

**Step 1 — Find your people**  
You need at least one other person who gives a damn about the same thing.  
A neighborhood. A cause. A school. A block. A vision.

**Step 2 — Name it**  
Give your unit a name that means something.  
Your name becomes your short link: `Votus.One/u/your-name`

**Step 3 — Register**  
Go to [Votus.One/start](https://Votus.One/start)  
Fill in your unit's:
- Name + Handle (`/u/your-handle`)
- City + State
- Purpose / Mission statement
- Discord server (create one if you don't have it — it's free)
- Website (optional)
- Image or video (optional but powerful)
- Next meeting date + location

**Step 4 — Create a Votus Account**  
Register with email + password at [Votus.One/account](https://Votus.One/account)  
This links your identity to your unit so you can edit, moderate, and manage it.

**Step 5 — Set your first meeting**  
Physical is powerful. Zoom works. A park bench counts.  
Show up. Everyone writes before anyone speaks.

**Step 6 — Start deciding together**  
Propose something. Vote on it. Document the outcome.  
Every decision builds your unit's record.

**Step 7 — Share your unit page**  
`Votus.One/u/your-name` — share it, post it, own it.

---

## Data Model

Every Votus Unit stores:

```typescript
{
  id: string;           // "VU-0001" — permanent
  slug: string;         // "semble" — used in Votus.One/u/semble
  name: string;         // Display name
  founder: string;      // Founder's name
  founderId: string;    // Linked user account (if registered)
  email: string;        // Contact email
  city: string;
  state: string;
  purpose: string;      // The unit's mission
  website: string;
  discord: string;      // Discord invite link
  imageUrl: string;     // Uploaded or linked image
  videoUrl: string;     // Uploaded video
  votes: number;        // Community upvotes
  members: number;      // Member count
  views: number;        // Lifetime page views
  nextMeeting: string;  // "March 25 at 6:30 PM"
  meetingLocation: string;
  meetingRecurring: string; // "Every 2nd Tuesday"
  created: string;      // ISO timestamp
  status: "active" | "inactive";
}
```

---

## Sound Design

Every page has an ambient soundscape built with the **Web Audio API** — no external files, no CDN, pure synthesis.

| Page | Sound |
|------|-------|
| Home | Rising chord from C minor → C major. A narrative in sound. |
| AllRise | Deep space drone + ethereal shimmer. The before-silence. |
| Motus | Bold ascending E2 drone + E5/G5/B5 chimes. Movement energy. |
| Ethos/Introducing | Crystalline C5-E5-G5 arpeggio over C2 ground. Sacred arrival. |
| Scroll reveals | Pentatonic chimes — each scroll note is a step in the scale. |
| The Reckoning | Sub-bass impact. The moment before the turn. |
| AllRise trigger | Full rising chord. C minor to resolution. |
| The Pledge | Gentle arpeggio. Quiet strength. |

---

## 🥚 Easter Eggs

Votus.One has hidden interactions woven throughout. Some are visible. Most aren't.

**There are 28 hidden interactions. Here are some.**

#### The Cyber Layer (original 14)

| # | Trigger | What Happens |
|---|---------|--------------|
| 01 | Konami code (↑↑↓↓←→←→BA) | ACCESS_GRANTED |
| 02 | Type `sudo` | ROOT ACCESS DENIED — Democracy has no superusers |
| 03 | Type `hack` | Intentions logged. The network sees you. |
| 04 | Type `trust` | On-chain. Immutable. Yours forever. |
| 05 | Type `whoami` | You are a Votus Vibe. Welcome home. |
| 06 | Type `ping` | Democracy is alive. Latency: 0ms. |
| 07 | Type `decrypt` | Animated decryption: "The future is not written. It is voted." |
| 08 | Type `allrise` | Matrix rain. The signal is activated. |
| 09 | Right-click anywhere | INSPECT_MODE — transparency is the first protocol |
| 10 | Sit idle for 45 seconds | SIGNAL_DETECTED — you were still enough to hear it |
| 11 | Long-press 2 seconds | PATIENCE_PROTOCOL — governance rewards the steady hand |
| 12 | Type `22` | $22 — less than your streaming subscription |
| 13 | Double-click any headline | HEADER_BREACH |
| 14 | Type `source` | VIEW_SOURCE — this movement is open. Always. |

#### The Philosophical Layer (14 more)

These are different. Quieter. They ask questions instead of making statements.

| # | Trigger | The Question |
|---|---------|-------------|
| 15 | Type `hero` | "What if the person you've been waiting for... is a team?" |
| 16 | Select (highlight) any text longer than 20 chars | "You scrolled past a hundred things today. You stopped here. Why?" |
| 17 | Visit the site on a Tuesday | "Every 4 years is not often enough. What if you cared every Tuesday?" |
| 18 | Type `small` | "The large is a reflection of the small. Your block is a country in miniature." |
| 19 | Type `apathy` | "The cure for apathy isn't information. It's a table. With chairs." |
| 20 | Leave the tab for 30+ seconds, then come back | "Someone in your neighborhood is awake right now, worrying about the same thing." |
| 21 | Resize the browser window 5 times | "Five people who show up every time outperform a million who show up once." |
| 22 | Hover on any link for 4 seconds | "You can't move faster than relationships can hold. That's not a bug." |
| 23 | Scroll to ~50% of any page | "There is a seat at the table with your name on it." |
| 24 | Scroll to 100% of any page | "You found it by being curious. That's emergent strategy." |
| 25 | Leave the tab 5-30 seconds, come back | "What if democracy felt like something you wanted to do on Saturday morning?" |
| 26 | Type `seed` | "Every forest began with one seed that didn't ask permission to grow." |
| 27 | Triple-click anywhere | "Somewhere a unit is meeting tonight. Somewhere one hasn't started yet. Both are about you." |
| 28 | Type `together` | "You are not here to be right. You are here to see together." |

#### The Terminal (`/terminal`)

A full interactive CLI hidden in the site. Try:
`ls`, `cat manifesto.txt`, `whoami`, `vote` (keep voting), `decrypt motus`,
`citizens`, `fortune`, `neofetch`, `man votus`, `hero`, `water`, `listen`,
`brave`, `together`, `42`, `cd ..`, `rm -rf /`, `love`

On mobile: swipe up-down-up-down to access the terminal.

**There are still more. We're not telling.**

### Contribute an Easter Egg

Want to hide something in Votus.One? Here's how:

1. **Fork this repo**
2. **Add your easter egg to `components/EasterEggs.tsx`**
   - Keep it invisible until triggered
   - Make it feel native, not bolted-on
   - One easter egg per PR
3. **Document it** in this README under Easter Eggs (with a spoiler warning if needed)
4. **Submit a PR** titled: `🥚 Easter Egg: [short description]`
5. Tag @BuiltByAugust for review

**Guidelines for good easter eggs:**
- Must be discoverable (not random) — there should be a "why" to the trigger
- Should feel like it belongs to the world of Votus
- No external requests, no tracking, no heavy assets
- Sound effects are encouraged (use the existing Web Audio patterns)
- The best ones make people want to tell someone else

---

## Contributing

We build this in the open. We build it together.

### For Developers

```bash
# Clone
git clone https://github.com/InitiumBuilders/Votus.One.git
cd Votus.One

# Install
npm install

# Set up environment
cp .env.example .env.local
# Fill in KV_REST_API_URL and KV_REST_API_TOKEN from Vercel/Upstash

# Run locally
npm run dev
# → http://localhost:3000
```

### Environment Variables

```bash
KV_REST_API_URL=         # Upstash Redis URL (from Vercel KV)
KV_REST_API_TOKEN=       # Upstash Redis token
VOTUS_ADMIN_KEY=         # Admin operations key
```

### Ways To Contribute

| Type | What |
|------|------|
| 🐛 **Bug Fix** | Find something broken → fix it → PR |
| ✨ **Feature** | Open an issue first, discuss, then build |
| 🥚 **Easter Egg** | See the Easter Eggs section above |
| 📖 **Docs** | Improve clarity, fix typos, add examples |
| 🎨 **Design** | Open an issue with your proposal + mockup |
| 🔊 **Sound** | Improve the Web Audio soundscapes |
| 🌐 **Translation** | Help us reach more communities |
| 📣 **Advocacy** | Start a Votus Unit. That's contributing. |

### PR Protocol

1. Fork → branch → build → test locally
2. PR title format: `[type]: short description`  
   `fix: slug uniqueness check`, `feat: unit analytics`, `🥚 Easter Egg: terminal ssh`
3. Keep PRs small. One thing per PR.
4. Explain *why*, not just *what*

### Code Standards

- **Components max 150 lines.** Split when you hit the limit.
- **UI and logic separated.** Hooks in `use*.ts` files, rendering in `*.tsx`.
- **No external CSS frameworks.** Inline styles only (it's a feature, not a bug).
- **Accessible by default.** Semantic HTML, keyboard nav, screen reader friendly.
- **Performance.** No client-side data fetching that could be static. No unnecessary re-renders.

---

## The Vision

**Year 1** — 100 Votus Units registered across the country.  
**Year 2** — First Votus Unit runs for local office as a team.  
**Year 3** — On-chain voting via Dash Platform. $Votus and $Motus live.  
**Year 5** — Votus Units are a recognized form of civic organizing.  
**Year 10** — Democracy looks different because we showed up.

→ **[Read NEXT_STEPS.md](./NEXT_STEPS.md)** for the full evolution roadmap, leverage points, and phase-by-phase build plan.

---

## ⚡ PromptHero — The Universal Skill

> *Every prompt is a mirror. PromptHero teaches you to read it.*

**[Votus.One/prompthero](https://Votus.One/prompthero)** — a universal skill for any AI agent
(Claude, Davara, Hermes, Openclaw…) that studies how you prompt, teaches you the craft of
asking one lesson at a time, and writes your growth as a book about you: auto-named
**Chapters**, earned **Badges**, **Prompt Promotions** (the 7-rank ladder from Spark Seeker
to PromptHero), and rare **EVOs** for the major evolutions.

- The skill itself: [`skills/prompthero/SKILL.md`](./skills/prompthero/SKILL.md) (also installed at `.claude/skills/prompthero/` for Claude Code)
- The founding prompt, preserved verbatim: [`skills/prompthero/INITIUM.md`](./skills/prompthero/INITIUM.md)
- The page includes copyable build prompts for a personal PromptHero dashboard on
  **Windows, Android, iPhone, macOS, Linux, or a team website**, plus **August AI — the Motus Mentor** coach prompt.

*There Is Hope In The Hard Questions.*

---

## Built By

**August James** ([@BuiltByAugust](https://x.com/BuiltByAugust)) — Vision, product, writing  
**Kristina Roll** ([LinkedIn](https://www.linkedin.com/in/kristina-roll-2135b4114/)) — Co-founder, strategy  
**AVARI** — AI co-founder, builder, emergent strategist

*Envisioned by Kristina Roll and August James.*  
*Built with love, urgency, and a deep belief that people, given the right container, will show up for each other.*

---

## License

MIT — use it, fork it, build on it.  
If you use it to make democracy more human, we consider that a win.

<!-- The password is: showing up. -->
<!-- If you found this, type "source" on the live site. -->
<!-- Or try: decrypt love -->
<!-- You're reading the HTML comments of a democracy platform. That's the kind of person we need. -->

---

<div align="center">

**[Votus.One](https://Votus.One)** · **[Browse Units](https://Votus.One/votus-units)** · **[Start A Unit](https://Votus.One/start)** · **[Discord](https://discord.gg/BDUDhayHeX)**

*The movement starts with you.*

///AllRise///

</div>
