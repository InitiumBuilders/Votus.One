import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://Votus.One";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/introducing`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/motus`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/ethos`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/allrise`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/prompthero`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/start`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/votus-units`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/account/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  // Dynamic unit pages
  let unitPages: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${base}/api/units`, { next: { revalidate: 3600 } });
    const data = await res.json();
    if (data.units) {
      unitPages = data.units
        .filter((u: { slug?: string }) => u.slug)
        .map((u: { slug: string; created: string }) => ({
          url: `${base}/u/${u.slug}`,
          lastModified: new Date(u.created),
          changeFrequency: "weekly" as const,
          priority: 0.7,
        }));
    }
  } catch { /* fallback: no unit pages in sitemap */ }

  return [...staticPages, ...unitPages];
}
