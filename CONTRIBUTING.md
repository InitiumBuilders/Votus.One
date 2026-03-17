# Contributing to Votus.One

We believe the people who show up to build this are the same people who believe in what it stands for.

This isn't just an open-source project. It's a civic act.

---

## Before You Start

Read the [README](./README.md). Understand the flywheels.  
Then ask: *what would make this more human, more accessible, more powerful?*

That's your contribution.

---

## How To Contribute

### 1. Fork & Clone

```bash
git clone https://github.com/InitiumBuilders/Votus.One.git
cd Votus.One
npm install
cp .env.example .env.local
# Add your KV credentials (or use a free Upstash instance)
npm run dev
```

### 2. Pick Your Path

| I want to... | Do this |
|-------------|---------|
| Fix a bug | Check Issues, comment "I'll take this", fix it |
| Add a feature | Open an issue first, get a thumbs up, build it |
| Hide an easter egg | See [Easter Egg Protocol](#easter-egg-protocol) |
| Improve docs | Just do it. Docs PRs are always welcome. |
| Translate | Open an issue flagged `translation` |
| Report a bug | Open an issue with steps to reproduce |

### 3. Open a PR

- Keep it small. One thing per PR.
- Title format: `[type]: short description`
  - `fix:` for bug fixes
  - `feat:` for new features  
  - `docs:` for documentation
  - `🥚` for easter eggs
  - `style:` for visual/design changes
- Describe *why* you made the change, not just what.
- If it's visual, include a screenshot.

---

## Easter Egg Protocol

Easter eggs are first-class citizens here. We love them.

**To contribute one:**

1. Add your logic to `components/EasterEggs.tsx`
2. Keep it self-contained — one function, no global state pollution
3. It must be *discoverable*, not random. There should be a reason someone finds it.
4. Document it in `README.md` under the Easter Eggs table
5. PR title: `🥚 Easter Egg: [what it does]`

**What makes a great easter egg:**
- Surprising, but fitting — it feels like it *belongs*
- Small footprint — no heavy assets, no external requests
- Makes you want to tell someone else about it
- Adds to the world of Votus, not just to the code

---

## Code Style

- **150-line limit per component.** Split at 140. No exceptions.
- **Hooks separate from UI.** `useX.ts` for logic, `X.tsx` for rendering.
- **Inline styles only.** No CSS modules, no Tailwind classes on new components.
- **TypeScript strict.** No `any` unless absolutely necessary and documented why.
- **Accessible.** Every interactive element needs keyboard support and ARIA labels.

---

## Votus Unit Protocol

If you're here to build the platform, you might also want to start a unit.

They're the same act. Building Votus.One *is* civic participation.

→ [Start a Votus Unit](https://Votus.One/start)

---

## Questions?

Join the [Discord](https://discord.gg/BDUDhayHeX).  
Find @BuiltByAugust on [X](https://x.com/BuiltByAugust).

*We build this in the open. We build it together.*

<!-- Hidden contribution: if you add a file called .your-name to the project root with why you're here, we'll notice. That's an easter egg too. -->

///AllRise///
