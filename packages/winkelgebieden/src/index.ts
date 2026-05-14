import { listWinkelgebieden } from "./client.js";
import { winkelgebiedenToolDefinitions } from "./tools.js";
import type { QueryParams } from "@amsterdam-mcp/core";

export { winkelgebiedenToolDefinitions };
export * from "./client.js";

export async function handleWinkelgebiedenTool(
  toolName: string,
  args: Record<string, unknown>
): Promise<unknown> {
  const p = args as QueryParams;
  switch (toolName) {
    case "ams_winkelgebieden_list": return listWinkelgebieden(p);
    default: throw new Error(`Onbekende winkelgebieden tool: ${toolName}`);
  }
}
