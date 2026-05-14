import { listTool, getTool, type ToolDef } from "@amsterdam-mcp/core";

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
    description: "Geeft buurten terug, optioneel gefilterd op wijk of via bbox.",
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
] as const;
