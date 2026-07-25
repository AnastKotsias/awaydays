import type { SpotFilters as Filters } from "@/api/queries";
import type { SpotCategory } from "@/api/types";
import { CATEGORY_META, CATEGORY_ORDER, formatDistance } from "@/lib/format";

const PRICE_OPTIONS: { label: string; value: number | undefined }[] = [
  { label: "Any", value: undefined },
  { label: "€", value: 1 },
  { label: "€€", value: 2 },
  { label: "€€€", value: 3 },
];

type SpotFiltersProps = {
  filters: Filters;
  onChange: (filters: Filters) => void;
  resultCount: number;
  isFetching: boolean;
};

export function SpotFiltersPanel({
  filters,
  onChange,
  resultCount,
  isFetching,
}: SpotFiltersProps) {
  /** Adds the category if absent, removes it if present. */
  function toggleCategory(category: SpotCategory) {
    const categories = filters.categories.includes(category)
      ? filters.categories.filter((item) => item !== category)
      : [...filters.categories, category];

    onChange({ ...filters, categories });
  }

  return (
    <div className="border border-line bg-glass p-4.5 shadow-panel backdrop-blur-lg">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-[17px] uppercase tracking-[0.02em]">
          Filters
        </h2>
        <p
          className="font-mono text-[10px] tracking-[0.12em] text-acid"
          aria-live="polite"
        >
          {isFetching ? "Searching…" : `${resultCount} spots in range`}
        </p>
      </div>

      {/* No selection means "everything", matching how the API treats a
          missing category parameter. */}
      <fieldset>
        <legend className="mt-4.5 font-mono text-[9px] uppercase tracking-[0.2em] text-ink-3">
          Category
        </legend>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {CATEGORY_ORDER.map((category) => {
            const meta = CATEGORY_META[category];
            const isActive = filters.categories.includes(category);

            return (
              <button
                key={category}
                type="button"
                onClick={() => toggleCategory(category)}
                aria-pressed={isActive}
                className={[
                  "flex cursor-pointer items-center gap-1.5 border px-2.5 py-1.5 font-mono text-[9px] font-medium uppercase tracking-[0.12em] transition-colors",
                  isActive
                    ? "bg-surface-2 text-ink"
                    : "bg-transparent text-ink-3 hover:text-ink",
                ].join(" ")}
                style={{
                  borderColor: isActive ? meta.colour : "var(--line)",
                }}
              >
                <span
                  aria-hidden="true"
                  className="size-1.75"
                  style={{ background: meta.colour }}
                />
                {meta.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-5 flex items-baseline justify-between">
        <label
          htmlFor="radius"
          className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-3"
        >
          Within
        </label>
        <p className="font-mono text-xs font-semibold text-acid">
          {formatDistance(filters.radius)}
        </p>
      </div>
      <input
        id="radius"
        type="range"
        min={250}
        max={5000}
        step={250}
        value={filters.radius}
        onChange={(event) =>
          onChange({ ...filters, radius: Number(event.target.value) })
        }
        className="mt-2.5 w-full accent-acid"
      />

      <fieldset>
        <legend className="mt-4.5 font-mono text-[9px] uppercase tracking-[0.2em] text-ink-3">
          Max price
        </legend>
        <div className="mt-2.5 flex gap-1.5">
          {PRICE_OPTIONS.map((option) => {
            const isActive = filters.maxPrice === option.value;

            return (
              <button
                key={option.label}
                type="button"
                onClick={() => onChange({ ...filters, maxPrice: option.value })}
                aria-pressed={isActive}
                className={[
                  "flex-1 cursor-pointer border py-2 font-mono text-[10px] font-semibold tracking-[0.06em] transition-colors",
                  isActive
                    ? "border-acid bg-acid text-acid-ink"
                    : "border-line bg-transparent text-ink-3 hover:border-ink-3 hover:text-ink",
                ].join(" ")}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
