import Image from "next/image";
import Link from "next/link";
import type { ContentEntry } from "@/lib/schemas/content";

type RelatedPostsProps = {
  posts: ContentEntry[];
};

export default function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="関連記事"
      className="fixed top-28 hidden max-h-[calc(100vh-10.5rem)] w-[min(297px,calc((100vw-896px)*11/21))] overflow-y-auto pt-20 2xl:block"
      style={{ right: "calc(50% + 26.5rem)" }}
    >
      <p className="mb-3 border-b-4 border-border pb-2 text-xl font-medium">関連記事</p>
      <ul className="space-y-4">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link href={`/blog/${post.slug}`} className="group flex gap-3 hover:bg-muted">
              <div className="relative h-[91.125px] flex-1 overflow-hidden border border-border">
                <Image
                  src={post.thumbnail ?? "/images/placeholder.svg"}
                  alt={post.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="w-[142px] shrink-0">
                <time className="block text-xs text-muted-foreground">{post.date}</time>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground group-hover:text-foreground">
                  {post.title}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
