import {
  listBgt, listNapPeilmerken,
  listMeetbouten, getMeetbout,
  listCivieleConstructies,
  listBouwstroompunten, listObjectenOpenbareRuimte,
} from "./client.js";
import { openbareRuimteToolDefinitions } from "./tools.js";
import { defaultClient, fetchNearRadius, type QueryParams } from "@amsterdam-mcp/core";

export { openbareRuimteToolDefinitions };
export * from "./client.js";

export async function handleOpenbareRuimteTool(
  toolName: string,
  args: Record<string, unknown>
): Promise<unknown> {
  switch (toolName) {
    case "ams_bgt_list": return listBgt(args as QueryParams);
    case "ams_nap_peilmerken_list": return listNapPeilmerken(args as QueryParams);
    case "ams_meetbouten_list": {
      const { nearLat, nearLon, radiusMeters, page_size, page: _page, ...rest } = args;
      if (nearLat !== undefined && nearLon !== undefined) {
        return fetchNearRadius(
          defaultClient, "meetbouten", "meetbouten", "geometrie[intersects]",
          nearLat as number, nearLon as number, (radiusMeters as number) ?? 500,
          rest as QueryParams, (page_size as number) ?? 20,
        );
      }
      return listMeetbouten(args as QueryParams);
    }
    case "ams_meetbouten_get": return getMeetbout(args.id as string);
    case "ams_civieleconstructies_list": {
      const { nearLat, nearLon, radiusMeters, page_size, page: _page, ...rest } = args;
      if (nearLat !== undefined && nearLon !== undefined) {
        return fetchNearRadius(
          defaultClient, "civieleconstructies", "kademuur", "geometrie[intersects]",
          nearLat as number, nearLon as number, (radiusMeters as number) ?? 500,
          rest as QueryParams, (page_size as number) ?? 20,
        );
      }
      return listCivieleConstructies(args as QueryParams);
    }
    case "ams_bouwstroompunten_list": return listBouwstroompunten(args as QueryParams);
    case "ams_objecten_openbare_ruimte_list": return listObjectenOpenbareRuimte(args as QueryParams);
    default: throw new Error(`Onbekende openbare-ruimte tool: ${toolName}`);
  }
}
