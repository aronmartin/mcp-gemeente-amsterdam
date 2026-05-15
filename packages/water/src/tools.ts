import { listTool, type ToolDef } from "@amsterdam-mcp/core";
import { ENDPOINT_SCHEMAS } from "@amsterdam-mcp/aggregatie";

export const waterToolDefinitions: readonly ToolDef[] = [
  listTool({
    name: "ams_water_list",
    endpoint: "water/binnenwater",
    schema: ENDPOINT_SCHEMAS["water/binnenwater"],
    description: "Geeft binnenwater terug in Amsterdam (grachten, meren, havens).",
    extraProps: {},
  }),
  listTool({
    name: "ams_varen_list",
    endpoint: "varen/ligplaats",
    schema: ENDPOINT_SCHEMAS["varen/ligplaats"],
    description: "Geeft ligplaatsen voor vaartuigen terug met naam, segment en vergunningkenmerk.",
    extraProps: {
      naamVaartuig: { type: "string", description: "Naam van het vaartuig" },
      ligplaatsSegment: { type: "string", description: "Ligplaatssegment" },
      kenmerkVergunning: { type: "string", description: "Kenmerk van de vergunning" },
    },
  }),
] as const;
