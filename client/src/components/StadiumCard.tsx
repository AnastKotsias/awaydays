import { Link } from "react-router-dom";
import type { StadiumListItem } from "@/api/types";
import { formatNumber } from "@/lib/format";

export function StadiumCard({ stadium }: { stadium: StadiumListItem }) {
  return (
    <Link
      to={`/stadiums/${stadium.slug}`}
      className="group block border border-line bg-surface text-ink transition-colors hover:border-acid"
    >
      <div className="flex items-start justify-between gap-5 px-6.5 pt-6.5 pb-5.5">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3">
            {stadium.city}, {stadium.country}
          </p>
          <h2 className="mt-3 font-display text-[34px] leading-none uppercase tracking-[-0.01em]">
            {stadium.name}
          </h2>
          {stadium.blurb ? (
            <p className="mt-3.5 text-[15px] leading-[1.55] text-ink-2">
              {stadium.blurb}
            </p>
          ) : null}
        </div>
        <span
          aria-hidden="true"
          className="grid size-11 shrink-0 place-items-center border border-line bg-canvas-2 font-mono text-[15px] text-acid"
        >
          →
        </span>
      </div>

      <dl className="grid grid-cols-3 border-t border-dashed border-line">
        <div className="border-r border-dashed border-line px-6.5 py-4">
          <dd className="font-display text-[26px] leading-none text-acid">
            {stadium.upcomingEventCount}
          </dd>
          <dt className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-ink-3">
            Fixtures
          </dt>
        </div>
        <div className="border-r border-dashed border-line px-6.5 py-4">
          <dd className="font-display text-[26px] leading-none">
            {stadium.spotCount}
          </dd>
          <dt className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-ink-3">
            Spots nearby
          </dt>
        </div>
        <div className="px-6.5 py-4">
          <dd className="font-display text-[26px] leading-none">
            {stadium.capacity ? formatNumber(stadium.capacity) : "—"}
          </dd>
          <dt className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-ink-3">
            Capacity
          </dt>
        </div>
      </dl>
    </Link>
  );
}
