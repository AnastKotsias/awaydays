import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MAX_RADIUS, useSpots, useStadium } from "@/api/queries";
import { StatusMessage } from "@/components/StatusMessage";
import {
  CATEGORY_META,
  formatClock,
  formatLongDate,
  formatPrice,
  formatTimeOfDay,
  pad2,
} from "@/lib/format";
import { decodePlan } from "@/plan/shareLink";
import { buildTimeline } from "@/plan/timeline";

export default function SharedPlanPage() {
  const { token = "" } = useParams<{ token: string }>();
  const [copied, setCopied] = useState(false);

  // Decoding is pure and cheap, but it runs on every render otherwise.
  const payload = useMemo(() => decodePlan(token), [token]);

  const stadiumQuery = useStadium(payload?.s ?? "");
  const spotsQuery = useSpots(payload?.s ?? "", {
    categories: [],
    radius: MAX_RADIUS,
  });

  const stops = useMemo(() => {
    if (!payload) return [];
    const byId = new Map(
      (spotsQuery.data?.data ?? []).map((spot) => [spot.id, spot]),
    );
    return payload.p
      .map((id) => byId.get(id))
      .filter((spot) => spot !== undefined);
  }, [payload, spotsQuery.data]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch {
      // Clipboard access needs a secure context and permission; the URL is
      // in the address bar either way.
      setCopied(false);
    }
  }

  if (!payload) {
    return (
      <div className="mx-auto max-w-210 px-6 py-16">
        <StatusMessage
          title="That link doesn't decode"
          description="It may have been truncated when it was copied. Ask for a fresh one."
        />
        <Link
          to="/grounds"
          className="mt-6 inline-block font-mono text-[10px] uppercase tracking-[0.2em] text-acid"
        >
          Browse grounds →
        </Link>
      </div>
    );
  }

  if (stadiumQuery.isPending || spotsQuery.isPending) {
    return (
      <div className="mx-auto max-w-210 px-6 py-16">
        <StatusMessage title="Opening the plan…" />
      </div>
    );
  }

  if (stadiumQuery.error) {
    return (
      <div className="mx-auto max-w-210 px-6 py-16">
        <StatusMessage
          title="Could not load this plan"
          description={stadiumQuery.error.message}
        />
      </div>
    );
  }

  const stadium = stadiumQuery.data;
  const event =
    stadium.events.find((candidate) => candidate.id === payload.e) ??
    stadium.events[0];
  const timeline = buildTimeline(stops, stadium, event?.kickoffAt ?? null);

  return (
    <div className="mx-auto max-w-210 px-6 pt-14 pb-24">
      <p className="truncate font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3">
        {window.location.host}/p/{token.slice(0, 12)}…
      </p>

      <article className="mt-4 border border-line bg-surface">
        <div className="border-b border-dashed border-line px-8.5 pt-8.5 pb-7">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-acid">
                Shared plan
              </p>
              <h1 className="mt-3 font-display text-[clamp(34px,5vw,56px)] leading-[0.92] uppercase tracking-[-0.015em]">
                {stadium.city} Away Day
              </h1>
              <p className="mt-3.5 font-mono text-[11px] tracking-widest text-ink-2">
                {event ? `${event.title} · ` : ""}
                {stadium.name}
                {event ? ` · ${formatLongDate(event.kickoffAt)}` : ""}
              </p>
            </div>
            {event ? (
              <span className="grid size-18.5 shrink-0 place-items-center bg-acid font-display text-3xl leading-none text-acid-ink">
                {formatClock(event.kickoffAt)}
              </span>
            ) : null}
          </div>
        </div>

        {timeline.stops.length === 0 ? (
          <div className="p-8.5">
            <StatusMessage title="This plan has no stops in it." />
          </div>
        ) : (
          <ol className="px-8.5 pt-2.5 pb-6">
            {timeline.stops.map((stop) => {
              const meta = CATEGORY_META[stop.spot.category];
              return (
                <li
                  key={stop.spot.id}
                  className="grid grid-cols-[64px_minmax(0,1fr)] gap-4.5 border-b border-line-soft py-5"
                >
                  <span
                    className="font-display text-xl"
                    style={{ color: meta.colour }}
                  >
                    {formatTimeOfDay(stop.startsAt)}
                  </span>
                  <div>
                    <h2 className="font-display text-[21px] leading-[1.05] uppercase">
                      {stop.spot.name}
                    </h2>
                    <p
                      className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.16em]"
                      style={{ color: meta.colour }}
                    >
                      {meta.label}{" "}
                      <span className="text-ink-3">
                        · {formatPrice(stop.spot.priceLevel)} ·{" "}
                        {stop.spot.address}
                      </span>
                    </p>
                    {stop.spot.description ? (
                      <p className="mt-2.25 text-sm leading-[1.55] text-ink-2">
                        {stop.spot.description}
                      </p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        <div className="flex flex-wrap items-center justify-between gap-5 px-8.5 pt-5.5 pb-7.5">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-3">
            {pad2(timeline.stops.length)} stops · {timeline.walkTotalMinutes} min
            on foot · €{timeline.spendEuros} a head
          </p>
          <div className="flex gap-2">
            <Link
              to={`/stadiums/${stadium.slug}`}
              className="border border-line px-5 py-3.5 font-mono text-[10px] uppercase tracking-[0.16em] text-ink hover:border-acid"
            >
              Copy this plan
            </Link>
            <button
              type="button"
              onClick={copyLink}
              className="cursor-pointer bg-acid px-5 py-3.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-acid-ink"
            >
              {copied ? "Link copied" : "Copy link"}
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}
