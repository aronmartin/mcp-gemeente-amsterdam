import {
  listParkeervakken, listParkeerzones,
  listMilieuzones, listMilieuzones2025, listUitstootVrijeZones,
  listWegenbestand, listTouringcars, listFietspaaltjes,
  listHoofdroutes, listLoopfietsnetwerk, listVerkeersinformatiesystemen,
} from "./client.js";
import { verkeerToolDefinitions } from "./tools.js";
import { defaultClient, fetchNearRadius, type QueryParams } from "@amsterdam-mcp/core";

export { verkeerToolDefinitions };
export * from "./client.js";

export async function handleVerkeerTool(
  toolName: string,
  args: Record<string, unknown>
): Promise<unknown> {
  const p = args as QueryParams;
  switch (toolName) {
    case "ams_parkeervakken_list": return listParkeervakken(p);
    case "ams_parkeerzones_list": {
      const { nearLat, nearLon, radiusMeters, page_size, ...rest } = args;
      if (nearLat !== undefined && nearLon !== undefined) {
        return fetchNearRadius(
          defaultClient, "parkeerzones", "parkeerzones", "geometrie[intersects]",
          nearLat as number, nearLon as number, (radiusMeters as number) ?? 500,
          rest as QueryParams, (page_size as number) ?? 20,
        );
      }
      return listParkeerzones(rest as QueryParams);
    }
    case "ams_milieuzones_list": {
      const { nearLat, nearLon, radiusMeters, page_size, ...rest } = args;
      if (nearLat !== undefined && nearLon !== undefined) {
        return fetchNearRadius(
          defaultClient, "milieuzones", "vrachtauto", "geometrie[intersects]",
          nearLat as number, nearLon as number, (radiusMeters as number) ?? 500,
          rest as QueryParams, (page_size as number) ?? 20,
        );
      }
      return listMilieuzones(rest as QueryParams);
    }
    case "ams_milieuzones2025_list": {
      const { nearLat, nearLon, radiusMeters, page_size, ...rest } = args;
      if (nearLat !== undefined && nearLon !== undefined) {
        return fetchNearRadius(
          defaultClient, "milieuzones2025", "vracht_en_bestelauto", "geometrie[intersects]",
          nearLat as number, nearLon as number, (radiusMeters as number) ?? 500,
          rest as QueryParams, (page_size as number) ?? 20,
        );
      }
      return listMilieuzones2025(rest as QueryParams);
    }
    case "ams_uitstootvrije_zones_list": {
      const { nearLat, nearLon, radiusMeters, page_size, ...rest } = args;
      if (nearLat !== undefined && nearLon !== undefined) {
        return fetchNearRadius(
          defaultClient, "uitstootvrije_zones", "brom_en_snorfiets", "geometrie[intersects]",
          nearLat as number, nearLon as number, (radiusMeters as number) ?? 500,
          rest as QueryParams, (page_size as number) ?? 20,
        );
      }
      return listUitstootVrijeZones(rest as QueryParams);
    }
    case "ams_wegenbestand_list": return listWegenbestand(p);
    case "ams_touringcars_list": return listTouringcars(p);
    case "ams_fietspaaltjes_list": return listFietspaaltjes(p);
    case "ams_hoofdroutes_list": return listHoofdroutes(p);
    case "ams_loopfietsnetwerk_list": return listLoopfietsnetwerk(p);
    case "ams_verkeersinformatiesystemen_list": return listVerkeersinformatiesystemen(p);
    default: throw new Error(`Onbekende verkeer tool: ${toolName}`);
  }
}
