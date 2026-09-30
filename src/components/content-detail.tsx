import type { ReactNode } from "react";
import Image from "next/image";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import type { CompileOptions } from "@mdx-js/mdx";
import type { ContentEntry } from "@/lib/schemas/content";

type ContentDetailProps = {
  entry: ContentEntry;
  rehypePlugins: NonNullable<CompileOptions["rehypePlugins"]>;
  proseClassName: string;
  sidebar?: ReactNode;
  afterMeta?: ReactNode;
};

export default function ContentDetail({
  entry,
  rehypePlugins,
  proseClassName,
  sidebar,
  afterMeta,
}: ContentDetailProps) {
  return (
    <main className="mx-auto w-full max-w-4xl lg:px-20 py-6 lg:py-9">
      {sidebar}
      <h1 className="text-2xl font-bold">{entry.title}</h1>
      <hr className="my-6 border-border" />
      <Image
        src={entry.thumbnail ?? "/images/placeholder.svg"}
        alt={entry.title}
        width={800}
        height={450}
        className="mx-auto mt-4 h-auto w-full object-contain"
      />
      <div className="mt-6 flex flex-wrap gap-2 text-sm text-muted-foreground">
        <time>{entry.date}</time>
        {entry.tags.map((tag) => (
          <span key={tag}>#{tag}</span>
        ))}
      </div>
      {afterMeta}
      <div className={proseClassName}>
        <MDXRemote
          source={entry.body}
          components={{}}
          options={{
            mdxOptions: {
              remarkPlugins: [remarkGfm],
              rehypePlugins,
            },
          }}
        />
      </div>
    </main>
  );
}
