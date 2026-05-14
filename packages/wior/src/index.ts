import { listWior, listStoringsmeldingen, listStroomstoringen } from "./client.js";
import { wiorToolDefinitions } from "./tools.js";
import { defaultClient, fetchNearRadius, type QueryParams } from "@amsterdam-mcp/core";

export { wiorToolDefinitions };
export * from "./client.js";

export async function handleWiorTool(
  toolName: string,
  args: Record<string, unknown>
): Promise<unknown> {
  switch (toolName) {
    case "ams_wior_list": {
      const { nearLat, nearLon, radiusMeters, page_size, page: _page, ...rest } = args;
      if (nearLat !== undefined && nearLon !== undefined) {
        return fetchNearRadius(
          defaultClient, "wior", "wior", "geometrie[intersects]",
          nearLat as number, nearLon as number, (radiusMeters as number) ?? 500,
          rest as QueryParams, (page_size as number) ?? 20,
        );
      }
      return listWior(args as QueryParams);
    }
    case "ams_storingsmeldingen_list": return listStoringsmeldingen(args as QueryParams);
    case "ams_stroomstoringen_list": return listStroomstoringen(args as QueryParams);
    default: throw new Error(`Onbekende wior tool: ${toolName}`);
  }
}
