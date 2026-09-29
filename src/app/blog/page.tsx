import type { Metadata } from "next";
import { getEntries } from "@/lib/content";
import CategoryFilter from "@/components/category-filter";

export const metadata: Metadata = {
  title: "Blog",
  description: "Naoki Kaneko | Tech Blog",
};

export default function BlogPage() {
  const entries = getEntries("blog");

  return (
    <main className="mx-auto w-full max-w-7xl py-6 lg:py-9">
      <CategoryFilter
        entries={entries}
        hrefPrefix="/blog"
        cardType="blog"
        defaultFilter="Tool"
        gridClassName="mx-auto w-fit max-w-7xl grid-cols-[minmax(0,424px)] gap-1 sm:grid-cols-[repeat(2,minmax(0,424px))] lg:grid-cols-[repeat(3,minmax(0,424px))]"
        title="Blog"
      />
    </main>
  );
}
