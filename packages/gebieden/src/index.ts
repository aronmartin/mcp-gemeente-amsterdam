import {
  listStadsdelen, getStadsdeel,
  listWijken, getWijk,
  listBuurten, getBuurt,
  listGgwGebieden,
  listGrootstedelijkeGebieden,
} from "./client.js";
import { resolveLocation } from "./resolve.js";
import { gebiedenToolDefinitions } from "./tools.js";
import type { QueryParams } from "@amsterdam-mcp/core";

export { gebiedenToolDefinitions };
export * from "./client.js";

export async function handleGebiedenTool(
  toolName: string,
  args: Record<string, unknown>
): Promise<unknown> {
  const p = args as QueryParams;
  switch (toolName) {
    case "ams_gebieden_list_stadsdelen": return listStadsdelen(p);
    case "ams_gebieden_list_wijken": return listWijken(p);
    case "ams_gebieden_list_buurten": return listBuurten(p);
    case "ams_gebieden_get_buurt": return getBuurt(args.identificatie as string);
    case "ams_gebieden_list_ggwgebieden": return listGgwGebieden(p);
    case "ams_gebieden_list_grootstedelijke_gebieden": return listGrootstedelijkeGebieden(p);
    case "ams_resolve_location": return resolveLocation(args as Parameters<typeof resolveLocation>[0]);
    default: throw new Error(`Onbekende gebieden tool: ${toolName}`);
  }
}
