import { listTool, type ToolDef, nearRadiusProps } from "@amsterdam-mcp/core";

export const bodemToolDefinitions: readonly ToolDef[] = [
  listTool({
    name: "ams_bodemonderzoeken_list",
    description: [
      "Geeft bodemonderzoeken terug. Toont locaties waar bodemonderzoek is gedaan, met verontreinigingsoordeel.",
      "Gebruik nearLat+nearLon+radiusMeters om onderzoeken bij een specifiek adres te vinden.",
    ].join(" "),
    extraProps: {
      eindoordeel: { type: "string", description: "Verontreinigingsoordeel: '>I' (interventiewaarde), '>S' (streefwaarde), '>T' (tussenwaarde), 'Schoon'" },
      "rapportdatum[gte]": { type: "string", description: "Rapportdatum vanaf (YYYY-MM-DD)" },
      "rapportdatum[lte]": { type: "string", description: "Rapportdatum tot (YYYY-MM-DD)" },
      ...nearRadiusProps,
    },
  }),
  listTool({
    name: "ams_historische_bodeminformatie_list",
    description: "Geeft historische bedrijfslocaties terug die bodemverontreiniging kunnen hebben veroorzaakt.",
    extraProps: {},
  }),
  listTool({
    name: "ams_explosieven_list",
    description: "Geeft verdachte gebieden terug met risico op niet-gesprongen explosieven (NGE) uit WOII.",
    extraProps: {},
  }),
  listTool({
    name: "ams_ontplofbare_oorlogsresten_list",
    description: "Geeft inslaglocaties van ontplofbare oorlogsresten (bommen, granaten) terug.",
    extraProps: {},
  }),
  listTool({
    name: "ams_leidingen_list",
    description: "Geeft Waternet riool- en leidingeninfrastructuur terug.",
    extraProps: {},
  }),
] as const;
