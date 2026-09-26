import { getEntries } from "@/lib/content";
import CategoryFilter from "@/components/category-filter";

export default function Home() {
  const entries = getEntries("work");

  return (
    <main className="mx-auto w-full max-w-7xl px-8 py-9">
      <h1 className="mb-6 text-3xl font-bold">Work</h1>
      <CategoryFilter
        entries={entries}
        hrefPrefix="/work"
        cardType="work"
        defaultFilter="Tool"
        gridClassName="grid-cols-1 gap-1 sm:grid-cols-2"
      />
    </main>
  );
}
