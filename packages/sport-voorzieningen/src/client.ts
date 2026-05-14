import { defaultClient, type DsoPage, type QueryParams } from "@amsterdam-mcp/core";

export type SportVoorziening = { id?: number; naam?: string; typeCode?: string; typeOmschrijving?: string; sportvoorziening?: string; soortLocatie?: string; soortOndergrond?: string; adres?: string; postcode?: string; geometrie?: unknown };
export type MaatschappelijkeVoorziening = { id?: number; naam?: string; typeCode?: string; typeOmschrijving?: string; adres?: string; geometrie?: unknown };
export type Schoolgebouw = { id?: number; naam?: string; adres?: string; postcode?: string; brinnummer?: string; geometrie?: unknown };
export type PrimairOnderwijsLoopafstand = { id?: number; schoolnaam?: string; afstand?: number; geometrie?: unknown };

export async function listSport(params?: QueryParams): Promise<DsoPage<SportVoorziening>> {
  return defaultClient.list("sport", "openbaresportplek", params);
}
export async function listMaatschappelijkeVoorzieningen(params?: QueryParams): Promise<DsoPage<MaatschappelijkeVoorziening>> {
  return defaultClient.list("maatschappelijke_voorzieningen", "voorziening_individueel", params);
}
export async function listSchoolgebouwen(params?: QueryParams): Promise<DsoPage<Schoolgebouw>> {
  return defaultClient.list("schoolgebouwen", "accommodatie", params);
}
export async function listPrimairOnderwijsLoopafstanden(params?: QueryParams): Promise<DsoPage<PrimairOnderwijsLoopafstand>> {
  return defaultClient.list("primair_onderwijs_loopafstanden", "afstanden", params);
}
