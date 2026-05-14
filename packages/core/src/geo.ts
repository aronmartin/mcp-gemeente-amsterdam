import type { AmsClient, DsoPage, QueryParams } from "./client.js";

// Linear approximation anchored at Amsterdam Centraal.
// Accurate to ~30m within Amsterdam; sufficient for neighbourhood-level queries.
// Reference: RD(121389, 487366) = WGS84(52.378784°, 4.900276°)
const REF_RD_X = 121389;
const REF_RD_Y = 487366;
const REF_LAT = 52.378784;
const REF_LON = 4.900276;
const METERS_PER_LAT_DEG = 111320;
const METERS_PER_LON_DEG = 67886;

export function rdToWgs84(rdX: number, rdY: number): { lat: number; lon: number } {
  return {
    lat: Math.round((REF_LAT + (rdY - REF_RD_Y) / METERS_PER_LAT_DEG) * 1e6) / 1e6,
    lon: Math.round((REF_LON + (rdX - REF_RD_X) / METERS_PER_LON_DEG) * 1e6) / 1e6,
  };
}

export function wgs84ToRd(lat: number, lon: number): [number, number] {
  return [
    Math.round(REF_RD_X + (lon - REF_LON) * METERS_PER_LON_DEG),
    Math.round(REF_RD_Y + (lat - REF_LAT) * METERS_PER_LAT_DEG),
  ];
}

export function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function geomToCentroid(geom: unknown): { lat: number; lon: number } | null {
  if (!geom || typeof geom !== "object") return null;
  const g = geom as { type?: string; coordinates?: unknown };
  let coords: number[][] = [];
  if (g.type === "Point") coords = [g.coordinates as number[]];
  else if (g.type === "Polygon") coords = (g.coordinates as number[][][])[0] ?? [];
  else if (g.type === "MultiPolygon") coords = (g.coordinates as number[][][][])[0]?.[0] ?? [];
  else if (g.type === "LineString") coords = g.coordinates as number[][];
  if (!coords.length) return null;
  const n = coords.length;
  const sumX = coords.reduce((s, c) => s + c[0], 0) / n;
  const sumY = coords.reduce((s, c) => s + c[1], 0) / n;
  return sumX > 100
    ? rdToWgs84(sumX, sumY)
    : { lat: Math.round(sumY * 1e6) / 1e6, lon: Math.round(sumX * 1e6) / 1e6 };
}

/** WKT POLYGON in WGS84 for API geo[intersects] filter */
export function buildIntersectsParam(nearLat: number, nearLon: number, radiusMeters: number): string {
  const latOff = radiusMeters / METERS_PER_LAT_DEG;
  const lonOff = radiusMeters / METERS_PER_LON_DEG;
  const minLat = nearLat - latOff;
  const maxLat = nearLat + latOff;
  const minLon = nearLon - lonOff;
  const maxLon = nearLon + lonOff;
  return `POLYGON((${minLon} ${minLat}, ${maxLon} ${minLat}, ${maxLon} ${maxLat}, ${minLon} ${maxLat}, ${minLon} ${minLat}))`;
}

/**
 * Filter and sort a DsoPage by distance from nearLat/nearLon.
 * Items without geometry pass through unfiltered (no distance info).
 * Adds _distanceMeters to each item that has geometry.
 */
export function applyNearFilter<T extends Record<string, unknown>>(
  page: DsoPage<T>,
  nearLat: number,
  nearLon: number,
  radiusMeters: number,
): DsoPage<T & { _distanceMeters?: number }> {
  const filtered: Record<string, (T & { _distanceMeters?: number })[]> = {};
  for (const [key, items] of Object.entries(page._embedded ?? {})) {
    const annotated = (items as T[]).map((item): T & { _distanceMeters?: number } => {
      // Some datasets use 'geometry' (without 'e'), e.g. bodem/grond
      const centroid = geomToCentroid(item.geometrie ?? item.geometry);
      if (!centroid) return { ...item };
      return { ...item, _distanceMeters: Math.round(haversineMeters(nearLat, nearLon, centroid.lat, centroid.lon)) };
    });
    const withinRadius = annotated
      .filter((item) => item._distanceMeters === undefined || item._distanceMeters <= radiusMeters)
      .sort((a, b) => (a._distanceMeters ?? Infinity) - (b._distanceMeters ?? Infinity));
    filtered[key] = withinRadius;
  }
  return { ...page, _embedded: filtered };
}

export const nearRadiusProps = {
  nearLat: { type: "number", description: "WGS84 latitude van het zoekpunt voor locatiefilter" },
  nearLon: { type: "number", description: "WGS84 longitude van het zoekpunt voor locatiefilter" },
  radiusMeters: { type: "number", description: "Zoekradius in meters (standaard 500)" },
} as const;

/**
 * Voert een volledige near-radius query uit:
 *  1. Stuurt een bbox-prefilter (geoParam) naar upstream
 *  2. Pagineert tot alle resultaten binnen de bbox zijn opgehaald (max 5 pagina's à 1000)
 *  3. Filtert client-side op de exacte circulaire radius via haversine
 *  4. Sorteert op afstand en begrenst op `limit` items
 *  5. Voegt _distanceMeters toe aan elk item
 */
export async function fetchNearRadius<T extends Record<string, unknown>>(
  client: AmsClient,
  dataset: string,
  collection: string,
  geoParam: string,
  nearLat: number,
  nearLon: number,
  radiusMeters: number,
  baseParams: QueryParams,
  limit: number,
): Promise<DsoPage<T & { _distanceMeters?: number }>> {
  const params = { ...baseParams, [geoParam]: buildIntersectsParam(nearLat, nearLon, radiusMeters) };
  const allPages = await client.listAll<T>(dataset, collection, params);
  const filtered = applyNearFilter(allPages, nearLat, nearLon, radiusMeters);
  const key = Object.keys(filtered._embedded ?? {})[0];
  if (key && limit > 0) {
    (filtered._embedded as Record<string, unknown[]>)[key] = filtered._embedded[key].slice(0, limit);
  }
  return filtered;
}
