import type { Spot, Stadium } from "@/api/types";
import { distanceInMetres } from "@/lib/geo";
import { addMinutes, DWELL_MINUTES, walkMinutes } from "@/lib/format";

/** How long before kick-off the last stop should end. */
const BUFFER_BEFORE_KICKOFF = 20;

/** Rough spend per head at each price level, in euros. */
const SPEND_PER_PRICE_LEVEL = 12;

export type TimelineStop = {
  spot: Spot;
  /** When to arrive. */
  startsAt: Date;
  /** How long to stay, in minutes. */
  dwellMinutes: number;
  /** Walk from here to the next stop — or to the turnstiles, if last. */
  legMinutes: number;
  legNote: string;
};

export type Timeline = {
  stops: TimelineStop[];
  walkTotalMinutes: number;
  spendEuros: number;
  kickoff: Date | null;
};

/**
 * Schedules the stops backwards from kick-off.
 *
 * Working backwards is what makes the plan useful: you don't want to know
 * "how long will this take", you want to know "what time do I have to leave".
 * The total of every stay plus every walk is subtracted from kick-off (less a
 * buffer to reach the turnstiles), and the first stop lands on the result.
 *
 * Leg lengths are measured point-to-point with haversine rather than reusing
 * each spot's distance-from-the-ground — two spots 400 m from the ground on
 * opposite sides are 800 m apart, and the walking times should say so.
 */
export function buildTimeline(
  spots: Spot[],
  stadium: Stadium,
  kickoffIso: string | null,
): Timeline {
  if (spots.length === 0 || !kickoffIso) {
    return { stops: [], walkTotalMinutes: 0, spendEuros: 0, kickoff: null };
  }

  const kickoff = new Date(kickoffIso);

  // Leg i is the walk that leaves stop i: either to the next stop, or from the
  // final stop to the ground itself.
  const legs = spots.map((spot, index) => {
    const next = spots[index + 1];
    const destination = next ?? stadium;
    return walkMinutes(distanceInMetres(spot, destination));
  });

  const dwells = spots.map((spot) => DWELL_MINUTES[spot.category]);

  const totalMinutes =
    dwells.reduce((sum, value) => sum + value, 0) +
    legs.reduce((sum, value) => sum + value, 0);

  let cursor = addMinutes(kickoff, -(BUFFER_BEFORE_KICKOFF + totalMinutes));

  const stops: TimelineStop[] = spots.map((spot, index) => {
    const dwellMinutes = dwells[index] ?? 30;
    const legMinutes = legs[index] ?? 0;
    const startsAt = cursor;
    cursor = addMinutes(cursor, dwellMinutes + legMinutes);

    const next = spots[index + 1];
    return {
      spot,
      startsAt,
      dwellMinutes,
      legMinutes,
      legNote: next
        ? `${legMinutes} min walk to ${next.name}`
        : `${legMinutes} min walk to the turnstiles`,
    };
  });

  return {
    stops,
    walkTotalMinutes: legs.reduce((sum, value) => sum + value, 0),
    spendEuros: spots.reduce(
      (sum, spot) => sum + (spot.priceLevel ?? 1) * SPEND_PER_PRICE_LEVEL,
      0,
    ),
    kickoff,
  };
}
