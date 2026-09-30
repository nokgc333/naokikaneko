import type { Metadata } from "next";
import { notFound } from "next/navigation";
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import { getEntries, getEntry } from "@/lib/content";
import { extractHeadings } from "@/lib/toc";
import { buildEntryMetadata } from "@/lib/metadata";
import TableOfContents from "@/components/table-of-contents";
import RelatedPosts from "@/components/related-posts";
import ContentDetail from "@/components/content-detail";

export function generateStaticParams() {
  return getEntries("blog").map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return buildEntryMetadata("blog", slug);
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getEntry("blog", slug);

  if (!entry) {
    notFound();
  }

  const headings = extractHeadings(entry.body);
  const relatedPosts = getEntries("blog")
    .filter((post) => post.slug !== slug)
    .slice(0, 5);

  return (
    <ContentDetail
      entry={entry}
      rehypePlugins={[rehypeSlug, rehypeSanitize]}
      proseClassName="prose mt-6 max-w-4xl [&_img]:mx-auto [&_img]:block"
      sidebar={
        <>
          <RelatedPosts posts={relatedPosts} />
          <TableOfContents headings={headings} />
        </>
      }
    />
  );
}
