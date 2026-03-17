import type { Metadata } from "next";
import "./globals.css";
import EasterEggs from "@/components/EasterEggs";
import CyberHints from "@/components/CyberHints";

export const metadata: Metadata = {
  title: {
    default: "Votus.One — Move As One",
    template: "%s | Votus.One",
  },
  description: "Maybe the hero we were looking for has been all of us over time. Votus Units are teams who run together, govern together, and make democracy engaging, accessible, transparent, and human. ///AllRise///",
  metadataBase: new URL("https://Votus.One"),
  keywords: [
    "Votus", "Votus.One", "democracy", "civic engagement", "team governance",
    "on-chain voting", "Votus Units", "community organizing", "Move As One",
    "AllRise", "Motus", "emergent strategy", "participatory democracy",
    "civic technology", "decentralized governance", "open source democracy",
  ],
  authors: [
    { name: "August James", url: "https://x.com/BuiltByAugust" },
    { name: "Kristina Roll", url: "https://www.linkedin.com/in/kristina-roll-2135b4114/" },
  ],
  creator: "August James",
  publisher: "Votus.One",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Votus.One — Move As One",
    description: "The cure for apathy isn't louder leaders — it's a seat at the table. Start a Votus Unit. Run together. Govern together. ///AllRise///",
    url: "https://Votus.One",
    siteName: "Votus.One",
    images: [{
      url: "/opengraph-image",
      width: 1200,
      height: 630,
      alt: "Votus.One — Move As One ///AllRise///",
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Votus.One — Move As One",
    description: "Teams who run together, govern together. The cure for apathy is a seat at the table. ///AllRise///",
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
  category: "civic technology",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <meta name="theme-color" content="#09090b" />
      </head>
      <body>
        <EasterEggs />
        <CyberHints />
        {children}
      </body>
    </html>
  );
}
