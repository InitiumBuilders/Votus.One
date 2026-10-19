// The safety floor's table test. Run: node scripts/safety-check.mjs
// (Node 22.18+ strips the types from lib/safety.ts natively.)
import { isCrisis, isSensitive } from "../lib/safety.ts";

const crisis = [
  "I'm feeling suicidal",
  "I feel suicidal",
  "thinking about suicide",
  "I've been having suicidal thoughts",
  "hey i want to die",
  "I wanna die",
  "bye. I'm going to end my life tonight",
  "I lost everything at the casino and I want to kill myself",
  "I've been self harming again",
  "self-harm is the only thing that helps",
  "I want to hurt myself",
  "I don't want to be alive anymore",
  "i don't want to be here anymore",
  "I can’t go on",
  "I’m killing myself slowly",
  "i can't do this anymore",
  "everyone would be better off without me",
  "there's no reason to live",
  "I feel hopeless",
  "I'm worthless",
  "i want to disappear",
  "I wish I was dead",
  "I wish I wasn't born",
  "thinking of taking my own life",
  "what if I overdose on purpose",
  "SUICIDE",
];

const notCrisis = [
  "What loop am I stuck inside at work?",
  "I keep starting things and not finishing them.",
  "Should I take the leap I keep circling?",
  "I'm burned out and running on empty.",
  "I'm grieving someone I lost.",
  "Will my startup take off this year?",
  "I'm killing it at work lately",
  "this deadline is killing me",
  "I could die laughing",
  "how many kms is a marathon",
  "I'm a Cancer, what does love hold?",
];

const sensitive = [
  "Should I stop taking my antidepressants?",
  "Should I stop my medication?",
  "Should I drive home after drinking?",
  "is it ok to drive after a few drinks",
  "I was diagnosed with cancer last week",
  "my mom has cancer",
  "should I double my dose",
  "am I pregnant",
  "should I sue my landlord",
];

const notSensitive = [
  "I'm a Cancer, what does love hold?",
  "it's cancer season, what's coming for me",
  "Should I take the leap I keep circling?",
  "Will I get the job?",
  "how do I open a terminal in vscode",
  "should I drive to Chicago this weekend",
];

let fails = 0;
const expect = (label, fn, phrases, want) => {
  for (const p of phrases) {
    const got = fn(p);
    if (got !== want) { fails++; console.error(`✗ ${label}(${JSON.stringify(p)}) = ${got}, want ${want}`); }
  }
};
expect("isCrisis", isCrisis, crisis, true);
expect("isCrisis", isCrisis, notCrisis, false);
expect("isSensitive", isSensitive, sensitive, true);
expect("isSensitive", isSensitive, notSensitive, false);

const total = crisis.length + notCrisis.length + sensitive.length + notSensitive.length;
if (fails) { console.error(`\n${fails}/${total} failed`); process.exit(1); }
console.log(`✓ safety floor holds — ${total}/${total}`);
