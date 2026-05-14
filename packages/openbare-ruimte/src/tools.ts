import { listTool, getTool, type ToolDef } from "@amsterdam-mcp/core";

export const openbareRuimteToolDefinitions: readonly ToolDef[] = [
  listTool({
    name: "ams_bgt_list",
    description: "Geeft BGT-wegdelen (Basisregistratie Grootschalige Topografie) terug op type.",
    extraProps: {
      bgtFunctie: { type: "string", description: "BGT-functie van het wegdeel" },
      plusFunctie: { type: "string", description: "Plus-functie van het wegdeel" },
      bgtFysiekVoorkomen: { type: "string", description: "Fysiek voorkomen van het wegdeel" },
    },
  }),
  listTool({
    name: "ams_nap_peilmerken_list",
    description: "Geeft NAP-peilmerken terug: officiële hoogtemeetpunten ten opzichte van NAP.",
    extraProps: {
      merkCode: { type: "string", description: "Code van het peilmerk" },
      statusCode: { type: "number", description: "Status als getal, bijv. 1 (actief), 2 (vervallen)" },
    },
  }),
  listTool({
    name: "ams_meetbouten_list",
    description: "Geeft meetbouten terug: bouts in de grond voor zakking-monitoring van de bodem.",
    extraProps: {
      statusCode: { type: "number", description: "Status als getal, bijv. 1 (actief), 2 (vervallen)" },
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
    description: "Geeft kademuren terug uit de civiele constructies registratie.",
    extraProps: {
      beheerder: { type: "string", description: "Beheerder van de kademuur" },
      eigenaar: { type: "string", description: "Eigenaar van de kademuur" },
      materiaal: { type: "string", description: "Materiaal van de kademuur" },
    },
  }),
  listTool({
    name: "ams_bouwstroompunten_list",
    description: "Geeft bouwstroompunten terug: aansluitpunten voor tijdelijke stroomafname bij bouwprojecten.",
    extraProps: {
      primaireFunctie: { type: "string", description: "Primaire functie van het bouwstroompunt" },
      toegangswijze: { type: "string", description: "Toegangswijze van het bouwstroompunt" },
    },
  }),
  listTool({
    name: "ams_objecten_openbare_ruimte_list",
    description: "Geeft afvalbakken in de openbare ruimte terug.",
    extraProps: {
      naam: { type: "string", description: "Naam van het object" },
      type: { type: "string", description: "Type object" },
      actief: { type: "string", description: "Of het object actief is ('true'/'false')" },
    },
  }),
] as const;
