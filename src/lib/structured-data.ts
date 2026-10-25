import { SITE_URL } from "@/lib/site";
import type { ContentEntry } from "@/lib/schemas/content";

const AUTHOR_NAME = "Naoki Kaneko";
const GITHUB_URL = "https://github.com/nokgc333";

type JsonLd = Record<string, unknown>;

function absoluteUrl(pathOrUrl: string): string {
  return new URL(pathOrUrl, SITE_URL).toString();
}

function authorReference(): JsonLd {
  return { "@type": "Person", name: AUTHOR_NAME, url: SITE_URL };
}

export function buildWebSiteJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "naokikaneko.com",
    url: SITE_URL,
    inLanguage: "ja",
    author: authorReference(),
  };
}

export function buildPersonJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: AUTHOR_NAME,
    url: SITE_URL,
    sameAs: [GITHUB_URL],
  };
}

export function buildBlogPostingJsonLd(entry: ContentEntry): JsonLd {
  const url = absoluteUrl(`/blog/${entry.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: entry.title,
    description: entry.description,
    datePublished: entry.date,
    dateModified: entry.updatedDate,
    url,
    mainEntityOfPage: url,
    image: absoluteUrl(`/blog/${entry.slug}/opengraph-image`),
    inLanguage: "ja",
    author: authorReference(),
    ...(entry.tags.length > 0 ? { keywords: entry.tags.join(", ") } : {}),
  };
}

export function buildCreativeWorkJsonLd(entry: ContentEntry): JsonLd {
  const url = absoluteUrl(`/work/${entry.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: entry.title,
    description: entry.description,
    dateCreated: entry.date,
    dateModified: entry.updatedDate,
    url,
    image: absoluteUrl(`/work/${entry.slug}/opengraph-image`),
    inLanguage: "ja",
    author: authorReference(),
    ...(entry.tags.length > 0 ? { keywords: entry.tags.join(", ") } : {}),
    ...(entry.url ? { sameAs: entry.url } : {}),
  };
}

export function serializeJsonLd(data: JsonLd): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}
