import { listAfvalcontainers, getAfvalcontainer, listAfvalwijzer, listRecyclepunten } from "./client.js";
import { afvalToolDefinitions } from "./tools.js";
import type { QueryParams } from "@amsterdam-mcp/core";

export { afvalToolDefinitions };
export * from "./client.js";

export async function handleAfvalTool(
  toolName: string,
  args: Record<string, unknown>
): Promise<unknown> {
  const p = args as QueryParams;
  switch (toolName) {
    case "ams_afvalcontainers_list": return listAfvalcontainers(p);
    case "ams_afvalcontainers_get": return getAfvalcontainer(args.id as string);
    case "ams_afvalwijzer_list": return listAfvalwijzer(p);
    case "ams_recyclepunten_list": return listRecyclepunten(p);
    default: throw new Error(`Onbekende afval tool: ${toolName}`);
  }
}
