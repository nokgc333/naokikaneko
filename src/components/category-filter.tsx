"use client";

import { useState } from "react";
import type { ContentEntry } from "@/lib/schemas/content";
import { workCategories } from "@/lib/schemas/content";
import ContentCard from "@/components/content-card";
import WorkCard from "@/components/work-card";

type FilterValue = "All" | (typeof workCategories)[number];

const filters: FilterValue[] = ["All", ...workCategories];

const cardComponents = {
  work: WorkCard,
  blog: ContentCard,
};

type CategoryFilterProps = {
  entries: ContentEntry[];
  hrefPrefix: string;
  cardType: keyof typeof cardComponents;
  defaultFilter?: FilterValue;
  gridClassName?: string;
};

export default function CategoryFilter({
  entries,
  hrefPrefix,
  cardType,
  defaultFilter = "All",
  gridClassName = "grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3",
}: CategoryFilterProps) {
  const [activeFilter, setActiveFilter] = useState<FilterValue>(defaultFilter);
  const CardComponent = cardComponents[cardType];

  const filteredEntries =
    activeFilter === "All" ? entries : entries.filter((entry) => entry.category === activeFilter);

  return (
    <div>
      <nav className="flex flex-wrap gap-6 border-b border-border pb-4">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActiveFilter(filter)}
            aria-pressed={activeFilter === filter}
            className={`text-sm font-medium ${
              activeFilter === filter
                ? "text-foreground underline underline-offset-4"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {filter}
          </button>
        ))}
      </nav>
      <div className={`mt-6 grid ${gridClassName}`}>
        {filteredEntries.map((entry) => (
          <CardComponent key={entry.slug} entry={entry} href={`${hrefPrefix}/${entry.slug}`} />
        ))}
      </div>
    </div>
  );
}
