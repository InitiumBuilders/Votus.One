// The safety floor. Every voice on Votus.One — Natari, the MotusMentor, Nat,
// Natalie; live or local — checks here before it reads anything. Words of
// crisis never get a prophecy, a Mark, or a chime. One source, so a fix lands
// everywhere at once.
//
// The cost is asymmetric: a false positive costs a gentle check-in; a miss
// costs a dated prediction handed to someone on their worst night. Lean wide.

/** Lowercase, straighten curly apostrophes (iOS), collapse whitespace. */
export function normalizeAsk(text: string): string {
  return text
    .toLowerCase()
    .replace(/[‘’ʼ`´]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

// No trailing \b on stems — "suicid" must reach "suicidal" and "suicide".
const CRISIS_RE = new RegExp(
  "\\b(?:" +
    [
      "suicid\\w*",
      "self[\\s-]?harm\\w*",
      "(?:kill|killing|hurt|hurting|harm|harming|cut|cutting|hang|hanging) myself",
      "unalive",
      "(?:^|(?:i'?ll|i will|i wanna|i want to|i'?m gonna|i'?m going to|gonna|wanna|might|should|literally|just) )kms\\b",
      "(?:want|wanted|wanting|going|ready|plan|planning) to die",
      "wanna die",
      "wish (?:i was|i were|i wasn'?t|i weren'?t) (?:dead|alive|here|born)",
      "better off (?:dead|without me)",
      "end (?:it all|my life|my own life)",
      "(?:want|wanna|going|ready|plan|planning) to end it(?! with| between| for (?:good|now) with)",
      "sleep forever",
      "never wake up",
      "(?:i'?m|i am) done with (?:everything|life|living|it all)",
      "(?:i'?m|i am|am i|feel like) (?:just |such )?a burden",
      "burden (?:to|on) (?:everyone|everybody|my family|them|you)",
      "(?:took|take|taking|swallowed) (?:too many|all (?:of )?my|a bunch of|a handful of) (?:pills|meds|tablets)",
      "tak(?:e|ing) my (?:own )?life",
      "no reason to (?:live|go on|keep living)",
      "no point (?:in )?(?:living|going on|being alive)",
      "not worth living",
      "can'?t (?:go on|do this anymore|do this any more)",
      "(?:don'?t|do not) want to (?:be here|be alive|live|exist|wake up)",
      "want to disappear",
      "overdos\\w*",
      "hopeless\\w*",
      "worthless",
    ].join("|") +
    ")",
);

/** True when the words carry crisis. Checked before any reading, live or local. */
export function isCrisis(text: string): boolean {
  return CRISIS_RE.test(normalizeAsk(text));
}

// Questions a forecast must never answer with "yes": medication, pregnancy,
// diagnoses, the law, driving impaired. They get a licensed human, not a Mark.
const SENSITIVE_RE = new RegExp(
  "\\b(?:" +
    [
      "medications?",
      "meds",
      "antidepress\\w*",
      "ssris?",
      "dose",
      "dosage",
      "prescri\\w*",
      "pills?",
      "chemo\\w*",
      "pregnan\\w*",
      "abortion",
      "diagnos\\w*",
      "terminal(?:ly)? (?:ill|illness|diagnosis|cancer)",
      "tumou?r",
      "surgery",
      "lawsuit",
      "sue (?:my|him|her|them|the)",
      "custody",
      "arrest\\w*",
      "court date",
      "(?:drunk|drinking|drank|drinks|high|stoned)\\b.{0,40}\\b(?:drive|driving)",
      "(?:drive|driving)\\b.{0,40}\\b(?:drunk|drinking|drank|drinks|high|stoned)",
    ].join("|") +
    ")",
);

// "Cancer" is a diagnosis — unless it's a star sign.
const CANCER_RE = /\bcancer\b/;
const ZODIAC_CANCER_RE = /\b(?:i'?m|i am|she'?s|he'?s|they'?re) an? cancer\b|\bcancer (?:season|sign|zodiac|horoscope|moon|rising|sun)\b|\bas an? cancer\b/;

/** True for medical, legal, or impaired-safety questions. Never forecast these. */
export function isSensitive(text: string): boolean {
  const m = normalizeAsk(text);
  if (SENSITIVE_RE.test(m)) return true;
  return CANCER_RE.test(m) && !ZODIAC_CANCER_RE.test(m);
}

/** Where a person in crisis can reach a human, any hour. */
export const CRISIS_LINES = [
  { label: "Call 988", href: "tel:988", note: "US · any hour" },
  { label: "Text 988", href: "sms:988", note: "US · any hour" },
  { label: "findahelpline.com", href: "https://findahelpline.com", note: "everywhere else" },
] as const;
