export type PropSchema = {
  type: string;
  description?: string;
  items?: { type: string };
  enum?: string[];
  additionalProperties?: { type: string };
};

export type ToolDef = {
  name: string;
  description: string;
  endpoint?: string;
  parameters: {
    type: "object";
    properties: Record<string, PropSchema>;
    required?: readonly string[];
  };
};

export type EndpointSchemaRef = {
  fields: Record<string, string>;
  numeric_fields: string[];
};

/** Formatteert een schema als compacte tekst voor tool descriptions */
function formatSchemaDescription(schema: EndpointSchemaRef): string {
  const fieldParts: string[] = [];
  for (const [name, type] of Object.entries(schema.fields)) {
    fieldParts.push(`${name} (${type})`);
  }

  // Splits in regels van max ~120 chars
  const lines: string[] = [];
  let currentLine = "";
  for (const part of fieldParts) {
    const sep = currentLine ? ", " : "";
    if (currentLine && (currentLine + sep + part).length > 120) {
      lines.push(currentLine);
      currentLine = part;
    } else {
      currentLine += sep + part;
    }
  }
  if (currentLine) lines.push(currentLine);

  const result = [`\n\nBeschikbare velden: ${lines.join(",\n")}`];
  if (schema.numeric_fields.length > 0) {
    result.push(`Numerieke velden (sum/avg): ${schema.numeric_fields.join(", ")}`);
  }
  return result.join("\n");
}

/** Bouw een standaard list-tool definitie voor een DSO collectie */
export function listTool(opts: {
  name: string;
  description: string;
  endpoint?: string;
  schema?: EndpointSchemaRef;
  extraProps?: Record<string, PropSchema>;
  required?: readonly string[];
}): ToolDef {
  const strategyHint = "\n\nStrategie: gebruik filters voor specifieke items (<10 resultaten). Voor tellingen of analyses over alle records: gebruik groupBy+count — ruwe items komen dan nooit in de context.";
  const description = (opts.schema
    ? opts.description + formatSchemaDescription(opts.schema)
    : opts.description) + strategyHint;

  return {
    name: opts.name,
    description,
    endpoint: opts.endpoint,
    parameters: {
      type: "object",
      properties: {
        groupBy: { type: "string", description: "Veldnaam om op te groeperen voor analytische vragen, bijv. 'stadsdeelNaam'." },
        sum: { type: "array", items: { type: "string" }, description: "Numerieke veldnamen om op te tellen per groep." },
        avg: { type: "array", items: { type: "string" }, description: "Numerieke veldnamen voor gemiddelde per groep. Output-key wordt '{veld}_avg'." },
        count: { type: "string", description: "Gebruik 'true' om het aantal items per groep te tellen." },
        limit: { type: "number", description: "Maximaal aantal items terug te geven (zonder aggregatie). Standaard 25 als geen aggregate-params opgegeven." },
        filter: { type: "object", additionalProperties: { type: "string" }, description: "Extra API-filterparameters. Range-operators: { 'veld[gte]': '2024-01-01', 'veld[lt]': '2025-01-01' }." },
        geoOp: {
          type: "string",
          enum: ["centroid", "area", "contains", "distance_to_edge", "bbox"],
          description: "Server-side geometry operatie. Ruwe coördinaten komen nooit in context — alleen het berekende resultaat. centroid=_lat/_lon, area=_area_m2, contains=_contains (vereist geoLat+geoLon), distance_to_edge=_distance_to_edge_m (vereist geoLat+geoLon), bbox=_bbox[minLon,minLat,maxLon,maxLat].",
        },
        geoLat: {
          type: "number",
          description: "WGS84 latitude voor contains/distance_to_edge operaties.",
        },
        geoLon: {
          type: "number",
          description: "WGS84 longitude voor contains/distance_to_edge operaties.",
        },
        ...opts.extraProps,
      },
      required: opts.required ?? ([] as const),
    },
  };
}

/** Bouw een standaard get-by-id tool definitie */
export function getTool(opts: {
  name: string;
  description: string;
  idProp?: string;
  idDescription?: string;
}): ToolDef {
  const idProp = opts.idProp ?? "id";
  return {
    name: opts.name,
    description: opts.description,
    parameters: {
      type: "object",
      properties: {
        [idProp]: {
          type: "string",
          description: opts.idDescription ?? `Uniek ID`,
        },
      },
      required: [idProp] as const,
    },
  };
}

export type ToolHandler = (
  toolName: string,
  args: Record<string, unknown>
) => Promise<unknown>;

/** Maak een dispatcher die tool-naam afbeeldt op een handler-map */
export function makeDispatcher(
  prefix: string,
  handlers: Record<string, (args: Record<string, unknown>) => Promise<unknown>>
): ToolHandler {
  return async (toolName, args) => {
    const fn = handlers[toolName];
    if (!fn) throw new Error(`Onbekende tool: ${toolName}`);
    return fn(args);
  };
}
