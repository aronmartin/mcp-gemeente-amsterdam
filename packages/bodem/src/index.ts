import {
  listBodemonderzoeken, listHistorischeBodeminfo,
  listExplosieven, listOntplofbareOorlogsresten, listLeidingen,
} from "./client.js";
import { bodemToolDefinitions } from "./tools.js";
import type { QueryParams } from "@amsterdam-mcp/core";

export { bodemToolDefinitions };
export * from "./client.js";

export async function handleBodemTool(
  toolName: string,
  args: Record<string, unknown>
): Promise<unknown> {
  const p = args as QueryParams;
  switch (toolName) {
    case "ams_bodemonderzoeken_list": return listBodemonderzoeken(p);
    case "ams_historische_bodeminformatie_list": return listHistorischeBodeminfo(p);
    case "ams_explosieven_list": return listExplosieven(p);
    case "ams_ontplofbare_oorlogsresten_list": return listOntplofbareOorlogsresten(p);
    case "ams_leidingen_list": return listLeidingen(p);
    default: throw new Error(`Onbekende bodem tool: ${toolName}`);
  }
}
