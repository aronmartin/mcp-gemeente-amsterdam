import {
  listRisicozones, listGeluidszones,
  listOverlastgebieden, listVeiligheidsAfstanden, listSchipholZones,
} from "./client.js";
import { veiligheidToolDefinitions } from "./tools.js";
import { defaultClient, fetchNearRadius, type QueryParams } from "@amsterdam-mcp/core";

export { veiligheidToolDefinitions };
export * from "./client.js";

export async function handleVeiligheidTool(
  toolName: string,
  args: Record<string, unknown>
): Promise<unknown> {
  const p = args as QueryParams;
  switch (toolName) {
    case "ams_risicozones_list": return listRisicozones(p);
    case "ams_geluidszones_list": {
      const { nearLat, nearLon, radiusMeters, page_size, ...rest } = args;
      if (nearLat !== undefined && nearLon !== undefined) {
        return fetchNearRadius(
          defaultClient, "geluidszones", "industrie", "geometrie[intersects]",
          nearLat as number, nearLon as number, (radiusMeters as number) ?? 500,
          rest as QueryParams, (page_size as number) ?? 20,
        );
      }
      return listGeluidszones(rest as QueryParams);
    }
    case "ams_overlastgebieden_list": {
      const { nearLat, nearLon, radiusMeters, page_size, ...rest } = args;
      if (nearLat !== undefined && nearLon !== undefined) {
        return fetchNearRadius(
          defaultClient, "overlastgebieden", "algemeenoverlast", "geometrie[intersects]",
          nearLat as number, nearLon as number, (radiusMeters as number) ?? 500,
          rest as QueryParams, (page_size as number) ?? 20,
        );
      }
      return listOverlastgebieden(rest as QueryParams);
    }
    case "ams_veilige_afstanden_list": return listVeiligheidsAfstanden(p);
    case "ams_schiphol_zones_list": return listSchipholZones(p);
    default: throw new Error(`Onbekende veiligheid tool: ${toolName}`);
  }
}
