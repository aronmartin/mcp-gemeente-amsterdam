import type { ToolDef } from "@amsterdam-mcp/core";

export const analyseToolDefinitions: readonly ToolDef[] = [
  {
    name: "ams_buurt_hotspot_analyse",
    description: [
      "Voert een cross-dataset analyse uit om buurten te vinden waar tegelijkertijd:",
      "1) veel openbare ruimte meldingen binnenkomen (Meldingen API),",
      "2) actieve graafwerkzaamheden/WIOR-projecten lopen (WIOR API),",
      "3) beperkte parkeercapaciteit is (Parkeervakken API).",
      "Geeft een gesorteerde hotspot-lijst terug met scores per buurt.",
      "Gebruik 'dagen' om de meldingen-periode in te stellen (standaard 7 dagen).",
      "Gebruik 'stadsdeel' om te filteren op één stadsdeel (bijv. 'Centrum', 'Oost').",
    ].join(" "),
    parameters: {
      type: "object",
      properties: {
        dagen: {
          type: "number",
          description: "Aantal dagen terug voor meldingen (standaard 7, max ~30 voor performance)",
        },
        stadsdeel: {
          type: "string",
          description: "Filter op stadsdeel, bijv. 'Centrum', 'Oost', 'West', 'Noord', 'Zuid', 'Nieuw-West', 'Zuidoost'",
        },
        top: {
          type: "number",
          description: "Maximaal aantal buurten in de output (standaard 10)",
        },
      },
      required: [] as const,
    },
  },
] as const;
