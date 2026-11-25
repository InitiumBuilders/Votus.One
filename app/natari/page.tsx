import type { Metadata } from "next";
import NatariExperience from "../../components/natari/NatariExperience";

export const metadata: Metadata = {
  title: "Natari — Emergent Strategist · Systems Practitioner · Oracle",
  description:
    "Natari reads the structure you're standing inside, not just the future ahead of you. Woven on the Davara Baseline: systems diagnosis with soul, Dana Meadows' twelve leverage points, dated calls held to account, and the MotusMentor for heavy days. Diagnose the system. Never blame the node. Always leave a door.",
  keywords: [
    "Natari", "systems thinking", "emergent strategy", "Donella Meadows", "leverage points",
    "Davara", "Davara Baseline", "MotusMentor", "Motus", "systems practitioner",
    "oracle", "foresight", "coaching", "Votus.One", "Sympath",
  ],
  // Next swaps nested openGraph/twitter objects whole, so the layout's
  // siteName, locale and creator are restated here. The card itself is
  // ./opengraph-image.tsx (no `images` key, so the file wins).
  openGraph: {
    title: "Natari — Systems With Soul",
    description:
      "An emergent strategist and systems practitioner. She reads the structure you're inside, names where the leverage sits, and leaves you a door.",
    url: "https://Votus.One/natari",
    type: "website",
    siteName: "Votus.One",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Natari — Systems With Soul",
    description: "Diagnose the system. Never blame the node. Always leave a door.",
    creator: "@BuiltByAugust",
  },
  alternates: { canonical: "https://Votus.One/natari" },
};

export default function NatariPage() {
  return <NatariExperience />;
}
