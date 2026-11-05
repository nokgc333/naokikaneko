import type { ContentEntry } from "@/lib/content/schema";
import { workCategories } from "@/lib/content/work-categories";

export type FilterValue = "All" | (typeof workCategories)[number];
export type ViewMode = "grid" | "list";
export type SortOrder = "desc" | "asc";

export const ENTRY_FILTERS: FilterValue[] = ["All", ...workCategories];

export function filterAndSortEntries(
  entries: ContentEntry[],
  activeFilter: FilterValue,
  sortOrder: SortOrder,
): ContentEntry[] {
  const filtered =
    activeFilter === "All" ? entries : entries.filter((entry) => entry.category === activeFilter);
  return sortOrder === "asc" ? [...filtered].reverse() : filtered;
}

export function toggleSortOrder(order: SortOrder): SortOrder {
  return order === "desc" ? "asc" : "desc";
}
