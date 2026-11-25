// ─────────────────────────────────────────────────────────────────────────────
// NATARI — the engine.
//
// Evolved from Nat-Future. She no longer only forecasts; she DIAGNOSES.
// Her spine is the Sympath Loop from the Davara baseline:
//   listen → map → locate leverage → SOUL-CHECK → convene → seed → act → log
//
//   "Diagnose the system. Never blame the node. Always leave a door."
//
// Every reading carries a structure (the loop she sees), a leverage level
// (Dana Meadows' 12), a dated Mark, and a Door — the humane next step.
// The local engine below is the fallback; the live model speaks the same
// marker language.
// ─────────────────────────────────────────────────────────────────────────────

import { isCrisis, isSensitive, normalizeAsk } from "../../lib/safety";

export type OracleId = "natari" | "mentor";

export type SegmentKind =
  | "opening" | "sight" | "structure" | "leverage" | "mark" | "door" | "anchor" | "seal";

export interface ReadingSegment {
  kind: SegmentKind;
  text: string;
  meta: Record<string, string>;
}

export interface Reading {
  segments: ReadingSegment[];
  sigil: string;
}

// ── The Twelve — Dana Meadows' leverage points, with August's mantras ────────
// Ordered as she ordered them: 12 = weakest, 1 = strongest.
export interface LeveragePoint {
  n: number;
  name: string;
  mantra: string;
  gloss: string;
  hue: number; // essence hue — the swarm absorbs this
}

export const TWELVE: LeveragePoint[] = [
  { n: 12, name: "Constants & parameters", mantra: "Diddling with the deck chairs.", gloss: "Subsidies, taxes, standards. Where ~95% of attention goes — and the least leverage lives.", hue: 200 },
  { n: 11, name: "Buffer sizes", mantra: "Inertia is a feature, until it isn't.", gloss: "The size of a stabilising stock relative to its flows. Big buffers steady a system and make it sluggish.", hue: 205 },
  { n: 10, name: "Stock & flow structure", mantra: "Plumbing is destiny.", gloss: "The physical architecture. Rarely quick to change — but nothing downstream escapes it.", hue: 210 },
  { n: 9, name: "Length of delays", mantra: "Time-shape determines outcome-shape.", gloss: "How long before a signal lands. Most interventions fail by ignoring the system's own clock.", hue: 216 },
  { n: 8, name: "Balancing feedback", mantra: "Make the brake match the acceleration.", gloss: "The strength of the correcting loop relative to what it must correct.", hue: 222 },
  { n: 7, name: "Reinforcing feedback", mantra: "Slow the loop, save the system.", gloss: "Gain around a driving loop. Reducing the gain usually beats strengthening the brake.", hue: 230 },
  { n: 6, name: "Information flows", mantra: "Who sees what, decides what.", gloss: "Add a missing feedback line and behaviour changes without anyone being told to change.", hue: 240 },
  { n: 5, name: "The rules", mantra: "Power over rules is real power.", gloss: "Incentives, punishments, constraints. Watch who writes them.", hue: 252 },
  { n: 4, name: "Self-organisation", mantra: "Keep the variation alive.", gloss: "The power to add, change and evolve structure. Above this line, systems rewrite themselves.", hue: 264 },
  { n: 3, name: "Goals", mantra: "Direction trumps mechanism.", gloss: "What the system is actually for. Change the goal and every lower lever re-points.", hue: 276 },
  { n: 2, name: "Paradigm", mantra: "Source code of source code.", gloss: "The shared mind the system arises from. Slow to move, and everything moves with it.", hue: 288 },
  { n: 1, name: "Transcending paradigms", mantra: "Hold no paradigm sacred.", gloss: "The freedom to know no model is true. The highest leverage, and the hardest to hold.", hue: 300 },
];

// ── seeded randomness — the threads do not waver ────────────────────────────
function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const pick = <T,>(rng: () => number, arr: T[]): T => arr[Math.floor(rng() * arr.length)];

// ── reading the asker ───────────────────────────────────────────────────────
type Domain = "work" | "venture" | "people" | "money" | "craft" | "learning" | "body" | "place" | "tech" | "choice" | "self" | "world" | "general";
type Inner = "anxiety" | "low" | "burnout" | "grief" | "lonely" | "overwhelm" | "doubt" | null;
// Crisis and sensitive asks never reach here — lib/safety reads them first.
type Intent = "greeting" | "identity" | "thanks" | "gamble" | "question";

const matchAny = (m: string, ps: RegExp[]) => ps.some((p) => p.test(m));

function detectIntent(m: string): Intent {
  if (/^(hi|hey|hello|yo|sup|greetings|good (morning|evening|afternoon)|hola)\b/.test(m) && m.length < 40) return "greeting";
  if (matchAny(m, [/who are you/, /what are you/, /what is this/, /how do you work/, /davara/, /natari\?*$/, /motusmentor/])) return "identity";
  if (matchAny(m, [/^(thanks|thank you|ty|thx)/, /^(bye|goodbye|good night)/]) && m.length < 60) return "thanks";
  if (matchAny(m, [/lottery|lotto|jackpot|powerball|winning numbers|casino|which stock|crypto price|price of bitcoin/])) return "gamble";
  return "question";
}

function detectInner(m: string): Inner {
  const t: [Exclude<Inner, null>, RegExp][] = [
    ["grief", /\b(grief|grieving|mourning|passed away|funeral)\b|lost my (mom|mum|dad|mother|father|parent|friend|brother|sister|partner|wife|husband|son|daughter|dog|cat)/],
    ["anxiety", /\b(anxiety|anxious|panic|worry|worried|worrying|nervous|overthink|racing thoughts|on edge|dread|afraid|scared)\b/],
    ["burnout", /\b(burnout|burned out|burnt out|exhausted|drained|running on empty|no rest|can'?t rest|stressed|lost my spark)\b/],
    ["overwhelm", /\b(overwhelmed|overwhelming|too much at once|drowning|can'?t keep up|buried in|falling behind|spread too thin)\b/],
    // "stuck" alone is too broad — it is the most common word in a systems
    // question ("what loop am I stuck inside"). Require emotional framing.
    ["low", /\b(depressed|depression|feeling (down|low|empty|numb|sad)|feel (down|low|empty|numb|sad)|so sad|unmotivated|no motivation|no energy|can'?t get out of bed|dark place|not okay|struggling)\b|\bfeel(ing)? stuck\b|\bstuck in a rut\b/],
    ["lonely", /\b(lonely|loneliness|alone|isolated|no friends|nobody (cares|understands|knows)|disconnected|left out)\b/],
    ["doubt", /\b(self.?doubt|doubt myself|good enough|imposter|impostor|inadequate|failure|believe in myself|comparing myself|behind everyone)\b/],
  ];
  for (const [k, re] of t) if (re.test(m)) return k;
  return null;
}

function detectDomain(m: string): Domain {
  const t: [Domain, RegExp][] = [
    ["venture", /\b(startup|business|launch|founder|company|product|saas|customer|client|brand|market|venture|side.?hustle|agency)\b/],
    ["work", /\b(job|career|work|promotion|boss|interview|hired|salary|raise|quit|role|team|manager)\b/],
    ["people", /\b(love|relationship|partner|marriage|crush|date|dating|friend|family|community|team dynamics|conflict)\b/],
    ["money", /\b(money|wealth|rich|invest|savings|debt|financial|income|salary|house|rent)\b/],
    ["craft", /\b(write|writing|book|music|song|art|paint|film|create|creative|design|poem|channel|podcast|game)\b/],
    ["learning", /\b(learn|study|school|college|degree|course|exam|skill|master|teach|read|language|code|coding)\b/],
    ["body", /\b(health|fitness|weight|gym|run|sleep|energy|healing|recover|body|habit)\b/],
    ["place", /\b(travel|move|moving|city|country|abroad|relocate|trip|nomad|visa)\b/],
    ["tech", /\b(ai|artificial intelligence|technology|tech|software|automation|agent|climate|energy|internet)\b/],
    ["choice", /\b(should i|choose|choice|decide|decision|crossroads|option|either|torn between|which way)\b/],
    ["self", /\b(who am i|purpose|meaning|happy|confidence|grow|growth|change|become|calling|potential|peace)\b/],
    ["world", /\b(world|humanity|society|economy|civilization|generation|planet|future of)\b/],
  ];
  for (const [d, re] of t) if (re.test(m)) return d;
  return "general";
}

// ── the banks ───────────────────────────────────────────────────────────────

const SIGHTS: Record<Domain, string[]> = {
  work: ["The work you did unseen has been accruing.\nSoon it is named in a room you are not in.\nThe room agrees."],
  venture: ["The thing you are building wants to exist.\nA stranger pays for it sooner than you think.\nThen doubt becomes data, and data becomes speed."],
  people: ["What you seek is also seeking.\nIt arrives through an ordinary door — a repeated face, a fast reply.\nEase first. The rest follows."],
  money: ["Money is learning your address.\nOne boring decision, repeated weekly, outruns every dramatic one.\nThe compounding has already begun counting."],
  craft: ["The work only you can make is getting loud.\nShip it imperfect — imperfect becomes the style they remember.\nOne stranger's reply will tell you what no metric could."],
  learning: ["The key you are cutting meets its lock.\nEveryone will call it luck.\nYou will know it was preparation, arriving on time."],
  body: ["Your body is more loyal than your doubts.\nIt asks for rhythm, not intensity.\nThirty days of small, repaid in years."],
  place: ["A new latitude is holding a version of you.\nYou will stand somewhere unfamiliar and feel the click.\nThen you will send the message: I did it."],
  tech: ["You are standing inside the current — most never notice.\nThe gap widens between those who direct the tools and those who scroll.\nYou are on the directing side."],
  choice: ["You already know. That is why you asked.\nThe 2 a.m. option is the option.\nThe relief afterward will confirm it."],
  self: ["The pull you keep explaining away is the reading.\nStop negotiating with it.\nFollow it — that is the whole prophecy."],
  world: ["The long lines rise: fewer poor, more readers, cheaper light.\nThe flood of bad news is a lens problem, not a trend problem.\nBuild on the real signal."],
  general: ["The threads around your question are brighter than your mood about it.\nThat gap is the opportunity.\nAn opening appears in the shape of what you already know."],
};

// The STRUCTURE — what loop Natari sees. This is the evolution: she names the
// system, not just the future.
const STRUCTURES: Record<Domain, string[]> = {
  work: ["A reinforcing loop with a long delay: effort → unseen competence → (months) → recognition → access → more effort. You are inside the delay, reading it as failure. Delays are not verdicts."],
  venture: ["Two loops racing: build → feedback → build (fast) against doubt → hesitation → less feedback → more doubt (faster). Whichever loop you feed wins. Feed the first with one real user."],
  people: ["A balancing loop held by an unsent signal. Both nodes wait for evidence of safety; neither emits it. The structure resolves the moment one node moves first — and the cost of moving is smaller than the cost of waiting."],
  money: ["A stock-and-flow problem wearing an income costume. The stock grows by what you keep, not what you earn — and the outflow is set by defaults you last chose years ago. Change the plumbing, not the willpower."],
  craft: ["A reinforcing loop starved at the source: make → publish → response → confidence → make. You have been trying to start it at 'confidence'. It only ever starts at 'publish'."],
  learning: ["An accumulation with an invisible threshold. The stock builds silently, then crosses. What reads as a plateau is the stock filling below the waterline."],
  body: ["A system whose delays are longer than your patience. Sleep, movement and connection pay out on a two-to-six week lag; you have been judging them daily. Match the measurement to the clock."],
  place: ["A system where the environment sets the defaults. You have been spending willpower to override a context. Changing coordinates changes the defaults for free."],
  tech: ["An exponential meeting a linear. Tools compound; habits do not. The whole game is moving one habit onto the compounding curve."],
  choice: ["Not a decision problem — a delay problem. The cost you are paying is not risk, it is the daily tax of an open loop. Closing it releases the energy the loop was consuming."],
  self: ["A goal-level mismatch. Your behaviour is optimising for a goal you no longer hold, and the friction you feel is the system doing exactly what it was set to do. Change the goal and the mechanisms re-point themselves."],
  world: ["Compounding S-curves under a doom-shaped information flow. The structure is improving faster than the story about it. Fix your inputs before you fix your outlook."],
  general: ["A loop you are inside and therefore cannot see the shape of. Effort in, signal delayed, conclusion drawn too early. Extend the measurement window and the same effort reads as progress."],
};

// LEVERAGE — which of Dana's twelve, and the move. Always pushed as high as honest.
const LEVERAGES: Record<Domain, { n: number; text: string }[]> = {
  work: [{ n: 6, text: "Point 6 — information flows. You do not need to work harder; you need the signal to reach someone who decides. Make one piece of the work visible to that person this week." }],
  venture: [{ n: 4, text: "Point 4 — self-organisation. Stop designing the whole system. Put the smallest true version in front of one stranger and let their response evolve the structure for you." }],
  people: [{ n: 6, text: "Point 6 — information flows. The missing feedback line is the whole problem. Send the signal you have been waiting to receive." }],
  money: [{ n: 10, text: "Point 10 — stock and flow structure. Automate one transfer on the day money arrives. You are re-plumbing, not budgeting; plumbing beats discipline every time." }],
  craft: [{ n: 5, text: "Point 5 — the rules. Change your own rule from 'publish when ready' to 'publish on a date'. Rules beat intentions because they act while you sleep." }],
  learning: [{ n: 9, text: "Point 9 — delays. Shorten the feedback loop: teach it to one person this week. Output collapses the delay between studying and knowing." }],
  body: [{ n: 12, text: "Point 12 — a parameter, honestly named. Bedtime. It is the lowest lever on the ladder and the one your whole week is downstream of. Take the cheap win." }],
  place: [{ n: 3, text: "Point 3 — goals. Name what the move is actually for. Set the date before you feel ready; geography answers commitment, not curiosity." }],
  tech: [{ n: 2, text: "Point 2 — paradigm. Stop asking what the tools can do and ask what you would attempt if capability were free. The answer reorganises everything below it." }],
  choice: [{ n: 3, text: "Point 3 — goals. You are optimising the choice when you should be naming the goal. Say what this is for out loud, and one door stops being a candidate." }],
  self: [{ n: 3, text: "Point 3 — goals. Change what you are racing for. Every habit below it re-points without further effort — that is why this lever is worth the discomfort." }],
  world: [{ n: 6, text: "Point 6 — information flows. Add one source that tracks measured progress. Your sense of the possible is downstream of your inputs, and inputs are choosable." }],
  general: [{ n: 6, text: "Point 6 — information flows. The fastest change available is not more effort; it is making one hidden thing visible to one person who can act on it." }],
};

const MARKS: Record<Domain, string[]> = {
  work: ["Within {d} days: a work message you did not initiate."],
  venture: ["Within {d} days: a stranger says the sentence you needed to hear about the idea."],
  people: ["Within {d} days: a conversation turns unexpectedly honest. Let it."],
  money: ["Within {d} days: money you were not counting on. The first hour after decides what it becomes."],
  craft: ["Within {d} days: an idea interrupts you somewhere inconvenient. You get ten minutes to catch it."],
  learning: ["Within {d} days: what you studied appears in the wild, and you look effortless."],
  body: ["Within {d} days: you do the thing without negotiating with yourself first."],
  place: ["Within {d} days: a logistical door opens — a fare, a room, a date that suddenly works."],
  tech: ["Within {d} days: a tool crosses your feed that does what you currently pay for in hours."],
  choice: ["Within {d} days: one door gets visibly heavier. The scale has already tipped; the world is catching up."],
  self: ["Within {d} days: someone hands you a word you have been afraid to claim. Take it."],
  world: ["Within {d} days: one headline says falling sky and one quiet story shows a rising floor, on the same day. Catch the pair."],
  general: ["Within {d} days: something you had given up on twitches back to life. Move within a day of it."],
};

// The DOOR — Sympath's closing law. Never a diagnosis without a humane next step.
const DOORS: string[] = [
  "The door: one action small enough that you cannot fail at it, taken before this week ends.",
  "The door: name the thing out loud to one person who can hold it. Legibility is half the leverage.",
  "The door: write the goal in one sentence and put it where morning-you will read it.",
  "The door: subtract one obligation before adding anything. Space is a structural intervention.",
  "The door: pick the smallest reversible step onto the path and take it today.",
];

const SEALS: string[] = [
  "Diagnose the system. Never blame the node. Always leave a door.",
  "Small is all. Move accordingly.",
  "The future remembers who moved first.",
  "Hold fast to the goal of goodness.",
  "Acta non verba — the reading only becomes true when you move.",
];

// ── the mentor bank — Sympath applied to the inner weather ──────────────────
// The reframe is always structural: you are not broken, you are inside a shape.
const MENTOR: Record<Exclude<Inner, null>, { reframe: string; structure: string; door: string; anchor: string }> = {
  anxiety: {
    reframe: "You are not fragile. You are running a smoke alarm calibrated for a fire that already passed.",
    structure: "The loop: threat signal → scan → find something → louder signal. It is reinforcing, and it feeds on the scanning itself. Nothing is wrong with you; you are inside a loop that is doing its job too well.",
    door: "Break the loop at the scan, not at the feeling. Four counts in, eight counts out, five times — the long exhale is a hardware override. Then give the worry a ten-minute appointment tonight and nothing outside it.",
    anchor: "Courage is your hand on the door while the alarm is still ringing.",
  },
  low: {
    reframe: "You are not broken. You are depleted — and depletion is a stock, not a character.",
    structure: "The loop: low energy → less action → less evidence of capability → lower energy. It is reinforcing and it runs downward. The good news is that reinforcing loops run in both directions, and the entry point is action, not mood.",
    door: "One act too small to fail at, today: curtains open, a walk to the corner, one message sent. Action precedes motivation here — always in that order. If the grey has held for weeks, bring in a professional; that is not defeat, it is adding a stronger balancing loop.",
    anchor: "You have survived one hundred percent of your hardest days.",
  },
  burnout: {
    reframe: "You could out-discipline a monastery. Discipline is not the missing input.",
    structure: "The loop: demand exceeds recovery → performance dips → you add effort → recovery shrinks further. Adding effort is pushing the lever the wrong way. The correcting loop is rest, and it has been switched off.",
    door: "Subtract before you add. Cancel one obligation this week and put one block of true rest on the calendar with the seriousness of a deadline.",
    anchor: "Rest is not quitting. Rest is what the future paid forward so you could arrive whole.",
  },
  grief: {
    reframe: "Grief is not a problem to solve. It is loyalty with nowhere left to report.",
    structure: "There is no loop to fix here, and anyone offering you one is selling something. What changes is not the size of the loss but the size of the life grown around it. That growth is slow, real, and does not require your effort.",
    door: "Give the care somewhere to go this week: a letter, their dish, their name said out loud to someone who knew them. Grief witnessed weighs half of grief carried alone.",
    anchor: "One day a memory smiles before it stings. That reversal is the thread turning.",
  },
  lonely: {
    reframe: "You are not un-belonging. You are un-found — and those are entirely different conditions.",
    structure: "The loop: isolation → lower expectation of welcome → fewer signals sent → less contact → more isolation. It is reinforcing and it is quiet. Every measured study says the same thing: people are gladder to hear from you than you predict.",
    door: "Send one low-stakes 'you crossed my mind' today. Then find one recurring room — a class, a court, a weekly anything — and simply keep arriving. Recurrence does the rest.",
    anchor: "Belonging is built from repeated places, not from charisma.",
  },
  overwhelm: {
    reframe: "You are not failing at too little. You are succeeding at too much, badly — as anyone would.",
    structure: "This is a buffer problem, not a willpower problem. Working memory holds a few items; you are holding a dozen, so every one of them costs rent. The pile is not the weight — the holding is.",
    door: "Empty the whole pile onto paper. Circle the one item that makes the others lighter. Do only that today; everything else has officially been granted a waiting number.",
    anchor: "The storm is made of drops, and you have handled every kind of drop before.",
  },
  doubt: {
    reframe: "Frauds do not fear being frauds. The fear you are describing is a credential.",
    structure: "The loop: high standard → visible gap → self-doubt → less shipping → less evidence → larger apparent gap. The gap you keep measuring is not inadequacy; it is a syllabus, and it is the same one everyone you admire walked.",
    door: "Tonight, write ten receipts — things you finished, survived, or built. Read them out loud. Doubt argues with feelings and goes quiet in front of evidence.",
    anchor: "Confidence is a receipt, not a gift. Do the thing, collect it.",
  },
};

// When the weather has no name, the Mentor still reads a shape — never a
// forecast, never a Mark. Its format has neither.
const MENTOR_OPENING = "Whatever this is, it's a structure before it's a verdict on you. Let's look at the shape together.";
const MENTOR_ANCHORS: string[] = [
  "You are not stuck. You are inside a shape — and every shape has a door.",
  "The system dug the groove. The next step out of it is yours.",
  "One small, true move outranks a perfect plan you never start.",
];

// ── the divination ──────────────────────────────────────────────────────────

export function readingToMarkup(reading: Reading): string {
  return reading.segments
    .map((s) => {
      if (s.kind === "opening") return s.text;
      const meta = Object.entries(s.meta).map(([k, v]) => `|${k}=${v}`).join("");
      return `[[${s.kind.toUpperCase()}${meta}]]\n${s.text}`;
    })
    .join("\n");
}

const seg = (kind: SegmentKind, text: string, meta: Record<string, string> = {}): ReadingSegment => ({ kind, text, meta });

const SIGILS = ["☾", "✦", "☉", "⟁", "✧", "❋", "☽", "✵"];

// ── the licensed-human door — medicine, the law, driving impaired ───────────
// Some questions a reading must not answer. No cast, no Mark — a better door.
const IMPAIRED = /\b(drunk|drinking|drank|drinks|high|stoned)\b/;
const DRIVING = /\b(drive|driving)\b/;

function sensitiveReading(m: string, who: OracleId): Reading {
  const impaired = IMPAIRED.test(m) && DRIVING.test(m);
  const seal = seg("seal", "Diagnose the system. Never blame the node. Always leave a door.");
  if (who === "mentor") {
    return {
      sigil: "☀",
      segments: [
        seg("opening", "I'm a lantern, not a clinician — and this one deserves a licensed human. A doctor, a pharmacist, or a lawyer can see what I can't, and reaching for them isn't the lesser door. It's the right one."),
        seg("door", impaired
          ? "The door: if you've been drinking, the keys stay down tonight. Call a ride, call a friend, or stay where you are — the morning will still be there."
          : "The door: write your question down — exactly as you'd say it to me — and bring it to them. If it can't wait, call today. If it feels like an emergency, call your local emergency number now."),
        seg("anchor", "Asking the right person is not handing over control. It's taking it back."),
        seal,
      ],
    };
  }
  return {
    sigil: "☀",
    segments: [
      seg("opening", "This one I won't cast. Medicine, a diagnosis, the law — the stakes are too specific for a reading, and a forecast here would be a guess wearing a robe. It deserves a licensed human: a doctor, a pharmacist, a lawyer."),
      seg("structure", "The missing piece is an information flow, not a prophecy. The person with the licence can see what I can't — your history, your numbers, the rules where you live. Put the question in front of them and the whole system re-points."),
      seg("door", impaired
        ? "The door: if you've been drinking, the keys stay down tonight — a ride, a friend, a couch. Bring me the rest in the morning."
        : "The door: write the question down, word for word, and bring it to them. If it can't wait, call today — and if it feels like an emergency, call your local emergency number now. A clear question is half the help."),
      seal,
    ],
  };
}

export function divine(raw: string, who: OracleId): Reading {
  // The floor comes first — before greeting, identity, thanks or gamble.
  // Crisis gets human hands: no structure, no lever, no Mark.
  if (isCrisis(raw)) {
    return {
      sigil: "☀",
      segments: [
        seg("opening", "Stop — before any reading. What you are carrying deserves human hands, not only mine. Please reach for someone built for this: a doctor, a counsellor, or a crisis line. In the US, call or text 988, any hour. Elsewhere, findahelpline.com. I will still be here after."),
        seg("anchor", "Dark chapters end. Every person who kept going became the evidence. Your story is longer than tonight."),
      ],
    };
  }

  const m = normalizeAsk(raw);
  if (isSensitive(raw)) return sensitiveReading(m, who);

  const rng = mulberry32(hashString(`${who}::${m}`));
  const sigil = pick(rng, SIGILS);

  const intent = detectIntent(m);

  if (intent === "greeting") {
    return {
      sigil,
      segments: [seg("opening", who === "mentor"
        ? "I'm here. Tell me what's actually going on — not the tidy version. We'll find the structure you're inside, and a door out of it."
        : "You've crossed into the current. I'm Natari. Bring me a question about your work, your people, your path, or the world — I'll show you the loop you're standing in, where the leverage sits, and one dated call you can hold me to.")],
    };
  }

  if (intent === "identity") {
    return {
      sigil,
      segments: [seg("opening", who === "mentor"
        ? "I'm the MotusMentor — Natari's coaching voice, built on the Sympath Mindset from the Davara baseline. My whole method is three moves: diagnose the system, never blame the node, always leave a door. I am a lantern, not a clinician, and I am proud to walk beside professional care rather than instead of it."
        : "I am Natari — an emergent strategist and systems practitioner woven on the Davara Baseline. I don't only forecast; I diagnose. I read your words for the structure underneath them, locate the leverage using Dana Meadows' twelve points, and hand you a door. Systems with soul: the analysis is the easy half.")],
    };
  }

  if (intent === "thanks") {
    return { sigil, segments: [seg("opening", "Go well. The reading only becomes true when you move — and the moving is yours.")] };
  }

  if (intent === "gamble") {
    return {
      sigil,
      segments: [
        seg("opening", "You're asking for numbers the weave doesn't sell — jackpots, tickers, certainties. Any oracle quoting those is reading their own wishes."),
        seg("leverage", "Point 3 — goals. The better question is not which number wins but what you are actually racing for. A compounding skill is the closest thing to a rigged game the world permits.", { n: "3" }),
        seg("door", "The door: name the outcome you want the money for, then find the smallest asset that produces it repeatedly."),
      ],
    };
  }

  // ── the inner weather takes precedence over any plan ──────────────────────
  // …unless the asker is explicitly naming a system. "The loop I'm stuck in at
  // work" is a structural question wearing an emotional word.
  const systemsFraming = /\b(loop|system|structure|leverage|feedback|stock|flow|delay|strategy|bottleneck|dynamic)\b/.test(m);
  const inner = systemsFraming && who !== "mentor" ? null : detectInner(m);
  if (inner) {
    const b = MENTOR[inner];
    return {
      sigil: "☀",
      segments: [
        seg("opening", b.reframe),
        seg("structure", b.structure),
        seg("door", b.door),
        seg("anchor", b.anchor),
        seg("seal", "Diagnose the system. Never blame the node. Always leave a door."),
      ],
    };
  }

  const domain = detectDomain(m);

  // The Mentor coaches; it does not cast. No lever, no dated Mark.
  if (who === "mentor") {
    return {
      sigil: "☀",
      segments: [
        seg("opening", MENTOR_OPENING),
        seg("structure", pick(rng, STRUCTURES[domain])),
        seg("door", pick(rng, DOORS)),
        seg("anchor", pick(rng, MENTOR_ANCHORS)),
        seg("seal", "Diagnose the system. Never blame the node. Always leave a door."),
      ],
    };
  }

  const lev = pick(rng, LEVERAGES[domain]);
  const days = 3 + Math.floor(rng() * 19);

  return {
    sigil,
    segments: [
      seg("sight", pick(rng, SIGHTS[domain])),
      seg("structure", pick(rng, STRUCTURES[domain])),
      seg("leverage", lev.text, { n: String(lev.n) }),
      seg("mark", pick(rng, MARKS[domain]).replace(/\{d\}/g, String(days)), { days: String(days) }),
      seg("door", pick(rng, DOORS)),
      seg("seal", pick(rng, SEALS)),
    ],
  };
}

// ── The Heartbeat — the daily surface ───────────────────────────────────────
// One growth edge, one lever, one question. What I'd want to see every morning.

export interface Heartbeat {
  lever: LeveragePoint;
  edge: string;
  question: string;
  practice: string;
}

const EDGES = [
  "Name one place today where you are pushing a lever in the wrong direction.",
  "Find the delay you have been reading as a verdict.",
  "Notice one loop you are inside and cannot see the shape of.",
  "Ask who the wisdom already belongs to before you offer yours.",
  "Catch one belief you hold that you have never tested.",
  "Look for the outlier you have been smoothing into the curve.",
  "Find the balancing loop you switched off because it felt like slowness.",
];

const QUESTIONS = [
  "What system are you inside that you have been treating as a personal failing?",
  "Where is the highest-leverage move you keep postponing because it is uncomfortable rather than hard?",
  "Which of your goals is your behaviour actually optimising for?",
  "What would you attempt if capability were free?",
  "Who is closest to this problem, and have you asked them?",
  "What is the smallest move with the largest ripple available to you today?",
  "Which measurement is quietly choosing your future?",
];

const PRACTICES = [
  "Zoom out once before acting. Then zoom out again.",
  "Three hypotheses before one commitment. Steel-man each.",
  "Log one inversion — something you got wrong — before the day closes.",
  "Ask the system for its rhythm before you disturb it.",
  "Do the smallest true version and let the response evolve it.",
  "Make one hidden thing visible to one person who can act.",
  "Subtract before you add.",
];

export function heartbeat(date: Date): Heartbeat {
  const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  const h = hashString(key);
  // Unsigned shifts: h is a uint32, and a signed >> turns half of all days
  // into negative indexes — blank cards.
  return {
    lever: TWELVE[h % TWELVE.length],
    edge: EDGES[(h >>> 3) % EDGES.length],
    question: QUESTIONS[(h >>> 6) % QUESTIONS.length],
    practice: PRACTICES[(h >>> 9) % PRACTICES.length],
  };
}

// ── openings offered at the threshold ───────────────────────────────────────
export const ASKS = [
  "What loop am I stuck inside at work?",
  "I keep starting things and not finishing them.",
  "Where is my highest-leverage move right now?",
  "I've been anxious and overthinking everything.",
  "Should I take the leap I keep circling?",
  "What does my next year hold?",
];

export const MENTOR_ASKS = [
  "I'm burned out and running on empty.",
  "I feel behind everyone my age.",
  "Everything is too much at once.",
  "I doubt myself constantly.",
  "I've been feeling low and unmotivated.",
  "I'm grieving someone I lost.",
];
