import { notFound } from "next/navigation";
import { getEntry } from "@/lib/content";
import { renderMarkdown } from "@/lib/markdown";

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
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-3xl font-bold">{entry.title}</h1>
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
