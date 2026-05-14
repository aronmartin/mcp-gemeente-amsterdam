import { listAardgasVrijeZones, listDuurzaamheid, listEnergieverbruikMra } from "./client.js";
import { duurzaamheidToolDefinitions } from "./tools.js";
import type { QueryParams } from "@amsterdam-mcp/core";

export { duurzaamheidToolDefinitions };
export * from "./client.js";

export async function handleDuurzaamheidTool(
  toolName: string,
  args: Record<string, unknown>
): Promise<unknown> {
  const p = args as QueryParams;
  switch (toolName) {
    case "ams_aardgasvrije_zones_list": return listAardgasVrijeZones(p);
    case "ams_duurzaamheid_list": return listDuurzaamheid(p);
    case "ams_energieverbruik_mra_list": return listEnergieverbruikMra(p);
    default: throw new Error(`Onbekende duurzaamheid tool: ${toolName}`);
  }
}
