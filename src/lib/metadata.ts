import type { Metadata } from "next";
import { getEntry } from "@/lib/content";

type Collection = "work" | "blog";

export function buildEntryMetadata(collection: Collection, slug: string): Metadata {
  const entry = getEntry(collection, slug);

  if (!entry) {
    return {};
  }

  const image = entry.thumbnail ?? "/images/placeholder.svg";

  return {
    title: entry.title,
    description: entry.description,
    openGraph: {
      title: entry.title,
      description: entry.description,
      type: "article",
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: entry.title,
      description: entry.description,
      images: [image],
    },
  };
}
