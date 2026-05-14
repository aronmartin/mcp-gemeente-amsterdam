import type { FieldProfile, GeometryMode, LinksMode } from "./response-profiles.js";

export const GEOMETRY_KEYS = new Set([
  "geometrie", "geometry", "_geometry", "geoPoint", "geoMultiPoint",
]);

// RD New (EPSG:28992) → WGS84 — lineaire benadering verankerd aan Amsterdam Centraal.
// Nauwkeurig tot ~30m binnen Amsterdam; voldoende voor buurt-level queries.
function rdToWgs84(rdX: number, rdY: number): { lat: number; lon: number } {
  return {
    lat: Math.round((52.378784 + (rdY - 487366) / 111320) * 1e6) / 1e6,
    lon: Math.round((4.900276 + (rdX - 121389) / 67886) * 1e6) / 1e6,
  };
}

export function geometryToCentroid(geom: unknown): { lat: number; lon: number } | null {
  if (!geom || typeof geom !== "object") return null;
  const g = geom as { type?: string; coordinates?: unknown };
  let coords: number[][] = [];
  if (g.type === "Point") coords = [g.coordinates as number[]];
  else if (g.type === "Polygon") coords = (g.coordinates as number[][][])[0] ?? [];
  else if (g.type === "MultiPolygon") coords = (g.coordinates as number[][][][])[0]?.[0] ?? [];
  else if (g.type === "LineString") coords = g.coordinates as number[][];
  if (!coords.length) return null;
  const sumX = coords.reduce((s, c) => s + c[0], 0) / coords.length;
  const sumY = coords.reduce((s, c) => s + c[1], 0) / coords.length;
  return sumX > 100
    ? rdToWgs84(sumX, sumY)
    : { lat: Math.round(sumY * 1e6) / 1e6, lon: Math.round(sumX * 1e6) / 1e6 };
}

function simplifyLink(link: unknown): unknown {
  if (link && typeof link === "object" && "href" in (link as object)) {
    return { href: (link as { href: string }).href };
  }
  return link;
}

function shapeLinks(
  links: Record<string, unknown>,
  mode: LinksMode,
  extraFields: Set<string>,
): Record<string, unknown> | undefined {
  const result: Record<string, unknown> = {};

  for (const [k, v] of Object.entries(links)) {
    if (k === "schema") continue; // altijd ruis voor LLM
    const dotKey = `_links.${k}`;
    if (extraFields.has(dotKey)) {
      result[k] = v;
      continue;
    }
    if (mode === "none") continue;
    if (mode === "self" && k !== "self") continue;
    result[k] = mode === "full" ? v : simplifyLink(v);
  }

  return Object.keys(result).length > 0 ? result : undefined;
}

export function shapeItem(
  item: Record<string, unknown>,
  profile: FieldProfile,
  extraFields: Set<string>,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const includeAll = profile.include.length === 0;

  for (const [k, v] of Object.entries(item)) {
    if (GEOMETRY_KEYS.has(k)) continue; // apart afgehandeld
    if (k === "_links") {
      const shaped = shapeLinks(v as Record<string, unknown>, profile.links, extraFields);
      if (shaped) result["_links"] = shaped;
      continue;
    }
    if (includeAll || profile.include.includes(k) || extraFields.has(k)) {
      result[k] = v;
    }
  }

  // Geometry afhandeling
  const geomKey = Object.keys(item).find(k => GEOMETRY_KEYS.has(k));
  const geomValue = geomKey ? item[geomKey] : undefined;
  const wantsFullGeom = extraFields.has("geometrie") || extraFields.has("geometry");

  if (wantsFullGeom || profile.geometry === "full") {
    if (geomKey && geomValue !== undefined) result[geomKey] = geomValue;
  } else if (profile.geometry === "centroid") {
    const centroid = geometryToCentroid(geomValue);
    if (centroid) result["_centroid"] = centroid;
  }

  return result;
}
