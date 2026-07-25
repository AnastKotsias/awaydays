import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/api/client";
import type {
  Envelope,
  Spot,
  SpotCategory,
  SpotSearchMeta,
  StadiumDetail,
  StadiumListItem,
} from "@/api/types";

/**
 * Query keys, in one place.
 *
 * TanStack Query caches by key, so a typo would quietly create a second cache
 * entry that never updates. Building keys from these helpers makes that
 * impossible and keeps invalidation easy to reason about later.
 */
export const queryKeys = {
  stadiums: (search?: string) => ["stadiums", { search: search ?? "" }] as const,
  stadium: (slug: string) => ["stadium", slug] as const,
  spots: (slug: string, filters: SpotFilters) =>
    ["stadium", slug, "spots", filters] as const,
};

export function useStadiums(search?: string) {
  return useQuery({
    queryKey: queryKeys.stadiums(search),
    queryFn: ({ signal }) =>
      apiGet<Envelope<StadiumListItem[]>>(
        "/api/stadiums",
        { q: search || undefined },
        signal,
      ).then((body) => body.data),
  });
}

export function useStadium(slug: string) {
  return useQuery({
    queryKey: queryKeys.stadium(slug),
    queryFn: ({ signal }) =>
      apiGet<Envelope<StadiumDetail>>(
        `/api/stadiums/${slug}`,
        undefined,
        signal,
      ).then((body) => body.data),
  });
}

export type SpotFilters = {
  /** Empty means "every category". */
  categories: SpotCategory[];
  radius: number;
  maxPrice?: number;
};

export function useSpots(slug: string, filters: SpotFilters) {
  return useQuery({
    queryKey: queryKeys.spots(slug, filters),
    queryFn: ({ signal }) =>
      apiGet<Envelope<Spot[], SpotSearchMeta>>(
        `/api/stadiums/${slug}/spots`,
        {
          // The API accepts a comma-separated list; omit the parameter
          // entirely when nothing is selected.
          category: filters.categories.length
            ? filters.categories.join(",")
            : undefined,
          radius: filters.radius,
          maxPrice: filters.maxPrice,
        },
        signal,
      ),
    // Keep the previous results on screen while a new radius or category
    // loads, so the map does not flash empty on every filter change.
    placeholderData: (previous) => previous,
  });
}
