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
| **Frontend** | Next.js 15 (App Router) | Fast, static where possible, server where needed |
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

**Known Easter Eggs:**

| Trigger | What Happens |
|---------|--------------|
| Click the V sigil 7 times | Arcane activation sequence |
| Type `motus` anywhere on the site | Something stirs |
| Hover the arcane mark for 3 seconds | The glyphs respond |
| Click the fox in the footer | It winks |
| Type `I am the archmage` | Confetti. You earned it. |
| Tab away and back | The page title becomes runes |
| Right-click anywhere | Custom context menu |
| Scroll to the very bottom of the Grimoire | Secret text appears |
| Find the terminal | `/terminal` — try `ls`, `cat README.md`, `ssh votus.one` |

**There are more. We're not telling.**

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

---

<div align="center">

**[Votus.One](https://Votus.One)** · **[Browse Units](https://Votus.One/votus-units)** · **[Start A Unit](https://Votus.One/start)** · **[Discord](https://discord.gg/BDUDhayHeX)**

*The movement starts with you.*

///AllRise///

</div>
