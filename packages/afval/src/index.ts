import { listAfvalcontainers, getAfvalcontainer, listAfvalwijzer, listRecyclepunten } from "./client.js";
import { afvalToolDefinitions } from "./tools.js";
import { defaultClient, fetchNearRadius, type QueryParams } from "@amsterdam-mcp/core";

export { afvalToolDefinitions };
export * from "./client.js";

export async function handleAfvalTool(
  toolName: string,
  args: Record<string, unknown>
): Promise<unknown> {
  switch (toolName) {
    case "ams_afvalcontainers_list": {
      const { nearLat, nearLon, radiusMeters, page_size, page: _page, ...rest } = args;
      if (nearLat !== undefined && nearLon !== undefined) {
        return fetchNearRadius(
          defaultClient, "huishoudelijkafval", "container", "geometrie[intersects]",
          nearLat as number, nearLon as number, (radiusMeters as number) ?? 500,
          rest as QueryParams, (page_size as number) ?? 20,
        );
      }
      return listAfvalcontainers(args as QueryParams);
    }
    case "ams_afvalcontainers_get": return getAfvalcontainer(args.id as string);
    case "ams_afvalwijzer_list": return listAfvalwijzer(args as QueryParams);
    case "ams_recyclepunten_list": return listRecyclepunten(args as QueryParams);
    default: throw new Error(`Onbekende afval tool: ${toolName}`);
  }
}
