import type { SpotFilters as Filters } from "@/api/queries";
import type { SpotCategory } from "@/api/types";
import { CATEGORY_META, formatDistance } from "@/lib/format";

const ALL_CATEGORIES = Object.keys(CATEGORY_META) as SpotCategory[];

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
    <div className="rounded-xl border border-white/10 bg-night-900 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-white">Filters</h3>
        <p className="text-xs text-slate-400" aria-live="polite">
          {isFetching ? "Searching…" : `${resultCount} spots found`}
        </p>
      </div>

      {/* Categories: no selection means "everything", which matches how the
          API treats a missing category parameter. */}
      <fieldset className="mt-4">
        <legend className="text-xs uppercase tracking-wide text-slate-500">
          Category
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {ALL_CATEGORIES.map((category) => {
            const meta = CATEGORY_META[category];
            const isActive = filters.categories.includes(category);

            return (
              <button
                key={category}
                type="button"
                onClick={() => toggleCategory(category)}
                aria-pressed={isActive}
                className="rounded-full border px-3 py-1.5 text-xs font-medium transition"
                style={{
                  borderColor: isActive ? meta.colour : "rgba(255,255,255,0.12)",
                  backgroundColor: isActive ? `${meta.colour}22` : "transparent",
                  color: isActive ? meta.colour : "#94a3b8",
                }}
              >
                {meta.icon} {meta.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-5">
        <label
          htmlFor="radius"
          className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-500"
        >
          Within
          <span className="font-semibold text-pitch-400 normal-case">
            {formatDistance(filters.radius)}
          </span>
        </label>
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
          className="mt-2 w-full accent-pitch-500"
        />
      </div>

      <fieldset className="mt-5">
        <legend className="text-xs uppercase tracking-wide text-slate-500">
          Max price
        </legend>
        <div className="mt-2 flex gap-2">
          {PRICE_OPTIONS.map((option) => {
            const isActive = filters.maxPrice === option.value;

            return (
              <button
                key={option.label}
                type="button"
                onClick={() => onChange({ ...filters, maxPrice: option.value })}
                aria-pressed={isActive}
                className={`flex-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                  isActive
                    ? "border-pitch-500 bg-pitch-500/15 text-pitch-300"
                    : "border-white/10 text-slate-400 hover:border-white/25 hover:text-slate-200"
                }`}
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
