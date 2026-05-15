import { listTool, getTool, type ToolDef, nearRadiusProps } from "@amsterdam-mcp/core";
import { ENDPOINT_SCHEMAS } from "@amsterdam-mcp/aggregatie";


export const erfgoedToolDefinitions: readonly ToolDef[] = [
  listTool({
    name: "ams_monumenten_list",
    endpoint: "monumenten/monumenten",
    schema: ENDPOINT_SCHEMAS["monumenten/monumenten"],
    description: [
      "Zoek Amsterdamse monumenten (monuments, heritage, listed buildings) op naam, adres of bouwjaar.",
      "Voor adres-gebaseerde lookup: gebruik bij voorkeur betreftBagPand.identificatie (haal bag.pandId op via ams_resolve_location) — dit is betrouwbaarder dan nearLat/nearLon of adressering[like] voor ensemble-monumenten waarbij het centroid ver van het gezochte adres kan liggen.",
      "Gebruik adressering[like] voor gedeeltelijke straatnaam/adres-matching (minder betrouwbaar voor ensembles).",
      "Gebruik nearLat+nearLon+radiusMeters om monumenten in de buurt van een punt te vinden (sorteert op afstand, voegt _distanceMeters toe; minder betrouwbaar voor ensembles).",
    ].join(" "),
    extraProps: {
      naam: { type: "string", description: "Naam van het monument (exact)" },
      "naam[like]": { type: "string", description: "Naam bevat (wildcard, hoofdletterongevoelig)" },
      adressering: { type: "string", description: "Volledig adres (exact-match). Gebruik adressering[like] voor gedeeltelijke match." },
      "adressering[like]": { type: "string", description: "Adres of straatnaam bevat (wildcard), bijv. 'Bloemgracht' of 'Jordaan'" },
      oorspronkelijkeFunctie: { type: "string", description: "Oorspronkelijke functie, bijv. 'Woning', 'Kerk'" },
      jaarBeginVan: { type: "number", description: "Bouwjaar (exacte overeenkomst). Opmerking: range-filters [gte]/[lte] worden niet ondersteund door upstream." },
      "betreftBagPand.identificatie": { type: "string", description: "BAG pand-identificatie (bijv. '0363100012177213'). Geeft het monument terug dat aan dit pand is gekoppeld." },
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
    endpoint: "beschermdestadsdorpsgezichten/beschermdestadsdorpsgezichten",
    schema: ENDPOINT_SCHEMAS["beschermdestadsdorpsgezichten/beschermdestadsdorpsgezichten"],
    description: [
      "Geeft beschermde stads- en dorpsgezichten terug (aangewezen beschermde gebieden).",
      "Gebruik nearLat+nearLon+radiusMeters (~50m) om te controleren of een specifiek adres binnen een beschermd gezicht valt.",
    ].join(" "),
    extraProps: {
      naam: { type: "string", description: "Naam van het beschermde gezicht" },
      ...nearRadiusProps,
    },
  }),
  listTool({
    name: "ams_amsterdam_canon_list",
    endpoint: "amsterdam_canon/canon_amsterdam_2025",
    schema: ENDPOINT_SCHEMAS["amsterdam_canon/canon_amsterdam_2025"],
    description: "Geeft items uit de Canon van Amsterdam terug: historische gebeurtenissen met jaar en locatie.",
    extraProps: {},
  }),
] as const;
