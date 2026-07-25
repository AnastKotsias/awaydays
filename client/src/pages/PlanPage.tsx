import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { MAX_RADIUS, useSpots, useStadium } from "@/api/queries";
import { StatusMessage } from "@/components/StatusMessage";
import {
  CATEGORY_META,
  formatClock,
  formatDistance,
  formatPrice,
  formatTimeOfDay,
  pad2,
} from "@/lib/format";
import { usePlans } from "@/plan/PlanProvider";
import { encodePlan } from "@/plan/shareLink";
import { buildTimeline } from "@/plan/timeline";

export default function PlanPage() {
  const { slug = "" } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { planFor, moveStop, removeStop } = usePlans();

  const stadiumQuery = useStadium(slug);
  // Unfiltered: the itinerary must resolve every saved stop, whatever the map
  // filters happened to be showing when it was built.
  const spotsQuery = useSpots(slug, { categories: [], radius: MAX_RADIUS });

  const plan = planFor(slug);

  const stops = useMemo(() => {
    const byId = new Map(
      (spotsQuery.data?.data ?? []).map((spot) => [spot.id, spot]),
    );
    return plan.stops
      .map((id) => byId.get(id))
      .filter((spot) => spot !== undefined);
  }, [spotsQuery.data, plan.stops]);

  if (stadiumQuery.isPending || spotsQuery.isPending) {
    return (
      <div className="mx-auto max-w-330 px-6 py-16">
        <StatusMessage title="Loading your plan…" />
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
      </div>
    );
  }

  const stadium = stadiumQuery.data;
  const event =
    stadium.events.find((candidate) => candidate.id === plan.eventId) ??
    stadium.events[0];

  const timeline = buildTimeline(stops, stadium, event?.kickoffAt ?? null);

  function share() {
    navigate(
      `/p/${encodePlan({
        v: 1,
        s: slug,
        e: event?.id ?? null,
        p: plan.stops,
      })}`,
    );
  }

  const summary = [
    { label: "Kick-off", value: event ? formatClock(event.kickoffAt) : "—" },
    {
      label: "First stop",
      value: timeline.stops[0]
        ? formatTimeOfDay(timeline.stops[0].startsAt)
        : "—",
    },
    { label: "On foot", value: `${timeline.walkTotalMinutes} min` },
    { label: "Rough spend", value: `€${timeline.spendEuros}` },
  ];

  return (
    <div className="mx-auto max-w-330 px-6 pt-11 pb-24">
      <Link
        to={`/stadiums/${slug}`}
        className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-2 hover:text-acid"
      >
        ← Back to the map
      </Link>

      <div className="mt-4.5 flex flex-wrap items-end justify-between gap-8">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-acid">
            {event
              ? `${event.title} · ${formatClock(event.kickoffAt)} kick-off`
              : "No fixture selected"}
          </p>
          <h1 className="mt-3.5 font-display text-[clamp(38px,6vw,72px)] leading-[0.9] uppercase tracking-[-0.02em]">
            {stadium.city} Away Day
          </h1>
        </div>
        <p className="font-mono text-[11px] leading-[1.7] uppercase tracking-widest text-ink-3 lg:text-right">
          {pad2(stops.length)} stops · {timeline.walkTotalMinutes} min on foot
          <br />€{timeline.spendEuros} a head, give or take
        </p>
      </div>

      <div className="mt-11 grid items-start gap-11 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div>
          {stops.length === 0 ? (
            <StatusMessage
              title="No stops yet"
              description="Go back to the map and add a few."
            />
          ) : (
            <ol className="relative">
              {timeline.stops.map((stop, index) => {
                const meta = CATEGORY_META[stop.spot.category];

                return (
                  <li
                    key={stop.spot.id}
                    className="grid grid-cols-[74px_30px_minmax(0,1fr)] items-stretch"
                  >
                    <div className="py-5.5 pr-4 text-right">
                      <p
                        className="font-display text-[26px] leading-none"
                        style={{ color: meta.colour }}
                      >
                        {formatTimeOfDay(stop.startsAt)}
                      </p>
                      <p className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-3">
                        {stop.dwellMinutes} min
                      </p>
                    </div>

                    {/* The spine: a hairline behind a dot, so the stops read as
                        one continuous run rather than separate cards. */}
                    <div className="relative flex justify-center">
                      <span
                        aria-hidden="true"
                        className="absolute inset-y-0 w-px bg-line"
                      />
                      <span
                        aria-hidden="true"
                        className="relative mt-7 size-3.25 rounded-full shadow-[0_0_0_4px_var(--bg)]"
                        style={{ background: meta.colour }}
                      />
                    </div>

                    <div className="py-4 pl-5">
                      <div className="border border-line bg-surface px-5 py-4.5">
                        <div className="flex items-baseline justify-between gap-4">
                          <h2 className="font-display text-[23px] leading-[1.05] uppercase">
                            {stop.spot.name}
                          </h2>
                          <div className="flex shrink-0 gap-1.5">
                            <button
                              type="button"
                              onClick={() => moveStop(slug, index, -1)}
                              disabled={index === 0}
                              aria-label={`Move ${stop.spot.name} earlier`}
                              className="size-7 cursor-pointer border border-line font-mono text-[11px] text-ink-2 transition-colors hover:border-acid hover:text-ink disabled:cursor-not-allowed disabled:opacity-35"
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              onClick={() => moveStop(slug, index, 1)}
                              disabled={index === timeline.stops.length - 1}
                              aria-label={`Move ${stop.spot.name} later`}
                              className="size-7 cursor-pointer border border-line font-mono text-[11px] text-ink-2 transition-colors hover:border-acid hover:text-ink disabled:cursor-not-allowed disabled:opacity-35"
                            >
                              ↓
                            </button>
                            <button
                              type="button"
                              onClick={() => removeStop(slug, stop.spot.id)}
                              aria-label={`Remove ${stop.spot.name}`}
                              className="size-7 cursor-pointer border border-line font-mono text-[11px] text-ink-2 transition-colors hover:border-flare hover:text-flare"
                            >
                              ×
                            </button>
                          </div>
                        </div>

                        <p
                          className="mt-2 font-mono text-[9px] uppercase tracking-[0.16em]"
                          style={{ color: meta.colour }}
                        >
                          {meta.label}{" "}
                          <span className="text-ink-3">
                            · {formatPrice(stop.spot.priceLevel)}
                            {stop.spot.distanceMetres !== undefined
                              ? ` · ${formatDistance(stop.spot.distanceMetres)} from the ground`
                              : ""}
                          </span>
                        </p>

                        {stop.spot.description ? (
                          <p className="mt-2.5 text-sm leading-[1.55] text-pretty text-ink-2">
                            {stop.spot.description}
                          </p>
                        ) : null}

                        <p className="mt-3 font-mono text-[10px] tracking-[0.06em] text-ink-3">
                          {stop.legNote}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}

              {/* Kick-off closes the timeline — the fixed point everything
                  else was scheduled backwards from. */}
              {event ? (
                <li className="grid grid-cols-[74px_30px_minmax(0,1fr)]">
                  <div className="py-5.5 pr-4 text-right">
                    <p className="font-display text-[26px] leading-none text-acid">
                      {formatClock(event.kickoffAt)}
                    </p>
                    <p className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.14em] text-ink-3">
                      Kick-off
                    </p>
                  </div>
                  <div className="relative flex justify-center">
                    <span
                      aria-hidden="true"
                      className="absolute top-0 h-8.5 w-px bg-line"
                    />
                    <span
                      aria-hidden="true"
                      className="relative mt-7 size-4.25 bg-acid shadow-[0_0_0_4px_var(--bg)]"
                    />
                  </div>
                  <div className="py-4 pl-5">
                    <div className="bg-acid p-5 text-acid-ink">
                      <h2 className="font-display text-[28px] leading-none uppercase">
                        {event.title}
                      </h2>
                      <p className="mt-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] opacity-75">
                        {stadium.name} · {event.league}
                      </p>
                    </div>
                  </div>
                </li>
              ) : null}
            </ol>
          )}
        </div>

        <aside className="border border-line bg-surface lg:sticky lg:top-22">
          <div className="border-b border-dashed border-line px-5.5 pt-5.5 pb-4.5">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-ink-3">
              Away-day plan
            </p>
            <h2 className="mt-2.5 font-display text-[26px] leading-none uppercase">
              {stadium.city} Away Day
            </h2>
          </div>

          <dl className="px-5.5 pt-1.5 pb-3.5">
            {summary.map((row) => (
              <div
                key={row.label}
                className="flex items-baseline justify-between gap-4 border-b border-line-soft py-2.75"
              >
                <dt className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">
                  {row.label}
                </dt>
                <dd className="font-mono text-xs font-semibold text-ink">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>

          <div className="flex flex-col gap-2 px-5.5 pt-2 pb-5.5">
            <button
              type="button"
              onClick={share}
              disabled={stops.length === 0}
              className="h-12 cursor-pointer bg-acid font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-acid-ink disabled:cursor-not-allowed disabled:opacity-40"
            >
              Get shareable link
            </button>
            <Link
              to={`/stadiums/${slug}`}
              className="grid h-12 place-items-center border border-line font-mono text-[11px] uppercase tracking-[0.18em] text-ink hover:border-acid"
            >
              Add more stops
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
