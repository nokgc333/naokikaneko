"use client";

import { useEffect, useState } from "react";
import type { TocHeading } from "@/lib/toc";

type TableOfContentsProps = {
  headings: TocHeading[];
};

export default function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (headings.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-96px 0px -70% 0px", threshold: 0 },
    );

    headings.forEach((heading) => {
      const el = document.getElementById(heading.id);
      if (el) {
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) {
    return null;
  }

  const minDepth = Math.min(...headings.map((heading) => heading.depth));

  return (
    <nav
      aria-label="目次"
      className="fixed top-28 hidden w-56 pt-20 2xl:block"
      style={{ left: "calc(50% + 32rem)" }}
    >
      <p className="mb-3 text-sm font-medium">目次</p>
      <ul className="space-y-2 text-sm">
        {headings.map((heading) => (
          <li key={heading.id} style={{ paddingLeft: `${(heading.depth - minDepth) * 0.75}rem` }}>
            <a
              href={`#${heading.id}`}
              className={
                activeId === heading.id
                  ? "text-foreground underline underline-offset-4"
                  : "text-muted-foreground hover:text-foreground"
              }
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
