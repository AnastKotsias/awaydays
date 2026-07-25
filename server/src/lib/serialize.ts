import type {
  EventModel,
  SpotModel,
  StadiumModel,
} from "../generated/prisma/models.js";
import type { Sport, SpotCategory } from "../generated/prisma/enums.js";

/**
 * Shapes returned by the API.
 *
 * Database rows are deliberately not sent straight to the client:
 *
 * - it keeps bookkeeping columns (createdAt/updatedAt) out of the payload
 * - dates become explicit ISO strings instead of relying on how JSON.stringify
 *   happens to treat a Date
 * - adding a column to the schema no longer changes the public API by accident
 */

export type StadiumDto = {
  id: string;
  slug: string;
  name: string;
  city: string;
  country: string;
  blurb: string | null;
  latitude: number;
  longitude: number;
  capacity: number | null;
  imageUrl: string | null;
};

export function toStadiumDto(stadium: StadiumModel): StadiumDto {
  return {
    id: stadium.id,
    slug: stadium.slug,
    name: stadium.name,
    city: stadium.city,
    country: stadium.country,
    blurb: stadium.blurb,
    latitude: stadium.latitude,
    longitude: stadium.longitude,
    capacity: stadium.capacity,
    imageUrl: stadium.imageUrl,
  };
}

export type EventDto = {
  id: string;
  /** Convenience label, e.g. "Olympiacos vs AEK Athens". */
  title: string;
  homeTeam: string;
  awayTeam: string;
  sport: Sport;
  league: string;
  kickoffAt: string;
  stadium?: StadiumDto;
};

export function toEventDto(
  event: EventModel & { stadium?: StadiumModel },
): EventDto {
  return {
    id: event.id,
    title: `${event.homeTeam} vs ${event.awayTeam}`,
    homeTeam: event.homeTeam,
    awayTeam: event.awayTeam,
    sport: event.sport,
    league: event.league,
    kickoffAt: event.kickoffAt.toISOString(),
    ...(event.stadium ? { stadium: toStadiumDto(event.stadium) } : {}),
  };
}

export type SpotDto = {
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
  /** Straight-line distance from the stadium, present on radius searches. */
  distanceMetres?: number;
};

export function toSpotDto(
  spot: SpotModel,
  distanceMetres?: number,
): SpotDto {
  return {
    id: spot.id,
    name: spot.name,
    category: spot.category,
    description: spot.description,
    address: spot.address,
    latitude: spot.latitude,
    longitude: spot.longitude,
    priceLevel: spot.priceLevel,
    website: spot.website,
    ...(distanceMetres === undefined
      ? {}
      : { distanceMetres: Math.round(distanceMetres) }),
  };
}
