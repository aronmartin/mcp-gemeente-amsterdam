import {
  listPanden, getPand,
  listVerblijfsobjecten, getVerblijfsobject,
  listNummeraanduidingen,
  listOpenbareruimtes, getOpenbareruimte,
  listWoonplaatsen,
  listStandplaatsen,
  listLigplaatsen,
} from "./client.js";
import { bagToolDefinitions } from "./tools.js";
import type { QueryParams } from "@amsterdam-mcp/core";

export { bagToolDefinitions };
export * from "./client.js";

export async function handleBagTool(
  toolName: string,
  args: Record<string, unknown>
): Promise<unknown> {
  const p = args as QueryParams;
  switch (toolName) {
    case "ams_bag_list_verblijfsobjecten": return listVerblijfsobjecten(p);
    case "ams_bag_get_verblijfsobject": return getVerblijfsobject(args.identificatie as string);
    case "ams_bag_list_panden": return listPanden(p);
    case "ams_bag_get_pand": return getPand(args.identificatie as string);
    case "ams_bag_list_nummeraanduidingen": return listNummeraanduidingen(p);
    case "ams_bag_list_openbareruimtes": return listOpenbareruimtes(p);
    case "ams_bag_get_openbareruimte": return getOpenbareruimte(args.identificatie as string);
    case "ams_bag_list_woonplaatsen": return listWoonplaatsen(p);
    case "ams_bag_list_standplaatsen": return listStandplaatsen(p);
    case "ams_bag_list_ligplaatsen": return listLigplaatsen(p);
    default: throw new Error(`Onbekende bag tool: ${toolName}`);
  }
}
