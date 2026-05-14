import { listTool, getTool, type ToolDef } from "@amsterdam-mcp/core";

export const afvalToolDefinitions: readonly ToolDef[] = [
  listTool({
    name: "ams_afvalcontainers_list",
    description: "Zoek afvalcontainers op type (restafval, glas, papier etc.), buurt of bbox.",
    extraProps: {
      containerEigenaarschap: { type: "string", description: "Eigenaarschap, bijv. 'Gemeente Amsterdam'" },
      containerKleur: { type: "string", description: "Kleur van de container" },
      "ligtInBuurt.naam": { type: "string", description: "Naam van de buurt" },
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
