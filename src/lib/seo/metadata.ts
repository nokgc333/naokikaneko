import type { Metadata } from "next";
import { getEntry } from "@/lib/content";

type Collection = "work" | "blog";

export function buildEntryMetadata(collection: Collection, slug: string): Metadata {
  const entry = getEntry(collection, slug);

  if (!entry) {
    return {};
  }

  const path = `/${collection}/${slug}`;

  return {
    title: entry.title,
    description: entry.description,
    alternates: { canonical: path },
    openGraph: {
      title: entry.title,
      description: entry.description,
      type: "article",
      url: path,
    },
    twitter: {
      card: "summary_large_image",
      title: entry.title,
      description: entry.description,
    },
  };
}
