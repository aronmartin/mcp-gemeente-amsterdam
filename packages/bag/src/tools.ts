import { listTool, getTool, type ToolDef } from "@amsterdam-mcp/core";

export const bagToolDefinitions: readonly ToolDef[] = [
  listTool({
    name: "ams_bag_list_verblijfsobjecten",
    description: "Zoek verblijfsobjecten (woningen, kantoren, winkels) in Amsterdam via postcode, huisnummer of gebruiksdoel.",
    extraProps: {
      "heeftHoofdadres.postcode": { type: "string", description: "Postcode, bijv. '1012JS'" },
      "heeftHoofdadres.huisnummer": { type: "number", description: "Huisnummer" },
      "heeftHoofdadres.ligtAanOpenbareruimte.naam": { type: "string", description: "Straatnaam" },
      gebruiksdoel: { type: "string", description: "Gebruiksdoel, bijv. 'woonfunctie' of 'kantoorfunctie'" },
      statusCode: { type: "string", description: "Status, bijv. '1' (in gebruik)" },
    },
  }),
  getTool({
    name: "ams_bag_get_verblijfsobject",
    description: "Haal een verblijfsobject op via BAG-identificatie (14-cijferig ID).",
    idProp: "identificatie",
    idDescription: "BAG verblijfsobject-identificatie, bijv. '0363010000818692'",
  }),
  listTool({
    name: "ams_bag_list_panden",
    description: "Zoek BAG-panden (gebouwen) op bouwjaar of status.",
    extraProps: {
      oorspronkelijkBouwjaar: { type: "number", description: "Bouwjaar" },
      "oorspronkelijkBouwjaar[gte]": { type: "number", description: "Bouwjaar minimaal" },
      "oorspronkelijkBouwjaar[lte]": { type: "number", description: "Bouwjaar maximaal" },
      statusCode: { type: "string", description: "Status, bijv. '1' (in gebruik)" },
    },
  }),
  getTool({
    name: "ams_bag_get_pand",
    description: "Haal een BAG-pand op via identificatie.",
    idProp: "identificatie",
    idDescription: "BAG pand-identificatie, bijv. '0363100012168052'",
  }),
  listTool({
    name: "ams_bag_list_nummeraanduidingen",
    description: "Zoek adressen (nummeraanduidingen) op postcode, huisnummer of straat.",
    extraProps: {
      postcode: { type: "string", description: "Postcode, bijv. '1012JS'" },
      huisnummer: { type: "number", description: "Huisnummer" },
      "ligtAanOpenbareruimte.naam": { type: "string", description: "Straatnaam" },
      typeAdres: { type: "string", description: "'hoofdadres' of 'nevenadres'" },
    },
  }),
  listTool({
    name: "ams_bag_list_openbareruimtes",
    description: "Zoek openbare ruimten (straten, pleinen, water) op naam of type.",
    extraProps: {
      naam: { type: "string", description: "Naam van de openbare ruimte, bijv. 'Damrak'" },
      "naam[like]": { type: "string", description: "Naam bevat (wildcard zoeken)" },
      typeOmschrijving: { type: "string", description: "Type, bijv. 'Weg', 'Water', 'Plein'" },
    },
  }),
  listTool({
    name: "ams_bag_list_woonplaatsen",
    description: "Geeft de BAG-woonplaatsen terug (Amsterdam, Weesp, etc.).",
    extraProps: {
      naam: { type: "string", description: "Naam van de woonplaats" },
    },
  }),
  listTool({
    name: "ams_bag_list_standplaatsen",
    description: "Zoek standplaatsen (officiële locaties voor woonwagens) op status.",
    extraProps: {
      statusCode: { type: "string", description: "Status" },
    },
  }),
  listTool({
    name: "ams_bag_list_ligplaatsen",
    description: "Zoek ligplaatsen (officiële waterlocaties voor woonboten) op status.",
    extraProps: {
      statusCode: { type: "string", description: "Status" },
    },
  }),
] as const;
