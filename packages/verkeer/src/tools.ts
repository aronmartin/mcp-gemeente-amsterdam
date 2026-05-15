import { listTool, type ToolDef, nearRadiusProps } from "@amsterdam-mcp/core";
import { ENDPOINT_SCHEMAS } from "@amsterdam-mcp/aggregatie";

export const verkeerToolDefinitions: readonly ToolDef[] = [
  listTool({
    name: "ams_parkeervakken_list",
    endpoint: "parkeervakken/parkeervakken",
    schema: ENDPOINT_SCHEMAS["parkeervakken/parkeervakken"],
    description: "Geeft parkeervakken terug op type (straatparkeren, betaald, vergunning etc.).",
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
    endpoint: "parkeerzones/parkeerzones",
    schema: ENDPOINT_SCHEMAS["parkeerzones/parkeerzones"],
    description: [
      "Geeft parkeerzones terug met gebiedsnaam, code en vergunningregime.",
      "Gebruik nearLat+nearLon+radiusMeters (~50m) om te controleren in welke parkeerzone een adres valt.",
    ].join(" "),
    extraProps: {
      gebiedsnaam: { type: "string", description: "Naam van de parkeerzone" },
      gebiedscode: { type: "string", description: "Code van de zone, bijv. 'A'" },
      ...nearRadiusProps,
    },
  }),
  listTool({
    name: "ams_milieuzones_list",
    endpoint: "milieuzones/vrachtauto",
    schema: ENDPOINT_SCHEMAS["milieuzones/vrachtauto"],
    description: [
      "Geeft huidige milieuzones terug (voor voertuigrestricties).",
      "Gebruik nearLat+nearLon+radiusMeters (~50m) om te controleren of een adres binnen een milieuzone valt.",
    ].join(" "),
    extraProps: {
      verkeerstype: { type: "string", description: "Verkeerstype waarop de zone van toepassing is" },
      ...nearRadiusProps,
    },
  }),
  listTool({
    name: "ams_milieuzones2025_list",
    endpoint: "milieuzones2025/vracht_en_bestelauto",
    schema: ENDPOINT_SCHEMAS["milieuzones2025/vracht_en_bestelauto"],
    description: [
      "Geeft milieuzones 2025 terug (toekomstige zones, strenger).",
      "Gebruik nearLat+nearLon+radiusMeters (~50m) om te controleren of een adres binnen een milieuzone 2025 valt.",
    ].join(" "),
    extraProps: {
      ...nearRadiusProps,
    },
  }),
  listTool({
    name: "ams_uitstootvrije_zones_list",
    endpoint: "uitstootvrije_zones/brom_en_snorfiets",
    schema: ENDPOINT_SCHEMAS["uitstootvrije_zones/brom_en_snorfiets"],
    description: [
      "Geeft uitstootvrije zones terug (zero-emissiezones).",
      "Gebruik nearLat+nearLon+radiusMeters (~50m) om te controleren of een adres binnen een uitstootvrije zone valt.",
    ].join(" "),
    extraProps: {
      ...nearRadiusProps,
    },
  }),
  listTool({
    name: "ams_wegenbestand_list",
    endpoint: "wegenbestand/routes_gevaarlijke_stoffen",
    schema: ENDPOINT_SCHEMAS["wegenbestand/routes_gevaarlijke_stoffen"],
    description: "Geeft routes gevaarlijke stoffen uit het Amsterdamse wegenbestand terug.",
    extraProps: {
      type: { type: "string", description: "Type route" },
    },
  }),
  listTool({
    name: "ams_touringcars_list",
    endpoint: "touringcars/haltes",
    schema: ENDPOINT_SCHEMAS["touringcars/haltes"],
    description: "Geeft touringcar-haltes en -locaties terug.",
    extraProps: {
      omschrijving: { type: "string", description: "Omschrijving van de locatie" },
    },
  }),
  listTool({
    name: "ams_fietspaaltjes_list",
    endpoint: "fietspaaltjes/fietspaaltjes",
    schema: ENDPOINT_SCHEMAS["fietspaaltjes/fietspaaltjes"],
    description: "Geeft fietspaaltjes en andere toegangsbelemmeringen terug.",
    extraProps: {
      soortPaaltje: { type: "string", description: "Soort paaltje" },
      soortWeg: { type: "string", description: "Soort weg" },
      type: { type: "string", description: "Type" },
      street: { type: "string", description: "Straatnaam" },
    },
  }),
  listTool({
    name: "ams_hoofdroutes_list",
    endpoint: "hoofdroutes/u_routes",
    schema: ENDPOINT_SCHEMAS["hoofdroutes/u_routes"],
    description: "Geeft u-routes en hoofdroutes terug (vlucht- en aanrijroutes voor hulpdiensten).",
    extraProps: {
      name: { type: "string", description: "Naam van de route" },
      type: { type: "string", description: "Type route" },
    },
  }),
  listTool({
    name: "ams_loopfietsnetwerk_list",
    endpoint: "loopfietsnetwerk/edges",
    schema: ENDPOINT_SCHEMAS["loopfietsnetwerk/edges"],
    description: "Geeft loopfietsroutes (gecombineerde fiets- en wandelroutes) terug.",
    extraProps: {
      wegklasse: { type: "string", description: "Wegklasse" },
      straatnaam: { type: "string", description: "Straatnaam" },
      indicatieVoetFiets: { type: "string", description: "Indicatie voet/fiets gebruik" },
    },
  }),
  listTool({
    name: "ams_verkeersinformatiesystemen_list",
    endpoint: "verkeersinformatiesystemen/verkeersinformatiesystemen",
    schema: ENDPOINT_SCHEMAS["verkeersinformatiesystemen/verkeersinformatiesystemen"],
    description: "Geeft verkeersinformatiesystemen terug (telpunten, camera's, etc.).",
    extraProps: {},
  }),
] as const;
