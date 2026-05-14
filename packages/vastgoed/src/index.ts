import {
  listWoz, listGemeentelijkVastgoed,
  listNieuwbouwplannen, listGrex, listPrecariobelasting,
} from "./client.js";
import { vastgoedToolDefinitions } from "./tools.js";
import type { QueryParams } from "@amsterdam-mcp/core";

export { vastgoedToolDefinitions };
export * from "./client.js";

export async function handleVastgoedTool(
  toolName: string,
  args: Record<string, unknown>
): Promise<unknown> {
  const p = args as QueryParams;
  switch (toolName) {
    case "ams_woz_list": return listWoz(p);
    case "ams_gemeentelijk_vastgoed_list": return listGemeentelijkVastgoed(p);
    case "ams_nieuwbouwplannen_list": return listNieuwbouwplannen(p);
    case "ams_grex_list": return listGrex(p);
    case "ams_precariobelasting_list": return listPrecariobelasting(p);
    default: throw new Error(`Onbekende vastgoed tool: ${toolName}`);
  }
}
