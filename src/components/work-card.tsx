import Image from "next/image";
import Link from "next/link";
import type { ContentEntry } from "@/lib/schemas/content";

type WorkCardProps = {
  entry: ContentEntry;
  href: string;
};

export default function WorkCard({ entry, href }: WorkCardProps) {
  return (
    <Link href={href} className="group relative block h-[288px] overflow-hidden border border-border">
      <Image
        src={entry.thumbnail ?? "/images/placeholder.svg"}
        alt={entry.title}
        fill
        className="object-cover transition-transform duration-[500ms] ease-out group-hover:scale-110"
      />
      <div className="absolute inset-x-0 bottom-0 bg-background/80 p-2 backdrop-blur-sm transition-colors duration-500 ease-out group-hover:bg-black/80">
        <h3 className="line-clamp-1 text-base font-semibold group-hover:text-white">
          {entry.title}
        </h3>
        <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground group-hover:text-white">
          {entry.tags.map((tag) => (
            <span key={tag}>#{tag}</span>
          ))}
        </div>
      </div>
    </Link>
  );
}
