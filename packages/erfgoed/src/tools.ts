import { listTool, getTool, type ToolDef, nearRadiusProps } from "@amsterdam-mcp/core";

export const erfgoedToolDefinitions: readonly ToolDef[] = [
  listTool({
    name: "ams_monumenten_list",
    description: [
      "Zoek Amsterdamse monumenten (monuments, heritage, listed buildings) op naam, adres of bouwjaar.",
      "Gebruik adressering[like] voor gedeeltelijke straatnaam/adres-matching.",
      "Gebruik nearLat+nearLon+radiusMeters om monumenten in de buurt van een punt te vinden (client-side filtering op geometrie).",
    ].join(" "),
    extraProps: {
      naam: { type: "string", description: "Naam van het monument (exact)" },
      "naam[like]": { type: "string", description: "Naam bevat (wildcard, hoofdletterongevoelig)" },
      adressering: { type: "string", description: "Volledig adres (exact-match). Gebruik adressering[like] voor gedeeltelijke match." },
      "adressering[like]": { type: "string", description: "Adres of straatnaam bevat (wildcard), bijv. 'Bloemgracht' of 'Jordaan'" },
      oorspronkelijkeFunctie: { type: "string", description: "Oorspronkelijke functie, bijv. 'Woning', 'Kerk'" },
      "jaarBeginVan[gte]": { type: "number", description: "Bouwjaar minimaal" },
      "jaarBeginVan[lte]": { type: "number", description: "Bouwjaar maximaal" },
      ...nearRadiusProps,
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
