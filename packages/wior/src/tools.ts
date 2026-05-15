import { listTool, type ToolDef, nearRadiusProps } from "@amsterdam-mcp/core";

export const wiorToolDefinitions: readonly ToolDef[] = [
  listTool({
    name: "ams_wior_list",
    endpoint: "wior/wior",
    description: [
      "Geeft werkzaamheden in de openbare ruimte terug: geplande en actieve graafwerken, rioleringsprojecten etc.",
      "Gebruik nearLat+nearLon+radiusMeters om graafwerken in de buurt van een punt te vinden (sorteert op afstand, voegt _distanceMeters toe).",
    ].join(" "),
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
      ...nearRadiusProps,
    },
  }),
  listTool({
    name: "ams_storingsmeldingen_list",
    endpoint: "storingsmeldingen_ovl_en_klokken/openbare_verlichting",
    description: "Geeft storingsmeldingen van openbare verlichting en klokken terug.",
    extraProps: {
      storingstatus: { type: "number", description: "Status van de storing als getal, bijv. 0 (gemeld), 1 (in behandeling), 2 (opgelost)" },
      meldingstatus: { type: "number", description: "Status van de melding als getal, bijv. 0 (open), 1 (gesloten)" },
      objecttype: { type: "string", description: "Type object (bijv. 'Armatuur', 'Mast')" },
      objectnummer: { type: "string", description: "Objectnummer" },
    },
  }),
  listTool({
    name: "ams_stroomstoringen_list",
    endpoint: "stroomstoringen/stroomstoringen",
    description: "Geeft stroomstoringen terug met tijdsduur, locatie en aantal getroffen aansluitingen.",
    extraProps: {},
  }),
] as const;
