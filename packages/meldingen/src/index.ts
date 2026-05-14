import { listMeldingen } from "./client.js";
import { meldingenToolDefinitions } from "./tools.js";
import type { QueryParams } from "@amsterdam-mcp/core";

export { meldingenToolDefinitions };
export * from "./client.js";

export async function handleMeldingenTool(
  toolName: string,
  args: Record<string, unknown>
): Promise<unknown> {
  const p = args as QueryParams;
  switch (toolName) {
    case "ams_meldingen_list": return listMeldingen(p);
    default: throw new Error(`Onbekende meldingen tool: ${toolName}`);
  }
}
