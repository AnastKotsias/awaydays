/** Mean radius of the Earth in metres. */
const EARTH_RADIUS_M = 6_371_000;

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

/**
 * Great-circle distance between two coordinates, in metres.
 *
 * This is the haversine formula: it treats the Earth as a sphere, which is
 * accurate to a few metres over the short, city-sized distances this app
 * deals with — far simpler than pulling in PostGIS for a "bars near the
 * stadium" feature.
 */
export function distanceInMetres(
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number },
): number {
  const deltaLat = toRadians(to.latitude - from.latitude);
  const deltaLng = toRadians(to.longitude - from.longitude);

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRadians(from.latitude)) *
      Math.cos(toRadians(to.latitude)) *
      Math.sin(deltaLng / 2) ** 2;

  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(a));
}

/**
 * Moves a coordinate by a number of metres north and east.
 *
 * Used by the seed script so sample spots sit at believable, known distances
 * from their stadium instead of at hand-typed coordinates.
 */
export function offsetCoordinates(
  origin: { latitude: number; longitude: number },
  metresNorth: number,
  metresEast: number,
): { latitude: number; longitude: number } {
  const metresPerDegreeLat = (Math.PI / 180) * EARTH_RADIUS_M;
  const metresPerDegreeLng =
    metresPerDegreeLat * Math.cos(toRadians(origin.latitude));

  return {
    latitude: origin.latitude + metresNorth / metresPerDegreeLat,
    longitude: origin.longitude + metresEast / metresPerDegreeLng,
  };
}
