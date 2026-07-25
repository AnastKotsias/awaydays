import { Link } from "react-router-dom";
import type { StadiumListItem } from "@/api/types";
import { formatNumber } from "@/lib/format";

export function StadiumCard({ stadium }: { stadium: StadiumListItem }) {
  return (
    <Link
      to={`/stadiums/${stadium.slug}`}
      className="group flex flex-col rounded-xl border border-white/10 bg-night-900 p-5 transition hover:border-pitch-500/60 hover:bg-night-800"
    >
      <h2 className="text-lg font-bold text-white group-hover:text-pitch-300">
        {stadium.name}
      </h2>
      <p className="mt-0.5 text-sm text-slate-400">
        {stadium.city}, {stadium.country}
      </p>

      <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500">
            Fixtures
          </dt>
          <dd className="font-semibold text-pitch-400">
            {stadium.upcomingEventCount}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-500">
            Spots nearby
          </dt>
          <dd className="font-semibold text-white">{stadium.spotCount}</dd>
        </div>
        {stadium.capacity ? (
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">
              Capacity
            </dt>
            <dd className="font-semibold text-white">
              {formatNumber(stadium.capacity)}
            </dd>
          </div>
        ) : null}
      </dl>

      <span className="mt-4 text-sm font-medium text-slate-400 group-hover:text-pitch-300">
        Plan the day →
      </span>
    </Link>
  );
}
