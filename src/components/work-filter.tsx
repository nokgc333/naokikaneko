"use client";

import { useState } from "react";
import type { ContentEntry } from "@/lib/schemas/content";
import { workCategories } from "@/lib/schemas/content";
import WorkCard from "@/components/work-card";

type FilterValue = "All" | (typeof workCategories)[number];

const filters: FilterValue[] = ["All", ...workCategories];

const DEFAULT_FILTER: FilterValue = "Tools";

type WorkFilterProps = {
  entries: ContentEntry[];
};

export default function WorkFilter({ entries }: WorkFilterProps) {
  const [activeFilter, setActiveFilter] = useState<FilterValue>(DEFAULT_FILTER);

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
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {filteredEntries.map((entry) => (
          <WorkCard key={entry.slug} entry={entry} href={`/work/${entry.slug}`} />
        ))}
      </div>
    </div>
  );
}
