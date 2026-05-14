import { listTool, type ToolDef } from "@amsterdam-mcp/core";

export const verkeerToolDefinitions: readonly ToolDef[] = [
  listTool({
    name: "ams_parkeervakken_list",
    description: "Geeft parkeervakken terug op type of bbox (straatparkeren, betaald, vergunning etc.).",
    extraProps: {
      eType: { type: "string", description: "E-type code van het parkeervak" },
      soort: { type: "string", description: "Soort parkeervak" },
      buurtcode: { type: "string", description: "Buurtcode" },
      straatnaam: { type: "string", description: "Straatnaam" },
      type: { type: "string", description: "Type parkeervak" },
    },
  }),
  listTool({
    name: "ams_parkeerzones_list",
    description: "Geeft parkeerzones terug met gebiedsnaam, code en vergunningregime.",
    extraProps: {
      gebiedsnaam: { type: "string", description: "Naam van de parkeerzone" },
      gebiedscode: { type: "string", description: "Code van de zone, bijv. 'A'" },
    },
  }),
  listTool({
    name: "ams_milieuzones_list",
    description: "Geeft huidige milieuzones terug (voor voertuigrestricties).",
    extraProps: {
      verkeerstype: { type: "string", description: "Verkeerstype waarop de zone van toepassing is" },
    },
  }),
  listTool({
    name: "ams_milieuzones2025_list",
    description: "Geeft milieuzones 2025 terug (toekomstige zones, strenger).",
    extraProps: {},
  }),
  listTool({
    name: "ams_uitstootvrije_zones_list",
    description: "Geeft uitstootvrije zones terug (zero-emissiezones).",
    extraProps: {},
  }),
  listTool({
    name: "ams_wegenbestand_list",
    description: "Geeft routes gevaarlijke stoffen uit het Amsterdamse wegenbestand terug.",
    extraProps: {
      type: { type: "string", description: "Type route" },
    },
  }),
  listTool({
    name: "ams_touringcars_list",
    description: "Geeft touringcar-haltes en -locaties terug.",
    extraProps: {
      omschrijving: { type: "string", description: "Omschrijving van de locatie" },
    },
  }),
  listTool({
    name: "ams_fietspaaltjes_list",
    description: "Geeft fietspaaltjes en andere toegangsbelemmeringen terug op bbox.",
    extraProps: {
      soortPaaltje: { type: "string", description: "Soort paaltje" },
      soortWeg: { type: "string", description: "Soort weg" },
      type: { type: "string", description: "Type" },
      street: { type: "string", description: "Straatnaam" },
    },
  }),
  listTool({
    name: "ams_hoofdroutes_list",
    description: "Geeft u-routes en hoofdroutes terug (vlucht- en aanrijroutes voor hulpdiensten).",
    extraProps: {
      name: { type: "string", description: "Naam van de route" },
      type: { type: "string", description: "Type route" },
    },
  }),
  listTool({
    name: "ams_loopfietsnetwerk_list",
    description: "Geeft loopfietsroutes (gecombineerde fiets- en wandelroutes) terug.",
    extraProps: {
      wegklasse: { type: "string", description: "Wegklasse" },
      straatnaam: { type: "string", description: "Straatnaam" },
      indicatieVoetFiets: { type: "string", description: "Indicatie voet/fiets gebruik" },
    },
  }),
  listTool({
    name: "ams_verkeersinformatiesystemen_list",
    description: "Geeft verkeersinformatiesystemen terug (telpunten, camera's, etc.).",
    extraProps: {},
  }),
] as const;
