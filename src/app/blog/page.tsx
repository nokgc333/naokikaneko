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
    <main className="mx-auto w-full max-w-7xl px-5 lg:px-10 py-6 lg:py-9">
      <h1 className="mb-6 text-3xl font-bold">Blog</h1>
      <CategoryFilter
        entries={entries}
        hrefPrefix="/blog"
        cardType="blog"
        defaultFilter="Tool"
        gridClassName="grid-cols-[minmax(0,397px)] justify-center gap-1 sm:grid-cols-[repeat(2,minmax(0,397px))] lg:grid-cols-[repeat(3,minmax(0,397px))]"
      />
    </main>
  );
}
