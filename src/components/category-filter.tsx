"use client";

import { useState } from "react";
import type { ContentEntry } from "@/lib/content/schema";
import {
  filterAndSortEntries,
  toggleSortOrder,
  type FilterValue,
  type SortOrder,
  type ViewMode,
} from "@/lib/content/entry-filter";
import CategoryTabs from "@/components/category-tabs";
import ViewControls from "@/components/view-controls";
import ContentCard from "@/components/content-card";
import ContentListItem from "@/components/content-list-item";
import WorkCard from "@/components/work-card";

const PRIORITY_IMAGE_COUNT = 2;

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

  const displayedEntries = filterAndSortEntries(entries, activeFilter, sortOrder);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-4 border-b border-border pb-4">
        {title ? <h1 className="text-3xl font-bold">{title}</h1> : null}
        {ListComponent ? (
          <ViewControls
            view={view}
            sortOrder={sortOrder}
            onViewChange={setView}
            onSortToggle={() => setSortOrder(toggleSortOrder)}
          />
        ) : null}
        <CategoryTabs activeFilter={activeFilter} onChange={setActiveFilter} />
      </div>
      {view === "list" && ListComponent ? (
        <div className="mt-4 flex flex-col">
          {displayedEntries.map((entry) => (
            <ListComponent key={entry.slug} entry={entry} href={`${hrefPrefix}/${entry.slug}`} />
          ))}
        </div>
      ) : (
        <div className={`mt-4 grid ${gridClassName}`}>
          {displayedEntries.map((entry, index) => (
            <CardComponent
              key={entry.slug}
              entry={entry}
              href={`${hrefPrefix}/${entry.slug}`}
              priority={index < PRIORITY_IMAGE_COUNT}
            />
          ))}
        </div>
      )}
    </div>
  );
}
