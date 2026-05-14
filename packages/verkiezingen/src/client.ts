import { defaultClient, type DsoPage, type QueryParams } from "@amsterdam-mcp/core";

export type Verkiezing = {
  id?: number;
  naam?: string;
  datum?: string;
  typeCode?: string;
  adres?: string;
  postcode?: string;
  geometrie?: unknown;
};

export async function listVerkiezingen(params?: QueryParams): Promise<DsoPage<Verkiezing>> {
  return defaultClient.list("verkiezingen", "processenverbaal", params);
}
