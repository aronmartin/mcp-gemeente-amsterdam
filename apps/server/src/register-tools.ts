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
import { aggregatieToolDefinitions, handleAggregatieTool } from "@amsterdam-mcp/aggregatie";
import { buildZodSchema } from "./json-schema-to-zod.js";
import type { JsonSchemaProp } from "./types.js";
import type { ToolDef, DsoPage, GeoOp } from "@amsterdam-mcp/core";
import { buildIntersectsParam, applyGeoOp } from "@amsterdam-mcp/core";
import { resolveProfile } from "./response-profiles.js";
import { GEOMETRY_KEYS, geometryToCentroid, shapeItem } from "./shape-response.js";

const MAX_RESPONSE_BYTES = 200_000;

const AGGREGATE_PARAMS = new Set(["groupBy", "sum", "avg", "count", "limit", "filter"]);
const GEO_PARAMS = new Set(["nearLat", "nearLon", "radiusMeters"]);
const GEO_OP_PARAMS = new Set(["geoOp", "geoLat", "geoLon"]);

function stripGeometry(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripGeometry);
  if (value !== null && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (GEOMETRY_KEYS.has(k)) {
        const centroid = geometryToCentroid(v);
        if (centroid) result["_centroid"] = centroid;
      } else if (k === "coordinates" && Array.isArray(v)) {
        // bare coordinates array — skip (geometry already handled via parent)
      } else {
        result[k] = stripGeometry(v);
      }
    }
    return result;
  }
  return value;
}

function processValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(processValue);
  if (value !== null && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (GEOMETRY_KEYS.has(k)) {
        const centroid = geometryToCentroid(v);
        if (centroid) result["_centroid"] = centroid;
      } else {
        result[k] = processValue(v);
      }
    }
    return result;
  }
  return value;
}

function formatResult(
  raw: unknown,
  toolName: string,
  detail: "minimal" | "default" | "full",
  fields?: string,
): string {
  const profile = resolveProfile(toolName, detail);
  const extraFields = new Set(
    fields ? fields.split(",").map(s => s.trim()).filter(Boolean) : [],
  );

  // Unwrap DSO HAL envelope into a flat structure
  if (raw !== null && typeof raw === "object" && "_embedded" in (raw as object)) {
    const hal = raw as DsoPage<unknown>;
    const embedded = hal._embedded ?? {};
    const items = Object.values(embedded).flat() as Record<string, unknown>[];
    const clean = {
      items: items.map(item => shapeItem(item, profile, extraFields)),
      pagination: hal.page ?? {},
    };
    const json = JSON.stringify(clean);
    if (json.length > MAX_RESPONSE_BYTES) {
      const truncated = {
        ...clean,
        items: clean.items.slice(0, 10),
        truncated: true,
        note: `Response te groot (${json.length} bytes). Gebruik page_size of filters om resultaten te beperken.`,
      };
      return JSON.stringify(truncated, null, 2);
    }
    return JSON.stringify(clean, null, 2);
  }

  // Single-object response — geen profiel toegepast, wel geometry → centroid
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
      // List tools (have endpoint) route via aggregate
      if (tool.endpoint) {
        const { detail, fields, ...restArgs } = args;

        const aggregateArgs: Record<string, unknown> = {};
        const geoArgs: Record<string, unknown> = {};
        const geoOpArgs: Record<string, unknown> = {};
        const apiFilters: Record<string, unknown> = {};

        for (const [key, val] of Object.entries(restArgs)) {
          if (AGGREGATE_PARAMS.has(key)) aggregateArgs[key] = val;
          else if (GEO_PARAMS.has(key)) geoArgs[key] = val;
          else if (GEO_OP_PARAMS.has(key)) geoOpArgs[key] = val;
          else apiFilters[key] = val;
        }

        const geoOp = geoOpArgs.geoOp as GeoOp | undefined;
        const geoLat = geoOpArgs.geoLat as number | undefined;
        const geoLon = geoOpArgs.geoLon as number | undefined;

        // Geo → geo[intersects]
        const geoFilter: Record<string, unknown> = {};
        if (geoArgs.nearLat && geoArgs.nearLon) {
          const radius = (geoArgs.radiusMeters as number) ?? 500;
          geoFilter["geo[intersects]"] = buildIntersectsParam(
            geoArgs.nearLat as number,
            geoArgs.nearLon as number,
            radius,
          );
        }

        const hasAggregateParams = aggregateArgs.groupBy ||
          (Array.isArray(aggregateArgs.sum) && aggregateArgs.sum.length) ||
          (Array.isArray(aggregateArgs.avg) && aggregateArgs.avg.length) ||
          aggregateArgs.count;
        const effectiveLimit = hasAggregateParams
          ? undefined
          : (typeof aggregateArgs.limit === "number" ? aggregateArgs.limit : 25);

        // Merge: apiFilters as base, geoFilter always added, explicit filter object wins
        const mergedFilter = {
          ...apiFilters,
          ...geoFilter,
          ...(aggregateArgs.filter && typeof aggregateArgs.filter === "object"
            ? aggregateArgs.filter as Record<string, unknown>
            : {}),
        };

        const result = await handleAggregatieTool("ams_aggregate", {
          endpoint: tool.endpoint,
          groupBy: aggregateArgs.groupBy,
          sum: aggregateArgs.sum,
          avg: aggregateArgs.avg,
          count: aggregateArgs.count,
          limit: effectiveLimit,
          filter: mergedFilter,
        });

        // Verwerk geometry: altijd strippen, optioneel geoOp toepassen
        const raw = result as Record<string, unknown>[];
        const processed = raw.map(item => {
          const stripped = stripGeometry(item) as Record<string, unknown>;
          if (geoOp) {
            const opResult = applyGeoOp(
              item,
              geoOp,
              geoLat,
              geoLon,
            );
            return { ...stripped, ...opResult };
          }
          return stripped;
        });
        return JSON.stringify(processed, null, 2);
      }

      // Get tools use original handler
      const { detail = "default", fields, ...upstreamArgs } = args;
      const result = await executeTool(tool.name, upstreamArgs);
      return formatResult(
        result,
        tool.name,
        detail as "minimal" | "default" | "full",
        fields as string | undefined,
      );
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
  { definitions: aggregatieToolDefinitions, executeTool: handleAggregatieTool },
];

export function registerAmsterdamTools(server: FastMCP): FastMCP {
  return amsterdamToolBundles
    .flatMap(bundleToSpecs)
    .reduce((srv, spec) => { srv.addTool(spec); return srv; }, server);
}
