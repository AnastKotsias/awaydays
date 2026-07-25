import type { Event } from "@/api/types";
import { formatKickoff, SPORT_LABEL } from "@/lib/format";

export function FixtureList({ events }: { events: Event[] }) {
  if (events.length === 0) {
    return (
      <p className="text-sm text-slate-400">
        No fixtures scheduled here at the moment.
      </p>
    );
  }

  return (
    <ul className="flex flex-wrap gap-3">
      {events.map((event) => (
        <li
          key={event.id}
          className="rounded-lg border border-white/10 bg-night-900 px-4 py-3"
        >
          <p className="font-semibold text-white">{event.title}</p>
          <p className="mt-0.5 text-xs text-slate-400">
            {formatKickoff(event.kickoffAt)} · {event.league} ·{" "}
            {SPORT_LABEL[event.sport]}
          </p>
        </li>
      ))}
    </ul>
  );
}
