import { listTool, type ToolDef } from "@amsterdam-mcp/core";

export const duurzaamheidToolDefinitions: readonly ToolDef[] = [
  listTool({
    name: "ams_aardgasvrije_zones_list",
    description: "Geeft aardgasvrije buurten terug: buurten die van het aardgas af gaan.",
    extraProps: {
      buurtNaam: { type: "string", description: "Naam van de buurt" },
      buurtCode: { type: "string", description: "Code van de buurt" },
      aandeelKookgas: { type: "string", description: "Aandeel kookgas dat van toepassing is" },
    },
  }),
  listTool({
    name: "ams_duurzaamheid_list",
    description: "Geeft duurzaamheidsdata terug (warmtenetten, isolatieprojecten, etc.).",
    extraProps: {
      typeOmschrijving: { type: "string", description: "Type duurzaamheidsproject" },
    },
  }),
  listTool({
    name: "ams_energieverbruik_mra_list",
    description: "Geeft energieverbruik per buurt in de MRA (gas en elektra per woning).",
    extraProps: {
      buurtCode: { type: "string", description: "Buurtcode" },
    },
  }),
] as const;
