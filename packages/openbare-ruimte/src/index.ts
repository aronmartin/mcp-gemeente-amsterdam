import {
  listBgt, listNapPeilmerken,
  listMeetbouten, getMeetbout,
  listCivieleConstructies,
  listBouwstroompunten, listObjectenOpenbareRuimte,
} from "./client.js";
import { openbareRuimteToolDefinitions } from "./tools.js";
import { applyNearFilter, buildIntersectsParam, type QueryParams } from "@amsterdam-mcp/core";

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
      const { nearLat, nearLon, radiusMeters, ...rest } = args;
      const params = rest as QueryParams;
      if (nearLat !== undefined && nearLon !== undefined) {
        const radius = (radiusMeters as number) ?? 500;
        params["geometrie[intersects]"] = buildIntersectsParam(nearLat as number, nearLon as number, radius);
        const page = await listMeetbouten(params);
        return applyNearFilter(page as Parameters<typeof applyNearFilter>[0], nearLat as number, nearLon as number, radius);
      }
      return listMeetbouten(params);
    }
    case "ams_meetbouten_get": return getMeetbout(args.id as string);
    case "ams_civieleconstructies_list": {
      const { nearLat, nearLon, radiusMeters, ...rest } = args;
      const params = rest as QueryParams;
      if (nearLat !== undefined && nearLon !== undefined) {
        const radius = (radiusMeters as number) ?? 500;
        params["geometrie[intersects]"] = buildIntersectsParam(nearLat as number, nearLon as number, radius);
        const page = await listCivieleConstructies(params);
        return applyNearFilter(page as Parameters<typeof applyNearFilter>[0], nearLat as number, nearLon as number, radius);
      }
      return listCivieleConstructies(params);
    }
    case "ams_bouwstroompunten_list": return listBouwstroompunten(args as QueryParams);
    case "ams_objecten_openbare_ruimte_list": return listObjectenOpenbareRuimte(args as QueryParams);
    default: throw new Error(`Onbekende openbare-ruimte tool: ${toolName}`);
  }
}
