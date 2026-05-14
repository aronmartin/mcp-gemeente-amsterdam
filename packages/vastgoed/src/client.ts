import { defaultClient, type DsoPage, type QueryParams } from "@amsterdam-mcp/core";

export type WozObject = { id?: number; wozObjectnummer?: string; waardepeildatum?: string; vastgesteldeWaarde?: number; adres?: string; postcode?: string; geometrie?: unknown };
export type GemeentelijkVastgoed = { id?: number; naam?: string; gebruik?: string; eigendom?: string; straatnaam?: string; huisnummer?: number; adres?: string; oppervlakte?: number; geometrie?: unknown };
export type Nieuwbouwplan = { id?: number; naam?: string; fase?: string; typeCode?: string; woningaantal?: number; buurtCode?: string; buurtNaam?: string; wijkCode?: string; wijkNaam?: string; gebiedCode?: string; geometrie?: unknown };
export type Grex = { id?: number; naam?: string; planstatus?: string; geometrie?: unknown };
export type Precariobelasting = { id?: number; naam?: string; tariefCode?: string; geometrie?: unknown };

export async function listWoz(params?: QueryParams): Promise<DsoPage<WozObject>> {
  return defaultClient.list("woz", "objecten", params);
}
export async function listGemeentelijkVastgoed(params?: QueryParams): Promise<DsoPage<GemeentelijkVastgoed>> {
  return defaultClient.list("gemeentelijk_vastgoed", "gebouwobjecten", params);
}
export async function listNieuwbouwplannen(params?: QueryParams): Promise<DsoPage<Nieuwbouwplan>> {
  return defaultClient.list("nieuwbouwplannen", "woningbouwplannen_openbaar", params);
}
export async function listGrex(params?: QueryParams): Promise<DsoPage<Grex>> {
  return defaultClient.list("grex", "projecten", params);
}
export async function listPrecariobelasting(params?: QueryParams): Promise<DsoPage<Precariobelasting>> {
  return defaultClient.list("precariobelasting", "terrassen", params);
}
