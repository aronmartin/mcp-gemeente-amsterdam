import { defaultClient, type DsoPage, type QueryParams } from "@amsterdam-mcp/core";

export type Parkeervak = { id?: number; eTypeCode?: string; eTypeOmschrijving?: string; bgtFunctie?: string; geometrie?: unknown };
export type Parkeerzone = { id?: number; gebiedsnaam?: string; gebiedscode?: string; uniekeCode?: string; regimeOmschrijving?: string; geometrie?: unknown };
export type Milieuzone = { id?: number; naam?: string; verkeersklasseOmschrijving?: string; geometrie?: unknown };
export type UitstootVrijeZone = { id?: number; naam?: string; geometrie?: unknown };
export type Wegenbestand = { id?: number; straatnaam?: string; wegvak?: string; rijrichting?: string; geometrie?: unknown };
export type Touringcar = { id?: number; omschrijving?: string; typeCode?: string; typeOmschrijving?: string; geometrie?: unknown };
export type Fietspaaltje = { id?: number; typeCode?: string; typeOmschrijving?: string; geometrie?: unknown };
export type VerkeersinformatieSystemeem = { id?: number; typeCode?: string; typeOmschrijving?: string; geometrie?: unknown };

export async function listParkeervakken(params?: QueryParams): Promise<DsoPage<Parkeervak>> {
  return defaultClient.list("parkeervakken", "parkeervakken", params);
}
export async function listParkeerzones(params?: QueryParams): Promise<DsoPage<Parkeerzone>> {
  return defaultClient.list("parkeerzones", "parkeerzones", params);
}
export async function listMilieuzones(params?: QueryParams): Promise<DsoPage<Milieuzone>> {
  return defaultClient.list("milieuzones", "vrachtauto", params);
}
export async function listMilieuzones2025(params?: QueryParams): Promise<DsoPage<Milieuzone>> {
  return defaultClient.list("milieuzones2025", "vracht_en_bestelauto", params);
}
export async function listUitstootVrijeZones(params?: QueryParams): Promise<DsoPage<UitstootVrijeZone>> {
  return defaultClient.list("uitstootvrije_zones", "brom_en_snorfiets", params);
}
export async function listWegenbestand(params?: QueryParams): Promise<DsoPage<Wegenbestand>> {
  return defaultClient.list("wegenbestand", "routes_gevaarlijke_stoffen", params);
}
export async function listTouringcars(params?: QueryParams): Promise<DsoPage<Touringcar>> {
  return defaultClient.list("touringcars", "haltes", params);
}
export async function listFietspaaltjes(params?: QueryParams): Promise<DsoPage<Fietspaaltje>> {
  return defaultClient.list("fietspaaltjes", "fietspaaltjes", params);
}
export async function listHoofdroutes(params?: QueryParams): Promise<DsoPage<Record<string, unknown>>> {
  return defaultClient.list("hoofdroutes", "u_routes", params);
}
export async function listLoopfietsnetwerk(params?: QueryParams): Promise<DsoPage<Record<string, unknown>>> {
  return defaultClient.list("loopfietsnetwerk", "edges", params);
}
export async function listVerkeersinformatiesystemen(params?: QueryParams): Promise<DsoPage<VerkeersinformatieSystemeem>> {
  return defaultClient.list("verkeersinformatiesystemen", "verkeersinformatiesystemen", params);
}
