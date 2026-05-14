import { listMonumenten, getMonument, listBeschermdeStadsgezichten, listCanon } from "./client.js";
import { erfgoedToolDefinitions } from "./tools.js";
import { defaultClient, fetchNearRadius, type QueryParams } from "@amsterdam-mcp/core";

export { erfgoedToolDefinitions };
export * from "./client.js";

export async function handleErfgoedTool(
  toolName: string,
  args: Record<string, unknown>
): Promise<unknown> {
  switch (toolName) {
    case "ams_monumenten_list": {
      const { nearLat, nearLon, radiusMeters, page_size, page: _page, bagPandId, ...rest } = args;
      // Translate bagPandId alias to upstream field name
      if (bagPandId) rest["betreftBagPand.identificatie"] = bagPandId;
      if (nearLat !== undefined && nearLon !== undefined) {
        return fetchNearRadius(
          defaultClient, "monumenten", "monumenten", "geometrie[intersects]",
          nearLat as number, nearLon as number, (radiusMeters as number) ?? 500,
          rest as QueryParams, (page_size as number) ?? 20,
        );
      }
      return listMonumenten(rest as QueryParams);
    }
    case "ams_monumenten_get": return getMonument(args.id as string);
    case "ams_beschermde_stadsgezichten_list": {
      const { nearLat, nearLon, radiusMeters, page_size, ...rest } = args;
      if (nearLat !== undefined && nearLon !== undefined) {
        return fetchNearRadius(
          defaultClient, "beschermdestadsdorpsgezichten", "beschermdestadsdorpsgezichten", "geometrie[intersects]",
          nearLat as number, nearLon as number, (radiusMeters as number) ?? 500,
          rest as QueryParams, (page_size as number) ?? 20,
        );
      }
      return listBeschermdeStadsgezichten(args as QueryParams);
    }
    case "ams_amsterdam_canon_list": return listCanon(args as QueryParams);
    default: throw new Error(`Onbekende erfgoed tool: ${toolName}`);
  }
}
