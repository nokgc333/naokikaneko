import type { MetadataRoute } from "next";
import { getEntries } from "@/lib/content";

const baseUrl = "https://naokikaneko.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/blog`, changeFrequency: "weekly", priority: 0.7 },
  ];

  const workRoutes: MetadataRoute.Sitemap = getEntries("work").map((entry) => ({
    url: `${baseUrl}/work/${entry.slug}`,
    lastModified: entry.date,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const blogRoutes: MetadataRoute.Sitemap = getEntries("blog").map((entry) => ({
    url: `${baseUrl}/blog/${entry.slug}`,
    lastModified: entry.date,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...workRoutes, ...blogRoutes];
}
