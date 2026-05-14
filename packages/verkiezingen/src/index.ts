import { listVerkiezingen } from "./client.js";
import { verkiezingenToolDefinitions } from "./tools.js";
import type { QueryParams } from "@amsterdam-mcp/core";

export { verkiezingenToolDefinitions };
export * from "./client.js";

export async function handleVerkiezingenTool(
  toolName: string,
  args: Record<string, unknown>
): Promise<unknown> {
  const p = args as QueryParams;
  switch (toolName) {
    case "ams_verkiezingen_list": return listVerkiezingen(p);
    default: throw new Error(`Onbekende verkiezingen tool: ${toolName}`);
  }
}
