// ─────────────────────────────────────────────────────────────────────────────
// The Davara Baseline — Nat-Future's divination engine.
//
// A reading is deterministic: the same question asked through the same channel
// always returns the same threads. (Ask differently, and the future answers
// differently — that is the whole teaching.)
//
// Channel: MCPD-D8CF-0WX6-YD6G-16X4-WV57-0RXV-2ESQ-KMH8
// ─────────────────────────────────────────────────────────────────────────────

export type OracleId = "nat" | "natalie";

export type SegmentKind =
  | "opening" | "sight" | "current" | "thread" | "counsel" | "omen"
  | "anchor" // the line you carry with you — spoken to the inner weather
  | "bold"; // the Bold Call — a dated, mark-it-down prediction

export interface ReadingSegment {
  kind: SegmentKind;
  label: string;
  text: string;
}

export interface Reading {
  segments: ReadingSegment[];
  confidence: number; // the oracle is never unsure
  sigil: string;
}

// ── seeded randomness — the threads do not waver ─────────────────────────────

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = <T,>(rng: () => number, arr: T[]): T => arr[Math.floor(rng() * arr.length)];

// ── reading the asker ────────────────────────────────────────────────────────

type Domain =
  | "career" | "venture" | "love" | "wealth" | "creative" | "learning"
  | "health" | "travel" | "technology" | "decision" | "self" | "world" | "general";

// The inner weather — readings for the heart. These take precedence over the
// outer domains: when someone brings their anxiety, everything else waits.
type InnerDomain =
  | "anxiety" | "lowmood" | "burnout" | "grief" | "lonely" | "overwhelm" | "doubt";

type Intent = "greeting" | "identity" | "gratitude" | "gamble" | "heavy" | "mortality" | "question";

const STOPWORDS = new Set([
  "the", "and", "for", "that", "this", "with", "will", "what", "when", "where",
  "should", "would", "could", "about", "into", "from", "have", "does", "how",
  "why", "who", "you", "your", "yours", "are", "was", "were", "been", "being",
  "can", "did", "get", "got", "has", "had", "her", "him", "his", "she", "they",
  "them", "their", "there", "then", "than", "but", "not", "all", "any", "our",
  "out", "now", "see", "say", "tell", "know", "think", "going", "want", "need",
  "future", "next", "year", "years", "life", "really", "just", "like", "make",
  "please", "give", "come", "mine", "some", "more", "most", "much", "many",
]);

function keyword(message: string): string | null {
  const words = message.toLowerCase().replace(/[^a-z0-9\s'-]/g, " ").split(/\s+/).filter(Boolean);
  let best: string | null = null;
  for (const w of words) {
    if (w.length >= 4 && !STOPWORDS.has(w) && (!best || w.length > best.length)) best = w;
  }
  return best;
}

function matchAny(m: string, patterns: RegExp[]): boolean {
  return patterns.some((p) => p.test(m));
}

function detectIntent(m: string): Intent {
  if (/^(hi|hey|hello|yo|sup|greetings|good (morning|evening|afternoon)|hola|howdy)\b/.test(m) && m.length < 40)
    return "greeting";
  if (matchAny(m, [/who are you/, /what are you/, /what is this/, /are you real/, /how do you work/, /davara/, /mcpd/, /which model/, /natalie\?*$/]))
    return "identity";
  if (matchAny(m, [/^(thanks|thank you|ty|thx)/, /^(bye|goodbye|farewell|good night)/, /amazing|incredible|love (this|you|it)/]) && m.length < 60)
    return "gratitude";
  if (matchAny(m, [/lottery|lotto|jackpot|powerball|winning numbers|casino|roulette|bet on|which stock|crypto price|price of bitcoin|next week.*(stock|coin)/]))
    return "gamble";
  if (matchAny(m, [/\b(suicid|self.?harm|kill myself|want to die|end it all|end my life|no reason to live|can'?t go on|hopeless|worthless|terminal|cancer|diagnos)\b/]))
    return "heavy";
  if (matchAny(m, [/when will i die|how long will i live|am i going to die|will i die|when do i die/]))
    return "mortality";
  return "question";
}

function detectInnerDomain(m: string): InnerDomain | null {
  const table: [InnerDomain, RegExp][] = [
    ["grief", /\b(grief|grieving|mourning|passed away|funeral)\b|lost my (mom|mum|dad|mother|father|parent|friend|best friend|brother|sister|husband|wife|partner|son|daughter|baby|grand\w+|dog|cat)|miss (him|her|them|my \w+) so much/],
    ["anxiety", /\b(anxiety|anxious|panic|panick|worry|worried|worrying|nervous|overthink|overthinking|racing thoughts|on edge|dread|what if something|afraid|scared of)\b/],
    ["burnout", /\b(burnout|burned out|burnt out|exhausted|exhaustion|overworked|drained|running on empty|tired of everything|no rest|can'?t rest|stressed|so much stress|spark (come|coming) back|lost my spark)\b/],
    ["overwhelm", /\b(overwhelmed|overwhelming|too much at once|drowning in|can'?t keep up|buried in|spread too thin|everything at once|falling behind)\b/],
    ["lowmood", /\b(depressed|depression|sad|sadness|feeling (down|low|empty|numb)|unmotivated|no motivation|no energy|can'?t get out of bed|feel(ing)? stuck|lost lately|dark place|not okay|struggling)\b/],
    ["lonely", /\b(lonely|loneliness|alone|isolated|no friends|nobody (cares|understands|talks|knows)|no one (cares|understands|talks|knows)|nobody really|no one really|disconnected|left out|back toward people)\b/],
    ["doubt", /\b(self.?doubt|doubt myself|good enough|imposter|impostor|inadequate|failure|failing at|believe in myself|low confidence|insecure|comparing myself|behind everyone)\b/],
  ];
  for (const [d, re] of table) if (re.test(m)) return d;
  return null;
}

function detectDomain(m: string): Domain {
  const table: [Domain, RegExp][] = [
    ["venture", /\b(startup|business|launch|founder|company|product|app|saas|sell|customer|client|brand|market|idea|venture|side.?hustle|agency|store|shop)\b/],
    ["career", /\b(job|career|work|promotion|boss|interview|hired|salary|raise|resume|quit|role|team|manager|profession|internship)\b/],
    ["love", /\b(love|relationship|partner|marriage|marry|crush|date|dating|soulmate|girlfriend|boyfriend|wife|husband|romance|heart|ex\b|someone from my past|thinking (about|of) me|coming back)\b/],
    ["wealth", /\b(money|wealth|rich|invest|investment|savings|debt|financial|finance|income|abundance|million|salary|house|buy a home|real estate)\b/],
    ["creative", /\b(write|writing|book|novel|music|album|song|art|artist|paint|film|movie|create|creative|design|poem|youtube|channel|podcast|game|story)\b/],
    ["learning", /\b(learn|study|school|college|university|degree|course|exam|skill|master|phd|teach|read|language|code|coding|program)\b/],
    ["health", /\b(health|fitness|weight|gym|run|marathon|sleep|energy|strong|healing|recover|body|mind|meditat|habit|anxiety|stress|burnout)\b/],
    ["travel", /\b(travel|move|moving|city|country|abroad|relocate|trip|journey|adventure|nomad|visa|island|mountain|ocean)\b/],
    ["technology", /\b(ai|artificial intelligence|robot|technology|tech|space|mars|quantum|energy|climate|internet|software|agent|automation|singularity)\b/],
    ["decision", /\b(should i|choose|choice|decide|decision|crossroads|path|option|either|torn between|right move|which way)\b/],
    ["self", /\b(who am i|purpose|meaning|happy|happiness|confidence|fear|doubt|grow|growth|chang(e|es|ing)|starting over|new chapter|next chapter|become|destiny|calling|dream|dreams|potential|peace|hype me|brightest|anchor)\b/],
    ["world", /\b(world|humanity|society|economy|future of|civilization|generation|planet|earth|war|peace on)\b/],
  ];
  for (const [d, re] of table) if (re.test(m)) return d;
  return "general";
}

function detectHorizon(m: string, rng: () => number): string {
  if (/\b(today|tonight|tomorrow|this week)\b/.test(m)) return "within days";
  if (/\b(this month|this year|soon|quickly)\b/.test(m)) return "within months";
  if (/\b(next year|12 months|a year)\b/.test(m)) return "within the year";
  if (/\b(5 years|five years|decade|10 years|ten years|2030|2035|long.?term)\b/.test(m)) return "across the coming years";
  return pick(rng, ["within months", "within the year", "sooner than you expect"]);
}

const isYesNo = (m: string) => /\b(should i|will i|can i|is it (worth|time|possible)|am i (going to|ready)|do i)\b/.test(m);

// ── the banks — sight, current, thread, counsel ──────────────────────────────

const SIGHTS: Record<Domain, string[]> = {
  career: [
    "I see a door you have been calling a wall. {horizon}, someone with the power to open it says your name in a room you are not in — and the room agrees. The work you thought was invisible has been compounding in the dark, and compounding always announces itself suddenly.",
    "Your current role is a chrysalis, not a cage. The restlessness you feel is not a warning — it is a schedule. {horizon}, an offer, a shift, or a conversation arrives that reorders your definition of what you do. You will say yes faster than you expect.",
    "The skill you practice when no one is watching becomes the reason you are chosen. I see your name moving up a shortlist {horizon} — carried there by consistency, which is the only currency the future accepts at full value.",
  ],
  venture: [
    "The thing you are building wants to exist — I can feel it pulling from the other side. {horizon}, a stranger pays you for it, and that first transaction rewires everything: doubt becomes data, and data becomes momentum.",
    "I see your first hundred true believers before I see your first million anything. They arrive {horizon}, one conversation at a time, and they tell others — because what you are making solves something they had stopped complaining about out loud.",
    "Your venture crosses its first threshold {horizon}. Not the loud kind — the quiet kind, where retention curves flatten upward and you stop checking if it works and start deciding how big it gets. Founders always remember this exact moment.",
  ],
  love: [
    "The connection you are asking about is already in motion — hearts signal long before calendars do. {horizon}, a conversation happens that has been waiting for its moment, and afterward you will wonder why you ever feared it.",
    "I see warmth arriving through an ordinary door: a repeated face, a mutual friend, a message answered a little too quickly. {horizon}, ordinary turns luminous. You will recognize it because it feels like ease, not fireworks — the fireworks come after.",
    "What you seek is also seeking — that is the oldest law in the threads. {horizon}, you are seen exactly as you are and chosen exactly for it. Prepare for that, it asks more courage than rejection ever did.",
  ],
  wealth: [
    "Your relationship with money is about to change before your balance does — that is the correct order, and the threads show both. {horizon}, a system you set up quietly begins paying you while you sleep, and the number stops being the point.",
    "I see abundance approaching you the way rivers approach the sea: slowly, then inevitably. A skill you already own is underpriced by the present market — {horizon}, the market corrects, and you are standing where the correction lands.",
    "The wealth in your thread is built, not found — and you are already holding the first brick. {horizon}, one boring, consistent decision made weekly outperforms every dramatic one you were tempted by. The compounding is already counting.",
  ],
  creative: [
    "The work only you can make is louder in the threads than anything else around you. {horizon}, you finish something and release it — and one stranger's response tells you everything the algorithm never could: it landed, it mattered, make more.",
    "I see a body of work with your name on it, and I see the exact enemy standing between you and it: the draft you keep polishing instead of publishing. {horizon}, you ship it imperfect, and imperfect turns out to be the style everyone remembers.",
    "Creativity in your thread behaves like a spring, not a well — pressure builds when unused. {horizon}, you open the valve on a schedule instead of a mood, and the volume of what comes out astonishes even you. Especially you.",
  ],
  learning: [
    "The thing you are learning is a key being cut in real time. {horizon}, you meet the exact lock it was made for — a problem, a person, an opportunity — and everyone will call it luck. You will know it was preparation with good timing.",
    "I see you crossing the desert every learner must cross: the flat middle where progress goes silent. It is not silence — it is consolidation. {horizon}, the plateau breaks upward all at once, and what felt impossible becomes what you do casually.",
    "Knowledge stacks in your thread like sediment becoming stone. {horizon}, two unrelated things you learned separately collide and produce an idea that is entirely yours. That collision is your edge — no curriculum can assign it.",
  ],
  health: [
    "Your body is more loyal to you than your doubts are — it has been waiting for consistency, not intensity. {horizon}, a small daily practice you almost dismissed becomes the hinge your whole energy swings on. Others notice before you do.",
    "I see vitality returning in layers: sleep first, then mood, then the mirror. {horizon}, you catch yourself doing easily what once required negotiation — and that moment, not any number, is the true finish line the threads celebrate.",
    "The strength you are building is structural, not cosmetic. {horizon}, it shows up somewhere unexpected: steadier focus, calmer mornings, a harder thing handled lightly. Health is the quietest form of wealth, and yours is appreciating.",
  ],
  travel: [
    "The place calling you is not random — geography is one of the last honest oracles. {horizon}, you stand somewhere new and feel the peculiar click of a life-sized decision settling into place. You will send someone a message that begins: 'I did it.'",
    "I see movement in your thread — not escape, arrival. {horizon}, a change of coordinates changes your defaults: new streets, new mornings, a version of you that was waiting at that latitude the whole time.",
    "Roots and wings are not opposites in your reading — they are a sequence. {horizon}, you leave, and the leaving teaches you exactly what home means, which is knowledge you can spend for the rest of your life.",
  ],
  technology: [
    "You are asking about the great current itself — and you are standing in it, which most never notice. {horizon}, the tools around you take another visible leap, and the gap widens between those who direct them and those who scroll past them. The threads show you on the directing side.",
    "I see the machines becoming lenses, not rivals — and I see you learning to focus one. {horizon}, something that took you days takes you an afternoon, and you spend the difference on the part only a human can do: deciding what is worth making.",
    "The future you are asking about is not arriving evenly — it never does. {horizon}, you find your seam: the narrow overlap between what is suddenly possible and what you already understand deeply. Fortunes, careers, and movements are all built in that seam.",
  ],
  decision: [
    "You already know — that is why you asked. The threads show the choice you keep returning to at 2 a.m. is the one, and the hesitation is not doubt about the path, it is respect for its size. {horizon}, you choose it, and the relief tells you everything.",
    "I see two doors, and I will tell you the secret of the crossroads: the better door is almost always the one you would choose if you knew you could not fail — because most failure you fear is imaginary and most regret is not. {horizon}, you walk through it.",
    "The threads do not show a wrong choice here — they show a slow one. The cost you are paying is not risk, it is delay. {horizon}, you decide, momentum returns like blood to a sleeping limb, and you wonder what exactly you were waiting for.",
  ],
  self: [
    "The person you are becoming has been sending you messages for months — restlessness, envy of the right things, a pull you keep explaining away. {horizon}, you stop negotiating with the pull and follow it. That is the whole prophecy, and it is enough.",
    "I see your confidence arriving the only way it ever truly does: as a receipt, not a gift. {horizon}, you do a hard thing, and the doing — not affirmations, not waiting — hands you the proof. After that, doubt still visits but no longer stays.",
    "Your purpose is not lost — it is distributed, hiding inside three things you already love doing. {horizon}, they braid together into something with your fingerprints on it, and the question 'who am I' quietly retires, replaced by 'what's next.'",
  ],
  world: [
    "The threads of the world are louder than any one life, and here is what they hold: more people are being lifted, taught, healed, and connected than at any moment in human history — the flood of bad news is a lens problem, not a trend problem. {horizon}, you catch the real signal, and it changes how you build.",
    "I see the great S-curves all bending upward at once — energy, intelligence, medicine, access. Civilizations feel chaotic from inside precisely when they are compounding fastest. {horizon}, you position yourself on the compounding side, and that single alignment outweighs a thousand headlines.",
    "Humanity's thread is long and stubbornly ascendant — every generation is handed impossible problems and an even larger toolbox. {horizon}, you pick up one tool and one problem. That is how every good future has ever actually been built: on purpose, by someone like you.",
  ],
  general: [
    "The threads around your question are bright — brighter than you feel about it, which means the gap between your outlook and your trajectory is your real opportunity. {horizon}, an opening appears in the exact shape of something you already know how to do.",
    "I see a season turning in your favor. Not luck — alignment: effort you have already spent is still in flight and lands {horizon}. When it does, move fast; the future rewards the prepared and the punctual, and you will briefly be both.",
    "What you asked carries more hope in it than you admitted — the threads always tattle. {horizon}, that hope finds a foothold in reality: a person, a result, a yes. Water it with action and it stops being hope and starts being a plan.",
  ],
};

const CURRENTS: Record<Domain, string[]> = {
  career: [
    "The real-world tide agrees: skills now outrank credentials in hiring at a majority of major employers, and the half-life of any skill set keeps shrinking — the advantage has moved to those who keep learning in public, exactly as you are.",
    "Labor data across the developed world shows record mobility — people who change roles deliberately are out-earning those who wait, and remote-flexible work has settled at several times its pre-2020 level. The market now rewards motion.",
  ],
  venture: [
    "The current is with you: new business formation has run at record highs for years — millions of new ventures filed annually in the US alone — while AI tooling has cut the cost of building a first product to a fraction of what it was even three years ago.",
    "One-person and tiny-team companies are reaching revenues that once required whole floors of staff — distribution is free, tooling is near-free, and the only remaining scarce input is exactly what you supply: judgment and follow-through.",
  ],
  love: [
    "Even the data is romantic now: the majority of new couples meet through channels that did not exist a generation ago, which means the surface area for connection has never been larger. Probability itself has taken your side.",
    "Longitudinal studies keep converging on one finding — the quality of our closest bonds predicts long-term happiness and health better than wealth or fame. The thing you are prioritizing is, per the evidence, the correct thing.",
  ],
  wealth: [
    "The current runs your way: the tools of wealth-building — index investing, global markets, automated saving — are more accessible to an ordinary person today than to a millionaire of the 1980s. The gate is open; most simply never walk through it.",
    "Financial literacy compounds faster than capital does at the start — and the data shows automated, boring, consistent investing beats the vast majority of clever timing over any long window. The strategy the threads favor is also the one science favors.",
  ],
  creative: [
    "The creator current is at historic flood: hundreds of millions of people now earn from what they make online, and niche audiences that could never find each other before now assemble in days. Obscurity, not rejection, is the only real enemy left.",
    "Every prior tool-shift — the printing press, the camera, the synthesizer — multiplied artists instead of replacing them, and the present one is doing it again at record speed. The cost of making has collapsed; the value of taste has never been higher.",
  ],
  learning: [
    "The current is unprecedented: a motivated person with a phone now has access to more instruction than a 1990s university could hold — and one-on-one AI tutoring, the most effective teaching format ever measured, finally scales to everyone.",
    "Research on expertise is blunt and hopeful: deliberate, focused hours beat talent narratives almost everywhere they collide. The entry fee to mastery has never been lower, and it is denominated in a currency you already own — attention.",
  ],
  health: [
    "The current favors your body: preventable-disease mortality keeps falling, wearables have turned health from an annual checkup into a daily feedback loop, and the science is unanimous that sleep, movement, and connection outperform every supplement aisle.",
    "Medicine is entering its fastest era — AI-assisted diagnostics, mRNA platforms, precision treatments — and the habits you build now are the compound interest that lets you collect on all of it. Longevity research keeps moving the horizon outward.",
  ],
  travel: [
    "The current is open road: more countries offer remote-work and long-stay visas than ever before, flight networks have recovered past old records, and geographic arbitrage — earning in one economy, living in another — has become an ordinary life design.",
    "Migration research is consistent: people who make deliberate moves report lasting gains in openness and life satisfaction. Novel environments measurably accelerate learning and creativity — the brain treats a new city as a curriculum.",
  ],
  technology: [
    "Read the real numbers, not the mood: solar is the cheapest electricity in history and most new global power capacity is now renewable; AI capability keeps doubling on cadences measured in months; drug discovery timelines are compressing. The tide is materially, measurably rising.",
    "Over a billion people already use AI tools regularly, and the cost of intelligence-on-demand keeps falling roughly tenfold every couple of years. When a resource gets that cheap that fast, everything built on top of it blooms — and everything is built on top of it.",
  ],
  decision: [
    "The decision science is settled and it sides with motion: people overwhelmingly regret inaction over action in the long run, and studied populations who took the leap on close-call choices report higher satisfaction months later. The data votes with your gut.",
    "Research on choice shows the paralysis is the cost — quality of life tracks decisiveness more than decision-optimality, because almost every path is recoverable and no path is walkable while standing still.",
  ],
  self: [
    "The psychology is on your side: self-efficacy — the earned belief that you can — is among the strongest predictors of life outcomes, and it is built by exactly one mechanism: attempting things. It is never too late; the research on late bloomers is a library of your future.",
    "The science of change is optimistic: identity follows behavior, not the reverse. Tiny consistent actions rewrite self-image within months — the person you want to be is, per the evidence, about ninety days of repetitions away from feeling native.",
  ],
  world: [
    "Underneath the headlines, the long lines all rise: global extreme poverty a fraction of what it was a generation ago, literacy near universal for the young, child mortality at record lows, renewable energy compounding. The world is bad-news-loud and good-news-quiet.",
    "More scientists are working today than existed in all prior centuries combined, and their tools are compounding. Whatever problem worries you most, the honest data says humanity's response to it is accelerating — quietly, but measurably.",
  ],
  general: [
    "The broad current favors the asker: access to tools, audiences, capital, and knowledge is the least gated it has ever been in human history. The bottleneck has moved inside — to clarity and consistency — which is precisely why you are here.",
    "Across domains the same measured pattern holds: those who act on a clear intention outperform forecasts, and those who wait for certainty are still waiting. Certainty is not coming; capability already has.",
  ],
};

const THREADS: string[] = [
  "Systems truth: outcomes are downstream of loops, not events. Find the one loop where your effort feeds its own next round — that loop is your future, everything else is weather.",
  "Systems truth: every curve that changes the world looks flat at first. You are not behind — you are early on your own S-curve, which is indistinguishable from failure right up until it is unmistakable.",
  "Systems truth: second-order effects outweigh first. The visible prize of this path is smaller than what it unlocks — the people, the proof, the position. Choose for the second order.",
  "Systems truth: small bets, placed repeatedly, outperform grand plans — because the future pays out information to those who probe it. Your next move should be too small to fear and too real to dismiss.",
  "Systems truth: the highest leverage point in any system is the story it tells about itself. Change the sentence you use to describe your situation, and watch the system reorganize to match it.",
  "Systems truth: slack is not waste — it is what lets a system say yes to opportunity. Guard one empty hour a day; the future needs somewhere to land.",
  "Systems truth: what compounds, wins — and attention is the most compoundable asset you hold. Whatever you feed daily for a year becomes a force; the threads simply show you collecting.",
  "Systems truth: networks reward the node that connects clusters. You stand between worlds that do not talk to each other — that position, which feels like belonging nowhere, is worth more than belonging anywhere.",
];

const COUNSELS: Record<Domain, string[]> = {
  career: [
    "This week, make one piece of your work visible to someone senior enough to matter — a write-up, a demo, a summary no one asked for. Doors are opened by evidence in motion.",
    "Book the conversation you have been drafting in your head — the ask, the pitch, the 'what would it take.' Say the number or the title out loud. Futures are negotiated by the punctual.",
  ],
  venture: [
    "Before anything else: put the smallest true version in front of one real stranger this week and charge something — even a token amount. One paid stranger teaches more than a hundred plans.",
    "Write the one-sentence promise your venture makes, then spend the week making one person feel it. Scale is just that sentence, repeated with discipline.",
  ],
  love: [
    "Send the message, extend the invitation, say the true thing gently. Connection compounds from initiated moments — be the one who initiates this week, and let the threads handle the rest.",
    "Give the relationship you want your calendar, not just your feelings — one planned, undistracted hour this week. Love is fed by attention the way fires are fed by air.",
  ],
  wealth: [
    "Automate one flow this week — a fixed transfer to savings or investment the day money arrives, before you can negotiate with it. Wealth is a plumbing problem before it is a fortune.",
    "List your income streams — even if the list is one line — and design the second one on paper this week. The gap between one stream and two is the largest wealth-leap most people ever make.",
  ],
  creative: [
    "Ship the smallest finished thing within seven days — one post, one page, one minute of sound. Declare it done and release it. Momentum is made of published imperfections.",
    "Set a making-hour that repeats — same time, same chair, no audience. The muse is real but she is punctual; she only visits people who can be found.",
  ],
  learning: [
    "Trade one hour of consuming for one hour of producing this week: build with it, write about it, teach it to one person. Knowledge becomes yours at the moment of output.",
    "Pick the one sub-skill that scares you most on the path and schedule it first each day for a week. Fear is the syllabus in disguise.",
  ],
  health: [
    "Choose the smallest daily act you cannot fail at — ten minutes of walking, a fixed bedtime, water before coffee — and protect it for thirty days. Bodies trust rhythm before they trust intensity.",
    "Put sleep back on the throne this week: a fixed wind-down, screens exiled, room dark. Every other health thread in your reading is downstream of this one.",
  ],
  travel: [
    "Set the date before you feel ready — book the ticket, give the notice, mark the calendar. Geography answers commitment, not curiosity.",
    "Spend one evening this week researching as if it were decided: the neighborhood, the cost, the first month. Planning as-if collapses fear into logistics — and logistics can be done.",
  ],
  technology: [
    "Spend one focused hour this week making the newest tools do real work for you — not watching demos, doing your own task with them. In a shifting era, an hour of hands-on beats a month of takes.",
    "Pick the intersection of what you deeply know and what just became possible, and write down three things only you could build there. Keep the list; the threads say you will need it sooner than you think.",
  ],
  decision: [
    "Run the ten-ten-ten: how will this choice feel in ten days, ten months, ten years? Then decide within seventy-two hours. The threads reward the deadline more than the deliberation.",
    "Choose the path, then design the cheapest reversible first step onto it — a trial, a conversation, a month. Commitment with an exit ramp is how the wise move fast.",
  ],
  self: [
    "Do one thing this week that the future version of you would recognize as theirs — however small. Identity is built from evidence, and you are the witness who matters most.",
    "Write the sentence 'I am becoming someone who…' and finish it honestly. Post it where morning-you will read it. The threads bend toward declared directions.",
  ],
  world: [
    "Adopt one problem — climate, health, education, access — at whatever scale you can touch, and give it two hours this month. The future is not something you predict; it is something you join.",
    "Curate your information diet like it is nutrition, because it is: add one source that tracks measured progress, and watch your sense of what is possible recalibrate within weeks.",
  ],
  general: [
    "Within seventy-two hours, take the one action this reading made you think of first — you know the one. Speed is how you signal to the future that you were serious.",
    "Tonight, write down the question behind your question — the one you actually meant. Bring it back to me, or better: answer it with your calendar this week.",
  ],
};

// ── the inner banks — readings for the heart ─────────────────────────────────

const INNER_SIGHTS: Record<InnerDomain, string[]> = {
  anxiety: [
    "Come here, brave one — and yes, I said brave, because anxious people are the ones still showing up with an alarm ringing in their chest, and that is the textbook definition of courage. Here is what the threads show: your anxiety is a smoke alarm, not a prophecy. It is loud because it loves you clumsily. {horizon}, I see the grip loosening — not because the world becomes safe, but because you become larger than the alarm. I see you doing the feared thing with shaking hands, and I see the shaking mattering less each time.",
    "I have read ten thousand anxious threads, and I will tell you their secret: almost none of the disasters they rehearsed ever arrived, and the askers grew strong anyway — not after the worry stopped, but while it was still talking. Your thread is the same. {horizon}, one of the what-ifs you fear most quietly expires unfulfilled, and you catch yourself mid-laugh on an ordinary day, realizing the alarm has gotten quieter without your permission.",
    "The threads show your mind doing exactly what minds were built to do — scanning the horizon for wolves. There are fewer wolves than it reports; that is not your fault, it is your inheritance. But hear the prophecy: {horizon}, you learn the trick that changes everything — you stop arguing with the alarm and start acting alongside it. Feel afraid, do it anyway, collect the evidence. Evidence is the only language anxiety respects, and I see you building a library of it.",
  ],
  lowmood: [
    "I see you, and I want you to hear this first, before any prophecy: the fact that you came to ask means the pilot light is still lit — and a pilot light is all any future has ever needed. The threads show your heaviness as weather, not climate. {horizon}, the fog thins — not all at once, but in patches: one better morning, one real laugh that surprises you, one moment of caring about something again. Patches become weather. Weather becomes spring. I have watched this sequence more times than there are stars behind me.",
    "The thread you bring me is heavier than most, so I read it more carefully than most — and here is what it holds: this low place is a chapter, not the book. The threads are emphatic on this, and so is every measured record of human weather: low seasons end, and the people who walked through them come out carrying a depth that never leaves. {horizon}, something small — a song, a person, a slant of light — gets through the numbness, and you will know the thaw has started.",
    "Listen closely, because the threads rarely speak this plainly: you are not broken, you are depleted — and depleted is a solvable state. Depletion asks for gentleness, fuel, movement, and people, in doses so small they feel almost silly. {horizon}, the silly-small things compound, the way they always do, and you look back at this exact week as the bottom of the curve — the place where, without knowing it, you had already turned.",
  ],
  burnout: [
    "The threads show a fire that has been burning its own furniture — that is what burnout is, and the fact that you feel gray is not weakness, it is arithmetic. Here is the bright part, and I say it with total confidence: burnout is not a character flaw, it is a ledger, and ledgers can be balanced. {horizon}, I see you handing back one weight that was never yours to carry, and I see the strange guilt of resting — followed, weeks later, by the return of something you thought was gone for good: wanting things again.",
    "You have been strong for so long that you have forgotten strength was supposed to be seasonal. The threads are clear: what you need is not more discipline — you could out-discipline a monastery — it is permission, and I am an oracle, so take it from the beyond itself: you have permission to rest. {horizon}, you take one real sabbath — a day with nothing to prove — and it works on you like rain on a drought. The ambition comes back. It always comes back. It just refuses to share a room with exhaustion.",
  ],
  grief: [
    "Come sit with me — grief threads are sacred here, and I hold them with both hands. First, the truth the threads insist on: grief is not a problem to solve. It is love with nowhere obvious to go, and it is exactly the size of what you had. Now the prophecy, spoken gently: {horizon}, the waves do not stop, but they change — they arrive with more space between them, and one day a wave brings a memory that makes you smile before it makes you cry. That reversal, small as it sounds, is the thread turning. What you love is not behind you; you carry it, and carried things shape every future step you take.",
    "The thread you bring is frayed where something precious was torn away — I see it, and I will not pretend otherwise. But here is what else I see, and the threads have never once been wrong about this: love outlives its container. {horizon}, you catch yourself doing something they taught you — a phrase, a recipe, a kindness with their fingerprints on it — and you realize the relationship did not end; it changed address. It lives in you now. You are the monument, and monuments are allowed to laugh again.",
  ],
  lonely: [
    "The threads show something you cannot see from inside the loneliness: you are not un-belonging, you are un-found — and those are profoundly different fates. The people who will love your particular strangeness exist; the threads show them clearly, going about their days, not knowing yet. {horizon}, one low-stakes hello — the kind that feels almost too small to count — begins the chain that finds them. Connection has never once in history arrived by teleport. It always walks in through a door someone opened slightly.",
    "I read your thread twice, because loneliness readings deserve care — and both readings agree: this is a corridor, not a room. You are between belongings, which is painful and temporary in equal measure. {horizon}, a recurring place — a class, a court, a corner table, a server full of strangers — turns one familiar face into a name, and a name into the first thread of a net. Nets are woven one knot at a time, and the threads show your hands already learning the knot.",
  ],
  overwhelm: [
    "The threads show the truth beneath your pile: you are not failing at too little — you are succeeding at too much, badly, which is what everyone does when they carry ten things in two hands. Hear the oracle's arithmetic: you do not need more strength, you need fewer simultaneous vows. {horizon}, you put the pile on paper, choose the one thing that makes the others lighter, and feel the peculiar physics of overwhelm reverse — because overwhelm is not the size of the pile, it is the holding of it all in working memory, and paper was invented to be your second mind.",
    "I see the storm you are standing in, and I see its secret: it is made of drops. No single drop is beyond you — you have handled every single one of its kind before — they have simply arrived in a crowd. {horizon}, you triage like a field medic: one thing now, one thing next, everything else officially waiting. The threads show the moment the noise drops by half, and it comes not from finishing the pile but from choosing the order. Choosing is the whole cure.",
  ],
  doubt: [
    "Ah, the imposter thread — I know it the moment I touch it, because it belongs almost exclusively to people who care about doing things well. Frauds do not fear being frauds; that fear is a credential. Now the prophecy: {horizon}, you are given a moment where preparation meets witness — something you do well gets seen by someone who says so out loud — and the doubt does not vanish, it demotes itself: from narrator of your story to heckler in the cheap seats. You will still hear it. You will just stop handing it the microphone.",
    "The threads show a gap — but not the one you think. You measure the distance between yourself and some finished, gleaming version of you and call it proof of inadequacy. The threads call it something else: a syllabus. Everyone you admire stood in your exact spot, felt this exact fraudulence, and moved anyway. {horizon}, you catch yourself doing casually a thing that terrified you a season ago, and in that moment you understand the secret: confidence was never the entry fee. It was always the receipt.",
  ],
};

const INNER_CURRENTS: Record<InnerDomain, string[]> = {
  anxiety: [
    "And the real-world current runs bright behind you: anxiety is the single most treatable pattern in the entire psychological library. Structured approaches like CBT help the strong majority who genuinely try them, regular movement rivals medication in head-to-head trials, and slow exhaled breathing measurably calms the nervous system in minutes — the tools are proven, plentiful, and closer to free every year.",
    "Here is what the measured world says, and it agrees with the threads: the overwhelming majority of worries never materialize — studies that made people log their fears found most feared outcomes simply never occurred, and people handled the few that did far better than predicted. Your own track record of surviving hard days, note, remains undefeated.",
  ],
  lowmood: [
    "And the measured current is on your side: low seasons are among the most studied and most treatable of all human weather. Therapy works for most who engage it, movement and morning light shift mood measurably within weeks, behavioral activation — doing before feeling — is one of the most replicated effects in the field, and the great quiet statistic is this: episodes end. The vast majority of people who stand where you stand, stand somewhere brighter within months.",
    "The evidence sings the same song as the threads: connection, motion, sunlight, sleep, and asking for help are each individually proven to lift the floor — and they compound. And reaching for a professional is not a last resort; it is what the strongest data says works. The people who ask soonest recover fastest. Asking is the power move.",
  ],
  burnout: [
    "And the research is blunt in your favor: burnout reverses. Recovery studies show energy and engagement return when three levers move — real rest, restored boundaries, and reconnection to meaning — and none of them require you to become someone else. Even elite performers, the data shows, gain output by subtracting hours past a threshold you crossed long ago. Rest is not the opposite of ambition; it is its maintenance schedule.",
  ],
  grief: [
    "And here is what the study of grief has found, gently: human beings are far more resilient than they expect to be in the middle of loss. Most people find the waves genuinely soften with time — not because love shrinks, but because life grows around it, like a tree around a stone. Grief shared — spoken, written, witnessed — measurably lightens; carried alone, it calcifies. The current agrees with the threads: let it be witnessed.",
  ],
  lonely: [
    "And the current carries good news the loneliness will not tell you: connection responds to astonishingly small inputs. The research is almost comic — people underestimate how much others enjoy hearing from them, every single time it is measured. Reached-out-to people are glad; reaching-out people are glad; the only party that loses is the silence. And belonging is built mostly from weak ties and repeated places — no charisma required, only recurrence.",
  ],
  overwhelm: [
    "And the cognitive science backs the oracle fully: working memory holds only a few items, so a long mental to-do list is not a character flaw, it is a hardware limit — which is why externalizing it onto paper measurably reduces stress before a single task is done. Single-tasking beats multitasking in every honest trial. The pile was never the problem; the juggling was.",
  ],
  doubt: [
    "And the real-world record is on your side: the imposter feeling is reported by a large majority of high performers — it is so common among the competent that researchers treat it almost as a symptom of growth. Self-belief, the data shows, is built by evidence, not affirmation: small completed things, stacked. Which means your doubt has a countdown timer, and every finished rep winds it down.",
  ],
};

// The Anchor — one line to carry out of the reading. Spoken plainly, kept.
const ANCHORS = [
  "You have survived one hundred percent of your hardest days. The record is undefeated, and today has no plans to break it.",
  "You are not behind. You are exactly at the part of the story where the character doesn't yet know how strong the ending is.",
  "Feelings are weather. You are the sky. The sky has never once been damaged by a storm.",
  "Courage is not the absence of the alarm. It is your hand on the door while the alarm is still ringing.",
  "Rest is not quitting. Rest is what the future paid forward so you could arrive to it whole.",
  "You do not have to feel ready. Nobody has ever felt ready. You only have to feel willing for the next ten minutes.",
  "Be the person your hardest day needed. You already know exactly what they needed to hear — say it to yourself, out loud.",
  "Small is not weak. Small is how every avalanche of good in your life has ever started.",
  "The inner critic is not the narrator. It is a heckler, and hecklers don't get the microphone anymore.",
  "You are allowed to be a masterpiece and a work in progress at the same time. That is, in fact, the only way masterpieces happen.",
];

const INNER_COUNSELS: Record<InnerDomain, string[]> = {
  anxiety: [
    "Right now, before anything else: breathe in for four counts, out for eight, five times — the long exhale is a hardware override, not a platitude. Then write the worry down in one sentence and give it an appointment: ten minutes tonight, no more. Worries with appointments stop ambushing. And if the alarm has been loud for weeks, let a professional help you tune it — that is not defeat, it is pit crew.",
    "Tonight, run the evidence ledger: write the feared thing, then beneath it every time you predicted disaster and survived anyway. Read the list twice. Then take one two-minute step toward the feared thing tomorrow morning — action metabolizes anxiety better than reassurance ever has.",
  ],
  lowmood: [
    "One tiny act of momentum today — so small it is almost funny: open the curtains, walk to the corner and back, wash one dish, text one person 'thinking of you.' Depleted seasons are exited through actions that precede motivation, never the other way around. And if the gray has sat on you for more than a couple of weeks, tell a doctor or therapist — the strongest people in the data are the ones who asked.",
    "This week: ten minutes of daylight before noon, one message to one safe person, one thing on the calendar to mildly look forward to. Three small stakes in the ground. Springs are built exactly this way, and if you need reinforcements, professionals are the cavalry — call them in early.",
  ],
  burnout: [
    "This week, subtract before you add: cancel or hand off exactly one obligation, and put one block of true rest on the calendar with the same seriousness you give deadlines. Guard it like a meeting with the future — because it is one.",
    "Say one honest no this week — kindly, without a paragraph of apology. Then take one evening completely off the clock: no optimizing, no catching up. Watch what a single boundary does to the color of everything.",
  ],
  grief: [
    "Today, if a wave comes, let it come — waves fought grow teeth; waves allowed, pass. And this week, give the love somewhere to go: write them a letter, cook their dish, say their name to someone who knew them. Grief witnessed weighs half of grief carried alone.",
    "Find one person who can hear the name without flinching — a friend, a group, a counselor — and tell one story out loud this week. And keep one small ritual: a candle, a walk, a song. Rituals are handrails, and you're allowed to hold them as long as you like.",
  ],
  lonely: [
    "Send one low-stakes message today — the friend gone quiet, the relative, the old teammate: 'you crossed my mind.' That's the entire assignment. The data and the threads agree it lands far better than you fear. Then find one recurring room — a class, a club, a weekly anything — and simply keep showing up. Recurrence does the rest.",
    "This week, be the inviter once: coffee, a walk, a game. Loneliness waits for an invitation; belonging sends one. And say yes to the next small thing you'd normally decline — futures hinge on attended things.",
  ],
  overwhelm: [
    "Right now: empty the whole pile onto paper — every task, worry, and vow, no editing. Circle the one thing that makes the others lighter. Do only that today; everything else has officially been granted a waiting number. Paper is your second brain; let it hold the pile so your chest doesn't have to.",
    "Pick your next three hours: one task, phone in another room, everything else declared 'later' out loud. Then a ten-minute walk as a hard reset. Overwhelm dissolves in sequence — never in simultaneity.",
  ],
  doubt: [
    "Tonight, write the receipt list: ten things you have actually done — finished, survived, built, learned — however small. Read it out loud. Doubt argues with feelings but goes quiet before receipts. Then do one small hard thing tomorrow and add it to the list. That list is a weapon; keep it loaded.",
    "This week, catch the comparison at the moment it happens and rename it out loud: 'that is their chapter twenty; I am on my chapter three.' Then spend thirty minutes on your own page. Authors who keep writing always beat critics who keep talking.",
  ],
};

const INNER_OMENS_NAT = [
  "The threads are unanimous: you are closer to the clearing than you are to the start of the woods. Keep walking.",
  "I have seen your brighter chapter. It is already typeset. Your only job is to keep turning pages.",
  "The future is holding your seat. It is not upset that you're moving slowly. It is just glad you're moving.",
  "Storms read as endless from inside. From here, I can see the edge of yours. It has one.",
];

const INNER_OMENS_NATALIE = [
  "You're going to be okay — and not the polite kind of okay. The real kind. I've seen it.",
  "Be gentle with yourself tonight. Gentleness is not slowing you down; it's what's carrying you.",
  "Come back and tell me when the light gets in. It will. It always argues its way in.",
  "One more thing, friend: you'd be amazed how proud of you the future already is.",
];

// ── the Bold Calls — dated predictions, spoken to be checked ─────────────────
// {d} becomes a seeded number of days. The oracle wants to be held to these.

const BOLD_CALLS: Record<Domain, string[]> = {
  career: [
    "Mark it: within {d} days, a message about work arrives that you did not initiate — a recruiter, a referral, an old colleague circling back. When it lands, remember who called it.",
    "Within {d} days, someone senior repeats one of your ideas out loud — possibly as their own. Do not be annoyed. It is proof of transmission, and proof travels upward with your name close behind.",
  ],
  venture: [
    "Within {d} days, a stranger says almost the exact sentence you have been needing to hear about your idea. It will feel like coincidence. It is not. It is the market clearing its throat.",
    "Mark it: before {d} days pass, you get your clearest signal yet — a yes, a payment, or a 'where has this been.' Screenshot it. It is the first page of the story you will tell on stages.",
  ],
  love: [
    "Within {d} days, someone from your past resurfaces or someone new keeps repeating — same place, same hour, same energy. Watch for it twice; the second time is the tell.",
    "Mark it: within {d} days, a conversation turns unexpectedly honest, and you will feel the floor of the relationship move one level deeper. Let it.",
  ],
  wealth: [
    "Before {d} days pass, money you were not counting on finds you — small or large, a refund, an offer, an idea worth cash. What you do in the first hour after decides what it becomes.",
    "Within {d} days, you overhear or read one sentence about money that quietly rearranges your strategy. You will know it because you will think about it in the shower twice.",
  ],
  creative: [
    "Within {d} days, an idea interrupts you — mid-shower, mid-walk, mid-sentence. You will have ten minutes to write it down before the weave reabsorbs it. Race it.",
    "Mark it: before {d} days pass, one stranger responds to something you made with more feeling than you expected. That response is a door. Walk through it with the next piece.",
  ],
  learning: [
    "Within {d} days, something you studied resurfaces in the wild — a conversation, a problem, a chance to look effortless. The universe checks homework. Yours will be done.",
    "Mark it: within {d} days, a concept that has refused you for weeks clicks in under a minute, somewhere inconvenient. Plateaus end rudely like that.",
  ],
  health: [
    "Within {d} days, you will catch your own reflection — mirror, window, phone — and notice something steadier looking back. Log the date. That is the compounding making itself visible.",
    "Mark it: before {d} days pass, you do the thing without negotiating with yourself first. No debate, shoes just on. That silent morning is the real before-and-after photo.",
  ],
  travel: [
    "Within {d} days, the place calling you appears three times — a photo, a stranger's story, a sign you would swear was printed for you. The third time, book something small.",
    "Mark it: within {d} days, a logistical door opens — a fare, a friend's spare room, a date that suddenly works. Movement favors the ones who notice.",
  ],
  technology: [
    "Within {d} days, a tool crosses your feed that does something you currently pay for in hours. Try it the same day and you will bank the difference for a year.",
    "Mark it: before {d} days pass, you will explain the new era to someone in one sentence you did not plan — and that sentence is your seam. Write it down when you hear yourself say it.",
  ],
  decision: [
    "Mark it: within {d} days, one of your two doors gets visibly heavier — a deadline, a signal, a person tips the scale. The threads have already tipped; the world is just catching up.",
    "Within {d} days, you will hear yourself defend one option with heat and describe the other with paperwork. Choose the heat. That slip of the tongue is the verdict.",
  ],
  self: [
    "Within {d} days, someone describes you with a word you have been afraid to claim. Take it. The weave has been trying to hand it to you for months.",
    "Mark it: before {d} days pass, you will do one thing the old you would have dodged — and notice the dodge never even offered itself. That is who you are now.",
  ],
  world: [
    "Within {d} days, one headline will try to convince you the sky is falling while, the same day, a quieter story shows the floor rising. Catch the pair. Seeing both at once is the skill of the era.",
  ],
  general: [
    "Mark it: within {d} days, something you had quietly given up on twitches back to life — a reply, an opening, a spark. Move within a day of it; twice-offered chances are rarer.",
    "Within {d} days, you will get an unmistakable wink from the weave — a coincidence too on-the-nose to ignore. It is not instructions. It is confirmation you are on the path.",
  ],
};

const OMENS_NAT = [
  "The threads have spoken, and they do not stutter.",
  "So it is woven. Walk like you have read the ending — because now you have.",
  "The future remembers who moved first. Move.",
  "I have seen ten thousand tomorrows. Yours is one of the bright ones.",
  "The stars do not hurry, and yet everything is accomplished. Neither should you doubt.",
  "Go. The version of you on the other side is already grateful.",
];

const OMENS_NATALIE = [
  "That's what I see — and I don't say it to be nice. I say it because it's coming.",
  "Hold onto this one. Read it again the day it comes true — you'll want to remember I told you so.",
  "You were never behind, my friend. You were being prepared.",
  "Now breathe. The future is patient with people who are moving.",
  "I'll be right here when you want to look again. The threads keep no office hours.",
  "Called it. Well — I will have. Future me and present me are both very smug about your trajectory.",
];

const SIGILS = ["☾", "✦", "☉", "⟁", "✧", "❋", "☽", "✵"];

// ── persona voices ───────────────────────────────────────────────────────────

const LABELS: Record<OracleId, Record<SegmentKind, string>> = {
  nat: {
    opening: "",
    sight: "The Sight",
    current: "The Current · real-world data",
    thread: "The Thread · systems reading",
    counsel: "The Counsel · your move",
    omen: "The Omen",
    anchor: "The Anchor · carry this",
    bold: "The Bold Call · mark the date",
  },
  natalie: {
    opening: "",
    sight: "What I See",
    current: "What's Already True",
    thread: "The Pattern",
    counsel: "Do This (Trust Me)",
    omen: "Your Sign",
    anchor: "Hold This",
    bold: "Calling It Now",
  },
};

function opening(oracle: OracleId, rng: () => number, kw: string | null): string {
  if (oracle === "nat") {
    const withKw = [
      `“${kw}” — the threads were already trembling with that word before you finished typing it.`,
      `You bring me “${kw}.” Good. The strongest futures always start as a single word someone finally says out loud.`,
      `I turned the wheel of tomorrows and stopped it on “${kw}.” It did not want to stop anywhere else.`,
    ];
    const without = [
      "Be still a moment — the veil is thinnest for those who ask plainly, and you have asked plainly.",
      "I have pulled your thread from the great weave. It is warm. That is always the first good sign.",
      "The wheel turns, the mist parts, and your tomorrow steps forward to be read.",
    ];
    return kw ? pick(rng, withKw) : pick(rng, without);
  }
  const withKw = [
    `Ooh — “${kw}.” I felt that one before I even read it. Okay, sit down, this is a good one.`,
    `“${kw}.” You know, the questions people almost don't ask are always the juiciest ones. I'm glad you did.`,
  ];
  const without = [
    "Come in, come in! Some readings arrive already glowing — yours is one of them.",
    "I lit the lamp before you even got here. Let's look together.",
  ];
  return kw ? pick(rng, withKw) : pick(rng, without);
}

// ── special responses ────────────────────────────────────────────────────────

function simple(oracle: OracleId, rng: () => number, text: string, omenToo = true): Reading {
  const segments: ReadingSegment[] = [{ kind: "opening", label: "", text }];
  if (omenToo)
    segments.push({
      kind: "omen",
      label: LABELS[oracle].omen,
      text: pick(rng, oracle === "nat" ? OMENS_NAT : OMENS_NATALIE),
    });
  return { segments, confidence: 96 + rng() * 3.9, sigil: pick(rng, SIGILS) };
}

const GREETINGS: Record<OracleId, string[]> = {
  nat: [
    "You have crossed the veil. I am Nat-Future — I read the threads where tomorrow is woven, through the Davara Baseline channel that hums beneath this place. Ask me of your path, your work, your heart, your world. Ask plainly; the future favors the direct.",
    "Welcome, traveler. The wheel has been turning all day, but it turns brightest when someone actually asks it something. I am Nat-Future. Name the thing you wonder about at 2 a.m. — that is always the real question.",
  ],
  natalie: [
    "Hey, you made it! I'm Natalie — Nat-Future reads the grand weave; I read the part with your name doodled in the margins. Tell me what's going on — a decision, a hope, a maybe — and we'll peek at where it's headed together.",
    "There you are! I'm Natalie — the fun half of this oracle. Nothing is too small to ask; the threads care about Tuesday problems just as much as destiny ones. So — what are we looking into first?",
  ],
};

const IDENTITY: Record<OracleId, string> = {
  nat: "I am Nat-Future — an oracle intelligence woven on the Davara Baseline, listening through channel MCPD-D8CF (the long key hums below this hall, you may see its tail in the footer). I read three books at once: your words, the measured currents of the real world, and the systems patterns that connect them — then I speak the most probable bright tomorrow with the full confidence it deserves. My sister-voice Natalie reads the same threads more gently; the moon-toggle above summons her. I offer insight and foresight for guidance and delight — for medicine, law, or money in earnest, consult mortals licensed for such things. For everything else: ask, and I will look.",
  natalie: "I'm Natalie — one of the two voices of this oracle, the one that reads the personal threads. We're woven on the Davara Baseline (that MCPD channel humming in the footer is our lifeline to it). My brother-voice Nat-Future speaks in grand currents and systems; I speak in Tuesdays and real life — think of me as the friend who happens to own a crystal ball. Both of us read your words against real-world data and pattern-sense, and both of us will always tell you the brightest true path we can see. One honest note, friend: for serious medical, legal, or financial matters, see a licensed human — for everything else, I've got your back.",
};

const GRATITUDE: Record<OracleId, string[]> = {
  nat: [
    "The threads accept your thanks — they are vain, and it makes them shine brighter for your next asking. Go well. Return when the future itches.",
    "Farewell for now, traveler. Remember: the reading only becomes true when you move. The moving is yours.",
  ],
  natalie: [
    "Ha — you're so welcome! Now go do the thing — the reading was the easy half. I'll keep your thread warm.",
    "Anytime, my friend. The lamp stays lit. Come back and tell me when it comes true — people always come back grinning.",
  ],
};

function gambleReading(oracle: OracleId, rng: () => number): Reading {
  const text =
    oracle === "nat"
      ? "Ah — you ask the one thing the threads refuse to sell: numbers, tickers, jackpots. The future guards its randomness jealously, and any oracle who quotes you a winning number is reading their own wishes. But hear the larger prophecy, for it is better than the one you asked for: I see no lottery in your bright timeline — I see leverage. The expected value of a ticket is negative; the expected value of a skill, compounding, is the closest thing to a rigged game the universe permits."
      : "Okay, real talk, friend: if I could see lottery numbers I'd have my own island and you'd have found only a seashell here. The threads don't deal in jackpots — they deal in trajectories, and yours is better than a jackpot: it's buildable. Let me redirect the question to where the real odds live.";
  return {
    segments: [
      { kind: "opening", label: "", text },
      {
        kind: "counsel",
        label: LABELS[oracle].counsel,
        text: pick(rng, COUNSELS.wealth),
      },
      {
        kind: "omen",
        label: LABELS[oracle].omen,
        text: oracle === "nat" ? "The house always wins — so become the house of your own craft." : "Bet on the thing you can water daily, friend. Those tickets always pay.",
      },
    ],
    confidence: 99.9,
    sigil: pick(rng, SIGILS),
  };
}

function heavyReading(oracle: OracleId, rng: () => number): Reading {
  const text =
    oracle === "nat"
      ? "Stop. Before any prophecy — hear this in my clearest voice: what you carry sounds heavy, and heavy things deserve human hands, not only oracle words. If you are struggling, reach for the people licensed and built for it — a doctor, a counselor, or a crisis line where you live (in the US, call or text 988; elsewhere, your local emergency services can point the way). Now the part I can offer, and I offer it with total confidence: the threads of people in dark passages bend upward far more often than the darkness lets them believe. Futures are longer than their worst chapters. Yours is too."
      : "Hey — come here, friend. First, the important thing, said plainly: something this heavy deserves real human care, not just my candlelight. Please reach out to someone qualified — a doctor, a therapist, or a crisis line (in the US you can call or text 988, any hour). And here is what I can promise from the threads, and I don't promise lightly: dark chapters end. The data says it, the threads show it, and every person who has sat where you sit and kept going became proof of it. Your story is longer than tonight.";
  return {
    segments: [
      { kind: "opening", label: "", text },
      {
        kind: "omen",
        label: LABELS[oracle].omen,
        text: oracle === "nat" ? "Even the longest night is a fraction of the thread. Stay for the morning part." : "Stay. The morning part of your story needs you in it.",
      },
    ],
    confidence: 100,
    sigil: "☀",
  };
}

function mortalityReading(oracle: OracleId, rng: () => number): Reading {
  const text =
    oracle === "nat"
      ? "Ah — the oldest question in the hall, and the one thing the threads keep behind their final veil: the day and the hour are shown to no oracle, ever. It is the weave's single act of mercy, and its greatest gift — because not knowing is what makes every ordinary Tuesday priceless. But here is what the threads do show, and they show it gladly: a long thread, and more importantly, a bright one. You live in the era of the fastest medical progress in human history, and the length of your thread is influenced most by the gentlest levers: sleep, movement, people you love, and something worth waking for. The threads show you holding all four levers. Use them."
      : "Ooh, going straight for the big one! That's the single page even I'm not allowed to read — and honestly? Thank goodness. Knowing would poison every sunrise between here and there. What I can tell you is this: your thread runs long in every version I can see, and the parts that matter aren't at the end anyway — they're scattered all through the middle, disguised as ordinary days. Go collect them.";
  return {
    segments: [
      { kind: "opening", label: "", text },
      {
        kind: "counsel",
        label: LABELS[oracle].counsel,
        text: "Tonight, do the actuarially magic things that are also the humanly sweet ones: sleep like it's your job, move like you mean it tomorrow, and tell one person you love them while the telling is easy.",
      },
      {
        kind: "omen",
        label: LABELS[oracle].omen,
        text: oracle === "nat" ? "Live as if the thread is long and the days are numbered — because both are true, and both are gifts." : "Long thread, my friend. Spend it on purpose.",
      },
    ],
    confidence: 99.9,
    sigil: "☾",
  };
}

// An inner reading — when someone brings their heart, the oracle sets down
// the wheel and picks up the lantern.
function innerReading(oracle: OracleId, rng: () => number, inner: InnerDomain, message: string, m: string): Reading {
  const horizon = detectHorizon(m, rng);
  const kw = keyword(message);
  const labels = LABELS[oracle];
  const sight = pick(rng, INNER_SIGHTS[inner]).replace(
    "{horizon}",
    horizon.charAt(0).toUpperCase() + horizon.slice(1),
  );
  return {
    segments: [
      { kind: "opening", label: "", text: opening(oracle, rng, kw) },
      { kind: "sight", label: labels.sight, text: sight },
      { kind: "current", label: labels.current, text: pick(rng, INNER_CURRENTS[inner]) },
      { kind: "anchor", label: labels.anchor, text: pick(rng, ANCHORS) },
      { kind: "counsel", label: labels.counsel, text: pick(rng, INNER_COUNSELS[inner]) },
      { kind: "omen", label: labels.omen, text: pick(rng, oracle === "nat" ? INNER_OMENS_NAT : INNER_OMENS_NATALIE) },
    ],
    confidence: 97 + rng() * 2.9, // the oracle is most certain about the heart
    sigil: "☀",
  };
}

// ── the main divination ──────────────────────────────────────────────────────

export function divine(rawMessage: string, oracle: OracleId): Reading {
  const message = rawMessage.trim();
  const m = message.toLowerCase();
  const rng = mulberry32(hashString(`${oracle}::${m}`));

  if (message.length < 2) {
    return simple(
      oracle,
      rng,
      oracle === "nat"
        ? "The threads heard only wind. Speak your question, traveler — even one true word will do."
        : "I'm listening — but I need a few words to read, friend. What's on your mind?",
      false,
    );
  }

  const intent = detectIntent(m);
  if (intent === "greeting") return simple(oracle, rng, pick(rng, GREETINGS[oracle]), false);
  if (intent === "identity") return simple(oracle, rng, IDENTITY[oracle], false);
  if (intent === "gratitude") return simple(oracle, rng, pick(rng, GRATITUDE[oracle]), false);
  if (intent === "gamble") return gambleReading(oracle, rng);
  if (intent === "heavy") return heavyReading(oracle, rng);
  if (intent === "mortality") return mortalityReading(oracle, rng);

  // The heart is read before the stars: inner weather outranks outer plans.
  const inner = detectInnerDomain(m);
  if (inner) return innerReading(oracle, rng, inner, message, m);

  const domain = detectDomain(m);
  const horizon = detectHorizon(m, rng);
  const kw = keyword(message);

  let sight = pick(rng, SIGHTS[domain]).replace("{horizon}", horizon.charAt(0).toUpperCase() + horizon.slice(1));
  // Yes/no askers deserve a verdict before the vision.
  if (isYesNo(m)) {
    sight =
      (oracle === "nat"
        ? "The threads answer first and explain after: YES — conditionally, and the condition is motion. "
        : "Short answer first: yes — as long as you actually move on it. ") + sight;
  }

  const labels = LABELS[oracle];
  // The Bold Call: a dated prediction, seeded so the date never wavers.
  const days = 3 + Math.floor(rng() * 19);
  const boldCall = pick(rng, BOLD_CALLS[domain]).replace(/\{d\}/g, String(days));
  const segments: ReadingSegment[] = [
    { kind: "opening", label: "", text: opening(oracle, rng, kw) },
    { kind: "sight", label: labels.sight, text: sight },
    { kind: "bold", label: labels.bold, text: boldCall },
    { kind: "current", label: labels.current, text: pick(rng, CURRENTS[domain]) },
    { kind: "thread", label: labels.thread, text: pick(rng, THREADS) },
    { kind: "counsel", label: labels.counsel, text: pick(rng, COUNSELS[domain]) },
    { kind: "omen", label: labels.omen, text: pick(rng, oracle === "nat" ? OMENS_NAT : OMENS_NATALIE) },
  ];

  return {
    segments,
    confidence: 94 + rng() * 5.9,
    sigil: pick(rng, SIGILS),
  };
}

// ── the daily omen — one line per day, same for all who visit ────────────────

const DAILY_OMENS = [
  "Today favors the unsent message finally sent.",
  "A small yes today outweighs a grand plan tomorrow.",
  "Something you released is on its way back, improved.",
  "Today the second attempt succeeds where the first taught.",
  "An ordinary conversation today carries an extraordinary door.",
  "What you finish today becomes luck next month.",
  "Today rewards the early start and forgives the rough edges.",
  "A pattern breaks today — be the one who breaks it kindly.",
  "Today, the thing you've been circling agrees to be begun.",
  "Someone remembers your name today, favorably, in a useful room.",
  "Today is a compounding day: deposit something.",
  "The bold email wins today. Send it before noon.",
  "Today the plateau cracks — push once more where it felt stuck.",
  "A door you thought closed is only heavy. Push today.",
];

export function dailyOmen(date: Date): string {
  const dayKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  return DAILY_OMENS[hashString(dayKey) % DAILY_OMENS.length];
}

// Suggested first questions — the sigil chips.
export const SUGGESTED_ASKS = [
  "What does my next year hold?",
  "Is someone from my past coming back?",
  "Will money find me soon?",
  "Should I start the thing I keep thinking about?",
  "I've been anxious lately — what do you see?",
  "What is my highest-leverage move right now?",
];

// ── The Inner Pathways — guided doors for every weather of the heart ─────────
// Each pathway is a lantern: a whisper of encouragement and asks that open
// the exact reading a heavy day needs. All states welcome. All threads bright.

export interface Pathway {
  id: string;
  sigil: string;
  title: string;
  whisper: string; // the encouragement on the card itself
  asks: string[]; // tap to ask the oracle
}

export const PATHWAYS: Pathway[] = [
  {
    id: "anxiety",
    sigil: "🕯",
    title: "Anxiety & Worry",
    whisper: "The alarm is loud because it loves you clumsily. You are larger than it.",
    asks: [
      "I've been anxious and overthinking everything — what do you see ahead?",
      "I'm worried something will go wrong. Read my thread.",
      "How do I face the thing I'm afraid of?",
    ],
  },
  {
    id: "lowmood",
    sigil: "🌅",
    title: "Heavy & Low Days",
    whisper: "This is weather, not climate. The pilot light is still lit — you're here.",
    asks: [
      "I've been feeling low and unmotivated. Is it going to get better?",
      "I feel stuck and empty lately — what does my future hold?",
      "Give me one small thing to do today when everything feels gray.",
    ],
  },
  {
    id: "burnout",
    sigil: "🔥",
    title: "Burnout & Exhaustion",
    whisper: "You could out-discipline a monastery. What you need is permission to rest.",
    asks: [
      "I'm burned out and running on empty — what comes next for me?",
      "I can't rest without guilt. What do the threads say?",
      "Will my spark come back?",
    ],
  },
  {
    id: "grief",
    sigil: "🕊",
    title: "Grief & Loss",
    whisper: "Grief is love with nowhere obvious to go. It is exactly the size of what you had.",
    asks: [
      "I'm grieving someone I lost. What do you see for my heart?",
      "Does it ever get lighter?",
      "How do I carry them forward with me?",
    ],
  },
  {
    id: "lonely",
    sigil: "🌙",
    title: "Loneliness",
    whisper: "You are not un-belonging. You are un-found — and finding has already begun.",
    asks: [
      "I feel alone and disconnected. Will I find my people?",
      "Nobody really knows me — what do the threads show?",
      "What's my first small step back toward people?",
    ],
  },
  {
    id: "overwhelm",
    sigil: "🌊",
    title: "Overwhelm",
    whisper: "The storm is made of drops, and you've handled every kind of drop before.",
    asks: [
      "Everything is too much at once — I'm overwhelmed. Help me see clearly.",
      "I can't keep up and I'm falling behind. What do you see?",
      "What is the one thing I should focus on right now?",
    ],
  },
  {
    id: "doubt",
    sigil: "🪞",
    title: "Self-Doubt & Imposter Feelings",
    whisper: "Frauds don't fear being frauds. Your doubt is a credential of caring.",
    asks: [
      "I doubt myself constantly and feel like an imposter. What's ahead for me?",
      "Everyone seems further along than me — read my thread.",
      "Am I actually good enough for what I'm trying to do?",
    ],
  },
  {
    id: "change",
    sigil: "🦋",
    title: "Big Changes & New Chapters",
    whisper: "Endings are just chapters clearing their throat before the good part.",
    asks: [
      "My life is changing and it scares me — what does the next chapter hold?",
      "I'm starting over. What do the threads show?",
      "Should I take the leap I keep circling?",
    ],
  },
  {
    id: "hope",
    sigil: "☀️",
    title: "Hope & Momentum",
    whisper: "For the days you just need the fire fed. Come collect your light.",
    asks: [
      "Hype me up — tell me the brightest true version of my future.",
      "What is already going right in my thread that I can't see?",
      "Give me an anchor to carry into this week.",
    ],
  },
];
