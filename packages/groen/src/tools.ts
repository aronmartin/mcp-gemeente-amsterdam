import { listTool, getTool, type ToolDef } from "@amsterdam-mcp/core";

export const groenToolDefinitions: readonly ToolDef[] = [
  listTool({
    name: "ams_bomen_list",
    description: "Zoek bomen in Amsterdam op soort, buurt, aanlegjaar of bbox.",
    extraProps: {
      soortnaamTop: { type: "string", description: "Hoofdsoort, bijv. 'Plataan', 'Eik', 'Iep'" },
      soortnaamKort: { type: "string", description: "Korte soortnaam" },
      soortnaam: { type: "string", description: "Volledige soortnaam" },
      "jaarVanAanleg[gte]": { type: "number", description: "Aanlegjaar minimaal" },
      "jaarVanAanleg[lte]": { type: "number", description: "Aanlegjaar maximaal" },
      typeEigenaarPlus: { type: "string", description: "Eigenaar/beheerder, bijv. 'Gemeente Amsterdam'" },
      boomhoogteklasseActueel: { type: "string", description: "Hoogteklasse, bijv. 'a: tot 6 m.'" },
      "gbdBuurt.identificatie": { type: "string", description: "Buurt-identificatiecode" },
    },
  }),
  getTool({
    name: "ams_bomen_get",
    description: "Haal één boom op via het ID.",
    idProp: "id",
    idDescription: "Boom-ID",
  }),
  listTool({
    name: "ams_ecologie_list",
    description: "Geeft ecologische kerngebieden en zones terug (bijv. ecologische verbindingszones).",
    extraProps: {
      categorieKerngebied: { type: "string", description: "Categorie kerngebied" },
      objecttype: { type: "string", description: "Type ecologisch object" },
      gidssoort: { type: "string", description: "Gidssoort" },
    },
  }),
  listTool({
    name: "ams_ziekte_plagen_exoten_list",
    description: "Geeft meldingen van eikenprocessierups en andere ziekten, plagen en exoten terug.",
    extraProps: {
      status: { type: "string", description: "Status van de melding" },
      urgentie: { type: "string", description: "Urgentieniveau" },
      "gbdBuurt.identificatie": { type: "string", description: "Buurt-identificatiecode" },
    },
  }),
  listTool({
    name: "ams_functionele_gebieden_list",
    description: "Geeft functionele groengebieden terug (parken, sportterreinen, begraafplaatsen, etc.).",
    extraProps: {
      naam: { type: "string", description: "Naam van het gebied" },
    },
  }),
] as const;
