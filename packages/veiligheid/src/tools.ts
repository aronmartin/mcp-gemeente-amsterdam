import { listTool, type ToolDef } from "@amsterdam-mcp/core";

export const veiligheidToolDefinitions: readonly ToolDef[] = [
  listTool({
    name: "ams_risicozones_list",
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
    description: "Geeft geluidszones terug: wettelijke zones rondom industrie, wegen en het spoor.",
    extraProps: {
      naam: { type: "string", description: "Naam van de geluidszone" },
      thema: { type: "string", description: "Thema van de zone" },
    },
  }),
  listTool({
    name: "ams_overlastgebieden_list",
    description: "Geeft overlastgebieden terug: gebieden met verhoogde handhaving of beperkingen.",
    extraProps: {
      oovNaam: { type: "string", description: "Naam van het overlastgebied" },
      oovCode: { type: "string", description: "Code van het overlastgebied" },
      type: { type: "string", description: "Type overlastgebied" },
      soort: { type: "string", description: "Soort overlast" },
    },
  }),
  listTool({
    name: "ams_veilige_afstanden_list",
    description: "Geeft veilige afstandszones terug: verplichte veiligheidsafstanden rondom risicovolle installaties.",
    extraProps: {
      type: { type: "string", description: "Type zone" },
      locatie: { type: "string", description: "Locatie" },
    },
  }),
  listTool({
    name: "ams_schiphol_zones_list",
    description: "Geeft Schiphol-gerelateerde zones terug (toetshoogtezones, geluidszones, bouwbeperkingen).",
    extraProps: {
      type: { type: "string", description: "Type Schiphol-zone" },
      thema: { type: "string", description: "Thema van de zone" },
    },
  }),
] as const;
