import { defaultClient, type DsoPage, type QueryParams } from "@amsterdam-mcp/core";

export type Winkelgebied = { id?: number; naam?: string; gebiedsnaam?: string; categorienaam?: string; typeCode?: string; typeOmschrijving?: string; geometrie?: unknown };

export async function listWinkelgebieden(params?: QueryParams): Promise<DsoPage<Winkelgebied>> {
  return defaultClient.list("winkelgebieden", "winkelgebieden", params);
}
