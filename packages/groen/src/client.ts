import { defaultClient, type DsoPage, type QueryParams } from "@amsterdam-mcp/core";

export type Boom = {
  id?: number;
  soortnaam?: string;
  soortnaamKort?: string;
  soortnaamTop?: string;
  boomhoogteklasseActueel?: string;
  stamdiameterklasse?: string;
  plantjaar?: number;
  eigenaarschap?: string;
  typeObject?: string;
  geometrie?: unknown;
  ligtInBuurt?: { naam?: string; code?: string };
};

export type EcologieZone = {
  id?: number;
  naam?: string;
  typeNaam?: string;
  beschrijving?: string;
  categorieKerngebied?: string;
  gidssoort?: string;
  geometrie?: unknown;
};

export type ZiektePlaagExoot = {
  id?: number;
  naam?: string;
  soortnaam?: string;
  status?: string;
  geometrie?: unknown;
};

export type FunctioneelGebied = {
  id?: number;
  naam?: string;
  typeNaam?: string;
  geometrie?: unknown;
};

export async function listBomen(params?: QueryParams): Promise<DsoPage<Boom>> {
  return defaultClient.list("bomen", "stamgegevens", params);
}
export async function getBoom(id: string): Promise<Boom> {
  return defaultClient.get("bomen", "stamgegevens", id);
}
export async function listEcologie(params?: QueryParams): Promise<DsoPage<EcologieZone>> {
  return defaultClient.list("ecologie", "kerngebieden", params);
}
export async function listZiektePlagenExoten(params?: QueryParams): Promise<DsoPage<ZiektePlaagExoot>> {
  return defaultClient.list("ziekte_plagen_exoten_groen", "eikenprocessierups", params);
}
export async function listFunctioneleGebieden(params?: QueryParams): Promise<DsoPage<FunctioneelGebied>> {
  return defaultClient.list("functionele_gebieden", "groen", params);
}
