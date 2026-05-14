import { listTool, type ToolDef } from "@amsterdam-mcp/core";

export const vastgoedToolDefinitions: readonly ToolDef[] = [
  listTool({
    name: "ams_woz_list",
    description: [
      "Geeft WOZ-objecten terug met gebruikscode, soortobject en geldigheidsdatum.",
      "Let op: de vastgesteldeWaarde (WOZ-bedrag) is niet beschikbaar in deze publieke API — alleen objecttype en gebruikscode worden ontsloten.",
      "Filter op wozobjectnummer of bevatBrkKadastraalobject.identificatie om een specifiek object op te zoeken.",
      "Om WOZ via een BAG-adres te vinden: gebruik eerst ams_bag_list_verblijfsobjecten om het verblijfsobject op te zoeken, dan ams_woz_list met het wozobjectnummer.",
    ].join(" "),
    extraProps: {
      wozobjectnummer: { type: "string", description: "WOZ-objectnummer" },
      "bevatBrkKadastraalobject.identificatie": { type: "string", description: "BRK kadastraalobject identificatie" },
    },
  }),
  listTool({
    name: "ams_gemeentelijk_vastgoed_list",
    description: "Geeft gemeentelijk vastgoed terug (panden en terreinen in eigendom van de gemeente Amsterdam).",
    extraProps: {
      eigendom: { type: "string", description: "Eigendomsvorm" },
      straatnaam: { type: "string", description: "Straatnaam" },
      huisnummer: { type: "number", description: "Huisnummer" },
    },
  }),
  listTool({
    name: "ams_nieuwbouwplannen_list",
    description: "Geeft nieuwbouwplannen terug (publiek deel): woningbouwprojecten in Amsterdam.",
    extraProps: {
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
