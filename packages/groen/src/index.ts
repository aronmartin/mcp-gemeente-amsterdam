import { listBomen, getBoom, listEcologie, listZiektePlagenExoten, listFunctioneleGebieden } from "./client.js";
import { groenToolDefinitions } from "./tools.js";
import type { QueryParams } from "@amsterdam-mcp/core";

export { groenToolDefinitions };
export * from "./client.js";

export async function handleGroenTool(
  toolName: string,
  args: Record<string, unknown>
): Promise<unknown> {
  const p = args as QueryParams;
  switch (toolName) {
    case "ams_bomen_list": return listBomen(p);
    case "ams_bomen_get": return getBoom(args.id as string);
    case "ams_ecologie_list": return listEcologie(p);
    case "ams_ziekte_plagen_exoten_list": return listZiektePlagenExoten(p);
    case "ams_functionele_gebieden_list": return listFunctioneleGebieden(p);
    default: throw new Error(`Onbekende groen tool: ${toolName}`);
  }
}
