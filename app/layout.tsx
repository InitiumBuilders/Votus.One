import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "PromptHero — The Universal Skill | Votus.One",
    template: "%s | Votus.One",
  },
  description: "Every prompt is a mirror. PromptHero teaches you to read it. A universal skill for any AI agent that studies how you prompt, coaches your growth one lesson at a time, and writes your evolution: Chapters, Badges, Prompt Promotions, EVOs. There Is Hope In The Hard Questions.",
  metadataBase: new URL("https://Votus.One"),
  keywords: [
    "PromptHero", "prompt engineering", "prompting skill", "AI coaching",
    "universal skill", "Claude skill", "prompt learning", "prompt education",
    "Votus", "Votus.One", "Motus Mentor", "August", "Davara", "prompt promotions",
    "EVOs", "learning journey", "reflection", "Fira", "inner fire",
  ],
  authors: [
    { name: "August James", url: "https://x.com/BuiltByAugust" },
  ],
  creator: "August James",
  publisher: "Votus.One",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "PromptHero — The Universal Skill",
    description: "Every prompt is a mirror. A universal skill for any AI agent that grows you into the author of better questions — with Chapters, Badges, Prompt Promotions, and EVOs. Copy it. Install it. Find Strength From Within.",
    url: "https://Votus.One",
    siteName: "Votus.One",
    images: [{
      url: "/opengraph-image",
      width: 1200,
      height: 630,
      alt: "PromptHero — Every prompt is a mirror. The Universal Skill by Votus.One",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "PromptHero — The Universal Skill",
    description: "Every prompt is a mirror. PromptHero teaches you to read it. There Is Hope In The Hard Questions.",
    creator: "@BuiltByAugust",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/icon.svg",
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: "https://Votus.One",
  },
  category: "education technology",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta name="theme-color" content="#09090b" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
