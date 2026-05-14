import { listMonumenten, getMonument, listBeschermdeStadsgezichten, listCanon } from "./client.js";
import { erfgoedToolDefinitions } from "./tools.js";
import { applyNearFilter, type QueryParams } from "@amsterdam-mcp/core";

export { erfgoedToolDefinitions };
export * from "./client.js";

export async function handleErfgoedTool(
  toolName: string,
  args: Record<string, unknown>
): Promise<unknown> {
  switch (toolName) {
    case "ams_monumenten_list": {
      const { nearLat, nearLon, radiusMeters, ...rest } = args;
      const params = rest as QueryParams;
      if (nearLat !== undefined && nearLon !== undefined) {
        const radius = (radiusMeters as number) ?? 500;
        params.page_size = params.page_size ?? 1000;
        const page = await listMonumenten(params);
        return applyNearFilter(page as Parameters<typeof applyNearFilter>[0], nearLat as number, nearLon as number, radius);
      }
      return listMonumenten(params);
    }
    case "ams_monumenten_get": return getMonument(args.id as string);
    case "ams_beschermde_stadsgezichten_list": return listBeschermdeStadsgezichten(args as QueryParams);
    case "ams_amsterdam_canon_list": return listCanon(args as QueryParams);
    default: throw new Error(`Onbekende erfgoed tool: ${toolName}`);
  }
}
