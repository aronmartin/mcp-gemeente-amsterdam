import {
  listVergunningen, listEvenementen,
  listHoreca, listBedrijvenInvesteringsZones,
} from "./client.js";
import { vergunningenToolDefinitions } from "./tools.js";
import type { QueryParams } from "@amsterdam-mcp/core";

export { vergunningenToolDefinitions };
export * from "./client.js";

export async function handleVergunningenTool(
  toolName: string,
  args: Record<string, unknown>
): Promise<unknown> {
  const p = args as QueryParams;
  switch (toolName) {
    case "ams_vergunningen_list": return listVergunningen(p);
    case "ams_evenementen_list": return listEvenementen(p);
    case "ams_horeca_list": return listHoreca(p);
    case "ams_biz_list": return listBedrijvenInvesteringsZones(p);
    default: throw new Error(`Onbekende vergunningen tool: ${toolName}`);
  }
}
