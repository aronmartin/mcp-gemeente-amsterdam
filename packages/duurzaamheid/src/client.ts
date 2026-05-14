import { defaultClient, type DsoPage, type QueryParams } from "@amsterdam-mcp/core";

export type AardgasVrijeBuurt = { id?: number; buurtCode?: string; buurtNaam?: string; toelichting?: string; aandeelKookgas?: string; geometrie?: unknown };
export type DuurzaamheidRecord = { id?: number; naam?: string; typeCode?: string; typeOmschrijving?: string; geometrie?: unknown };
export type EnergieverbruikMra = { id?: number; buurtCode?: string; aantalWoningen?: number; gasVerbruik?: number; elektraVerbruik?: number; geometrie?: unknown };

export async function listAardgasVrijeZones(params?: QueryParams): Promise<DsoPage<AardgasVrijeBuurt>> {
  return defaultClient.list("aardgasvrijezones", "buurt", params);
}
export async function listDuurzaamheid(params?: QueryParams): Promise<DsoPage<DuurzaamheidRecord>> {
  return defaultClient.list("duurzaamheid", "energielabel", params);
}
export async function listEnergieverbruikMra(params?: QueryParams): Promise<DsoPage<EnergieverbruikMra>> {
  return defaultClient.list("energieverbruik_mra", "gas_en_elektriciteit_kwartaal", params);
}
