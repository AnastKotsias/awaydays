import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { SpotFilters } from "@/api/queries";
import { useSpots, useStadium } from "@/api/queries";
import { FixtureList } from "@/components/FixtureList";
import { SpotFiltersPanel } from "@/components/SpotFilters";
import { SpotList } from "@/components/SpotList";
import { SpotMap } from "@/components/SpotMap";
import { StatusMessage } from "@/components/StatusMessage";
import { formatNumber } from "@/lib/format";

/** No categories selected means "all of them", matching the API's default. */
const DEFAULT_FILTERS: SpotFilters = {
  categories: [],
  radius: 2000,
};

export default function StadiumPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const [filters, setFilters] = useState<SpotFilters>(DEFAULT_FILTERS);

  const stadiumQuery = useStadium(slug);
  const spotsQuery = useSpots(slug, filters);

  if (stadiumQuery.isPending) {
    return <StatusMessage title="Loading the ground…" />;
  }

  if (stadiumQuery.error) {
    return (
      <div>
        <StatusMessage
          title="Could not load this ground"
          description={stadiumQuery.error.message}
        />
        <Link
          to="/"
          className="mt-4 inline-block text-sm text-pitch-400 hover:underline"
        >
          ← Back to all grounds
        </Link>
      </div>
    );
  }

  const stadium = stadiumQuery.data;
  const spots = spotsQuery.data?.data ?? [];

  return (
    <div className="flex flex-col gap-8">
      <header>
        <Link
          to="/"
          className="text-sm text-slate-400 transition hover:text-pitch-300"
        >
          ← All grounds
        </Link>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
          {stadium.name}
        </h1>
        <p className="mt-1 text-slate-400">
          {stadium.city}, {stadium.country}
          {stadium.capacity
            ? ` · ${formatNumber(stadium.capacity)} capacity`
            : ""}
        </p>
      </header>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-white">
          Upcoming fixtures
        </h2>
        <FixtureList events={stadium.events} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-white">
          Around the ground
        </h2>

        <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
          <SpotMap stadium={stadium} spots={spots} radius={filters.radius} />

          <div className="flex flex-col gap-4">
            <SpotFiltersPanel
              filters={filters}
              onChange={setFilters}
              resultCount={spots.length}
              isFetching={spotsQuery.isFetching}
            />

            {spotsQuery.error ? (
              <StatusMessage
                title="Could not load nearby spots"
                description={spotsQuery.error.message}
              />
            ) : (
              <SpotList spots={spots} />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
