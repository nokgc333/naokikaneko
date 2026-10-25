import type { ReactNode } from "react";
import Image from "next/image";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import type { CompileOptions } from "@mdx-js/mdx";
import type { ContentEntry } from "@/lib/schemas/content";
import TaskListCheckbox from "./task-list-checkbox";

type ContentDetailProps = {
  entry: ContentEntry;
  rehypePlugins: NonNullable<CompileOptions["rehypePlugins"]>;
  proseClassName: string;
  sidebar?: ReactNode;
  afterMeta?: ReactNode;
  cropEyecatch?: boolean;
  mainMaxWidthClassName?: string;
  eyecatchMaxWidth?: number;
};

export default function ContentDetail({
  entry,
  rehypePlugins,
  proseClassName,
  sidebar,
  afterMeta,
  cropEyecatch = false,
  mainMaxWidthClassName = "max-w-4xl",
  eyecatchMaxWidth = 736,
}: ContentDetailProps) {
  return (
    <main className={`mx-auto w-full ${mainMaxWidthClassName} py-6 lg:px-20 lg:py-9`}>
      {sidebar}
      <h1 className="text-2xl font-bold">{entry.title}</h1>
      <hr className="my-6 border-border" />
      {cropEyecatch ? (
        <div
          className="relative mx-auto mt-4 w-full overflow-hidden"
          style={{ maxWidth: `${eyecatchMaxWidth}px`, aspectRatio: `${eyecatchMaxWidth} / 414` }}
        >
          <Image
            src={entry.thumbnail ?? "/images/placeholder.svg"}
            alt={entry.title}
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <Image
          src={entry.thumbnail ?? "/images/placeholder.svg"}
          alt={entry.title}
          width={800}
          height={450}
          className="mx-auto mt-4 h-auto w-full object-contain"
        />
      )}
      <div className="mt-6 flex flex-wrap gap-2 text-sm text-muted-foreground">
        {entry.tags.map((tag) => (
          <span key={tag}>#{tag}</span>
        ))}
        <div className="ml-auto hidden flex-wrap gap-2 sm:flex">
          <span>
            追加日: <time>{entry.date}</time>
          </span>
          <span>
            更新日: <time>{entry.updatedDate}</time>
          </span>
        </div>
      </div>
      {afterMeta}
      <div className={proseClassName}>
        <MDXRemote
          source={entry.body}
          components={{ input: TaskListCheckbox }}
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
