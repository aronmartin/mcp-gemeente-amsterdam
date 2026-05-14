import { defaultClient, type DsoPage, type QueryParams } from "@amsterdam-mcp/core";

export type WaterObject = { id?: number; naam?: string; typeCode?: string; typeOmschrijving?: string; oppervlakte?: number; geometrie?: unknown };
export type VarenRoute = { id?: number; naam?: string; typeCode?: string; beschrijving?: string; naamVaartuig?: string; ligplaatsSegment?: string; kenmerkVergunning?: string; geometrie?: unknown };

export async function listWater(params?: QueryParams): Promise<DsoPage<WaterObject>> {
  return defaultClient.list("water", "binnenwater", params);
}
export async function listVaren(params?: QueryParams): Promise<DsoPage<VarenRoute>> {
  return defaultClient.list("varen", "ligplaats", params);
}
