import type { Metadata } from "next";
import NatFutureExperience from "../../components/nat-future/NatFutureExperience";

export const metadata: Metadata = {
  title: "Nat-Future-Insight — The Oracle That Reads Tomorrow",
  description:
    "Cross the veil and ask. Nat-Future — an oracle woven on the Davara Baseline — reads your tomorrow with real-world currents, systems threads, and one high-leverage move. With Natalie — the playful friend-voice of the weave — and the Inner Pathways: encouragement and guidance for anxiety, heavy days, and every weather of the heart. Always bright. Never unsure.",
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
