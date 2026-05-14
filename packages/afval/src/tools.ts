import { listTool, getTool, type ToolDef, nearRadiusProps } from "@amsterdam-mcp/core";

export const afvalToolDefinitions: readonly ToolDef[] = [
  listTool({
    name: "ams_afvalcontainers_list",
    description: [
      "Zoek afvalcontainers op fractie, eigenaarschap of buurt.",
      "Geldige fractieOmschrijving-waarden: 'Glas', 'Papier', 'Restafval', 'Textiel', 'Plastic', 'Brood', 'GFT'.",
      "Gebruik nearLat+nearLon+radiusMeters om containers in de buurt van een punt te vinden (sorteert op afstand oplopend, voegt _distanceMeters toe).",
    ].join(" "),
    extraProps: {
      fractieOmschrijving: { type: "string", description: "Afvalfractie: 'Glas', 'Papier', 'Restafval', 'Textiel', 'Plastic', 'Brood', 'GFT'" },
      "gbdBuurt.identificatie": { type: "string", description: "Buurt-identificatie (bijv. '03630980000386') — gebruik ams_resolve_location om dit op te zoeken" },
      containerEigenaarschap: { type: "string", description: "Eigenaarschap van de container, bijv. 'Eigendom', 'Huur'" },
      containerKleur: { type: "string", description: "Kleur van de container" },
      ...nearRadiusProps,
    },
  }),
  getTool({
    name: "ams_afvalcontainers_get",
    description: "Haal één afvalcontainer op via het ID.",
    idProp: "id",
    idDescription: "Container-ID",
  }),
  listTool({
    name: "ams_afvalwijzer_list",
    description: "Geeft afvalwijzer-informatie terug: ophaaldagen en instructies per afvalfractie.",
    extraProps: {
      afvalwijzerFractieCode: { type: "string", description: "Code van de afvalfractie" },
      afvalwijzerBasisroutetypeCode: { type: "string", description: "Code van het basisroutetype" },
      huisnummer: { type: "number", description: "Huisnummer" },
      postcode: { type: "string", description: "Postcode" },
    },
  }),
  listTool({
    name: "ams_recyclepunten_list",
    description: "Geeft wegingen van recyclepunten (milieustraten) terug.",
    extraProps: {
      "datumWeging[gte]": { type: "string", description: "Datum weging vanaf (YYYY-MM-DD)" },
      "datumWeging[lte]": { type: "string", description: "Datum weging tot (YYYY-MM-DD)" },
    },
  }),
] as const;
