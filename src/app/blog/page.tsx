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
    <main className="mx-auto w-full max-w-7xl px-8 py-9">
      <h1 className="mb-6 text-3xl font-bold">Blog</h1>
      <CategoryFilter
        entries={entries}
        hrefPrefix="/blog"
        cardType="blog"
        defaultFilter="Tool"
      />
    </main>
  );
}
