import Image from "next/image";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { getEntries, getEntry } from "@/lib/content";

export function generateStaticParams() {
  return getEntries("blog").map((entry) => ({ slug: entry.slug }));
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
      <div className="prose mt-6">
        <MDXRemote
          source={entry.body}
          components={{}}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm],
              rehypePlugins: [rehypeSanitize],
            },
          }}
        />
      </div>
    </main>
  );
}
