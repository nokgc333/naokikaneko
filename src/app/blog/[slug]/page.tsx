import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { getEntry } from "@/lib/content";

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

  return (
    <main className="mx-auto w-full max-w-3xl p-8">
      <h1 className="text-3xl font-bold">{entry.title}</h1>
      <hr className="my-6 border-border" />
      {entry.thumbnail ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={entry.thumbnail}
          alt={entry.title}
          className="mt-4 aspect-video w-full object-cover"
        />
      ) : null}
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
      <div className="prose mt-6">
        <MDXRemote
          source={entry.body}
          components={{}}
          options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
        />
      </div>
    </main>
  );
}
