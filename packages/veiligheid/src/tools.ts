import { listTool, type ToolDef, nearRadiusProps } from "@amsterdam-mcp/core";
import { ENDPOINT_SCHEMAS } from "@amsterdam-mcp/aggregatie";

export const veiligheidToolDefinitions: readonly ToolDef[] = [
  listTool({
    name: "ams_risicozones_list",
    endpoint: "risicozones/bedrijven",
    schema: ENDPOINT_SCHEMAS["risicozones/bedrijven"],
    description: "Geeft risicozones terug: gebieden met externe veiligheidsrisico's (LPG, gevaarlijke stoffen etc.).",
    extraProps: {
      naamBedrijf: { type: "string", description: "Naam van het bedrijf" },
      typeBedrijf: { type: "string", description: "Type bedrijf" },
      categorieBevi: { type: "string", description: "BEVI-categorie" },
      stadsdeel: { type: "string", description: "Stadsdeel" },
    },
  }),
  listTool({
    name: "ams_geluidszones_list",
    endpoint: "geluidszones/industrie",
    schema: ENDPOINT_SCHEMAS["geluidszones/industrie"],
    description: [
      "Geeft geluidszones terug: wettelijke zones rondom industrie, wegen en het spoor.",
      "Gebruik nearLat+nearLon+radiusMeters (~50m) om te controleren of een adres binnen een geluidszone valt.",
    ].join(" "),
    extraProps: {
      naam: { type: "string", description: "Naam van de geluidszone" },
      thema: { type: "string", description: "Thema van de zone" },
      ...nearRadiusProps,
    },
  }),
  listTool({
    name: "ams_overlastgebieden_list",
    endpoint: "overlastgebieden/algemeenoverlast",
    schema: ENDPOINT_SCHEMAS["overlastgebieden/algemeenoverlast"],
    description: [
      "Geeft overlastgebieden terug: gebieden met verhoogde handhaving of beperkingen.",
      "Gebruik nearLat+nearLon+radiusMeters (~50m) om te controleren of een adres binnen een overlastgebied valt.",
    ].join(" "),
    extraProps: {
      oovNaam: { type: "string", description: "Naam van het overlastgebied" },
      oovCode: { type: "string", description: "Code van het overlastgebied" },
      type: { type: "string", description: "Type overlastgebied" },
      soort: { type: "string", description: "Soort overlast" },
      ...nearRadiusProps,
    },
  }),
  listTool({
    name: "ams_veilige_afstanden_list",
    endpoint: "veiligeafstanden/veiligeafstanden",
    schema: ENDPOINT_SCHEMAS["veiligeafstanden/veiligeafstanden"],
    description: "Geeft veilige afstandszones terug: verplichte veiligheidsafstanden rondom risicovolle installaties.",
    extraProps: {
      type: { type: "string", description: "Type zone" },
      locatie: { type: "string", description: "Locatie" },
    },
  }),
  listTool({
    name: "ams_schiphol_zones_list",
    endpoint: "schiphol/geluidzones",
    schema: ENDPOINT_SCHEMAS["schiphol/geluidzones"],
    description: "Geeft Schiphol-gerelateerde zones terug (toetshoogtezones, geluidszones, bouwbeperkingen).",
    extraProps: {
      type: { type: "string", description: "Type Schiphol-zone" },
      thema: { type: "string", description: "Thema van de zone" },
    },
  }),
] as const;
