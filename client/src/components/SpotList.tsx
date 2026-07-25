import type { Spot } from "@/api/types";
import {
  CATEGORY_META,
  formatDistance,
  formatPrice,
  walkMinutes,
} from "@/lib/format";

type SpotListProps = {
  spots: Spot[];
  /** Spot ids already in the itinerary. */
  planStops: string[];
  onToggle: (spotId: string) => void;
};

export function SpotList({ spots, planStops, onToggle }: SpotListProps) {
  if (spots.length === 0) {
    return (
      <p className="border border-dashed border-line bg-glass p-6 text-center font-mono text-[11px] uppercase tracking-widest text-ink-3 backdrop-blur-lg">
        Nothing in range. Widen the circle.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2.5">
      {spots.map((spot) => {
        const meta = CATEGORY_META[spot.category];
        const inPlan = planStops.includes(spot.id);

        return (
          <li key={spot.id}>
            <article
              className="bg-glass shadow-panel backdrop-blur-lg"
              style={{
                border: `1px solid ${inPlan ? meta.colour : "var(--line)"}`,
              }}
            >
              <div className="flex items-stretch">
                {/* Colour rail: the fastest way to read category down a list. */}
                <div
                  aria-hidden="true"
                  className="w-1 shrink-0"
                  style={{ background: meta.colour }}
                />

                <div className="min-w-0 flex-1 py-4 pr-4 pl-3.5">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-display text-[19px] leading-[1.1] uppercase">
                      {spot.name}
                    </h3>
                    {spot.distanceMetres !== undefined ? (
                      <span className="shrink-0 font-mono text-[11px] font-semibold text-ink-2">
                        {formatDistance(spot.distanceMetres)}
                      </span>
                    ) : null}
                  </div>

                  <p
                    className="mt-1.75 flex flex-wrap items-center gap-2.25 font-mono text-[9px] uppercase tracking-[0.16em]"
                    style={{ color: meta.colour }}
                  >
                    {meta.label}
                    <span className="text-line">|</span>
                    <span className="tracking-widest text-ink-3">
                      {formatPrice(spot.priceLevel)}
                    </span>
                    {spot.distanceMetres !== undefined ? (
                      <>
                        <span className="text-line">|</span>
                        <span className="tracking-widest text-ink-3">
                          {walkMinutes(spot.distanceMetres)} min walk
                        </span>
                      </>
                    ) : null}
                  </p>

                  {spot.description ? (
                    <p className="mt-2.5 text-[13.5px] leading-[1.55] text-pretty text-ink-2">
                      {spot.description}
                    </p>
                  ) : null}

                  <div className="mt-3.5 flex items-center justify-between gap-3">
                    <p className="truncate font-mono text-[10px] text-ink-3">
                      {spot.address}
                    </p>
                    <button
                      type="button"
                      onClick={() => onToggle(spot.id)}
                      aria-pressed={inPlan}
                      className={[
                        "shrink-0 cursor-pointer border px-3 py-1.75 font-mono text-[9px] font-semibold uppercase tracking-[0.14em] transition-colors",
                        inPlan
                          ? "border-acid bg-acid text-acid-ink"
                          : "border-line bg-transparent text-ink-2 hover:border-acid hover:text-ink",
                      ].join(" ")}
                    >
                      {inPlan ? "In plan ✓" : "+ Add stop"}
                    </button>
                  </div>
                </div>
              </div>
            </article>
          </li>
        );
      })}
    </ul>
  );
}
