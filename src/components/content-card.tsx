import Link from "next/link";
import type { ContentEntry } from "@/lib/schemas/content";

type ContentCardProps = {
  entry: ContentEntry;
  href: string;
};

export default function ContentCard({ entry, href }: ContentCardProps) {
  return (
    <Link href={href} className="block border border-border hover:bg-muted">
      {entry.thumbnail ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={entry.thumbnail}
          alt={entry.title}
          className="aspect-video w-full object-cover"
        />
      ) : (
        <div className="aspect-video w-full bg-muted" />
      )}
      <div className="p-4">
        <h3 className="line-clamp-1 text-lg font-semibold">{entry.title}</h3>
        <p className="mt-1 line-clamp-2 min-h-10 text-sm text-muted-foreground">
          {entry.description}
        </p>
        <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
          <time>{entry.date}</time>
          {entry.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </div>
    </Link>
  );
}
