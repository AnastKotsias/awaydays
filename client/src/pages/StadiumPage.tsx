import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { SpotFilters } from "@/api/queries";
import { MAX_RADIUS, useSpots, useStadium } from "@/api/queries";
import { PlanDock } from "@/components/PlanDock";
import { SpotFiltersPanel } from "@/components/SpotFilters";
import { SpotList } from "@/components/SpotList";
import { SpotMap } from "@/components/SpotMap";
import { StatusMessage } from "@/components/StatusMessage";
import { formatClock, formatNumber, formatShortDate } from "@/lib/format";
import { usePlans } from "@/plan/PlanProvider";

/** No categories selected means "all of them", matching the API's default. */
const DEFAULT_FILTERS: SpotFilters = { categories: [], radius: 2000 };

export default function StadiumPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const [filters, setFilters] = useState<SpotFilters>(DEFAULT_FILTERS);
  const { planFor, toggleStop, chooseEvent } = usePlans();

  const stadiumQuery = useStadium(slug);
  const spotsQuery = useSpots(slug, filters);

  // A second, unfiltered query backs the plan dock: a stop stays in the
  // itinerary even after the filters stop showing it, so its name and colour
  // still have to resolve.
  const allSpotsQuery = useSpots(slug, {
    categories: [],
    radius: MAX_RADIUS,
  });

  const plan = planFor(slug);

  const planStops = useMemo(() => {
    const byId = new Map(
      (allSpotsQuery.data?.data ?? []).map((spot) => [spot.id, spot]),
    );
    return plan.stops
      .map((id) => byId.get(id))
      .filter((spot) => spot !== undefined);
  }, [allSpotsQuery.data, plan.stops]);

  if (stadiumQuery.isPending) {
    return (
      <div className="mx-auto max-w-330 px-6 py-16">
        <StatusMessage title="Loading the ground…" />
      </div>
    );
  }

  if (stadiumQuery.error) {
    return (
      <div className="mx-auto max-w-330 px-6 py-16">
        <StatusMessage
          title="Could not load this ground"
          description={stadiumQuery.error.message}
        />
        <Link
          to="/grounds"
          className="mt-6 inline-block font-mono text-[10px] uppercase tracking-[0.2em] text-acid"
        >
          ← All grounds
        </Link>
      </div>
    );
  }

  const stadium = stadiumQuery.data;
  const spots = spotsQuery.data?.data ?? [];
  // Default to the next fixture until the reader picks another.
  const selectedEventId = plan.eventId ?? stadium.events[0]?.id ?? null;

  return (
    // 4rem is the sticky header, so the map fills exactly the rest of the
    // viewport with nothing scrolling behind it.
    <div className="relative h-[calc(100vh-4rem)] min-h-170">
      <SpotMap
        stadium={stadium}
        spots={spots}
        radius={filters.radius}
        planStops={plan.stops}
      />

      {/* Left column: identity, fixtures, then the scrolling spot list. */}
      <div className="pointer-events-none absolute top-5 left-5 z-500 flex max-h-[calc(100%-2.5rem)] w-100 flex-col gap-3">
        <div className="pointer-events-auto border border-line bg-glass shadow-panel backdrop-blur-lg">
          <div className="px-5.5 pt-5.5 pb-4.5">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-acid">
              {stadium.city}, {stadium.country}
            </p>
            <h1 className="mt-2.5 font-display text-[38px] leading-[0.95] uppercase tracking-[-0.01em]">
              {stadium.name}
            </h1>
            <p className="mt-3 font-mono text-[11px] tracking-widest text-ink-3">
              {stadium.capacity ? `${formatNumber(stadium.capacity)} capacity · ` : ""}
              {stadium.spotCount} spots logged
            </p>
          </div>

          {stadium.events.length > 0 ? (
            <div className="border-t border-line px-5.5 pt-4 pb-5">
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-3">
                Next up
              </p>
              {stadium.events.map((event) => {
                const isSelected = event.id === selectedEventId;
                return (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => chooseEvent(slug, event.id)}
                    aria-pressed={isSelected}
                    className={[
                      "mt-2.5 flex w-full cursor-pointer items-center gap-3.5 border px-3.5 py-3 text-left text-ink transition-colors",
                      isSelected
                        ? "border-acid bg-surface-2"
                        : "border-line bg-transparent hover:border-ink-3",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "font-mono text-[10px] whitespace-nowrap tracking-[0.08em]",
                        isSelected ? "text-acid" : "text-ink-3",
                      ].join(" ")}
                    >
                      {formatShortDate(event.kickoffAt)}
                    </span>
                    <span className="min-w-0 flex-1 truncate font-display text-base uppercase tracking-[0.01em]">
                      {event.title}
                    </span>
                    <span className="font-mono text-[10px] text-ink-3">
                      {formatClock(event.kickoffAt)}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>

        <div className="pointer-events-auto min-h-0 flex-1 overflow-y-auto pr-0.5 pb-30">
          {spotsQuery.error ? (
            <StatusMessage
              title="Could not load nearby spots"
              description={spotsQuery.error.message}
            />
          ) : (
            <SpotList
              spots={spots}
              planStops={plan.stops}
              onToggle={(spotId) => toggleStop(slug, spotId)}
            />
          )}
        </div>
      </div>

      {/* Right column: the filters. */}
      <div className="absolute top-5 right-5 z-500 w-74">
        <SpotFiltersPanel
          filters={filters}
          onChange={setFilters}
          resultCount={spots.length}
          isFetching={spotsQuery.isFetching}
        />
      </div>

      {/* Bottom: the running itinerary. */}
      <div className="absolute bottom-5.5 left-1/2 z-500 -translate-x-1/2">
        <PlanDock slug={slug} stops={planStops} />
      </div>
    </div>
  );
}
