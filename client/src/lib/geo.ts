const EARTH_RADIUS_M = 6_371_000;

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

export type Coordinates = { latitude: number; longitude: number };

/**
 * Great-circle distance between two points, in metres (haversine).
 *
 * The same formula the API uses for radius search, needed here as well so the
 * itinerary can measure the actual walk from one stop to the next rather than
 * guessing from how far each one sits from the ground.
 */
export function distanceInMetres(from: Coordinates, to: Coordinates): number {
  const deltaLat = toRadians(to.latitude - from.latitude);
  const deltaLng = toRadians(to.longitude - from.longitude);

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRadians(from.latitude)) *
      Math.cos(toRadians(to.latitude)) *
      Math.sin(deltaLng / 2) ** 2;

  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(a));
}
