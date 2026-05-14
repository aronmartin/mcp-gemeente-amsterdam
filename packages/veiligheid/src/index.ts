import {
  listRisicozones, listGeluidszones,
  listOverlastgebieden, listVeiligheidsAfstanden, listSchipholZones,
} from "./client.js";
import { veiligheidToolDefinitions } from "./tools.js";
import type { QueryParams } from "@amsterdam-mcp/core";

export { veiligheidToolDefinitions };
export * from "./client.js";

export async function handleVeiligheidTool(
  toolName: string,
  args: Record<string, unknown>
): Promise<unknown> {
  const p = args as QueryParams;
  switch (toolName) {
    case "ams_risicozones_list": return listRisicozones(p);
    case "ams_geluidszones_list": return listGeluidszones(p);
    case "ams_overlastgebieden_list": return listOverlastgebieden(p);
    case "ams_veilige_afstanden_list": return listVeiligheidsAfstanden(p);
    case "ams_schiphol_zones_list": return listSchipholZones(p);
    default: throw new Error(`Onbekende veiligheid tool: ${toolName}`);
  }
}
