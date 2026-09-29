import Image from "next/image";
import Link from "next/link";
import type { ContentEntry } from "@/lib/schemas/content";

type ContentListItemProps = {
  entry: ContentEntry;
  href: string;
};

export default function ContentListItem({ entry, href }: ContentListItemProps) {
  return (
    <Link
      href={href}
      className="group flex gap-3 border-b border-border py-4 first:pt-0 last:border-b-0"
    >
      <div className="relative w-[120px] shrink-0 overflow-hidden border border-border sm:w-[267px]">
        <Image
          src={entry.thumbnail ?? "/images/placeholder.svg"}
          alt={entry.title}
          fill
          className="object-cover"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <h3 className="line-clamp-1 text-sm font-semibold group-hover:underline">
          {entry.title}
        </h3>
        <p className="mt-1 line-clamp-2 min-h-8 text-xs text-muted-foreground">{entry.description}</p>
        <div className="mt-auto flex flex-wrap gap-2 pt-2 text-xs text-muted-foreground">
          <time>{entry.date}</time>
          {entry.tags.map((tag) => (
            <span key={tag}>#{tag}</span>
          ))}
        </div>
      </div>
    </Link>
  );
}
