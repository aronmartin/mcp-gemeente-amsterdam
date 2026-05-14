import {
  listParkeervakken, listParkeerzones,
  listMilieuzones, listMilieuzones2025, listUitstootVrijeZones,
  listWegenbestand, listTouringcars, listFietspaaltjes,
  listHoofdroutes, listLoopfietsnetwerk, listVerkeersinformatiesystemen,
} from "./client.js";
import { verkeerToolDefinitions } from "./tools.js";
import type { QueryParams } from "@amsterdam-mcp/core";

export { verkeerToolDefinitions };
export * from "./client.js";

export async function handleVerkeerTool(
  toolName: string,
  args: Record<string, unknown>
): Promise<unknown> {
  const p = args as QueryParams;
  switch (toolName) {
    case "ams_parkeervakken_list": return listParkeervakken(p);
    case "ams_parkeerzones_list": return listParkeerzones(p);
    case "ams_milieuzones_list": return listMilieuzones(p);
    case "ams_milieuzones2025_list": return listMilieuzones2025(p);
    case "ams_uitstootvrije_zones_list": return listUitstootVrijeZones(p);
    case "ams_wegenbestand_list": return listWegenbestand(p);
    case "ams_touringcars_list": return listTouringcars(p);
    case "ams_fietspaaltjes_list": return listFietspaaltjes(p);
    case "ams_hoofdroutes_list": return listHoofdroutes(p);
    case "ams_loopfietsnetwerk_list": return listLoopfietsnetwerk(p);
    case "ams_verkeersinformatiesystemen_list": return listVerkeersinformatiesystemen(p);
    default: throw new Error(`Onbekende verkeer tool: ${toolName}`);
  }
}
