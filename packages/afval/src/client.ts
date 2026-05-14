import { defaultClient, type DsoPage, type QueryParams } from "@amsterdam-mcp/core";

export type Afvalcontainer = {
  id?: number;
  idNummer?: string;
  serienummer?: string;
  eigenaarschapCode?: string;
  eigenaarschapOmschrijving?: string;
  containerKleur?: string;
  afvalwegingcode?: string;
  afvalwegingOmschrijving?: string;
  typeCode?: string;
  typeOmschrijving?: string;
  geometrie?: unknown;
  ligtInBuurt?: { naam?: string; code?: string };
};

export type AfvalwijzerFractie = {
  id?: number;
  naam?: string;
  ophaaldag?: string;
  opmerking?: string;
  afvalwijzerInstructie2?: string;
};

export type Recyclepunt = {
  id?: number;
  naam?: string;
  adres?: string;
  postcode?: string;
  geometrie?: unknown;
};

export async function listAfvalcontainers(params?: QueryParams): Promise<DsoPage<Afvalcontainer>> {
  return defaultClient.list("huishoudelijkafval", "container", params);
}
export async function getAfvalcontainer(id: string): Promise<Afvalcontainer> {
  return defaultClient.get("huishoudelijkafval", "container", id);
}
export async function listAfvalwijzer(params?: QueryParams): Promise<DsoPage<AfvalwijzerFractie>> {
  return defaultClient.list("afvalwijzer", "afvalwijzer", params);
}
export async function listRecyclepunten(params?: QueryParams): Promise<DsoPage<Recyclepunt>> {
  return defaultClient.list("recyclepunten", "wegingen", params);
}
