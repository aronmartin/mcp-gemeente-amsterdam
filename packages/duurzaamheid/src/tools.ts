import { listTool, type ToolDef } from "@amsterdam-mcp/core";
import { ENDPOINT_SCHEMAS } from "@amsterdam-mcp/aggregatie";

export const duurzaamheidToolDefinitions: readonly ToolDef[] = [
  listTool({
    name: "ams_aardgasvrije_zones_list",
    endpoint: "aardgasvrijezones/buurt",
    schema: ENDPOINT_SCHEMAS["aardgasvrijezones/buurt"],
    description: "Geeft aardgasvrije buurten terug: buurten die van het aardgas af gaan.",
    extraProps: {
      buurtNaam: { type: "string", description: "Naam van de buurt" },
      buurtCode: { type: "string", description: "Code van de buurt" },
      aandeelKookgas: { type: "string", description: "Aandeel kookgas dat van toepassing is" },
    },
  }),
  listTool({
    name: "ams_duurzaamheid_list",
    endpoint: "duurzaamheid/energielabel",
    schema: ENDPOINT_SCHEMAS["duurzaamheid/energielabel"],
    description: "Geeft duurzaamheidsdata terug (warmtenetten, isolatieprojecten, etc.).",
    extraProps: {
    },
  }),
  listTool({
    name: "ams_energieverbruik_mra_list",
    endpoint: "energieverbruik_mra/gas_en_elektriciteit_kwartaal",
    schema: ENDPOINT_SCHEMAS["energieverbruik_mra/gas_en_elektriciteit_kwartaal"],
    description: "Geeft energieverbruik per buurt in de MRA (gas en elektra per woning).",
    extraProps: {
      buurtCode: { type: "string", description: "Buurtcode" },
    },
  }),
] as const;
