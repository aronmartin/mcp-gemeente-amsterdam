import { defaultClient, type DsoPage, type QueryParams } from "@amsterdam-mcp/core";

export type Monument = {
  identificatie?: string;
  monumentnummer?: number;
  naam?: string;
  statusCode?: string;
  statusOmschrijving?: string;
  monumentTypeCode?: string;
  monumentTypeOmschrijving?: string;
  bouwjaar?: number;
  oorspronkelijkeFunctie?: string;
  opdrachtgevernaam?: string;
  geometrie?: unknown;
  ligtInBuurt?: { naam?: string };
};

export type BeschermdeStadsgezicht = {
  id?: number;
  naam?: string;
  statusCode?: string;
  geometrie?: unknown;
};

export type CanonItem = {
  id?: number;
  naam?: string;
  jaar?: string;
  omschrijving?: string;
  geometrie?: unknown;
};

export async function listMonumenten(params?: QueryParams): Promise<DsoPage<Monument>> {
  return defaultClient.list("monumenten", "monumenten", params);
}
export async function getMonument(id: string): Promise<Monument> {
  return defaultClient.get("monumenten", "monumenten", id);
}
export async function listBeschermdeStadsgezichten(params?: QueryParams): Promise<DsoPage<BeschermdeStadsgezicht>> {
  return defaultClient.list("beschermdestadsdorpsgezichten", "beschermdestadsdorpsgezichten", params);
}
export async function listCanon(params?: QueryParams): Promise<DsoPage<CanonItem>> {
  return defaultClient.list("amsterdam_canon", "canon_amsterdam_2025", params);
}
