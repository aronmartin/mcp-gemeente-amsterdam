import { defaultClient, type DsoPage, type QueryParams } from "@amsterdam-mcp/core";

const DS = "gebieden";

export type Stadsdeel = { identificatie: string; naam: string; code: string; geometrie?: unknown };
export type Wijk = { identificatie: string; naam: string; code: string; ligtInStadsdeel?: { naam?: string; code?: string }; geometrie?: unknown };
export type Buurt = { identificatie: string; naam: string; code: string; ligtInWijk?: { naam?: string; code?: string }; geometrie?: unknown };
export type GgwGebied = { identificatie: string; naam: string; code: string; geometrie?: unknown };
export type GrootstedelijkGebied = { identificatie: string; naam: string; geometrie?: unknown };

export async function listStadsdelen(params?: QueryParams): Promise<DsoPage<Stadsdeel>> {
  return defaultClient.list(DS, "stadsdelen", params);
}
export async function getStadsdeel(id: string): Promise<Stadsdeel> {
  return defaultClient.get(DS, "stadsdelen", id);
}
export async function listWijken(params?: QueryParams): Promise<DsoPage<Wijk>> {
  return defaultClient.list(DS, "wijken", params);
}
export async function getWijk(id: string): Promise<Wijk> {
  return defaultClient.get(DS, "wijken", id);
}
export async function listBuurten(params?: QueryParams): Promise<DsoPage<Buurt>> {
  return defaultClient.list(DS, "buurten", params);
}
export async function getBuurt(id: string): Promise<Buurt> {
  return defaultClient.get(DS, "buurten", id);
}
export async function listGgwGebieden(params?: QueryParams): Promise<DsoPage<GgwGebied>> {
  return defaultClient.list(DS, "ggwgebieden", params);
}
export async function listGrootstedelijkeGebieden(params?: QueryParams): Promise<DsoPage<GrootstedelijkGebied>> {
  return defaultClient.list(DS, "grootstedelijke_projecten", params);
}
