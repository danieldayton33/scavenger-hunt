/**
 * Randomly shifts a lat/lng position by a small amount (within ~100-300 meters)
 * to make the item location approximate rather than exact.
 *
 * @param lat - Latitude
 * @param lng - Longitude
 * @param maxRadiusMeters - Maximum radius in meters to shift (default: 200)
 * @returns A slightly shifted position
 */
export function randomizeLocation(
  lat: number,
  lng: number,
  maxRadiusMeters: number = 200
): { lat: number; lng: number } {
  // Convert meters to degrees (approximate)
  // 1 degree latitude ≈ 111,000 meters
  // 1 degree longitude ≈ 111,000 * cos(latitude) meters
  const metersPerDegreeLat = 111000;
  const metersPerDegreeLng = 111000 * Math.cos((lat * Math.PI) / 180);

  // Generate random angle (0 to 2π)
  const angle = Math.random() * 2 * Math.PI;

  // Generate random distance (0 to maxRadiusMeters)
  // Using square root for uniform distribution in circle
  const distance = Math.sqrt(Math.random()) * maxRadiusMeters;

  // Calculate offset in degrees
  const offsetLat = (distance * Math.cos(angle)) / metersPerDegreeLat;
  const offsetLng = (distance * Math.sin(angle)) / metersPerDegreeLng;

  return {
    lat: lat + offsetLat,
    lng: lng + offsetLng,
  };
}

/**
 * Creates a circle configuration for Google Maps with a randomized center position
 *
 * @param itemLat - Item's actual latitude
 * @param itemLng - Item's actual longitude
 * @param radiusMeters - Circle radius in meters (default: 750)
 * @param maxShiftMeters - Maximum distance to shift center (default: 200)
 * @returns Circle configuration object
 */
export function createRandomizedCircle(
  itemLat: number,
  itemLng: number,
  radiusMeters: number = 750,
  maxShiftMeters: number = 200
): {
  center: { lat: number; lng: number };
  radius: number;
} {
  const randomizedCenter = randomizeLocation(itemLat, itemLng, maxShiftMeters);

  return {
    center: randomizedCenter,
    radius: radiusMeters,
  };
}
