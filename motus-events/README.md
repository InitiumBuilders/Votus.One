# Motus.Events · Coming Soon 👀

The holding page for **motus.events** while the real site is designed and built.

One static page, no build step, no dependencies.

## The moment

It opens letterboxed at 2.39:1, like a film. Lights arrive from every edge of the frame, find each other, spin into a vortex and fall into a single point. There is a flash, the frame opens to full screen, and a pair of eyes made of light opens and looks at you.

**The statement:** an event is many people paying attention to one moment together. Many lights, one gaze.

First visits get the full opening (about 7 seconds). Return visits in the same session get only the climax. Any tap, click or key skips straight to it.

## Things to find

| Do this | What happens |
|---|---|
| Move the cursor, drag a finger | The eyes follow you. Eyes lead, the head follows. |
| Tilt the phone | The eyes keep looking at you (Android right away; iPhone asks after the first tap on the eyes). |
| Tap or click the eyes | They widen and blink. Tap twice quickly for a wink. |
| Tap anywhere else | The nearer eye reaches toward you with a spark. |
| Press the gold dot in MOTUS · EVENTS | The whole gathering plays again. |
| Hold the eyes, or type `love` | Heart eyes. |
| Press **Sound** | A generative score: a low room tone, a riser into the flash, a chord at the impact. Off until you ask. |
| Leave the tab and come back | The tab title turns into 👀 while you're away, and the eyes notice you're back. |
| Arrow keys | Steer the gaze. |

## Accessibility

- Every word is real text, visible from the first frame, with or without JavaScript.
- `prefers-reduced-motion`: no intro and no animation, just one still frame of the eyes.
- Every control is a real button with a visible focus ring. Keyboard users reach **Skip intro** first.
- Contrast is computed for every text pair in both modes. The lowest is 7.5:1.
- The title stands on its own ground panel, so it stays legible even through the flash.

## Deploy

1. Put these files at the root of the `InitiumBuilders/Motus.Events` repository.
2. In Vercel: **Add New → Project**, import the repository, set **Framework Preset** to **Other**, and deploy.
3. In **Settings → Domains**, add `motus.events` and `www.motus.events`.

| File | What it is |
|---|---|
| `index.html` | The whole experience: markup, styles, the particle engine, the sound engine |
| `og.png` | The share card (1200×630) |
| `favicon.svg` | The tab icon |
| `apple-touch-icon.png` | The home-screen icon |

The share card is referenced as `https://motus.events/og.png`, so link previews work once the domain points at this deployment.

## Design

Davara Distinct V3 · Electric. Nocturne (graphite night) by default and Meridian (stone daylight) for light-mode visitors. By day the eyes become white eyeballs with ink pupils, like the emoji.

One canvas holds 96 to 210 particles, depending on screen size, with the pixel ratio capped at 2. One aurora, one gold (the dot), one charge (the eyes). Type is Sora 800 and IBM Plex Mono.

---

August James · Initium Builders · 2026
