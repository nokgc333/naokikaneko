import type { Metadata } from "next";
import { notFound } from "next/navigation";
import rehypeSanitize from "rehype-sanitize";
import { getEntries, getEntry } from "@/lib/content";
import { buildEntryMetadata } from "@/lib/metadata";
import ContentDetail from "@/components/content-detail";

export function generateStaticParams() {
  return getEntries("work").map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return buildEntryMetadata("work", slug);
}

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getEntry("work", slug);

  if (!entry) {
    notFound();
  }

  return (
    <ContentDetail
      entry={entry}
      rehypePlugins={[rehypeSanitize]}
      proseClassName="prose mt-6 w-full [&_img]:mx-auto [&_img]:block"
      afterMeta={
        entry.url ? (
          <a href={entry.url} className="mt-4 inline-block text-primary underline">
            {entry.url}
          </a>
        ) : null
      }
    />
  );
}
