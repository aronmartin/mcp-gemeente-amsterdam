import { listTool, type ToolDef } from "@amsterdam-mcp/core";

export const waterToolDefinitions: readonly ToolDef[] = [
  listTool({
    name: "ams_water_list",
    description: "Geeft binnenwater terug in Amsterdam (grachten, meren, havens).",
    extraProps: {},
  }),
  listTool({
    name: "ams_varen_list",
    description: "Geeft ligplaatsen voor vaartuigen terug met naam, segment en vergunningkenmerk.",
    extraProps: {
      naamVaartuig: { type: "string", description: "Naam van het vaartuig" },
      ligplaatsSegment: { type: "string", description: "Ligplaatssegment" },
      kenmerkVergunning: { type: "string", description: "Kenmerk van de vergunning" },
    },
  }),
] as const;
