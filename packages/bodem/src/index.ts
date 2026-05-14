import {
  listBodemonderzoeken, listHistorischeBodeminfo,
  listExplosieven, listOntplofbareOorlogsresten, listLeidingen,
} from "./client.js";
import { bodemToolDefinitions } from "./tools.js";
import { applyNearFilter, buildIntersectsParam, type QueryParams } from "@amsterdam-mcp/core";

export { bodemToolDefinitions };
export * from "./client.js";

export async function handleBodemTool(
  toolName: string,
  args: Record<string, unknown>
): Promise<unknown> {
  switch (toolName) {
    case "ams_bodemonderzoeken_list": {
      const { nearLat, nearLon, radiusMeters, ...rest } = args;
      const params = rest as QueryParams;
      if (nearLat !== undefined && nearLon !== undefined) {
        const radius = (radiusMeters as number) ?? 500;
        params["geometry[intersects]"] = buildIntersectsParam(nearLat as number, nearLon as number, radius);
        const page = await listBodemonderzoeken(params);
        return applyNearFilter(page as Parameters<typeof applyNearFilter>[0], nearLat as number, nearLon as number, radius);
      }
      return listBodemonderzoeken(params);
    }
    case "ams_historische_bodeminformatie_list": return listHistorischeBodeminfo(args as QueryParams);
    case "ams_explosieven_list": return listExplosieven(args as QueryParams);
    case "ams_ontplofbare_oorlogsresten_list": return listOntplofbareOorlogsresten(args as QueryParams);
    case "ams_leidingen_list": return listLeidingen(args as QueryParams);
    default: throw new Error(`Onbekende bodem tool: ${toolName}`);
  }
}
