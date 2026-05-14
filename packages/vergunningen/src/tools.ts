import { listTool, type ToolDef } from "@amsterdam-mcp/core";

export const vergunningenToolDefinitions: readonly ToolDef[] = [
  listTool({
    name: "ams_vergunningen_list",
    description: "Zoek omzettingsvergunningen (woningomzetting) op wijk of kleurcategorie.",
    extraProps: {
      wijkNaam: { type: "string", description: "Naam van de wijk" },
      categorieKleur: { type: "string", description: "Kleurcategorie van de vergunning" },
    },
  }),
  listTool({
    name: "ams_evenementen_list",
    description: [
      "Zoek vergunde evenementen in Amsterdam op naam, datum of gebied.",
      "Waarschuwing: de upstream evenementen-feed bevat mogelijk verouderde data (laatste bekende events zijn uit 2021).",
      "Als er 0 resultaten zijn bij een datumfilter in 2025/2026 is de dataset waarschijnlijk niet meer actueel.",
    ].join(" "),
    extraProps: {
      titel: { type: "string", description: "Titel van het evenement" },
      "startdatum[gte]": { type: "string", description: "Startdatum vanaf (YYYY-MM-DD)" },
      "startdatum[lte]": { type: "string", description: "Startdatum tot (YYYY-MM-DD)" },
      "einddatum[gte]": { type: "string", description: "Einddatum vanaf (YYYY-MM-DD)" },
      gbdStadsdeelNaam: { type: "string", description: "Naam van het stadsdeel, bijv. 'Centrum', 'West'" },
      gbdWijkNaam: { type: "string", description: "Naam van de wijk" },
    },
  }),
  listTool({
    name: "ams_horeca_list",
    description: "Zoek horecabedrijven (cafés, restaurants, hotels) op naam of adres.",
    extraProps: {
      zaaknaam: { type: "string", description: "Naam van het bedrijf" },
      "zaaknaam[like]": { type: "string", description: "Naam bevat (wildcard)" },
      adres: { type: "string", description: "Adres" },
      postcode: { type: "string", description: "Postcode" },
    },
  }),
  listTool({
    name: "ams_biz_list",
    description: "Geeft Bedrijven Investeringszones (BIZ) terug: samenwerkingsverbanden van ondernemers per gebied.",
    extraProps: {},
  }),
] as const;
