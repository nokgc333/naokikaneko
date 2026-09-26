import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { getEntries, getEntry } from "@/lib/content";

export function generateStaticParams() {
  return getEntries("blog").map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const entry = getEntry("blog", slug);

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
    <main className="mx-auto w-full max-w-4xl px-8 py-9">
      <h1 className="text-3xl font-bold">{entry.title}</h1>
      <hr className="my-6 border-border" />
      <Image
        src={entry.thumbnail ?? "/images/placeholder.svg"}
        alt={entry.title}
        width={800}
        height={450}
        className="mx-auto mt-4 h-[378px] w-full object-cover"
      />
      <div className="mt-6 flex flex-wrap gap-2 text-sm text-muted-foreground">
        <time>{entry.date}</time>
        {entry.tags.map((tag) => (
          <span key={tag}>#{tag}</span>
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
