import { defaultClient, type DsoPage, type QueryParams } from "@amsterdam-mcp/core";

export type WiorProject = {
  id?: number;
  naam?: string;
  statusCode?: string;
  statusOmschrijving?: string;
  typeCode?: string;
  typeOmschrijving?: string;
  datumBegin?: string;
  datumEinde?: string;
  geometrie?: unknown;
};

export type StoringsMelding = {
  id?: number;
  typeCode?: string;
  typeOmschrijving?: string;
  statusCode?: string;
  meldingDatum?: string;
  geometrie?: unknown;
};

export type Stroomstoring = {
  id?: number;
  gebiedsOmschrijving?: string;
  datumBegin?: string;
  datumEinde?: string;
  aantalAansluitingen?: number;
  geometrie?: unknown;
};

export async function listWior(params?: QueryParams): Promise<DsoPage<WiorProject>> {
  return defaultClient.list("wior", "wior", params);
}
export async function listStoringsmeldingen(params?: QueryParams): Promise<DsoPage<StoringsMelding>> {
  return defaultClient.list("storingsmeldingen_ovl_en_klokken", "openbare_verlichting", params);
}
export async function listStroomstoringen(params?: QueryParams): Promise<DsoPage<Stroomstoring>> {
  return defaultClient.list("stroomstoringen", "stroomstoringen", params);
}
