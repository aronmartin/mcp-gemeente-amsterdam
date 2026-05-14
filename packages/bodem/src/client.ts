import { defaultClient, type DsoPage, type QueryParams } from "@amsterdam-mcp/core";

export type BodemOnderzoek = { id?: number; naam?: string; typeCode?: string; typeOmschrijving?: string; geometrie?: unknown };
export type HistorischeBodeminfo = { id?: number; naam?: string; activiteit?: string; geometrie?: unknown };
export type Explosief = { id?: number; naam?: string; typeOmschrijving?: string; nauwkeurigheid?: string; geometrie?: unknown };
export type OntplofbaareOorlogsrest = { id?: number; naam?: string; geometrie?: unknown };
export type Leiding = { id?: number; typeCode?: string; typeOmschrijving?: string; materiaalCode?: string; geometrie?: unknown };

export async function listBodemonderzoeken(params?: QueryParams): Promise<DsoPage<BodemOnderzoek>> {
  return defaultClient.list("bodem", "grond", params);
}
export async function listHistorischeBodeminfo(params?: QueryParams): Promise<DsoPage<HistorischeBodeminfo>> {
  return defaultClient.list("historische_bodeminformatie", "onderzoeken", params);
}
export async function listExplosieven(params?: QueryParams): Promise<DsoPage<Explosief>> {
  return defaultClient.list("explosieven", "verdachtgebied", params);
}
export async function listOntplofbareOorlogsresten(params?: QueryParams): Promise<DsoPage<OntplofbaareOorlogsrest>> {
  return defaultClient.list("ontplofbare_oorlogsresten", "inslagen", params);
}
export async function listLeidingen(params?: QueryParams): Promise<DsoPage<Leiding>> {
  return defaultClient.list("leidingeninfrastructuur", "waternet_rioolleidingen", params);
}
