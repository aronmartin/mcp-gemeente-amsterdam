import { listTool, type ToolDef } from "@amsterdam-mcp/core";

export const sportVoorzieningenToolDefinitions: readonly ToolDef[] = [
  listTool({
    name: "ams_sport_list",
    description: "Geeft openbare sportplekken terug (sportparken, zwembaden, sportscholen, etc.) op type.",
    extraProps: {
      naam: { type: "string", description: "Naam van de sportplek" },
      sportvoorziening: { type: "string", description: "Type sportvoorziening" },
      soortLocatie: { type: "string", description: "Soort locatie" },
      soortOndergrond: { type: "string", description: "Soort ondergrond" },
    },
  }),
  listTool({
    name: "ams_maatschappelijke_voorzieningen_list",
    description: "Geeft maatschappelijke voorzieningen terug (ziekenhuizen, bibliotheken, buurthuizen, etc.).",
    extraProps: {
      naam: { type: "string", description: "Naam van de voorziening" },
      status: { type: "string", description: "Status van de voorziening" },
      typeGebouw: { type: "string", description: "Type gebouw" },
    },
  }),
  listTool({
    name: "ams_schoolgebouwen_list",
    description: "Geeft schoolgebouwen terug met adres en BRIN-nummer.",
    extraProps: {
      adresStraat: { type: "string", description: "Straatnaam" },
      adresPostcode: { type: "string", description: "Postcode" },
      code: { type: "string", description: "BRIN-code of schoolcode" },
    },
  }),
  listTool({
    name: "ams_primair_onderwijs_loopafstanden_list",
    description: "Geeft loopafstanden tot basisscholen per buurt terug (bereikbaarheidsdata).",
    extraProps: {},
  }),
] as const;
