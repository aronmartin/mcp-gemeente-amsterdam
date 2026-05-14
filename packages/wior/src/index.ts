import { listWior, listStoringsmeldingen, listStroomstoringen } from "./client.js";
import { wiorToolDefinitions } from "./tools.js";
import type { QueryParams } from "@amsterdam-mcp/core";

export { wiorToolDefinitions };
export * from "./client.js";

export async function handleWiorTool(
  toolName: string,
  args: Record<string, unknown>
): Promise<unknown> {
  const p = args as QueryParams;
  switch (toolName) {
    case "ams_wior_list": return listWior(p);
    case "ams_storingsmeldingen_list": return listStoringsmeldingen(p);
    case "ams_stroomstoringen_list": return listStroomstoringen(p);
    default: throw new Error(`Onbekende wior tool: ${toolName}`);
  }
}
