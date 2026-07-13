import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://Votus.One";
  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/nat-future-insight`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/skill.md`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/initium.md`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.6 },
  ];
}
