import { listTool, getTool, type ToolDef, type PropSchema } from "@amsterdam-mcp/core";
import { ENDPOINT_SCHEMAS } from "@amsterdam-mcp/aggregatie";

export const gebiedenToolDefinitions: readonly ToolDef[] = [
  listTool({
    name: "ams_gebieden_list_stadsdelen",
    endpoint: "gebieden/stadsdelen",
    schema: ENDPOINT_SCHEMAS["gebieden/stadsdelen"],
    description: "Geeft alle Amsterdamse stadsdelen terug (bijv. Centrum, Noord, West).",
    extraProps: {
      naam: { type: "string", description: "Naam van het stadsdeel" },
      code: { type: "string", description: "Code van het stadsdeel" },
    },
  }),
  listTool({
    name: "ams_gebieden_list_wijken",
    endpoint: "gebieden/wijken",
    schema: ENDPOINT_SCHEMAS["gebieden/wijken"],
    description: [
      "Geeft wijken terug, optioneel gefilterd op stadsdeel.",
      "Voor stadsdeel-filtering: gebruik ams_gebieden_list_stadsdelen om de identificatie op te zoeken, filter dan op ligtInStadsdeel.identificatie.",
    ].join(" "),
    extraProps: {
      naam: { type: "string", description: "Naam van de wijk" },
      "ligtInStadsdeel.identificatie": { type: "string", description: "Stadsdeel-identificatie (opzoeken via ams_gebieden_list_stadsdelen)" },
    },
  }),
  listTool({
    name: "ams_gebieden_list_buurten",
    endpoint: "gebieden/buurten",
    schema: ENDPOINT_SCHEMAS["gebieden/buurten"],
    description: [
      "Geeft buurten terug, optioneel gefilterd op naam, code of wijk.",
      "Voor wijk-filtering: gebruik ams_gebieden_list_wijken om de identificatie op te zoeken, filter dan op ligtInWijk.identificatie.",
    ].join(" "),
    extraProps: {
      naam: { type: "string", description: "Naam van de buurt" },
      code: { type: "string", description: "Buurtcode" },
      "ligtInWijk.identificatie": { type: "string", description: "Wijk-identificatie (opzoeken via ams_gebieden_list_wijken)" },
    },
  }),
  getTool({
    name: "ams_gebieden_get_buurt",
    description: "Haal een buurt op via het identificatienummer.",
    idProp: "identificatie",
    idDescription: "Buurt-identificatie",
  }),
  listTool({
    name: "ams_gebieden_list_ggwgebieden",
    endpoint: "gebieden/ggwgebieden",
    schema: ENDPOINT_SCHEMAS["gebieden/ggwgebieden"],
    description: "Geeft GGW-gebieden (gebiedsgericht werken) terug.",
    extraProps: {
      naam: { type: "string", description: "Naam van het GGW-gebied" },
    },
  }),
  listTool({
    name: "ams_gebieden_list_grootstedelijke_gebieden",
    endpoint: "gebieden/grootstedelijke_projecten",
    schema: ENDPOINT_SCHEMAS["gebieden/grootstedelijke_projecten"],
    description: "Geeft grootstedelijke gebieden terug (bijv. Amstel III, Zuidas, Haven).",
    extraProps: {
      naam: { type: "string", description: "Naam van het grootstedelijk gebied" },
    },
  }),
  {
    name: "ams_resolve_location",
    description: [
      "Resolves an address or coordinates to the containing Amsterdam neighbourhood (buurt), district (wijk), and borough (stadsdeel) in a single call.",
      "Accepts either lat+lon (WGS84) or postcode+huisnummer.",
      "Returns: adres (address details with coordinates), buurt (neighbourhood with CBS code), wijk (district), stadsdeel (borough), bag (BAG pand/verblijfsobject details including pandId), erfgoed (monument status for the pand — empty array means no monument).",
      "Use this to get buurt/wijk/stadsdeel identificaties for filtering tools like ams_gebieden_list_buurten or ams_afvalcontainers_list.",
      "Also use bag.pandId from the result as betreftBagPand.identificatie when querying ams_monumenten_list — this is more reliable than nearLat/nearLon or adressering for ensemble monuments where the centroid may lie far from the queried address.",
    ].join(" "),
    parameters: {
      type: "object" as const,
      properties: {
        lat: { type: "number", description: "WGS84 latitude" } as PropSchema,
        lon: { type: "number", description: "WGS84 longitude" } as PropSchema,
        postcode: { type: "string", description: "Postcode (bijv. '1017BN')" } as PropSchema,
        huisnummer: { type: "number", description: "Huisnummer" } as PropSchema,
        huisletter: { type: "string", description: "Huisletter (optioneel)" } as PropSchema,
      },
      required: [] as const,
    },
  },
] as const;
