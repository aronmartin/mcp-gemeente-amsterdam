import {
  listBodemonderzoeken, listHistorischeBodeminfo,
  listExplosieven, listOntplofbareOorlogsresten, listLeidingen,
} from "./client.js";
import { bodemToolDefinitions } from "./tools.js";
import { defaultClient, fetchNearRadius, type QueryParams } from "@amsterdam-mcp/core";

export { bodemToolDefinitions };
export * from "./client.js";

export async function handleBodemTool(
  toolName: string,
  args: Record<string, unknown>
): Promise<unknown> {
  switch (toolName) {
    case "ams_bodemonderzoeken_list": {
      const { nearLat, nearLon, radiusMeters, page_size, page: _page, ...rest } = args;
      if (nearLat !== undefined && nearLon !== undefined) {
        // Let op: upstream gebruikt 'geometry' (zonder 'e') als geo-veldnaam
        return fetchNearRadius(
          defaultClient, "bodem", "grond", "geometry[intersects]",
          nearLat as number, nearLon as number, (radiusMeters as number) ?? 500,
          rest as QueryParams, (page_size as number) ?? 20,
        );
      }
      return listBodemonderzoeken(args as QueryParams);
    }
    case "ams_historische_bodeminformatie_list": return listHistorischeBodeminfo(args as QueryParams);
    case "ams_explosieven_list": return listExplosieven(args as QueryParams);
    case "ams_ontplofbare_oorlogsresten_list": return listOntplofbareOorlogsresten(args as QueryParams);
    case "ams_leidingen_list": return listLeidingen(args as QueryParams);
    default: throw new Error(`Onbekende bodem tool: ${toolName}`);
  }
}
