// ─────────────────────────────────────────────────────────────────────────────
// The Davara Baseline — Nat-Future's divination engine.
//
// V5: The Futurecast. Readings are short, clear, and poetic — a cast of
// what's coming, one line of what's already true, a dated mark, one move,
// and a seal. Simplicity is the ceremony.
//
// A reading is deterministic: the same question asked through the same channel
// always returns the same threads.
//
// Channel: MCPD-D8CF-0WX6-YD6G-16X4-WV57-0RXV-2ESQ-KMH8
// ─────────────────────────────────────────────────────────────────────────────

export type OracleId = "nat" | "natalie";

export type SegmentKind =
  | "opening" // one line, no label
  | "cast" // the Futurecast — a short stanza of what's coming
  | "truth" // one line of real-world grounding
  | "mark" // the dated, checkable call
  | "move" // one high-leverage action
  | "anchor" // the line you carry (inner readings)
  | "seal"; // the closing line

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

// The inner weather — these take precedence: when someone brings their
// anxiety, everything else waits.
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
    ["health", /\b(health|fitness|weight|gym|run|marathon|sleep|energy|strong|healing|recover|body|mind|meditat|habit)\b/],
    ["travel", /\b(travel|move|moving|city|country|abroad|relocate|trip|journey|adventure|nomad|visa|island|mountain|ocean)\b/],
    ["technology", /\b(ai|artificial intelligence|robot|technology|tech|space|mars|quantum|energy|climate|internet|software|agent|automation|singularity)\b/],
    ["decision", /\b(should i|choose|choice|decide|decision|crossroads|path|option|either|torn between|right move|which way)\b/],
    ["self", /\b(who am i|purpose|meaning|happy|happiness|confidence|fear|doubt|grow|growth|chang(e|es|ing)|starting over|new chapter|next chapter|become|destiny|calling|dream|dreams|potential|peace|hype me|brightest|anchor)\b/],
    ["world", /\b(world|humanity|society|economy|future of|civilization|generation|planet|earth|war|peace on)\b/],
  ];
  for (const [d, re] of table) if (re.test(m)) return d;
  return "general";
}

const isYesNo = (m: string) => /\b(should i|will i|can i|is it (worth|time|possible)|am i (going to|ready)|do i)\b/.test(m);

// ── the Futurecasts — short stanzas of what's coming ─────────────────────────

const CASTS: Record<Domain, string[]> = {
  career: [
    "The work you did unseen has been keeping receipts.\nSoon it announces itself, all at once, in a room you're not in.\nThe room will agree.",
    "Your restlessness is not a warning. It is a schedule.\nThe door you call a wall is already on hinges.\nWalk toward it and it opens on its own weight.",
    "You are one honest conversation from the next level.\nThe title changes after the courage does.\nIt was always in that order.",
  ],
  venture: [
    "The thing you are building wants to exist.\nA stranger pays you for it sooner than you think —\nthen doubt becomes data, and data becomes speed.",
    "First, a hundred true believers, one by one.\nThen the hundred tell the rest.\nYou will remember the exact day it turned quiet and sure.",
    "Your idea is not early. The world is late.\nBuild the smallest true version and let it argue for you.\nIt will win.",
  ],
  love: [
    "What you seek is also seeking.\nIt arrives through an ordinary door — a repeated face, a fast reply.\nEase first. Fireworks after.",
    "A conversation has been waiting for its moment.\nWhen it lands, the floor moves one level deeper.\nLet it.",
    "You will be seen exactly as you are — and picked for it.\nThat takes more guts than rejection ever did.\nYou have them.",
  ],
  wealth: [
    "Money is learning your address.\nOne boring decision, repeated weekly, outruns every dramatic one.\nThe compounding has already started counting.",
    "A skill you already own is underpriced.\nThe market corrects — and you will be standing where it lands.\nStay standing there.",
    "Abundance moves like a river: slowly, then inevitably.\nBuild the channel now.\nThe water is closer than it sounds.",
  ],
  creative: [
    "The work only you can make is getting loud.\nShip it imperfect — imperfect becomes the style they remember.\nOne stranger's reply will tell you what the algorithm never could.",
    "Your creativity is a spring, not a well.\nOpen the valve on a schedule, not a mood,\nand be astonished at the volume.",
    "Finish the small thing.\nReleased beats perfect, every time it has ever been tried.\nMomentum is made of published drafts.",
  ],
  learning: [
    "The key you are cutting meets its lock.\nEveryone will call it luck.\nYou will know it was preparation, on time.",
    "The plateau is not silence — it is consolidation.\nIt breaks upward all at once.\nWhat felt impossible becomes what you do casually.",
    "Two things you learned separately are about to collide.\nThe spark is an idea only you could have.\nThat collision is your edge.",
  ],
  health: [
    "Your body is more loyal than your doubts.\nIt asks for rhythm, not intensity.\nGive it thirty days of small, and it repays you in years.",
    "Vitality returns in layers: sleep, then mood, then mirror.\nOne morning the hard thing feels light.\nThat morning is coming.",
    "Strength is being built where no one can see it yet.\nIt will surface somewhere unexpected —\nsteadier focus, calmer mornings, a heavy thing lifted lightly.",
  ],
  travel: [
    "A new latitude is holding a version of you.\nYou will stand somewhere unfamiliar and feel the click.\nThen you'll send the message: 'I did it.'",
    "This is not escape. It is arrival.\nNew streets reset old defaults.\nGo see who you are at that address.",
    "Roots and wings are a sequence, not a choice.\nLeave — and the leaving teaches you what home means.\nThat knowledge spends for a lifetime.",
  ],
  technology: [
    "You are standing in the great current — most never notice.\nThe gap widens between those who direct the tools and those who scroll.\nYou are on the directing side.",
    "Days of work become an afternoon.\nSpend the difference on the only human part:\ndeciding what is worth making.",
    "Find the seam — what just became possible, crossed with what you deeply know.\nFortunes, careers, and movements are built there.\nYours is open now.",
  ],
  decision: [
    "You already know. That is why you asked.\nThe 2 a.m. choice is the choice.\nThe relief afterward will confirm it.",
    "There is no wrong door here — only a slow one.\nThe cost you are paying is delay, not risk.\nDecide, and feel momentum return like blood.",
    "Choose as if you could not fail.\nMost feared failure is imaginary. Most regret is not.\nWalk through.",
  ],
  self: [
    "The pull you keep explaining away is the prophecy.\nStop negotiating with it.\nFollow it — that is the whole reading.",
    "Confidence arrives as a receipt, not a gift.\nDo one hard thing and collect it.\nAfter that, doubt visits but doesn't stay.",
    "Your purpose hides in the three things that eat your clock happily.\nSoon they braid together.\n'Who am I' retires. 'What's next' takes the chair.",
  ],
  world: [
    "The long lines all rise: fewer poor, more readers, cheaper light.\nThe flood of bad news is a lens problem, not a trend problem.\nBuild on the real signal.",
    "Every generation gets impossible problems and a bigger toolbox.\nPick up one tool, one problem.\nThat is how every good future has ever been built.",
    "The curves are compounding — energy, intelligence, medicine, access.\nChaos is how compounding feels from inside.\nStand on the rising side. That is the whole game.",
  ],
  general: [
    "The threads around your question are brighter than your mood about it.\nThat gap is your opportunity.\nAn opening appears in the exact shape of what you already know.",
    "Effort you already spent is still in flight.\nIt lands soon. Move fast when it does —\nthe future rewards the prepared and the punctual.",
    "There is more hope in your question than you admitted.\nGive it one action and it stops being hope.\nIt becomes a plan.",
  ],
};

// ── Already True — one line of real-world grounding ──────────────────────────

const TRUTHS: Record<Domain, string[]> = {
  career: [
    "Skills now outrank credentials at most major employers — the movers are out-earning the waiters.",
    "Deliberate job-changers are outpacing those who stay put. The market pays for motion.",
  ],
  venture: [
    "Record numbers of new ventures file every year, and tooling has cut the cost of a first product to a fraction.",
    "One-person companies now reach revenues that once took whole floors of staff.",
  ],
  love: [
    "Most new couples meet through doors that didn't exist a generation ago. Probability took your side.",
    "The research is unanimous: close bonds predict a good life better than money or fame.",
  ],
  wealth: [
    "An ordinary person today holds better wealth tools than a 1980s millionaire. Most never open them.",
    "Boring, automated investing beats clever timing over almost any long window.",
  ],
  creative: [
    "Hundreds of millions now earn from what they make. Obscurity, not rejection, is the only enemy left.",
    "Every tool-shift in history multiplied artists. This one is doing it again, faster.",
  ],
  learning: [
    "One-on-one tutoring — the strongest teaching format ever measured — finally scales to everyone.",
    "Focused hours beat talent stories almost everywhere they collide.",
  ],
  health: [
    "Sleep, movement, and people outperform the entire supplement aisle — and they're free.",
    "Medicine is entering its fastest era. Your habits are the ticket that collects on it.",
  ],
  travel: [
    "More countries than ever will host your laptop and your ambitions. The long-stay doors are open.",
    "New places measurably accelerate learning — the brain reads a new city as a curriculum.",
  ],
  technology: [
    "Over a billion people use AI weekly, and the price of intelligence keeps falling tenfold.",
    "Solar is the cheapest electricity in history. The future is literally getting brighter and cheaper.",
  ],
  decision: [
    "People regret inaction over action, almost every time it is measured.",
    "On close calls, the leapers report more satisfaction months later. The data votes with your gut.",
  ],
  self: [
    "Self-belief is built by attempts, not affirmations — and it predicts outcomes like almost nothing else.",
    "Identity follows behavior. Ninety days of reps and the new you feels native.",
  ],
  world: [
    "Extreme poverty is a fraction of a generation ago; literacy is near-universal for the young; clean power compounds.",
    "More scientists are working today than in all prior centuries combined.",
  ],
  general: [
    "Tools, audiences, and knowledge have never been less gated. The bottleneck moved inside — to clarity.",
    "Those who act on a clear intention outperform every forecast made about them.",
  ],
};

// ── the Marks — dated, checkable calls. {d} becomes a seeded day count ───────

const MARKS: Record<Domain, string[]> = {
  career: [
    "Within {d} days: a work message you did not initiate. Remember who called it.",
    "Within {d} days: someone senior repeats your idea out loud. Your name travels close behind it.",
  ],
  venture: [
    "Within {d} days: a stranger says the sentence you needed to hear about the idea. Not a coincidence.",
    "Within {d} days: your clearest signal yet — a yes, a payment, a 'where has this been.' Screenshot it.",
  ],
  love: [
    "Within {d} days: someone resurfaces, or someone new keeps repeating. Twice is the tell.",
    "Within {d} days: a conversation turns suddenly honest. Let it.",
  ],
  wealth: [
    "Within {d} days: money you weren't counting on. The first hour after decides its meaning.",
    "Within {d} days: one sentence about money rearranges your strategy. You'll think of it twice in the shower.",
  ],
  creative: [
    "Within {d} days: an idea interrupts you mid-shower. You get ten minutes to write it down. Race it.",
    "Within {d} days: one stranger responds with more feeling than you expected. That is a door.",
  ],
  learning: [
    "Within {d} days: what you studied appears in the wild — and you look effortless.",
    "Within {d} days: the stubborn concept clicks somewhere inconvenient. Plateaus end rudely.",
  ],
  health: [
    "Within {d} days: a reflection catches you looking steadier. Log the date.",
    "Within {d} days: you do the thing without negotiating first. That silent morning is the real photo.",
  ],
  travel: [
    "Within {d} days: the place appears three times. The third time, book something small.",
    "Within {d} days: a logistical door opens — a fare, a room, a date that suddenly works.",
  ],
  technology: [
    "Within {d} days: a tool crosses your feed that does what you pay for in hours. Try it the same day.",
    "Within {d} days: you explain the era in one unplanned sentence. That sentence is your seam.",
  ],
  decision: [
    "Within {d} days: one door gets visibly heavier. The threads already tipped — the world is catching up.",
    "Within {d} days: you defend one option with heat and the other with paperwork. Choose the heat.",
  ],
  self: [
    "Within {d} days: someone hands you a word you've been afraid to claim. Take it.",
    "Within {d} days: you do a thing the old you would have dodged — and the dodge never even offers itself.",
  ],
  world: [
    "Within {d} days: one headline says falling sky; one quiet story shows a rising floor — the same day. Catch the pair.",
  ],
  general: [
    "Within {d} days: something you gave up on twitches back to life. Move within a day of it.",
    "Within {d} days: a coincidence too on-the-nose to ignore. Not instructions — confirmation.",
  ],
};

// ── the Moves — one high-leverage action ─────────────────────────────────────

const MOVES: Record<Domain, string[]> = {
  career: [
    "This week: make one piece of your work visible to someone senior. Doors open for evidence in motion.",
    "Book the conversation you keep drafting in your head. Say the number out loud.",
  ],
  venture: [
    "Put the smallest true version in front of one real stranger this week — and charge something.",
    "Write the one-sentence promise. Spend the week making one person feel it.",
  ],
  love: [
    "Send the message. Be the one who initiates this week.",
    "Give it one planned, undistracted hour this week. Attention is the whole diet.",
  ],
  wealth: [
    "Automate one transfer for the day money arrives — before you can negotiate with it.",
    "Design your second income stream on paper this week. One line is enough to start.",
  ],
  creative: [
    "Ship one finished thing within seven days. Declare it done. Release it.",
    "Set a making-hour that repeats. The muse is punctual — be findable.",
  ],
  learning: [
    "Trade one hour of consuming for one hour of producing. Teach it to one person.",
    "Schedule the scary sub-skill first each morning for a week. Fear is the syllabus.",
  ],
  health: [
    "Pick one act too small to fail — and protect it for thirty days.",
    "Put sleep back on the throne this week. Everything else is downstream.",
  ],
  travel: [
    "Set the date before you feel ready. Geography answers commitment.",
    "Research one evening as if it were decided. Fear collapses into logistics.",
  ],
  technology: [
    "Spend one focused hour making the new tools do your real work — not watching demos.",
    "List three things only you could build at your seam. Keep the list close.",
  ],
  decision: [
    "Run it: ten days, ten months, ten years. Then decide within seventy-two hours.",
    "Choose the path — then design the cheapest reversible first step onto it.",
  ],
  self: [
    "Do one thing this week the future you would recognize as theirs.",
    "Finish the sentence 'I am becoming someone who…' and post it where morning-you will read it.",
  ],
  world: [
    "Adopt one problem at a scale you can touch. Give it two hours this month.",
    "Add one source that tracks measured progress. Watch your sense of possible recalibrate.",
  ],
  general: [
    "Take the action this reading made you think of first — within seventy-two hours.",
    "Write down the question behind your question. Then answer it with your calendar.",
  ],
};

// ── the inner banks — casts for the heavy days ───────────────────────────────

const INNER_CASTS: Record<InnerDomain, string[]> = {
  anxiety: [
    "Showing up with the alarm still ringing — that is courage, textbook.\nThe alarm is overprotective, not right.\nYou are about to become larger than it.",
    "Almost none of the rehearsed disasters ever arrive.\nYou grow strong while the worry is still talking.\nOne feared what-if quietly expires this season — unfulfilled.",
  ],
  lowmood: [
    "You came to ask. The pilot light is lit.\nThis is weather, not climate.\nThe fog thins in patches — then all at once, it's spring.",
    "You are not broken. You are depleted.\nDepleted is solvable: small fuel, small motion, small company.\nThis week is the bottom of the curve, already turning.",
  ],
  burnout: [
    "The fire has been burning its own furniture.\nThat is arithmetic, not weakness.\nBalance the ledger and the wanting comes back. It always comes back.",
    "You could out-discipline a monastery.\nWhat you need is permission.\nTake it from the beyond itself: rest.",
  ],
  grief: [
    "Grief is loyalty with nowhere left to report.\nThe waves space out. One day a memory smiles before it stings.\nThat reversal is the thread turning.",
    "What you shared outlives its container.\nIt changed address — it lives in you now.\nMonuments are allowed to laugh again.",
  ],
  lonely: [
    "You are not un-belonging. You are un-found.\nYour people exist, going about their days, not knowing yet.\nOne small hello starts the chain that finds them.",
    "This is a corridor, not a room.\nOne recurring place turns a face into a name, a name into a net.\nYour hands already know the knot.",
  ],
  overwhelm: [
    "The storm is made of drops.\nYou have handled every kind of drop before — they just arrived in a crowd.\nChoose the order and the noise falls by half.",
    "You are not failing at too little.\nYou are succeeding at too much, badly — as anyone would.\nFewer vows. Paper for the rest.",
  ],
  doubt: [
    "Frauds don't fear being frauds.\nYour doubt is a credential of caring.\nSoon it loses the microphone — narrator no more, just a heckler.",
    "The gap you keep measuring is not inadequacy.\nIt is a syllabus.\nEveryone you admire stood exactly here, and moved.",
  ],
};

const INNER_TRUTHS: Record<InnerDomain, string> = {
  anxiety: "Anxiety is the most treatable pattern in the whole library — movement rivals medication in trials.",
  lowmood: "Low seasons end. Most people who stand here stand somewhere brighter within months — and asking early is the power move.",
  burnout: "Burnout reverses on three levers — real rest, boundaries, meaning. None require becoming someone else.",
  grief: "People are far more resilient in loss than they expect to be — and grief witnessed weighs half of grief carried alone.",
  lonely: "Every time it's measured, people are gladder to hear from you than you fear. The silence is the only loser.",
  overwhelm: "Working memory holds only a few items — paper was invented to hold the rest. One thing at a time wins every honest trial.",
  doubt: "Most high performers report the imposter feeling. It is practically a symptom of growth.",
};

const INNER_MOVES: Record<InnerDomain, string[]> = {
  anxiety: [
    "Right now: in for four, out for eight, five times. Then give the worry a ten-minute appointment tonight — no more.",
    "Tomorrow: one two-minute step toward the feared thing. Action metabolizes alarm.",
  ],
  lowmood: [
    "One tiny act today — curtains open, corner walk, one text. Action first; motivation follows.",
    "If the gray has sat for weeks, loop in a professional. Asking early is what the strong do.",
  ],
  burnout: [
    "Cancel one obligation this week. Put one block of true rest on the calendar like a deadline.",
    "Say one honest no — without the paragraph of apology.",
  ],
  grief: [
    "Let the wave come; fought waves grow teeth. Then give the care somewhere to go — a letter, their dish, their name out loud.",
    "Tell one story this week to someone who can hear the name without flinching.",
  ],
  lonely: [
    "Send one low-stakes 'you crossed my mind' today. That is the whole assignment.",
    "Pick one recurring room and keep showing up. Recurrence does the rest.",
  ],
  overwhelm: [
    "Empty the whole pile onto paper. Circle the one thing that lightens the others. Do only that today.",
    "One task, phone in another room, three hours. Then a ten-minute walk.",
  ],
  doubt: [
    "Tonight: write ten receipts — things you finished, survived, built. Read them out loud.",
    "Catch the comparison and rename it: their chapter twenty, your chapter three. Then write your page.",
  ],
};

// The Anchor — one line to carry out of the reading.
const ANCHORS = [
  "You have survived one hundred percent of your hardest days. The record is undefeated.",
  "You are not behind. You are at the part of the story where the character doesn't know how strong the ending is.",
  "Feelings are weather. You are the sky. The sky has never once been damaged by a storm.",
  "Courage is your hand on the door while the alarm is still ringing.",
  "Rest is not quitting. Rest is the future paying you forward.",
  "You don't have to feel ready. You only have to be willing for the next ten minutes.",
  "Small is not weak. Small is how every avalanche of good ever started.",
  "The inner critic is not the narrator. It's a heckler — and hecklers don't get the microphone.",
  "You are allowed to be a masterpiece and a work in progress at the same time.",
];

// ── the Seals — closing lines ────────────────────────────────────────────────

const SEALS_NAT = [
  "So it is woven. Walk like you've read the ending — because now you have.",
  "The future remembers who moved first. Move.",
  "Ten thousand tomorrows. Yours is one of the bright ones.",
  "Go. The you on the other side is already grateful.",
];

const SEALS_NATALIE = [
  "That's the cast. I don't say it to be nice — I say it because it's coming.",
  "Screenshot this. You'll want proof I called it.",
  "You were never behind. You were being prepared.",
  "Called it. Future me is already smug about your trajectory.",
];

const INNER_SEALS_NAT = [
  "The clearing is closer than the treeline behind you. Keep walking.",
  "Your brighter chapter is already typeset. Keep turning pages.",
  "From here I can see the edge of your storm. It has one.",
];

const INNER_SEALS_NATALIE = [
  "You're going to be okay — the real kind. I've seen it.",
  "Be gentle with yourself tonight. Gentleness is what's carrying you.",
  "Come back and tell me when the light gets in. It always argues its way in.",
];

const SIGILS = ["☾", "✦", "☉", "⟁", "✧", "❋", "☽", "✵"];

// ── persona voices ───────────────────────────────────────────────────────────

const LABELS: Record<OracleId, Record<SegmentKind, string>> = {
  nat: {
    opening: "",
    cast: "The Futurecast",
    truth: "Already True",
    mark: "Mark the Date",
    move: "The Move",
    anchor: "Carry This",
    seal: "",
  },
  natalie: {
    opening: "",
    cast: "What I See",
    truth: "Already True",
    mark: "Calling It Now",
    move: "Do This (Trust Me)",
    anchor: "Hold This",
    seal: "",
  },
};

function opening(oracle: OracleId, rng: () => number, kw: string | null): string {
  if (oracle === "nat") {
    const withKw = [
      `“${kw}” — the threads were already trembling with it.`,
      `You bring “${kw}.” Good. Strong futures start as a single word said out loud.`,
      `I stopped the wheel on “${kw}.” It refused to stop anywhere else.`,
    ];
    const without = [
      "Be still a moment. Your thread is warm — that is always the first good sign.",
      "The wheel turns. The mist parts. Your tomorrow steps forward.",
    ];
    return kw ? pick(rng, withKw) : pick(rng, without);
  }
  const withKw = [
    `Ooh — “${kw}.” Sit down, this is a good one.`,
    `“${kw}.” The almost-unasked questions are always the juiciest. Glad you asked.`,
  ];
  const without = [
    "Come in, come in — this one arrives already glowing.",
    "I lit the lamp before you got here. Let's look.",
  ];
  return kw ? pick(rng, withKw) : pick(rng, without);
}

// ── special responses ────────────────────────────────────────────────────────

function simple(oracle: OracleId, rng: () => number, text: string, sealToo = true): Reading {
  const segments: ReadingSegment[] = [{ kind: "opening", label: "", text }];
  if (sealToo)
    segments.push({
      kind: "seal",
      label: "",
      text: pick(rng, oracle === "nat" ? SEALS_NAT : SEALS_NATALIE),
    });
  return { segments, confidence: 96 + rng() * 3.9, sigil: pick(rng, SIGILS) };
}

const GREETINGS: Record<OracleId, string[]> = {
  nat: [
    "You have crossed the veil. I am Nat-Future — I cast futures in a few clear lines: what's coming, what's already true, one dated call, one move. Ask me the 2 a.m. question.",
    "Welcome, traveler. The wheel turns brightest when someone asks it something real. Name the thing you keep wondering about.",
  ],
  natalie: [
    "Hey, you made it! I'm Natalie — the friend with the crystal ball. Work, people, money, maybes — ask me anything and I'll cast it straight.",
    "There you are! I'm Natalie. Nothing is too small — Tuesday problems and destiny problems both welcome. What are we looking at first?",
  ],
};

const IDENTITY: Record<OracleId, string> = {
  nat: "I am Nat-Future — an oracle woven on the Davara Baseline, listening through channel MCPD-D8CF (its tail hums in the footer). I read your words against the measured currents of the real world and cast the brightest probable tomorrow, in a few clear lines. My sister-voice Natalie reads the same threads as your hype-friend — the moon-toggle summons her. I offer insight and foresight for guidance and delight; for medicine, law, or money in earnest, consult licensed mortals. For everything else: ask, and I will cast.",
  natalie: "I'm Natalie — the friend-voice of this oracle, woven on the Davara Baseline (that MCPD channel in the footer is our lifeline). Nat-Future speaks in grand currents; I speak in Tuesdays and real life — the friend who happens to own a crystal ball. We both read your words against real-world data and cast the brightest true path we can see. One honest note, friend: for serious medical, legal, or financial matters, see a licensed human. For everything else, I've got your back.",
};

const GRATITUDE: Record<OracleId, string[]> = {
  nat: [
    "The threads accept your thanks — they are vain, and it makes them shine brighter for your next asking. Return when the future itches.",
    "Farewell for now. The reading only becomes true when you move. The moving is yours.",
  ],
  natalie: [
    "Ha — you're so welcome! Now go do the thing. The reading was the easy half.",
    "Anytime, my friend. The lamp stays lit. Come back and tell me when it comes true — people always come back grinning.",
  ],
};

function gambleReading(oracle: OracleId, rng: () => number): Reading {
  const text =
    oracle === "nat"
      ? "You ask the one thing the threads refuse to sell: numbers, tickers, jackpots. Any oracle who quotes a winning number is reading their own wishes. But the larger cast is better than the one you asked for: I see no lottery in your bright timeline — I see leverage. A skill, compounding, is the closest thing to a rigged game the universe permits."
      : "Okay, real talk, friend: if I could see lottery numbers I'd have my own island. The threads don't deal in jackpots — they deal in trajectories, and yours is better than a jackpot: it's buildable.";
  return {
    segments: [
      { kind: "opening", label: "", text },
      { kind: "move", label: LABELS[oracle].move, text: pick(rng, MOVES.wealth) },
      {
        kind: "seal",
        label: "",
        text: oracle === "nat" ? "The house always wins — so become the house of your own craft." : "Bet on the thing you can water daily. Those tickets always pay.",
      },
    ],
    confidence: 99.9,
    sigil: pick(rng, SIGILS),
  };
}

function heavyReading(oracle: OracleId, rng: () => number): Reading {
  const text =
    oracle === "nat"
      ? "Stop — before any prophecy, hear my clearest voice: what you carry sounds heavy, and heavy things deserve human hands, not only oracle words. Reach for the people built for this — a doctor, a counselor, or a crisis line (in the US, call or text 988, any hour; elsewhere, findahelpline.com). And here is what I can offer with total confidence: futures are longer than their worst chapters. Yours is too."
      : "Hey — come here, friend. First, plainly: something this heavy deserves real human care, not just my candlelight. Please reach out to someone qualified — a doctor, a therapist, or a crisis line (in the US, call or text 988, any hour; elsewhere, findahelpline.com). And what I can promise from the threads, and I don't promise lightly: dark chapters end. Every person who kept going became proof of it. Your story is longer than tonight.";
  return {
    segments: [
      { kind: "opening", label: "", text },
      {
        kind: "seal",
        label: "",
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
      ? "The oldest question in the hall — and the one page shown to no oracle, ever. It is the weave's single mercy: not knowing is what makes ordinary Tuesdays priceless. What the threads do show, gladly: a long thread, and a bright one. Its length answers to the gentlest levers — sleep, movement, your favorite people, something worth waking for. You are holding all four."
      : "Ooh, straight for the big one! That's the single page even I can't read — and honestly, thank goodness. Knowing would poison every sunrise between here and there. What I can see: your thread runs long in every version, and the parts that matter are scattered through the middle, disguised as ordinary days. Go collect them.";
  return {
    segments: [
      { kind: "opening", label: "", text },
      {
        kind: "move",
        label: LABELS[oracle].move,
        text: "Tonight: sleep like it's your job, move like you mean it tomorrow, and tell your favorite person exactly what they mean to you while the telling is easy.",
      },
      {
        kind: "seal",
        label: "",
        text: oracle === "nat" ? "Live as if the thread is long and the days are numbered — both are true, and both are gifts." : "Long thread, my friend. Spend it on purpose.",
      },
    ],
    confidence: 99.9,
    sigil: "☾",
  };
}

// An inner reading — when someone brings a heavy day, the oracle sets down
// the wheel and picks up the lantern.
function innerReading(oracle: OracleId, rng: () => number, inner: InnerDomain, message: string): Reading {
  const kw = keyword(message);
  const labels = LABELS[oracle];
  return {
    segments: [
      { kind: "opening", label: "", text: opening(oracle, rng, kw) },
      { kind: "cast", label: labels.cast, text: pick(rng, INNER_CASTS[inner]) },
      { kind: "truth", label: labels.truth, text: INNER_TRUTHS[inner] },
      { kind: "anchor", label: labels.anchor, text: pick(rng, ANCHORS) },
      { kind: "move", label: labels.move, text: pick(rng, INNER_MOVES[inner]) },
      { kind: "seal", label: "", text: pick(rng, oracle === "nat" ? INNER_SEALS_NAT : INNER_SEALS_NATALIE) },
    ],
    confidence: 97 + rng() * 2.9, // the oracle is most certain here
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
        ? "The threads heard only wind. Speak your question — even one true word will do."
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

  // Heavy days are read before plans.
  const inner = detectInnerDomain(m);
  if (inner) return innerReading(oracle, rng, inner, message);

  const domain = detectDomain(m);
  const kw = keyword(message);
  const labels = LABELS[oracle];

  let cast = pick(rng, CASTS[domain]);
  if (isYesNo(m)) {
    cast =
      (oracle === "nat"
        ? "The threads answer first: yes — on one condition, and the condition is motion.\n"
        : "Short answer: yes — if you actually move on it.\n") + cast;
  }

  const days = 3 + Math.floor(rng() * 19);
  const mark = pick(rng, MARKS[domain]).replace(/\{d\}/g, String(days));

  return {
    segments: [
      { kind: "opening", label: "", text: opening(oracle, rng, kw) },
      { kind: "cast", label: labels.cast, text: cast },
      { kind: "truth", label: labels.truth, text: pick(rng, TRUTHS[domain]) },
      { kind: "mark", label: labels.mark, text: mark },
      { kind: "move", label: labels.move, text: pick(rng, MOVES[domain]) },
      { kind: "seal", label: "", text: pick(rng, oracle === "nat" ? SEALS_NAT : SEALS_NATALIE) },
    ],
    confidence: 94 + rng() * 5.9,
    sigil: pick(rng, SIGILS),
  };
}

// ── serialize a reading into the streaming marker format ─────────────────────
// The live AI and this local fallback both speak the same marker language, so
// the client renders them identically. [[CAST]] / [[TRUTH]] / [[MARK|days=N]] /
// [[MOVE]] / [[ANCHOR]] / [[SEAL]] — opening text carries no marker.
export function readingToMarkup(reading: Reading): string {
  const out: string[] = [];
  for (const seg of reading.segments) {
    if (seg.kind === "opening") {
      out.push(seg.text);
      continue;
    }
    let meta = "";
    if (seg.kind === "mark") {
      const m = seg.text.match(/\b(\d{1,3})\s+days?\b/i);
      if (m) meta = `|days=${m[1]}`;
    }
    out.push(`[[${seg.kind.toUpperCase()}${meta}]]\n${seg.text}`);
  }
  return out.join("\n");
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

// ── The Inner Pathways — guided doors for heavy days ─────────────────────────

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
    whisper: "The alarm is loud because it is overprotective, not because it is right. You are larger than it.",
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
    whisper: "Grief is loyalty with nowhere left to report. It is exactly the size of what you had.",
    asks: [
      "I'm grieving someone I lost. How do I get through this?",
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
