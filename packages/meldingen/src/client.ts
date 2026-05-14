import { defaultClient, type DsoPage, type QueryParams } from "@amsterdam-mcp/core";

export type Melding = {
  id?: string;
  hoofdcategorie?: string;
  subcategorie?: string;
  thema?: string;
  externeStatus?: string;
  meldingType?: string;
  meldingSoort?: string;
  datumMelding?: string;
  tijdstipMelding?: string;
  gbdBuurtCode?: string;
  gbdBuurtNaam?: string;
  gbdBuurtId?: string;
  gbdWijkCode?: string;
  gbdWijkNaam?: string;
  gbdStadsdeelCode?: string;
  gbdStadsdeelNaam?: string;
  latitudeVisualisatie?: number;
  longitudeVisualisatie?: number;
  geometrie?: unknown;
};

export async function listMeldingen(params?: QueryParams): Promise<DsoPage<Melding>> {
  return defaultClient.list("meldingen", "meldingen", params);
}
