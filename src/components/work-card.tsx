import Image from "next/image";
import Link from "next/link";
import type { ContentEntry } from "@/lib/schemas/content";

type WorkCardProps = {
  entry: ContentEntry;
  href: string;
};

export default function WorkCard({ entry, href }: WorkCardProps) {
  return (
    <Link href={href} className="group relative block h-64 overflow-hidden border border-border">
      <Image
        src={entry.thumbnail ?? "/images/placeholder.svg"}
        alt={entry.title}
        fill
        className="object-cover transition-transform group-hover:scale-105"
      />
      <div className="absolute inset-x-0 bottom-0 bg-background/60 p-2 backdrop-blur-sm transition-colors duration-300 group-hover:bg-background/90">
        <h3 className="line-clamp-1 text-lg font-semibold">{entry.title}</h3>
        <div className="flex flex-wrap text-xs leading-6 text-muted-foreground">
          {entry.tags.map((tag) => (
            <span key={tag} className="mr-2">
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
}
