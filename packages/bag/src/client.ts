import { defaultClient, type DsoPage, type QueryParams } from "@amsterdam-mcp/core";

const DS = "bag";

export type BagPand = {
  identificatie: string;
  bouwjaar?: number;
  oorspronkelijkBouwjaar?: number;
  statusCode: string;
  statusOmschrijving?: string;
  geometrie?: unknown;
  heeftVerblijfsobjecten?: unknown[];
};

export type BagVerblijfsobject = {
  identificatie: string;
  gebruiksdoel: string[];
  oppervlakte?: number;
  statusCode: string;
  heeftHoofdadres?: { postcode?: string; huisnummer?: number; huisletter?: string; huisnummertoevoeging?: string; ligtAanOpenbareruimte?: { naam?: string } };
  ligtInPand?: { identificatie?: string; bouwjaar?: number };
  ligtInBuurt?: { naam?: string; code?: string };
};

export type BagNummeraanduiding = {
  identificatie: string;
  huisnummer: number;
  huisletter?: string;
  huisnummertoevoeging?: string;
  postcode: string;
  typeAdres: string;
  statusCode: string;
  ligtAanOpenbareruimte?: { naam?: string; identificatie?: string };
  ligtInWoonplaats?: { naam?: string };
};

export type BagOpenbareruimte = {
  identificatie: string;
  naam: string;
  naamNen?: string;
  typeOmschrijving?: string;
  statusCode?: string;
  ligtInWoonplaats?: { naam?: string };
};

export type BagWoonplaats = {
  identificatie: string;
  naam: string;
  statusCode?: string;
};

export type BagStandplaats = {
  identificatie: string;
  statusCode: string;
  heeftHoofdadres?: unknown;
  geometrie?: unknown;
};

export type BagLigplaats = {
  identificatie: string;
  statusCode: string;
  heeftHoofdadres?: unknown;
  geometrie?: unknown;
};

export async function listPanden(params?: QueryParams): Promise<DsoPage<BagPand>> {
  return defaultClient.list(DS, "panden", params);
}

export async function getPand(id: string): Promise<BagPand> {
  return defaultClient.get(DS, "panden", id);
}

export async function listVerblijfsobjecten(params?: QueryParams): Promise<DsoPage<BagVerblijfsobject>> {
  return defaultClient.list(DS, "verblijfsobjecten", params);
}

export async function getVerblijfsobject(id: string): Promise<BagVerblijfsobject> {
  return defaultClient.get(DS, "verblijfsobjecten", id);
}

export async function listNummeraanduidingen(params?: QueryParams): Promise<DsoPage<BagNummeraanduiding>> {
  return defaultClient.list(DS, "nummeraanduidingen", params);
}

export async function listOpenbareruimtes(params?: QueryParams): Promise<DsoPage<BagOpenbareruimte>> {
  return defaultClient.list(DS, "openbareruimtes", params);
}

export async function getOpenbareruimte(id: string): Promise<BagOpenbareruimte> {
  return defaultClient.get(DS, "openbareruimtes", id);
}

export async function listWoonplaatsen(params?: QueryParams): Promise<DsoPage<BagWoonplaats>> {
  return defaultClient.list(DS, "woonplaatsen", params);
}

export async function listStandplaatsen(params?: QueryParams): Promise<DsoPage<BagStandplaats>> {
  return defaultClient.list(DS, "standplaatsen", params);
}

export async function listLigplaatsen(params?: QueryParams): Promise<DsoPage<BagLigplaats>> {
  return defaultClient.list(DS, "ligplaatsen", params);
}
