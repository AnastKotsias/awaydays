import { useState } from "react";
import { useStadiums } from "@/api/queries";
import { StadiumCard } from "@/components/StadiumCard";
import { SkeletonCard, StatusMessage } from "@/components/StatusMessage";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

export default function StadiumsPage() {
  const [search, setSearch] = useState("");
  // The request follows the debounced value; the input follows `search`, so
  // typing stays instant while the network stays quiet.
  const debouncedSearch = useDebouncedValue(search);

  const { data: stadiums, isPending, error } = useStadiums(debouncedSearch);

  return (
    <section className="mx-auto max-w-330 px-6 pt-14 pb-24">
      <div className="flex flex-wrap items-end justify-between gap-8">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-acid">
            The fixture list
          </p>
          <h1 className="mt-4 font-display text-[clamp(40px,6vw,76px)] leading-[0.92] uppercase tracking-[-0.02em]">
            Pick your away day
          </h1>
        </div>

        <label className="flex min-w-75 items-center gap-2.5 border-b-2 border-line pb-2 focus-within:border-acid">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-3">
            Find
          </span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="ground or city"
            aria-label="Search grounds by name or city"
            className="min-w-0 flex-1 border-0 bg-transparent text-[17px] text-ink outline-none placeholder:text-ink-3"
          />
        </label>
      </div>

      <div className="mt-11">
        {isPending ? (
          <div className="grid gap-5 lg:grid-cols-2">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : error ? (
          <StatusMessage
            title="Could not load the grounds"
            description={error.message}
          />
        ) : stadiums.length === 0 ? (
          <StatusMessage
            title="No grounds match that search"
            description="Try a city, or clear the box to see them all."
          />
        ) : (
          <ul className="grid gap-5 lg:grid-cols-2">
            {stadiums.map((stadium) => (
              <li key={stadium.id}>
                <StadiumCard stadium={stadium} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
