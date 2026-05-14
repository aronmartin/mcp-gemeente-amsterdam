import {
  listBgt, listNapPeilmerken,
  listMeetbouten, getMeetbout,
  listCivieleConstructies,
  listBouwstroompunten, listObjectenOpenbareRuimte,
} from "./client.js";
import { openbareRuimteToolDefinitions } from "./tools.js";
import type { QueryParams } from "@amsterdam-mcp/core";

export { openbareRuimteToolDefinitions };
export * from "./client.js";

export async function handleOpenbareRuimteTool(
  toolName: string,
  args: Record<string, unknown>
): Promise<unknown> {
  const p = args as QueryParams;
  switch (toolName) {
    case "ams_bgt_list": return listBgt(p);
    case "ams_nap_peilmerken_list": return listNapPeilmerken(p);
    case "ams_meetbouten_list": return listMeetbouten(p);
    case "ams_meetbouten_get": return getMeetbout(args.id as string);
    case "ams_civieleconstructies_list": return listCivieleConstructies(p);
    case "ams_bouwstroompunten_list": return listBouwstroompunten(p);
    case "ams_objecten_openbare_ruimte_list": return listObjectenOpenbareRuimte(p);
    default: throw new Error(`Onbekende openbare-ruimte tool: ${toolName}`);
  }
}
