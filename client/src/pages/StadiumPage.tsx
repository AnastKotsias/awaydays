import { Link, useParams } from "react-router-dom";
import { useSpots, useStadium } from "@/api/queries";
import { FixtureList } from "@/components/FixtureList";
import { SpotList } from "@/components/SpotList";
import { SpotMap } from "@/components/SpotMap";
import { StatusMessage } from "@/components/StatusMessage";
import { formatNumber } from "@/lib/format";

/** Fixed for now; the next commit turns these into controls. */
const DEFAULT_RADIUS = 2000;

export default function StadiumPage() {
  const { slug = "" } = useParams<{ slug: string }>();

  const stadiumQuery = useStadium(slug);
  const spotsQuery = useSpots(slug, {
    categories: [],
    radius: DEFAULT_RADIUS,
  });

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
          <SpotMap stadium={stadium} spots={spots} radius={DEFAULT_RADIUS} />

          <div>
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
