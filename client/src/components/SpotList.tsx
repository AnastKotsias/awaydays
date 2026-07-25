import type { Spot } from "@/api/types";
import { CATEGORY_META, formatDistance, formatPrice } from "@/lib/format";

export function SpotList({ spots }: { spots: Spot[] }) {
  if (spots.length === 0) {
    return (
      <p className="rounded-xl border border-white/10 bg-night-900 p-6 text-center text-sm text-slate-400">
        Nothing matches these filters. Try a wider radius or another category.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {spots.map((spot) => {
        const meta = CATEGORY_META[spot.category];

        return (
          <li
            key={spot.id}
            className="rounded-xl border border-white/10 bg-night-900 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-semibold text-white">{spot.name}</h3>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-slate-400">
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium"
                    style={{
                      backgroundColor: `${meta.colour}22`,
                      color: meta.colour,
                    }}
                  >
                    {meta.icon} {meta.label}
                  </span>
                  <span>{formatPrice(spot.priceLevel)}</span>
                </p>
              </div>

              {spot.distanceMetres !== undefined ? (
                <span className="shrink-0 rounded-md bg-white/5 px-2 py-1 text-xs font-medium text-slate-300">
                  {formatDistance(spot.distanceMetres)}
                </span>
              ) : null}
            </div>

            {spot.description ? (
              <p className="mt-2 text-sm text-slate-400">{spot.description}</p>
            ) : null}
            <p className="mt-1 text-xs text-slate-500">{spot.address}</p>
          </li>
        );
      })}
    </ul>
  );
}
