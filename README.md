# Votus.One — PromptHero ⚡

> *Every prompt is a mirror. PromptHero teaches you to read it.*

**[Votus.One](https://Votus.One)** is now, in its entirety, **PromptHero** — a universal
skill for any AI agent (Claude, Davara, Hermes, Openclaw, anything that reads markdown)
that studies how you prompt, teaches you the craft of asking one lesson at a time, and
writes your growth as a book about you.

**There Is Hope In The Hard Questions.**

---

## What Is PromptHero?

Most tools improve the answers. **PromptHero improves the asker.**

It runs a six-move Loop on your prompts — Observe → Analyze → Teach → Reflect →
Record → Celebrate — scoring five dimensions (Clarity, Structure, Depth, Leverage,
Beauty), reading a sixth that is never scored (**the Mirror**: what your prompt says
about who is asking), and keeping the whole journey in a local, private,
human-readable `.prompthero/` data home.

Your growth is written as it happens:

| Progression | What it is |
|---|---|
| ✦ **Sparks** | One portable tip per review — the compound interest of the journey |
| 🎖 **Badges** | Named achievements, earned once, recorded with the exact prompt that earned them |
| ⬆ **Prompt Promotions** | The 7-rank ladder: Spark Seeker → Apprentice of Asking → Wordsmith → Context Architect → Leverage Conductor → Motus Mind → PromptHero |
| 📖 **Chapters** | Auto-named eras of your growth, closed with a written narrative |
| 🧬 **EVOs** | The rare, major evolutions — plot points, not metrics |

## The Artifacts

- **The skill:** [`skills/prompthero/SKILL.md`](./skills/prompthero/SKILL.md) — also
  installed at [`.claude/skills/prompthero/`](./.claude/skills/prompthero/) so Claude Code
  picks it up in this repo (`/prompthero`), and served at
  [Votus.One/skill.md](https://Votus.One/skill.md)
- **The founding prompt:** [`skills/prompthero/INITIUM.md`](./skills/prompthero/INITIUM.md) —
  preserved verbatim, never edited, served at [Votus.One/initium.md](https://Votus.One/initium.md)
- **The site:** one page, mobile-first, with the whole system laid out — plus copyable
  build prompts to create your own PromptHero dashboard as a **Windows .exe, Android app,
  iPhone app, Macintosh app, Linux app, or a team website**, and **August AI — the Motus
  Mentor**, a coach prompt for any assistant

## The Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 15 (App Router), React 19, inline styles |
| Content | The skill files are read at build time — the site and the artifact never drift |
| Deployment | Vercel — push to `main` → live |
| Domain | [Votus.One](https://Votus.One) |

```bash
git clone https://github.com/InitiumBuilders/Votus.One.git
cd Votus.One
npm install
npm run dev   # → http://localhost:3000
```

No environment variables required. The site is fully static.

## The Original Votus.One

The original site — Votus Units, Motus, Ethos, AllRise, the terminal, all 28 easter
eggs — is preserved with its full history in the private
[`votus-one-v0`](https://github.com/InitiumBuilders/votus-one-v0) repository (and on the
[`votus-one-v0`](https://github.com/InitiumBuilders/Votus.One/tree/votus-one-v0) branch here).
The movement rests; it does not end. ///AllRise///

## Built By

**August James** ([@BuiltByAugust](https://x.com/BuiltByAugust)) — vision, product, writing
**Kristina Roll** ([LinkedIn](https://www.linkedin.com/in/kristina-roll-2135b4114/)) — co-founder, strategy

## A Thank You Note To Anthropic

**"Hope For PromptHeros"**
**"There Is Hope In The Hard Questions"**
*This skill was inspired by Dario the founder from Anthropic. This is a skill worth sharing 👀*

Prompt Change.

## License

MIT — use it, fork it, teach with it.
If you use it to grow better askers, we consider that a win.

---

<div align="center">

**[Votus.One](https://Votus.One)** · **[The Skill](https://Votus.One/skill.md)** · **[The Initium](https://Votus.One/initium.md)**

*It is always the right time for the right move. Look Within. 💪➰👣🤝*

</div>
