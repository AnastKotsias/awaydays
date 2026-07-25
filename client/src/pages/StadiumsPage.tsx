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
    <section>
      <h1 className="text-3xl font-bold tracking-tight text-white">
        Pick your away day
      </h1>
      <p className="mt-2 max-w-2xl text-slate-400">
        Choose a ground to see its upcoming fixtures and everything worth
        visiting around it.
      </p>

      <div className="mt-6 max-w-md">
        <label htmlFor="stadium-search" className="sr-only">
          Search grounds by name or city
        </label>
        <input
          id="stadium-search"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by ground or city…"
          className="w-full rounded-lg border border-white/10 bg-night-900 px-4 py-2.5 text-white placeholder:text-slate-500 focus:border-pitch-500 focus:outline-none"
        />
      </div>

      <div className="mt-8">
        {isPending ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <SkeletonCard />
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stadiums.map((stadium) => (
              <StadiumCard key={stadium.id} stadium={stadium} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
