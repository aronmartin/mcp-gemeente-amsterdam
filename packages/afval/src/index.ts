import { listAfvalcontainers, getAfvalcontainer, listAfvalwijzer, listRecyclepunten } from "./client.js";
import { afvalToolDefinitions } from "./tools.js";
import { applyNearFilter, buildBboxParam, type QueryParams } from "@amsterdam-mcp/core";

export { afvalToolDefinitions };
export * from "./client.js";

export async function handleAfvalTool(
  toolName: string,
  args: Record<string, unknown>
): Promise<unknown> {
  switch (toolName) {
    case "ams_afvalcontainers_list": {
      const { nearLat, nearLon, radiusMeters, ...rest } = args;
      const params = rest as QueryParams;
      if (nearLat !== undefined && nearLon !== undefined) {
        const radius = (radiusMeters as number) ?? 500;
        params["geometrie[within_bbox]"] = buildBboxParam(nearLat as number, nearLon as number, radius);
        params.page_size = params.page_size ?? 1000;
        const page = await listAfvalcontainers(params);
        return applyNearFilter(page as Parameters<typeof applyNearFilter>[0], nearLat as number, nearLon as number, radius);
      }
      return listAfvalcontainers(params);
    }
    case "ams_afvalcontainers_get": return getAfvalcontainer(args.id as string);
    case "ams_afvalwijzer_list": return listAfvalwijzer(args as QueryParams);
    case "ams_recyclepunten_list": return listRecyclepunten(args as QueryParams);
    default: throw new Error(`Onbekende afval tool: ${toolName}`);
  }
}
