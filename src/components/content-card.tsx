import Image from "next/image";
import Link from "next/link";
import type { ContentEntry } from "@/lib/content/schema";

type ContentCardProps = {
  entry: ContentEntry;
  href: string;
  priority?: boolean;
};

export const CONTENT_CARD_IMAGE_SIZES = "(min-width: 640px) 424px, 100vw";

export default function ContentCard({ entry, href, priority = false }: ContentCardProps) {
  return (
    <Link
      href={href}
      className="group flex h-[288px] flex-col overflow-hidden border border-border"
    >
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <Image
          src={entry.thumbnail ?? "/images/placeholder.svg"}
          alt={entry.title}
          fill
          sizes={CONTENT_CARD_IMAGE_SIZES}
          loading={priority ? "eager" : undefined}
          fetchPriority={priority ? "high" : undefined}
          className="object-cover"
        />
      </div>
      <div className="bg-background/60 p-2 backdrop-blur-sm transition-colors duration-500 ease-out group-hover:bg-black/80">
        <h2 className="line-clamp-1 text-base font-semibold group-hover:text-white">
          {entry.title}
        </h2>
        <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground group-hover:text-white">
          {entry.tags.map((tag) => (
            <span key={tag}>#{tag}</span>
          ))}
          <time className="pl-2">{entry.date}</time>
        </div>
      </div>
    </Link>
  );
}
