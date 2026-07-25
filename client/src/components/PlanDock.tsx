import { Link } from "react-router-dom";
import type { Spot } from "@/api/types";
import { CATEGORY_META, pad2 } from "@/lib/format";

type PlanDockProps = {
  slug: string;
  /** The chosen spots, already in visiting order. */
  stops: Spot[];
};

/** The floating bar that keeps the itinerary in view while browsing the map. */
export function PlanDock({ slug, stops }: PlanDockProps) {
  return (
    // The chip list grows with the plan, so the dock is capped to the viewport
    // and only the chips give up space — the count and the call to action never
    // shrink.
    <div className="flex max-w-[calc(100vw-2.5rem)] items-center border border-line bg-glass shadow-panel backdrop-blur-lg">
      <div className="flex shrink-0 items-center gap-3.5 px-5 py-3.5">
        <span className="font-display text-3xl leading-none text-acid">
          {pad2(stops.length)}
        </span>
        <span className="font-mono text-[9px] leading-normal whitespace-nowrap uppercase tracking-[0.18em] text-ink-3">
          Stops in
          <br />
          your plan
        </span>
      </div>

      <div className="flex min-h-15 min-w-0 flex-1 items-center gap-1.5 overflow-hidden border-x border-line px-4">
        {stops.length === 0 ? (
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-3">
            Add stops from the list →
          </span>
        ) : (
          stops.slice(0, 3).map((spot) => (
            <span
              key={spot.id}
              className="flex max-w-45 shrink-0 items-center gap-1.75 truncate border border-line px-2.5 py-1.5 font-mono text-[9px] whitespace-nowrap uppercase tracking-widest text-ink-2"
            >
              <span
                aria-hidden="true"
                className="size-1.5"
                style={{ background: CATEGORY_META[spot.category].colour }}
              />
              {spot.name}
            </span>
          ))
        )}
        {stops.length > 3 ? (
          <span className="font-mono text-[9px] uppercase tracking-widest text-ink-3">
            +{stops.length - 3}
          </span>
        ) : null}
      </div>

      <Link
        to={`/stadiums/${slug}/plan`}
        className="grid shrink-0 self-stretch place-items-center bg-acid px-6 font-mono text-[11px] font-semibold whitespace-nowrap uppercase tracking-[0.18em] text-acid-ink"
      >
        Build the day
      </Link>
    </div>
  );
}
