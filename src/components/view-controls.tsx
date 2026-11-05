import { LayoutGrid, List as ListIcon, ArrowUpDown } from "lucide-react";
import type { SortOrder, ViewMode } from "@/lib/content/entry-filter";

type ViewControlsProps = {
  view: ViewMode;
  sortOrder: SortOrder;
  onViewChange: (view: ViewMode) => void;
  onSortToggle: () => void;
};

function viewButtonClass(isActive: boolean): string {
  return `flex items-center justify-center p-1.5 ${
    isActive ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
  }`;
}

export default function ViewControls({
  view,
  sortOrder,
  onViewChange,
  onSortToggle,
}: ViewControlsProps) {
  return (
    <>
      <div className="ml-auto flex flex-wrap items-center gap-4 sm:order-4">
        <button
          type="button"
          onClick={onSortToggle}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowUpDown size={16} />
          {sortOrder === "desc" ? "新しい順" : "古い順"}
        </button>
        <div className="inline-flex divide-x divide-border border border-border">
          <button
            type="button"
            onClick={() => onViewChange("grid")}
            aria-pressed={view === "grid"}
            aria-label="グリッド表示"
            className={viewButtonClass(view === "grid")}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            type="button"
            onClick={() => onViewChange("list")}
            aria-pressed={view === "list"}
            aria-label="リスト表示"
            className={viewButtonClass(view === "list")}
          >
            <ListIcon size={16} />
          </button>
        </div>
      </div>
      <div className="h-6 basis-full sm:hidden" />
      <div className="hidden h-6 basis-full sm:order-2 sm:block" />
    </>
  );
}
