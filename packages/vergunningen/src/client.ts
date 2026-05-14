import { defaultClient, type DsoPage, type QueryParams } from "@amsterdam-mcp/core";

export type Vergunning = {
  id?: number;
  kenmerk?: string;
  datumAanvraag?: string;
  datumAfhandeling?: string;
  statusCode?: string;
  statusOmschrijving?: string;
  typeCode?: string;
  typeOmschrijving?: string;
  wijkNaam?: string;
  categorieKleur?: string;
  adres?: string;
  geometrie?: unknown;
};

export type Evenement = {
  id?: number;
  naam?: string;
  titel?: string;
  datumBegin?: string;
  startdatum?: string;
  datumEinde?: string;
  typeCode?: string;
  typeOmschrijving?: string;
  locatie?: string;
  geometrie?: unknown;
};

export type HorecaInrichting = {
  id?: number;
  naam?: string;
  zaaknaam?: string;
  adres?: string;
  postcode?: string;
  typeCode?: string;
  typeOmschrijving?: string;
  geometrie?: unknown;
};

export type BedrijvenInvesteringsZone = {
  id?: number;
  naam?: string;
  statusCode?: string;
  geometrie?: unknown;
};

export async function listVergunningen(params?: QueryParams): Promise<DsoPage<Vergunning>> {
  return defaultClient.list("vergunningen", "omzetting", params);
}
export async function listEvenementen(params?: QueryParams): Promise<DsoPage<Evenement>> {
  return defaultClient.list("evenementen", "evenementen", params);
}
export async function listHoreca(params?: QueryParams): Promise<DsoPage<HorecaInrichting>> {
  return defaultClient.list("horeca", "exploitatievergunning", params);
}
export async function listBedrijvenInvesteringsZones(params?: QueryParams): Promise<DsoPage<BedrijvenInvesteringsZone>> {
  return defaultClient.list("bedrijveninvesteringszones", "gebieden", params);
}
