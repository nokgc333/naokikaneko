import { ENTRY_FILTERS, type FilterValue } from "@/lib/content/entry-filter";

type CategoryTabsProps = {
  activeFilter: FilterValue;
  onChange: (filter: FilterValue) => void;
};

export default function CategoryTabs({ activeFilter, onChange }: CategoryTabsProps) {
  return (
    <nav
      aria-label="カテゴリ"
      className="flex min-h-[30px] flex-wrap items-center gap-6 sm:order-3"
    >
      {ENTRY_FILTERS.map((filter) => (
        <button
          key={filter}
          type="button"
          onClick={() => onChange(filter)}
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
  );
}
