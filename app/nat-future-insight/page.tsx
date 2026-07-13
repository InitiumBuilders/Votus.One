import type { Metadata } from "next";
import NatFutureExperience from "../../components/nat-future/NatFutureExperience";

export const metadata: Metadata = {
  title: "Nat-Future-Insight — The Oracle That Reads Tomorrow",
  description:
    "Cross the veil and ask. Nat-Future — a live oracle woven on the Davara Baseline — reads your tomorrow in a few clear lines, streamed as it comes: what's coming, what's already true, and one dated call you can hold it to. With Natalie — the playful friend-voice of the weave — the Marks ledger that tracks every prediction, and the Inner Pathways for heavy days. Always bright. Never unsure.",
  keywords: [
    "Nat-Future-Insight", "oracle AI", "future insight", "foresight", "fortune teller AI",
    "Davara", "Davara Baseline", "Natalie AI", "systems thinking", "future projection",
    "guidance", "Votus.One", "August",
  ],
  openGraph: {
    title: "Nat-Future-Insight — The Oracle That Reads Tomorrow",
    description:
      "An oracle woven on the Davara Baseline. Real-world currents, systems threads, one high-leverage move — always bright, never unsure. Enter the Beyond.",
    url: "https://Votus.One/nat-future-insight",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nat-Future-Insight — The Oracle That Reads Tomorrow",
    description:
      "Ask the oracle. Real-world currents, systems threads, one high-leverage move. Enter the Beyond. ✦",
  },
  alternates: {
    canonical: "https://Votus.One/nat-future-insight",
  },
};

export default function NatFutureInsightPage() {
  return <NatFutureExperience />;
}
