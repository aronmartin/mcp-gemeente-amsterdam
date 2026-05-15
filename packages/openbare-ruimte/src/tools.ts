import { listTool, getTool, type ToolDef, nearRadiusProps } from "@amsterdam-mcp/core";

export const openbareRuimteToolDefinitions: readonly ToolDef[] = [
  listTool({
    name: "ams_bgt_list",
    endpoint: "bgt/wegdelen",
    description: "Geeft BGT-wegdelen (Basisregistratie Grootschalige Topografie) terug op type.",
    extraProps: {
      bgtFunctie: { type: "string", description: "BGT-functie van het wegdeel" },
      plusFunctie: { type: "string", description: "Plus-functie van het wegdeel" },
      bgtFysiekVoorkomen: { type: "string", description: "Fysiek voorkomen van het wegdeel" },
    },
  }),
  listTool({
    name: "ams_nap_peilmerken_list",
    endpoint: "nap/peilmerken",
    description: "Geeft NAP-peilmerken terug: officiële hoogtemeetpunten ten opzichte van NAP.",
    extraProps: {
      merkCode: { type: "string", description: "Code van het peilmerk" },
      statusCode: { type: "number", description: "Status als getal, bijv. 1 (actief), 2 (vervallen)" },
    },
  }),
  listTool({
    name: "ams_meetbouten_list",
    endpoint: "meetbouten/meetbouten",
    description: [
      "Geeft meetbouten terug: bouts in de grond voor zakking-monitoring van de bodem.",
      "Gebruik nearLat+nearLon+radiusMeters om meetbouten bij een specifiek adres te vinden (sorteert op afstand).",
    ].join(" "),
    extraProps: {
      statusCode: { type: "number", description: "Status als getal, bijv. 1 (actief), 2 (vervallen)" },
      ...nearRadiusProps,
    },
  }),
  getTool({
    name: "ams_meetbouten_get",
    description: "Haal één meetbout op via het ID.",
    idProp: "id",
    idDescription: "Meetbout-ID",
  }),
  listTool({
    name: "ams_civieleconstructies_list",
    endpoint: "civieleconstructies/kademuur",
    description: [
      "Geeft kademuren terug uit de civiele constructies registratie.",
      "Gebruik nearLat+nearLon+radiusMeters om kademuren bij een specifiek grachtenpand te vinden (sorteert op afstand).",
    ].join(" "),
    extraProps: {
      beheerder: { type: "string", description: "Beheerder van de kademuur" },
      eigenaar: { type: "string", description: "Eigenaar van de kademuur" },
      materiaal: { type: "string", description: "Materiaal van de kademuur" },
      ...nearRadiusProps,
    },
  }),
  listTool({
    name: "ams_bouwstroompunten_list",
    endpoint: "bouwstroompunten/bouwstroompunten",
    description: "Geeft bouwstroompunten terug: aansluitpunten voor tijdelijke stroomafname bij bouwprojecten.",
    extraProps: {
      primaireFunctie: { type: "string", description: "Primaire functie van het bouwstroompunt" },
      toegangswijze: { type: "string", description: "Toegangswijze van het bouwstroompunt" },
    },
  }),
  listTool({
    name: "ams_objecten_openbare_ruimte_list",
    endpoint: "objectenopenbareruimte/afvalbakken",
    description: "Geeft afvalbakken in de openbare ruimte terug.",
    extraProps: {
      naam: { type: "string", description: "Naam van het object" },
      type: { type: "string", description: "Type object" },
      actief: { type: "string", description: "Of het object actief is ('true'/'false')" },
    },
  }),
] as const;
