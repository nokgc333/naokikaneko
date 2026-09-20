import { getEntries } from "@/lib/content";
import ContentCard from "@/components/content-card";

export default function BlogPage() {
  const entries = getEntries("blog");

  return (
    <main className="mx-auto w-full max-w-5xl p-8">
      <h1 className="mb-6 text-3xl font-bold">Blog</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map((entry) => (
          <ContentCard key={entry.slug} entry={entry} href={`/blog/${entry.slug}`} />
        ))}
      </div>
    </main>
  );
}
