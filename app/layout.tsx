import type { Metadata } from "next";
import "./globals.css";
import EasterEggs from "@/components/EasterEggs";
import CyberHints from "@/components/CyberHints";

export const metadata: Metadata = {
  title: "Votus.One — Move As One",
  description: "Maybe the hero we were looking for has been all of us over time. Votus Units are teams who run together, govern together, and make democracy engaging, accessible, transparent, and human. ///AllRise///",
  metadataBase: new URL("https://Votus.One"),
  openGraph: {
    title: "Votus.One — Move As One",
    description: "The cure for apathy isn't louder leaders — it's a seat at the table.",
    url: "https://Votus.One",
    siteName: "Votus.One",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <EasterEggs />
        <CyberHints />
        {children}
      </body>
    </html>
  );
}
