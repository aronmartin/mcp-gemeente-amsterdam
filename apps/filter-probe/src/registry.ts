import { afvalToolDefinitions } from "@amsterdam-mcp/afval";
import { bagToolDefinitions } from "@amsterdam-mcp/bag";
import { bodemToolDefinitions } from "@amsterdam-mcp/bodem";
import { duurzaamheidToolDefinitions } from "@amsterdam-mcp/duurzaamheid";
import { erfgoedToolDefinitions } from "@amsterdam-mcp/erfgoed";
import { gebiedenToolDefinitions } from "@amsterdam-mcp/gebieden";
import { groenToolDefinitions } from "@amsterdam-mcp/groen";
import { meldingenToolDefinitions } from "@amsterdam-mcp/meldingen";
import { openbareRuimteToolDefinitions } from "@amsterdam-mcp/openbare-ruimte";
import { sportVoorzieningenToolDefinitions } from "@amsterdam-mcp/sport-voorzieningen";
import { statistiekenToolDefinitions } from "@amsterdam-mcp/statistieken";
import { vastgoedToolDefinitions } from "@amsterdam-mcp/vastgoed";
import { veiligheidToolDefinitions } from "@amsterdam-mcp/veiligheid";
import { vergunningenToolDefinitions } from "@amsterdam-mcp/vergunningen";
import { verkeerToolDefinitions } from "@amsterdam-mcp/verkeer";
import { verkiezingenToolDefinitions } from "@amsterdam-mcp/verkiezingen";
import { waterToolDefinitions } from "@amsterdam-mcp/water";
import { winkelgebiedenToolDefinitions } from "@amsterdam-mcp/winkelgebieden";
import { wiorToolDefinitions } from "@amsterdam-mcp/wior";

// Params to skip: base listTool() params + client-side near-radius props (handled by applyNearFilter, never sent upstream)
const BASE_PARAMS = new Set(["page", "page_size", "_sort", "nearLat", "nearLon", "radiusMeters"]);

// Maps list tool name → upstream dataset/collection path + source file for patching
const ENDPOINT_MAP: Record<string, { dataset: string; collection: string; toolsFile: string }> = {
  // afval
  "ams_afvalcontainers_list":             { dataset: "huishoudelijkafval",                    collection: "container",                         toolsFile: "packages/afval/src/tools.ts" },
  "ams_afvalwijzer_list":                 { dataset: "afvalwijzer",                            collection: "afvalwijzer",                        toolsFile: "packages/afval/src/tools.ts" },
  "ams_recyclepunten_list":               { dataset: "recyclepunten",                           collection: "wegingen",                           toolsFile: "packages/afval/src/tools.ts" },

  // bag
  "ams_bag_list_verblijfsobjecten":       { dataset: "bag",                                    collection: "verblijfsobjecten",                  toolsFile: "packages/bag/src/tools.ts" },
  "ams_bag_list_panden":                  { dataset: "bag",                                    collection: "panden",                             toolsFile: "packages/bag/src/tools.ts" },
  "ams_bag_list_nummeraanduidingen":      { dataset: "bag",                                    collection: "nummeraanduidingen",                 toolsFile: "packages/bag/src/tools.ts" },
  "ams_bag_list_openbareruimtes":         { dataset: "bag",                                    collection: "openbareruimtes",                    toolsFile: "packages/bag/src/tools.ts" },
  "ams_bag_list_woonplaatsen":            { dataset: "bag",                                    collection: "woonplaatsen",                       toolsFile: "packages/bag/src/tools.ts" },
  "ams_bag_list_standplaatsen":           { dataset: "bag",                                    collection: "standplaatsen",                      toolsFile: "packages/bag/src/tools.ts" },
  "ams_bag_list_ligplaatsen":             { dataset: "bag",                                    collection: "ligplaatsen",                        toolsFile: "packages/bag/src/tools.ts" },

  // bodem
  "ams_bodemonderzoeken_list":            { dataset: "bodem",                                  collection: "grond",                              toolsFile: "packages/bodem/src/tools.ts" },
  "ams_historische_bodeminformatie_list": { dataset: "historische_bodeminformatie",             collection: "onderzoeken",                        toolsFile: "packages/bodem/src/tools.ts" },
  "ams_explosieven_list":                 { dataset: "explosieven",                             collection: "verdachtgebied",                     toolsFile: "packages/bodem/src/tools.ts" },
  "ams_ontplofbare_oorlogsresten_list":   { dataset: "ontplofbare_oorlogsresten",               collection: "inslagen",                           toolsFile: "packages/bodem/src/tools.ts" },
  "ams_leidingen_list":                   { dataset: "leidingeninfrastructuur",                 collection: "waternet_rioolleidingen",             toolsFile: "packages/bodem/src/tools.ts" },

  // duurzaamheid
  "ams_aardgasvrije_zones_list":          { dataset: "aardgasvrijezones",                       collection: "buurt",                              toolsFile: "packages/duurzaamheid/src/tools.ts" },
  "ams_duurzaamheid_list":               { dataset: "duurzaamheid",                            collection: "energielabel",                       toolsFile: "packages/duurzaamheid/src/tools.ts" },
  "ams_energieverbruik_mra_list":         { dataset: "energieverbruik_mra",                     collection: "gas_en_elektriciteit_kwartaal",      toolsFile: "packages/duurzaamheid/src/tools.ts" },

  // erfgoed
  "ams_monumenten_list":                  { dataset: "monumenten",                              collection: "monumenten",                         toolsFile: "packages/erfgoed/src/tools.ts" },
  "ams_beschermde_stadsgezichten_list":   { dataset: "beschermdestadsdorpsgezichten",           collection: "beschermdestadsdorpsgezichten",      toolsFile: "packages/erfgoed/src/tools.ts" },
  "ams_amsterdam_canon_list":             { dataset: "amsterdam_canon",                          collection: "canon_amsterdam_2025",               toolsFile: "packages/erfgoed/src/tools.ts" },

  // gebieden
  "ams_gebieden_list_stadsdelen":         { dataset: "gebieden",                                collection: "stadsdelen",                         toolsFile: "packages/gebieden/src/tools.ts" },
  "ams_gebieden_list_wijken":             { dataset: "gebieden",                                collection: "wijken",                             toolsFile: "packages/gebieden/src/tools.ts" },
  "ams_gebieden_list_buurten":            { dataset: "gebieden",                                collection: "buurten",                            toolsFile: "packages/gebieden/src/tools.ts" },
  "ams_gebieden_list_ggwgebieden":        { dataset: "gebieden",                                collection: "ggwgebieden",                        toolsFile: "packages/gebieden/src/tools.ts" },
  "ams_gebieden_list_grootstedelijke_gebieden": { dataset: "gebieden",                          collection: "grootstedelijke_projecten",          toolsFile: "packages/gebieden/src/tools.ts" },

  // groen
  "ams_bomen_list":                       { dataset: "bomen",                                   collection: "stamgegevens",                       toolsFile: "packages/groen/src/tools.ts" },
  "ams_ecologie_list":                    { dataset: "ecologie",                                collection: "kerngebieden",                       toolsFile: "packages/groen/src/tools.ts" },
  "ams_ziekte_plagen_exoten_list":        { dataset: "ziekte_plagen_exoten_groen",              collection: "eikenprocessierups",                 toolsFile: "packages/groen/src/tools.ts" },
  "ams_functionele_gebieden_list":        { dataset: "functionele_gebieden",                    collection: "groen",                              toolsFile: "packages/groen/src/tools.ts" },

  // meldingen
  "ams_meldingen_list":                   { dataset: "meldingen",                               collection: "meldingen",                          toolsFile: "packages/meldingen/src/tools.ts" },

  // openbare ruimte
  "ams_bgt_list":                         { dataset: "bgt",                                     collection: "wegdelen",                           toolsFile: "packages/openbare-ruimte/src/tools.ts" },
  "ams_nap_peilmerken_list":              { dataset: "nap",                                     collection: "peilmerken",                         toolsFile: "packages/openbare-ruimte/src/tools.ts" },
  "ams_meetbouten_list":                  { dataset: "meetbouten",                              collection: "meetbouten",                         toolsFile: "packages/openbare-ruimte/src/tools.ts" },
  "ams_civieleconstructies_list":         { dataset: "civieleconstructies",                     collection: "kademuur",                           toolsFile: "packages/openbare-ruimte/src/tools.ts" },
  "ams_bouwstroompunten_list":            { dataset: "bouwstroompunten",                        collection: "bouwstroompunten",                   toolsFile: "packages/openbare-ruimte/src/tools.ts" },
  "ams_objecten_openbare_ruimte_list":    { dataset: "objectenopenbareruimte",                  collection: "afvalbakken",                        toolsFile: "packages/openbare-ruimte/src/tools.ts" },

  // sport & voorzieningen
  "ams_sport_list":                               { dataset: "sport",                           collection: "openbaresportplek",                  toolsFile: "packages/sport-voorzieningen/src/tools.ts" },
  "ams_maatschappelijke_voorzieningen_list":      { dataset: "maatschappelijke_voorzieningen",  collection: "voorziening_individueel",            toolsFile: "packages/sport-voorzieningen/src/tools.ts" },
  "ams_schoolgebouwen_list":                      { dataset: "schoolgebouwen",                  collection: "accommodatie",                       toolsFile: "packages/sport-voorzieningen/src/tools.ts" },
  "ams_primair_onderwijs_loopafstanden_list":     { dataset: "primair_onderwijs_loopafstanden", collection: "afstanden",                          toolsFile: "packages/sport-voorzieningen/src/tools.ts" },

  // statistieken
  "ams_bbga_list":                        { dataset: "bbga",                                    collection: "kerncijfers",                        toolsFile: "packages/statistieken/src/tools.ts" },
  "ams_statistieken_list":                { dataset: "statistieken",                            collection: "cijfers",                            toolsFile: "packages/statistieken/src/tools.ts" },
  "ams_indicatoren_list":                 { dataset: "indicatoren",                             collection: "buurt",                              toolsFile: "packages/statistieken/src/tools.ts" },

  // vastgoed
  "ams_woz_list":                         { dataset: "woz",                                     collection: "objecten",                           toolsFile: "packages/vastgoed/src/tools.ts" },
  "ams_gemeentelijk_vastgoed_list":       { dataset: "gemeentelijk_vastgoed",                   collection: "gebouwobjecten",                     toolsFile: "packages/vastgoed/src/tools.ts" },
  "ams_nieuwbouwplannen_list":            { dataset: "nieuwbouwplannen",                        collection: "woningbouwplannen_openbaar",          toolsFile: "packages/vastgoed/src/tools.ts" },
  "ams_grex_list":                        { dataset: "grex",                                    collection: "projecten",                          toolsFile: "packages/vastgoed/src/tools.ts" },
  "ams_precariobelasting_list":           { dataset: "precariobelasting",                       collection: "terrassen",                          toolsFile: "packages/vastgoed/src/tools.ts" },

  // veiligheid
  "ams_risicozones_list":                 { dataset: "risicozones",                             collection: "bedrijven",                          toolsFile: "packages/veiligheid/src/tools.ts" },
  "ams_geluidszones_list":               { dataset: "geluidszones",                            collection: "industrie",                          toolsFile: "packages/veiligheid/src/tools.ts" },
  "ams_overlastgebieden_list":            { dataset: "overlastgebieden",                        collection: "algemeenoverlast",                   toolsFile: "packages/veiligheid/src/tools.ts" },
  "ams_veilige_afstanden_list":           { dataset: "veiligeafstanden",                        collection: "veiligeafstanden",                   toolsFile: "packages/veiligheid/src/tools.ts" },
  "ams_schiphol_zones_list":              { dataset: "schiphol",                                collection: "geluidzones",                        toolsFile: "packages/veiligheid/src/tools.ts" },

  // vergunningen
  "ams_vergunningen_list":                { dataset: "vergunningen",                            collection: "omzetting",                          toolsFile: "packages/vergunningen/src/tools.ts" },
  "ams_evenementen_list":                 { dataset: "evenementen",                             collection: "evenementen",                        toolsFile: "packages/vergunningen/src/tools.ts" },
  "ams_horeca_list":                      { dataset: "horeca",                                  collection: "exploitatievergunning",              toolsFile: "packages/vergunningen/src/tools.ts" },
  "ams_biz_list":                         { dataset: "bedrijveninvesteringszones",              collection: "gebieden",                           toolsFile: "packages/vergunningen/src/tools.ts" },

  // verkeer
  "ams_parkeervakken_list":               { dataset: "parkeervakken",                           collection: "parkeervakken",                      toolsFile: "packages/verkeer/src/tools.ts" },
  "ams_parkeerzones_list":                { dataset: "parkeerzones",                            collection: "parkeerzones",                       toolsFile: "packages/verkeer/src/tools.ts" },
  "ams_milieuzones_list":                 { dataset: "milieuzones",                             collection: "vrachtauto",                         toolsFile: "packages/verkeer/src/tools.ts" },
  "ams_milieuzones2025_list":             { dataset: "milieuzones2025",                         collection: "vracht_en_bestelauto",               toolsFile: "packages/verkeer/src/tools.ts" },
  "ams_uitstootvrije_zones_list":         { dataset: "uitstootvrije_zones",                     collection: "brom_en_snorfiets",                  toolsFile: "packages/verkeer/src/tools.ts" },
  "ams_wegenbestand_list":                { dataset: "wegenbestand",                            collection: "routes_gevaarlijke_stoffen",         toolsFile: "packages/verkeer/src/tools.ts" },
  "ams_touringcars_list":                 { dataset: "touringcars",                             collection: "haltes",                             toolsFile: "packages/verkeer/src/tools.ts" },
  "ams_fietspaaltjes_list":               { dataset: "fietspaaltjes",                           collection: "fietspaaltjes",                      toolsFile: "packages/verkeer/src/tools.ts" },
  "ams_hoofdroutes_list":                 { dataset: "hoofdroutes",                             collection: "u_routes",                           toolsFile: "packages/verkeer/src/tools.ts" },
  "ams_loopfietsnetwerk_list":            { dataset: "loopfietsnetwerk",                        collection: "edges",                              toolsFile: "packages/verkeer/src/tools.ts" },
  "ams_verkeersinformatiesystemen_list":  { dataset: "verkeersinformatiesystemen",              collection: "verkeersinformatiesystemen",          toolsFile: "packages/verkeer/src/tools.ts" },

  // verkiezingen
  "ams_verkiezingen_list":                { dataset: "verkiezingen",                            collection: "processenverbaal",                   toolsFile: "packages/verkiezingen/src/tools.ts" },

  // water
  "ams_water_list":                       { dataset: "water",                                   collection: "binnenwater",                        toolsFile: "packages/water/src/tools.ts" },
  "ams_varen_list":                       { dataset: "varen",                                   collection: "ligplaats",                          toolsFile: "packages/water/src/tools.ts" },

  // winkelgebieden
  "ams_winkelgebieden_list":              { dataset: "winkelgebieden",                          collection: "winkelgebieden",                     toolsFile: "packages/winkelgebieden/src/tools.ts" },

  // wior
  "ams_wior_list":                        { dataset: "wior",                                    collection: "wior",                               toolsFile: "packages/wior/src/tools.ts" },
  "ams_storingsmeldingen_list":           { dataset: "storingsmeldingen_ovl_en_klokken",        collection: "openbare_verlichting",               toolsFile: "packages/wior/src/tools.ts" },
  "ams_stroomstoringen_list":             { dataset: "stroomstoringen",                         collection: "stroomstoringen",                    toolsFile: "packages/wior/src/tools.ts" },
};

export type FilterEntry = {
  toolName: string;
  dataset: string;
  collection: string;
  toolsFile: string;
  param: string;
  paramType: string;
};

export function buildRegistry(): FilterEntry[] {
  const allDefs = [
    ...afvalToolDefinitions,
    ...bagToolDefinitions,
    ...bodemToolDefinitions,
    ...duurzaamheidToolDefinitions,
    ...erfgoedToolDefinitions,
    ...gebiedenToolDefinitions,
    ...groenToolDefinitions,
    ...meldingenToolDefinitions,
    ...openbareRuimteToolDefinitions,
    ...sportVoorzieningenToolDefinitions,
    ...statistiekenToolDefinitions,
    ...vastgoedToolDefinitions,
    ...veiligheidToolDefinitions,
    ...vergunningenToolDefinitions,
    ...verkeerToolDefinitions,
    ...verkiezingenToolDefinitions,
    ...waterToolDefinitions,
    ...winkelgebiedenToolDefinitions,
    ...wiorToolDefinitions,
  ];

  const entries: FilterEntry[] = [];

  for (const def of allDefs) {
    const ep = ENDPOINT_MAP[def.name];
    if (!ep) continue; // get-tools en analyse-tools overslaan
    for (const [param, schema] of Object.entries(def.parameters.properties)) {
      if (BASE_PARAMS.has(param)) continue;
      entries.push({
        toolName: def.name,
        dataset: ep.dataset,
        collection: ep.collection,
        toolsFile: ep.toolsFile,
        param,
        paramType: schema.type,
      });
    }
  }

  return entries;
}
