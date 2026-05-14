import { listTool, type ToolDef } from "@amsterdam-mcp/core";

export const wiorToolDefinitions: readonly ToolDef[] = [
  listTool({
    name: "ams_wior_list",
    description: "Geeft werkzaamheden in de openbare ruimte terug: geplande en actieve graafwerken, rioleringsprojecten etc.",
    extraProps: {
      hoofdstatus: { type: "string", description: "Status, bijv. 'Uitvoering', 'Gepland', 'Gereed'" },
      typeWerkzaamheden: { type: "string", description: "Type werkzaamheid, bijv. 'Vervanging', 'Aanleg'" },
      projectnaam: { type: "string", description: "Naam van het project" },
      "projectnaam[like]": { type: "string", description: "Projectnaam bevat (wildcard)" },
      wiorNummer: { type: "string", description: "WIOR-nummer" },
      "datumStartUitvoering[gte]": { type: "string", description: "Startdatum uitvoering vanaf (YYYY-MM-DD)" },
      "datumStartUitvoering[lte]": { type: "string", description: "Startdatum uitvoering tot (YYYY-MM-DD)" },
      "datumEindeUitvoering[gte]": { type: "string", description: "Einddatum uitvoering vanaf (YYYY-MM-DD)" },
      "datumEindeUitvoering[lte]": { type: "string", description: "Einddatum uitvoering tot (YYYY-MM-DD)" },
    },
  }),
  listTool({
    name: "ams_storingsmeldingen_list",
    description: "Geeft storingsmeldingen van openbare verlichting en klokken terug.",
    extraProps: {
      storingstatus: { type: "string", description: "Status van de storing" },
      meldingstatus: { type: "string", description: "Status van de melding" },
      objecttype: { type: "string", description: "Type object (bijv. 'Armatuur', 'Mast')" },
      objectnummer: { type: "string", description: "Objectnummer" },
    },
  }),
  listTool({
    name: "ams_stroomstoringen_list",
    description: "Geeft stroomstoringen terug met tijdsduur, locatie en aantal getroffen aansluitingen.",
    extraProps: {},
  }),
] as const;
