import {
  listSport, listMaatschappelijkeVoorzieningen,
  listSchoolgebouwen, listPrimairOnderwijsLoopafstanden,
} from "./client.js";
import { sportVoorzieningenToolDefinitions } from "./tools.js";
import type { QueryParams } from "@amsterdam-mcp/core";

export { sportVoorzieningenToolDefinitions };
export * from "./client.js";

export async function handleSportVoorzieningenTool(
  toolName: string,
  args: Record<string, unknown>
): Promise<unknown> {
  const p = args as QueryParams;
  switch (toolName) {
    case "ams_sport_list": return listSport(p);
    case "ams_maatschappelijke_voorzieningen_list": return listMaatschappelijkeVoorzieningen(p);
    case "ams_schoolgebouwen_list": return listSchoolgebouwen(p);
    case "ams_primair_onderwijs_loopafstanden_list": return listPrimairOnderwijsLoopafstanden(p);
    default: throw new Error(`Onbekende sport-voorzieningen tool: ${toolName}`);
  }
}
