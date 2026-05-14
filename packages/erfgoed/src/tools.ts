import { listTool, getTool, type ToolDef } from "@amsterdam-mcp/core";

export const erfgoedToolDefinitions: readonly ToolDef[] = [
  listTool({
    name: "ams_monumenten_list",
    description: "Zoek Amsterdamse monumenten op naam, functie of bouwjaar.",
    extraProps: {
      naam: { type: "string", description: "Naam van het monument" },
      "naam[like]": { type: "string", description: "Naam bevat (wildcard)" },
      adressering: { type: "string", description: "Adres of straatnaam, bijv. 'Leidseplein'" },
      oorspronkelijkeFunctie: { type: "string", description: "Oorspronkelijke functie, bijv. 'Woning', 'Kerk'" },
      "jaarBeginVan[gte]": { type: "number", description: "Bouwjaar minimaal" },
      "jaarBeginVan[lte]": { type: "number", description: "Bouwjaar maximaal" },
    },
  }),
  getTool({
    name: "ams_monumenten_get",
    description: "Haal een monument op via het monument-ID.",
    idProp: "id",
    idDescription: "Monument-ID",
  }),
  listTool({
    name: "ams_beschermde_stadsgezichten_list",
    description: "Geeft beschermde stads- en dorpsgezichten terug (aangewezen beschermde gebieden).",
    extraProps: {
      naam: { type: "string", description: "Naam van het beschermde gezicht" },
    },
  }),
  listTool({
    name: "ams_amsterdam_canon_list",
    description: "Geeft items uit de Canon van Amsterdam terug: historische gebeurtenissen met jaar en locatie.",
    extraProps: {},
  }),
] as const;
