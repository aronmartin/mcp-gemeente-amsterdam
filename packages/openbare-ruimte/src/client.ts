import { defaultClient, type DsoPage, type QueryParams } from "@amsterdam-mcp/core";

export type BgtObject = { id?: number; typeCode?: string; typeOmschrijving?: string; bgtFunctie?: string; plusFunctie?: string; bgtFysiekVoorkomen?: string; geometrie?: unknown };
export type NapPeilmerk = { id?: number; merk?: string; hoogte?: number; type?: string; geometrie?: unknown };
export type Meetbout = { identificatie?: string; boutnummer?: string; statusCode?: string; hoogte?: number; geometrie?: unknown };
export type CivieleConstructie = { id?: number; typeCode?: string; typeOmschrijving?: string; naam?: string; beheerder?: string; eigenaar?: string; materiaal?: string; geometrie?: unknown };
export type Bouwstroompunt = { id?: number; naam?: string; aansluitingType?: string; geometrie?: unknown };
export type ObjectOpenbareRuimte = { id?: number; typeCode?: string; typeOmschrijving?: string; geometrie?: unknown };

export async function listBgt(params?: QueryParams): Promise<DsoPage<BgtObject>> {
  return defaultClient.list("bgt", "wegdelen", params);
}
export async function listNapPeilmerken(params?: QueryParams): Promise<DsoPage<NapPeilmerk>> {
  return defaultClient.list("nap", "peilmerken", params);
}
export async function listMeetbouten(params?: QueryParams): Promise<DsoPage<Meetbout>> {
  return defaultClient.list("meetbouten", "meetbouten", params);
}
export async function getMeetbout(id: string): Promise<Meetbout> {
  return defaultClient.get("meetbouten", "meetbouten", id);
}
export async function listCivieleConstructies(params?: QueryParams): Promise<DsoPage<CivieleConstructie>> {
  return defaultClient.list("civieleconstructies", "kademuur", params);
}
export async function listBouwstroompunten(params?: QueryParams): Promise<DsoPage<Bouwstroompunt>> {
  return defaultClient.list("bouwstroompunten", "bouwstroompunten", params);
}
export async function listObjectenOpenbareRuimte(params?: QueryParams): Promise<DsoPage<ObjectOpenbareRuimte>> {
  return defaultClient.list("objectenopenbareruimte", "afvalbakken", params);
}
