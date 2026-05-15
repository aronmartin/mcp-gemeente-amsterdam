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

// ─── GeoOp: server-side geometry transform ───────────────────────────────────

export type GeoOp = "centroid" | "area" | "contains" | "distance_to_edge" | "bbox";

export type GeoOpResult = {
  _lat?: number;
  _lon?: number;
  _area_m2?: number;
  _contains?: boolean;
  _distance_to_edge_m?: number;
  _bbox?: [number, number, number, number]; // [minLon, minLat, maxLon, maxLat]
};

const GEOMETRY_KEYS_LOCAL = new Set([
  "geometrie", "geometry", "_geometry", "geoPoint", "geoMultiPoint",
]);

/** Extract de eerste ring van een Polygon of MultiPolygon geometry als [x, y][] */
function extractRing(geom: unknown): number[][] | null {
  if (!geom || typeof geom !== "object") return null;
  const g = geom as { type?: string; coordinates?: unknown };
  if (g.type === "Polygon") {
    const ring = (g.coordinates as number[][][])?.[0];
    return ring?.length ? ring : null;
  }
  if (g.type === "MultiPolygon") {
    const ring = (g.coordinates as number[][][][])?.[0]?.[0];
    return ring?.length ? ring : null;
  }
  return null;
}

/** Haal de geometry op uit een API item via bekende keys */
function extractGeometry(item: Record<string, unknown>): unknown {
  for (const key of GEOMETRY_KEYS_LOCAL) {
    if (key in item) return item[key];
  }
  return null;
}

/** Shoelace formule voor polygoon-oppervlakte in geprojecteerde eenheden² */
function shoelaceArea(ring: number[][]): number {
  let area = 0;
  const n = ring.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += ring[i][0] * ring[j][1];
    area -= ring[j][0] * ring[i][1];
  }
  return Math.abs(area) / 2;
}

/** Punt-in-polygoon via ray casting */
function pointInPolygon(lat: number, lon: number, ring: number[][], isRd: boolean): boolean {
  // Converteer punt naar zelfde coördinatenstelsel als ring
  const [px, py] = isRd ? wgs84ToRd(lat, lon) : [lon, lat];
  let inside = false;
  const n = ring.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

/** Minimale afstand van punt tot alle segmenten van de ring (haversine benadering via segment-middelpunt) */
function minDistanceToEdge(lat: number, lon: number, ring: number[][], isRd: boolean): number {
  let minDist = Infinity;
  const n = ring.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    const midX = (xi + xj) / 2;
    const midY = (yi + yj) / 2;
    const { lat: midLat, lon: midLon } = isRd
      ? rdToWgs84(midX, midY)
      : { lat: midY, lon: midX };
    const dist = haversineMeters(lat, lon, midLat, midLon);
    if (dist < minDist) minDist = dist;
  }
  return minDist;
}

/**
 * Voer een geometry-operatie uit op een raw API item.
 * Werkt op het originele item (vóór stripGeometry) zodat geometry beschikbaar is.
 */
export function applyGeoOp(
  item: Record<string, unknown>,
  op: GeoOp,
  geoLat?: number,
  geoLon?: number,
): GeoOpResult {
  if (op === "centroid") {
    const geom = extractGeometry(item);
    const centroid = geomToCentroid(geom);
    if (!centroid) return {};
    return { _lat: centroid.lat, _lon: centroid.lon };
  }

  if (op === "bbox") {
    const geom = extractGeometry(item);
    if (!geom || typeof geom !== "object") return {};
    const g = geom as { type?: string; coordinates?: unknown };
    let allCoords: number[][] = [];
    if (g.type === "Polygon") {
      allCoords = (g.coordinates as number[][][])?.[0] ?? [];
    } else if (g.type === "MultiPolygon") {
      for (const poly of (g.coordinates as number[][][][]) ?? []) {
        for (const ring of poly ?? []) {
          allCoords = allCoords.concat(ring);
        }
      }
    } else if (g.type === "LineString") {
      allCoords = g.coordinates as number[][];
    } else if (g.type === "Point") {
      allCoords = [g.coordinates as number[]];
    }
    if (!allCoords.length) return {};
    const isRd = allCoords[0][0] > 1000;
    const wgsCoords = isRd
      ? allCoords.map(c => { const w = rdToWgs84(c[0], c[1]); return [w.lon, w.lat]; })
      : allCoords.map(c => [c[0], c[1]]);
    const minLon = Math.min(...wgsCoords.map(c => c[0]));
    const maxLon = Math.max(...wgsCoords.map(c => c[0]));
    const minLat = Math.min(...wgsCoords.map(c => c[1]));
    const maxLat = Math.max(...wgsCoords.map(c => c[1]));
    return { _bbox: [
      Math.round(minLon * 1e6) / 1e6,
      Math.round(minLat * 1e6) / 1e6,
      Math.round(maxLon * 1e6) / 1e6,
      Math.round(maxLat * 1e6) / 1e6,
    ] };
  }

  // area, contains, distance_to_edge — werken op ring
  const geom = extractGeometry(item);
  const ring = extractRing(geom);
  if (!ring || !ring.length) return {};

  const isRd = ring[0][0] > 1000;

  if (op === "area") {
    let area: number;
    if (isRd) {
      // RD is metrisch stelsel — Shoelace geeft m² direct
      area = shoelaceArea(ring);
    } else {
      // WGS84 — schakel om naar meters via lat/lon schaling
      const refLat = ring.reduce((s, c) => s + c[1], 0) / ring.length;
      const metersPerLon = METERS_PER_LON_DEG * Math.cos((refLat * Math.PI) / 180);
      const scaled = ring.map(c => [c[0] * metersPerLon, c[1] * METERS_PER_LAT_DEG]);
      area = shoelaceArea(scaled);
    }
    return { _area_m2: Math.round(area) };
  }

  if (op === "contains") {
    if (geoLat === undefined || geoLon === undefined) return {};
    return { _contains: pointInPolygon(geoLat, geoLon, ring, isRd) };
  }

  if (op === "distance_to_edge") {
    if (geoLat === undefined || geoLon === undefined) return {};
    const dist = minDistanceToEdge(geoLat, geoLon, ring, isRd);
    return { _distance_to_edge_m: Math.round(dist) };
  }

  return {};
}

export const nearRadiusProps = {
  nearLat: { type: "number", description: "WGS84 latitude van het zoekpunt. Gebruik samen met nearLon + radiusMeters voor locatievragen — dit stuurt een server-side bbox-filter naar de API waardoor alleen relevante items worden opgehaald. Veel efficiënter dan ongefilterde paginatie." },
  nearLon: { type: "number", description: "WGS84 longitude van het zoekpunt. Vereist samen met nearLat." },
  radiusMeters: { type: "number", description: "Zoekradius in meters rondom nearLat/nearLon (standaard 500). Resultaten worden gesorteerd op afstand oplopend en krijgen _distanceMeters mee." },
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
