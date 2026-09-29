"use client";

import { useState } from "react";
import { LayoutGrid, List as ListIcon, ArrowUpDown } from "lucide-react";
import type { ContentEntry } from "@/lib/schemas/content";
import { workCategories } from "@/lib/schemas/content";
import ContentCard from "@/components/content-card";
import ContentListItem from "@/components/content-list-item";
import WorkCard from "@/components/work-card";

type FilterValue = "All" | (typeof workCategories)[number];
type ViewMode = "grid" | "list";
type SortOrder = "desc" | "asc";

const filters: FilterValue[] = ["All", ...workCategories];

const cardComponents = {
  work: WorkCard,
  blog: ContentCard,
};

const listComponents: Partial<Record<keyof typeof cardComponents, typeof ContentListItem>> = {
  blog: ContentListItem,
};

type CategoryFilterProps = {
  entries: ContentEntry[];
  hrefPrefix: string;
  cardType: keyof typeof cardComponents;
  defaultFilter?: FilterValue;
  gridClassName?: string;
  title?: string;
};

export default function CategoryFilter({
  entries,
  hrefPrefix,
  cardType,
  defaultFilter = "All",
  gridClassName = "grid-cols-1 gap-1 sm:grid-cols-2 lg:grid-cols-3",
  title,
}: CategoryFilterProps) {
  const [activeFilter, setActiveFilter] = useState<FilterValue>(defaultFilter);
  const [view, setView] = useState<ViewMode>("grid");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const CardComponent = cardComponents[cardType];
  const ListComponent = listComponents[cardType];

  const filteredEntries =
    activeFilter === "All" ? entries : entries.filter((entry) => entry.category === activeFilter);

  const displayedEntries =
    sortOrder === "asc" ? [...filteredEntries].reverse() : filteredEntries;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-4 border-b border-border pb-4">
        {title ? <h1 className="text-3xl font-bold">{title}</h1> : null}
        {ListComponent ? (
          <>
            <div className="ml-auto flex flex-wrap items-center gap-4 sm:order-4">
              <button
                type="button"
                onClick={() => setSortOrder(sortOrder === "desc" ? "asc" : "desc")}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                <ArrowUpDown size={16} />
                {sortOrder === "desc" ? "新しい順" : "古い順"}
              </button>
              <div className="inline-flex divide-x divide-border border border-border">
                <button
                  type="button"
                  onClick={() => setView("grid")}
                  aria-pressed={view === "grid"}
                  aria-label="グリッド表示"
                  className={`flex items-center justify-center p-1.5 ${
                    view === "grid"
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <LayoutGrid size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setView("list")}
                  aria-pressed={view === "list"}
                  aria-label="リスト表示"
                  className={`flex items-center justify-center p-1.5 ${
                    view === "list"
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <ListIcon size={16} />
                </button>
              </div>
            </div>
            {/* Forces a line break after the heading+toolbar row on mobile only. */}
            <div className="h-6 basis-full sm:hidden" />
            {/* Forces a line break after the heading row on sm+ only. */}
            <div className="hidden h-6 basis-full sm:order-2 sm:block" />
          </>
        ) : null}
        <nav className="flex min-h-[30px] flex-wrap items-center gap-6 sm:order-3">
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
      </div>
      {view === "list" && ListComponent ? (
        <div className="mt-4 flex flex-col">
          {displayedEntries.map((entry) => (
            <ListComponent key={entry.slug} entry={entry} href={`${hrefPrefix}/${entry.slug}`} />
          ))}
        </div>
      ) : (
        <div className={`mt-4 grid ${gridClassName}`}>
          {displayedEntries.map((entry) => (
            <CardComponent key={entry.slug} entry={entry} href={`${hrefPrefix}/${entry.slug}`} />
          ))}
        </div>
      )}
    </div>
  );
}
