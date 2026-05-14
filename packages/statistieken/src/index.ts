import { listBbga, listStatistieken, listIndicatoren } from "./client.js";
import { statistiekenToolDefinitions } from "./tools.js";
import type { QueryParams } from "@amsterdam-mcp/core";

export { statistiekenToolDefinitions };
export * from "./client.js";

export async function handleStatistiekenTool(
  toolName: string,
  args: Record<string, unknown>
): Promise<unknown> {
  const p = args as QueryParams;
  switch (toolName) {
    case "ams_bbga_list": return listBbga(p);
    case "ams_statistieken_list": return listStatistieken(p);
    case "ams_indicatoren_list": return listIndicatoren(p);
    default: throw new Error(`Onbekende statistieken tool: ${toolName}`);
  }
}
