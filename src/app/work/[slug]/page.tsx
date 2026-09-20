import Image from "next/image";
import { notFound } from "next/navigation";
import { getEntries, getEntry } from "@/lib/content";
import { renderMarkdown } from "@/lib/markdown";

export function generateStaticParams() {
  return getEntries("work").map((entry) => ({ slug: entry.slug }));
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

  const html = await renderMarkdown(entry.body);

  return (
    <main>
      <Image
        src={entry.thumbnail ?? "/images/placeholder.svg"}
        alt={entry.title}
        width={400}
        height={225}
      />
      <h1>{entry.title}</h1>
      <div>
        <time>{entry.date}</time>
        {entry.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
      {entry.url ? <a href={entry.url}>{entry.url}</a> : null}
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </main>
  );
}
