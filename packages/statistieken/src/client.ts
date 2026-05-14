import { defaultClient, type DsoPage, type QueryParams } from "@amsterdam-mcp/core";

export type BbgaRecord = {
  id?: number;
  indicatorDefinitieId?: string;
  naam?: string;
  waarde?: number;
  jaar?: number;
  gebiedcode15?: string;
  gebiedCode?: string;
  gebiedNaam?: string;
};

export type StatistiekRecord = {
  id?: number;
  naam?: string;
  jaar?: number;
  waarde?: number;
  gebiedCode?: string;
};

export type Indicator = {
  id?: number;
  naam?: string;
  eenheid?: string;
  thema?: string;
  bron?: string;
  gbdBuurtNaam?: string;
  gbdBuurtCode?: string;
  gbdWijkNaam?: string;
  gbdStadsdeelNaam?: string;
  indDomeinNaam?: string;
  ruimtelijkeDimensieCode?: string;
  ruimtelijkeDimensieNaam?: string;
};

export async function listBbga(params?: QueryParams): Promise<DsoPage<BbgaRecord>> {
  return defaultClient.list("bbga", "kerncijfers", params);
}
export async function listStatistieken(params?: QueryParams): Promise<DsoPage<StatistiekRecord>> {
  return defaultClient.list("statistieken", "cijfers", params);
}
export async function listIndicatoren(params?: QueryParams): Promise<DsoPage<Indicator>> {
  return defaultClient.list("indicatoren", "buurt", params);
}
