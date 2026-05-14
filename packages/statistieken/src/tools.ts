import { listTool, type ToolDef } from "@amsterdam-mcp/core";

export const statistiekenToolDefinitions: readonly ToolDef[] = [
  listTool({
    name: "ams_bbga_list",
    description: "Geeft BBGA-kerncijfers terug: Basisbestand Gebieden Amsterdam met statistieken per wijk/buurt.",
    extraProps: {
      gebiedcode15: { type: "string", description: "Gebiedscode (buurt- of wijkcode, 15 tekens)" },
      jaar: { type: "number", description: "Jaar van de meting" },
    },
  }),
  listTool({
    name: "ams_statistieken_list",
    description: "Geeft gemeentelijke statistieken terug op indicator of dimensie.",
    extraProps: {
      indicator: { type: "string", description: "Naam van de indicator" },
      ruimtelijkeDimensieCode: { type: "string", description: "Code van de ruimtelijke dimensie" },
      ruimtelijkeDimensieNaam: { type: "string", description: "Naam van de ruimtelijke dimensie" },
      begindatum: { type: "string", description: "Begindatum (YYYY-MM-DD)" },
      einddatum: { type: "string", description: "Einddatum (YYYY-MM-DD)" },
    },
  }),
  listTool({
    name: "ams_indicatoren_list",
    description: "Geeft beschikbare indicatoren terug met eenheid, thema en bron, per buurt/wijk/stadsdeel.",
    extraProps: {
      gbdBuurtNaam: { type: "string", description: "Naam van de buurt" },
      gbdWijkNaam: { type: "string", description: "Naam van de wijk" },
      gbdStadsdeelNaam: { type: "string", description: "Naam van het stadsdeel" },
      indDomeinNaam: { type: "string", description: "Domeinnaam van de indicator" },
    },
  }),
] as const;
