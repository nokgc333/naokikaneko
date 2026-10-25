import { getEntries, getEntry } from "@/lib/content";
import { ENTRY_OG_CONTENT_TYPE, ENTRY_OG_SIZE, renderEntryOgImage } from "@/lib/entry-og-image";

export const alt = "Work";
export const size = ENTRY_OG_SIZE;
export const contentType = ENTRY_OG_CONTENT_TYPE;

export function generateStaticParams() {
  return getEntries("work").map((entry) => ({ slug: entry.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = getEntry("work", slug);
  return renderEntryOgImage(entry?.title ?? "", "Work");
}
