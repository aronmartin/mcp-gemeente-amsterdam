import { listTool, getTool, type ToolDef, type PropSchema } from "@amsterdam-mcp/core";

export const gebiedenToolDefinitions: readonly ToolDef[] = [
  listTool({
    name: "ams_gebieden_list_stadsdelen",
    description: "Geeft alle Amsterdamse stadsdelen terug (bijv. Centrum, Noord, West).",
    extraProps: {
      naam: { type: "string", description: "Naam van het stadsdeel" },
      code: { type: "string", description: "Code van het stadsdeel" },
    },
  }),
  listTool({
    name: "ams_gebieden_list_wijken",
    description: "Geeft wijken terug, optioneel gefilterd op stadsdeel.",
    extraProps: {
      naam: { type: "string", description: "Naam van de wijk" },
      "ligtInStadsdeel.naam": { type: "string", description: "Naam van het stadsdeel" },
      "ligtInStadsdeel.code": { type: "string", description: "Code van het stadsdeel" },
    },
  }),
  listTool({
    name: "ams_gebieden_list_buurten",
    description: "Geeft buurten terug, optioneel gefilterd op naam, code of wijk.",
    extraProps: {
      naam: { type: "string", description: "Naam van de buurt" },
      code: { type: "string", description: "Buurtcode" },
      "ligtInWijk.naam": { type: "string", description: "Naam van de wijk" },
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
    description: "Geeft GGW-gebieden (gebiedsgericht werken) terug.",
    extraProps: {
      naam: { type: "string", description: "Naam van het GGW-gebied" },
    },
  }),
  listTool({
    name: "ams_gebieden_list_grootstedelijke_gebieden",
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
      "Returns: adres (address details with coordinates), buurt (neighbourhood with CBS code), wijk (district), stadsdeel (borough).",
      "Use this before calling any tool that accepts gbdBuurtCode, gbdWijkNaam, or gbdStadsdeelNaam filters.",
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
