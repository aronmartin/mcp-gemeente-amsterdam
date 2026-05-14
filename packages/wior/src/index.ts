import { listWior, listStoringsmeldingen, listStroomstoringen } from "./client.js";
import { wiorToolDefinitions } from "./tools.js";
import { applyNearFilter, buildBboxParam, type QueryParams } from "@amsterdam-mcp/core";

export { wiorToolDefinitions };
export * from "./client.js";

export async function handleWiorTool(
  toolName: string,
  args: Record<string, unknown>
): Promise<unknown> {
  switch (toolName) {
    case "ams_wior_list": {
      const { nearLat, nearLon, radiusMeters, ...rest } = args;
      const params = rest as QueryParams;
      if (nearLat !== undefined && nearLon !== undefined) {
        const radius = (radiusMeters as number) ?? 500;
        params["geometrie[within_bbox]"] = buildBboxParam(nearLat as number, nearLon as number, radius);
        params.page_size = params.page_size ?? 1000;
        const page = await listWior(params);
        return applyNearFilter(page as Parameters<typeof applyNearFilter>[0], nearLat as number, nearLon as number, radius);
      }
      return listWior(params);
    }
    case "ams_storingsmeldingen_list": return listStoringsmeldingen(args as QueryParams);
    case "ams_stroomstoringen_list": return listStroomstoringen(args as QueryParams);
    default: throw new Error(`Onbekende wior tool: ${toolName}`);
  }
}
