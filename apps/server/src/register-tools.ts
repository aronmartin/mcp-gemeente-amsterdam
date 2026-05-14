import type { FastMCP } from "fastmcp";
import { bagToolDefinitions, handleBagTool } from "@amsterdam-mcp/bag";
import { gebiedenToolDefinitions, handleGebiedenTool } from "@amsterdam-mcp/gebieden";
import { groenToolDefinitions, handleGroenTool } from "@amsterdam-mcp/groen";
import { verkeerToolDefinitions, handleVerkeerTool } from "@amsterdam-mcp/verkeer";
import { afvalToolDefinitions, handleAfvalTool } from "@amsterdam-mcp/afval";
import { bodemToolDefinitions, handleBodemTool } from "@amsterdam-mcp/bodem";
import { erfgoedToolDefinitions, handleErfgoedTool } from "@amsterdam-mcp/erfgoed";
import { duurzaamheidToolDefinitions, handleDuurzaamheidTool } from "@amsterdam-mcp/duurzaamheid";
import { vastgoedToolDefinitions, handleVastgoedTool } from "@amsterdam-mcp/vastgoed";
import { openbareRuimteToolDefinitions, handleOpenbareRuimteTool } from "@amsterdam-mcp/openbare-ruimte";
import { veiligheidToolDefinitions, handleVeiligheidTool } from "@amsterdam-mcp/veiligheid";
import { vergunningenToolDefinitions, handleVergunningenTool } from "@amsterdam-mcp/vergunningen";
import { sportVoorzieningenToolDefinitions, handleSportVoorzieningenTool } from "@amsterdam-mcp/sport-voorzieningen";
import { statistiekenToolDefinitions, handleStatistiekenTool } from "@amsterdam-mcp/statistieken";
import { waterToolDefinitions, handleWaterTool } from "@amsterdam-mcp/water";
import { wiorToolDefinitions, handleWiorTool } from "@amsterdam-mcp/wior";
import { winkelgebiedenToolDefinitions, handleWinkelgebiedenTool } from "@amsterdam-mcp/winkelgebieden";
import { meldingenToolDefinitions, handleMeldingenTool } from "@amsterdam-mcp/meldingen";
import { verkiezingenToolDefinitions, handleVerkiezingenTool } from "@amsterdam-mcp/verkiezingen";
import { analyseToolDefinitions, handleAnalyseTool } from "@amsterdam-mcp/analyse";
import { buildZodSchema } from "./json-schema-to-zod.js";
import type { JsonSchemaProp } from "./types.js";
import type { ToolDef, DsoPage } from "@amsterdam-mcp/core";

const GEOMETRY_KEYS = new Set(["geometrie", "geometry", "_geometry", "geoPoint", "geoMultiPoint"]);
const MAX_RESPONSE_BYTES = 200_000;

// RD New (EPSG:28992) → WGS84 — lineaire benadering verankerd aan Amsterdam Centraal.
// Nauwkeurig tot ~30m binnen Amsterdam; voldoende voor buurt-level queries.
// Referentie: RD(121389, 487366) = WGS84(52.378784°, 4.900276°)
function rdToWgs84(rdX: number, rdY: number): { lat: number; lon: number } {
  return {
    lat: Math.round((52.378784 + (rdY - 487366) / 111320) * 1e6) / 1e6,
    lon: Math.round((4.900276 + (rdX - 121389) / 67886) * 1e6) / 1e6,
  };
}

function geometryToCentroid(geom: unknown): { lat: number; lon: number } | null {
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
  // RD coordinates are in the range 7000–300000 for x; WGS84 lon is 3–8
  return sumX > 100 ? rdToWgs84(sumX, sumY) : { lat: Math.round(sumY * 1e6) / 1e6, lon: Math.round(sumX * 1e6) / 1e6 };
}

function processValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(processValue);
  if (value !== null && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (GEOMETRY_KEYS.has(k)) {
        const centroid = geometryToCentroid(v);
        if (centroid) result["_centroid"] = centroid;
        // geometry itself is dropped
      } else {
        result[k] = processValue(v);
      }
    }
    return result;
  }
  return value;
}

function formatResult(raw: unknown): string {
  // Unwrap DSO HAL envelope into a flat structure
  if (raw !== null && typeof raw === "object" && "_embedded" in (raw as object)) {
    const hal = raw as DsoPage<unknown>;
    const embedded = hal._embedded ?? {};
    const items = Object.values(embedded).flat();
    const clean = {
      items: processValue(items),
      pagination: hal.page ?? {},
    };
    const json = JSON.stringify(clean);
    if (json.length > MAX_RESPONSE_BYTES) {
      const truncated = { ...clean, items: (clean.items as unknown[]).slice(0, 10), truncated: true, note: `Response te groot (${json.length} bytes). Gebruik page_size of filters om resultaten te beperken.` };
      return JSON.stringify(truncated, null, 2);
    }
    return JSON.stringify(clean, null, 2);
  }

  // Single-object response
  const clean = processValue(raw);
  const json = JSON.stringify(clean, null, 2);
  if (json.length > MAX_RESPONSE_BYTES) {
    return JSON.stringify({ error: "Response te groot", bytes: json.length, hint: "Gebruik _fields om velden te beperken." }, null, 2);
  }
  return json;
}

type ToolExecutor = (toolName: string, args: Record<string, unknown>) => Promise<unknown>;

type RegisteredTool = {
  name: string;
  description: string;
  parameters: ReturnType<typeof buildZodSchema>;
  execute: (args: Record<string, unknown>) => Promise<string>;
};

type ToolBundle = {
  definitions: readonly ToolDef[];
  executeTool: ToolExecutor;
};

function toMcpToolSpec(tool: ToolDef, executeTool: ToolExecutor): RegisteredTool {
  const required = [...(tool.parameters.required ?? [])];
  return {
    name: tool.name,
    description: tool.description,
    parameters: buildZodSchema(
      tool.parameters.properties as Record<string, JsonSchemaProp>,
      required,
    ),
    execute: async (args) => {
      const result = await executeTool(tool.name, args);
      return formatResult(result);
    },
  };
}

function bundleToSpecs(bundle: ToolBundle): RegisteredTool[] {
  return bundle.definitions.map((def) => toMcpToolSpec(def, bundle.executeTool));
}

const amsterdamToolBundles: readonly ToolBundle[] = [
  { definitions: bagToolDefinitions, executeTool: handleBagTool },
  { definitions: gebiedenToolDefinitions, executeTool: handleGebiedenTool },
  { definitions: groenToolDefinitions, executeTool: handleGroenTool },
  { definitions: verkeerToolDefinitions, executeTool: handleVerkeerTool },
  { definitions: afvalToolDefinitions, executeTool: handleAfvalTool },
  { definitions: bodemToolDefinitions, executeTool: handleBodemTool },
  { definitions: erfgoedToolDefinitions, executeTool: handleErfgoedTool },
  { definitions: duurzaamheidToolDefinitions, executeTool: handleDuurzaamheidTool },
  { definitions: vastgoedToolDefinitions, executeTool: handleVastgoedTool },
  { definitions: openbareRuimteToolDefinitions, executeTool: handleOpenbareRuimteTool },
  { definitions: veiligheidToolDefinitions, executeTool: handleVeiligheidTool },
  { definitions: vergunningenToolDefinitions, executeTool: handleVergunningenTool },
  { definitions: sportVoorzieningenToolDefinitions, executeTool: handleSportVoorzieningenTool },
  { definitions: statistiekenToolDefinitions, executeTool: handleStatistiekenTool },
  { definitions: waterToolDefinitions, executeTool: handleWaterTool },
  { definitions: wiorToolDefinitions, executeTool: handleWiorTool },
  { definitions: winkelgebiedenToolDefinitions, executeTool: handleWinkelgebiedenTool },
  { definitions: meldingenToolDefinitions, executeTool: handleMeldingenTool },
  { definitions: verkiezingenToolDefinitions, executeTool: handleVerkiezingenTool },
  { definitions: analyseToolDefinitions, executeTool: handleAnalyseTool },
];

export function registerAmsterdamTools(server: FastMCP): FastMCP {
  return amsterdamToolBundles
    .flatMap(bundleToSpecs)
    .reduce((srv, spec) => { srv.addTool(spec); return srv; }, server);
}
