import { listTool, type ToolDef } from "@amsterdam-mcp/core";

export const vastgoedToolDefinitions: readonly ToolDef[] = [
  listTool({
    name: "ams_woz_list",
    description: [
      "Geeft WOZ-objecten terug met gebruikscode, soortobject en geldigheidsdatum.",
      "Let op: de vastgesteldeWaarde (WOZ-bedrag) is niet beschikbaar in deze publieke API — alleen objecttype en gebruikscode worden ontsloten.",
      "Filter op bagNummeraanduidingId of postcode+huisnummer om een specifiek adres op te zoeken.",
    ].join(" "),
    extraProps: {
      wozobjectnummer: { type: "string", description: "WOZ-objectnummer" },
      bagNummeraanduidingId: { type: "string", description: "BAG-nummeraanduidingidentificatie (gebruik ams_resolve_location of bag tools om dit op te zoeken)" },
      postcode: { type: "string", description: "Postcode van het adres (bijv. '1017BN')" },
      huisnummer: { type: "number", description: "Huisnummer" },
    },
  }),
  listTool({
    name: "ams_gemeentelijk_vastgoed_list",
    description: "Geeft gemeentelijk vastgoed terug (panden en terreinen in eigendom van de gemeente Amsterdam).",
    extraProps: {
      naam: { type: "string", description: "Naam van het object" },
      eigendom: { type: "string", description: "Eigendomsvorm" },
      straatnaam: { type: "string", description: "Straatnaam" },
      huisnummer: { type: "number", description: "Huisnummer" },
    },
  }),
  listTool({
    name: "ams_nieuwbouwplannen_list",
    description: "Geeft nieuwbouwplannen terug (publiek deel): woningbouwprojecten in Amsterdam.",
    extraProps: {
      naam: { type: "string", description: "Naam van het project" },
      buurtCode: { type: "string", description: "Buurtcode" },
      buurtNaam: { type: "string", description: "Naam van de buurt" },
      wijkCode: { type: "string", description: "Wijkcode" },
      wijkNaam: { type: "string", description: "Naam van de wijk" },
      gebiedCode: { type: "string", description: "Gebiedscode" },
    },
  }),
  listTool({
    name: "ams_grex_list",
    description: "Geeft grondexploitaties terug: gebiedsontwikkelingsprojecten van de gemeente.",
    extraProps: {
      plannaam: { type: "string", description: "Naam van het plan" },
      planstatus: { type: "string", description: "Status van het plan" },
      "startdatum[gte]": { type: "string", description: "Startdatum vanaf (YYYY-MM-DD)" },
    },
  }),
  listTool({
    name: "ams_precariobelasting_list",
    description: "Geeft precariobelastingzones terug (belasting voor gebruik gemeentegrond, bijv. terrassen).",
    extraProps: {
      categorie: { type: "string", description: "Categorie precario" },
      stadsdeel: { type: "string", description: "Stadsdeel" },
      gebied: { type: "string", description: "Gebied" },
    },
  }),
] as const;
