import { defaultClient, type DsoPage, type QueryParams } from "@amsterdam-mcp/core";

export type Risicozone = { id?: number; naam?: string; typeCode?: string; typeOmschrijving?: string; naamBedrijf?: string; typeBedrijf?: string; categorieBevi?: string; stadsdeel?: string; geometrie?: unknown };
export type Geluidszone = { id?: number; naam?: string; typeCode?: string; geometrie?: unknown };
export type Overlastgebied = { id?: number; naam?: string; typeCode?: string; typeOmschrijving?: string; oovNaam?: string; oovCode?: string; type?: string; soort?: string; geometrie?: unknown };
export type VeiligheidsAfstand = { id?: number; naam?: string; typeCode?: string; geometrie?: unknown };
export type SchipholZone = { id?: number; naam?: string; typeCode?: string; hoogte?: number; geometrie?: unknown };

export async function listRisicozones(params?: QueryParams): Promise<DsoPage<Risicozone>> {
  return defaultClient.list("risicozones", "bedrijven", params);
}
export async function listGeluidszones(params?: QueryParams): Promise<DsoPage<Geluidszone>> {
  return defaultClient.list("geluidszones", "industrie", params);
}
export async function listOverlastgebieden(params?: QueryParams): Promise<DsoPage<Overlastgebied>> {
  return defaultClient.list("overlastgebieden", "algemeenoverlast", params);
}
export async function listVeiligheidsAfstanden(params?: QueryParams): Promise<DsoPage<VeiligheidsAfstand>> {
  return defaultClient.list("veiligeafstanden", "veiligeafstanden", params);
}
export async function listSchipholZones(params?: QueryParams): Promise<DsoPage<SchipholZone>> {
  return defaultClient.list("schiphol", "geluidzones", params);
}
