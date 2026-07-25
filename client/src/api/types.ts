/**
 * The shapes the API returns.
 *
 * These mirror `server/src/lib/serialize.ts` by hand. Two separate npm
 * projects cannot share types without extra tooling, so if you change a DTO
 * on the server, change it here too — TypeScript will then point at every
 * component that needs updating.
 */

export type Sport = "FOOTBALL" | "BASKETBALL";

export type SpotCategory =
  | "SPORTS_BAR"
  | "LOCAL_FOOD"
  | "FAN_MEETING_POINT"
  | "PUB"
  | "CAFE";

export type Stadium = {
  id: string;
  slug: string;
  name: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  capacity: number | null;
  imageUrl: string | null;
};

/** A stadium in the browse list, with its counts. */
export type StadiumListItem = Stadium & {
  spotCount: number;
  upcomingEventCount: number;
};

export type Event = {
  id: string;
  title: string;
  homeTeam: string;
  awayTeam: string;
  sport: Sport;
  league: string;
  /** ISO 8601 timestamp. */
  kickoffAt: string;
  stadium?: Stadium;
};

/** A single stadium with its upcoming fixtures attached. */
export type StadiumDetail = Stadium & {
  events: Event[];
};

export type Spot = {
  id: string;
  name: string;
  category: SpotCategory;
  description: string | null;
  address: string;
  latitude: number;
  longitude: number;
  /** 1 = cheap, 2 = mid, 3 = pricey. */
  priceLevel: number | null;
  website: string | null;
  /** Present on radius searches. */
  distanceMetres?: number;
};

export type SpotSearchMeta = {
  stadium: Stadium;
  radius: number;
  count: number;
};

/** Every endpoint wraps its payload in `data`, with optional `meta`. */
export type Envelope<TData, TMeta = undefined> = {
  data: TData;
  meta: TMeta;
};
