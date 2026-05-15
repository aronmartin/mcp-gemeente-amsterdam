import { listTool, type ToolDef } from "@amsterdam-mcp/core";

export const meldingenToolDefinitions: readonly ToolDef[] = [
  listTool({
    name: "ams_meldingen_list",
    endpoint: "meldingen/meldingen",
    description: "Geeft meldingen openbare ruimte terug: klachten over vuil, kapotte bestrating, overlast etc. Filteer op categorie, status of datum.",
    extraProps: {
      hoofdcategorie: { type: "string", description: "Hoofdcategorie, bijv. 'Overlast van en door personen of groepen', 'Afval'" },
      subcategorie: { type: "string", description: "Subcategorie" },
      externeStatus: { type: "string", description: "Status van de melding, bijv. 'Gemeld', 'In behandeling', 'Afgesloten'" },
      gbdBuurtNaam: { type: "string", description: "Naam van de buurt, bijv. 'Transvaalbuurt-West'" },
      gbdBuurtCode: { type: "string", description: "Buurtcode, bijv. 'MD01' (zelfde formaat als parkeervakken buurtcode)" },
      gbdWijkNaam: { type: "string", description: "Naam van de wijk" },
      gbdStadsdeelNaam: { type: "string", description: "Naam van het stadsdeel, bijv. 'Centrum', 'Oost', 'West'" },
      "datumMelding[gte]": { type: "string", description: "Meldingsdatum vanaf (YYYY-MM-DD)" },
      "datumMelding[lte]": { type: "string", description: "Meldingsdatum tot (YYYY-MM-DD)" },
    },
  }),
] as const;
