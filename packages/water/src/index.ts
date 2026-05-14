import { listWater, listVaren } from "./client.js";
import { waterToolDefinitions } from "./tools.js";
import type { QueryParams } from "@amsterdam-mcp/core";

export { waterToolDefinitions };
export * from "./client.js";

export async function handleWaterTool(
  toolName: string,
  args: Record<string, unknown>
): Promise<unknown> {
  const p = args as QueryParams;
  switch (toolName) {
    case "ams_water_list": return listWater(p);
    case "ams_varen_list": return listVaren(p);
    default: throw new Error(`Onbekende water tool: ${toolName}`);
  }
}
