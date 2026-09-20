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
    <main className="mx-auto w-full max-w-3xl p-8">
      <h1 className="text-3xl font-bold">{entry.title}</h1>
      <hr className="my-6 border-border" />
      <Image
        src={entry.thumbnail ?? "/images/placeholder.svg"}
        alt={entry.title}
        width={800}
        height={450}
        className="mt-4 aspect-video w-full object-cover"
      />
      <div className="mt-2 flex flex-wrap gap-2 text-sm text-muted-foreground">
        <time>{entry.date}</time>
        {entry.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
      {entry.url ? (
        <a href={entry.url} className="mt-4 inline-block text-primary underline">
          {entry.url}
        </a>
      ) : null}
      <div className="prose mt-6" dangerouslySetInnerHTML={{ __html: html }} />
    </main>
  );
}
