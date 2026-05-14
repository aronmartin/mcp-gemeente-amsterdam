import { listMonumenten, getMonument, listBeschermdeStadsgezichten, listCanon } from "./client.js";
import { erfgoedToolDefinitions } from "./tools.js";
import type { QueryParams } from "@amsterdam-mcp/core";

export { erfgoedToolDefinitions };
export * from "./client.js";

export async function handleErfgoedTool(
  toolName: string,
  args: Record<string, unknown>
): Promise<unknown> {
  const p = args as QueryParams;
  switch (toolName) {
    case "ams_monumenten_list": return listMonumenten(p);
    case "ams_monumenten_get": return getMonument(args.id as string);
    case "ams_beschermde_stadsgezichten_list": return listBeschermdeStadsgezichten(p);
    case "ams_amsterdam_canon_list": return listCanon(p);
    default: throw new Error(`Onbekende erfgoed tool: ${toolName}`);
  }
}
