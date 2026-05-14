import type { DsoPage } from "@amsterdam-mcp/core";
import { defaultClient, fetchNearRadius } from "@amsterdam-mcp/core";

import { listPanden, getPand, listVerblijfsobjecten, getVerblijfsobject, listNummeraanduidingen, listOpenbareruimtes, getOpenbareruimte, listWoonplaatsen, listStandplaatsen, listLigplaatsen } from "@amsterdam-mcp/bag";
import { listAfvalcontainers, getAfvalcontainer, listAfvalwijzer, listRecyclepunten } from "@amsterdam-mcp/afval";
import { listBodemonderzoeken, listHistorischeBodeminfo, listExplosieven, listOntplofbareOorlogsresten, listLeidingen } from "@amsterdam-mcp/bodem";
import { listAardgasVrijeZones, listDuurzaamheid, listEnergieverbruikMra } from "@amsterdam-mcp/duurzaamheid";
import { listMonumenten, getMonument, listBeschermdeStadsgezichten, listCanon } from "@amsterdam-mcp/erfgoed";
import { listStadsdelen, getStadsdeel, listWijken, getWijk, listBuurten, getBuurt, listGgwGebieden, listGrootstedelijkeGebieden } from "@amsterdam-mcp/gebieden";
import { listBomen, getBoom, listEcologie, listZiektePlagenExoten, listFunctioneleGebieden } from "@amsterdam-mcp/groen";
import { listMeldingen } from "@amsterdam-mcp/meldingen";
import { listBgt, listNapPeilmerken, listMeetbouten, getMeetbout, listCivieleConstructies, listBouwstroompunten, listObjectenOpenbareRuimte } from "@amsterdam-mcp/openbare-ruimte";
import { listSport, listMaatschappelijkeVoorzieningen, listSchoolgebouwen, listPrimairOnderwijsLoopafstanden } from "@amsterdam-mcp/sport-voorzieningen";
import { listBbga, listStatistieken, listIndicatoren } from "@amsterdam-mcp/statistieken";
import { listWoz, listGemeentelijkVastgoed, listNieuwbouwplannen, listGrex, listPrecariobelasting } from "@amsterdam-mcp/vastgoed";
import { listRisicozones, listGeluidszones, listOverlastgebieden, listVeiligheidsAfstanden, listSchipholZones } from "@amsterdam-mcp/veiligheid";
import { listVergunningen, listEvenementen, listHoreca, listBedrijvenInvesteringsZones } from "@amsterdam-mcp/vergunningen";
import { listParkeervakken, listParkeerzones, listMilieuzones, listMilieuzones2025, listUitstootVrijeZones, listWegenbestand, listTouringcars, listFietspaaltjes, listHoofdroutes, listLoopfietsnetwerk, listVerkeersinformatiesystemen } from "@amsterdam-mcp/verkeer";
import { listVerkiezingen } from "@amsterdam-mcp/verkiezingen";
import { listWater, listVaren } from "@amsterdam-mcp/water";
import { listWinkelgebieden } from "@amsterdam-mcp/winkelgebieden";
import { listWior, listStoringsmeldingen, listStroomstoringen } from "@amsterdam-mcp/wior";

const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const DIM = "\x1b[2m";
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";

type TestResult = { name: string; ok: boolean; ms: number; error?: string };

async function check(name: string, fn: () => Promise<unknown>): Promise<TestResult> {
  const start = Date.now();
  try {
    const data = await fn();
    if (!data || typeof data !== "object") throw new Error("Leeg of ongeldig response");
    return { name, ok: true, ms: Date.now() - start };
  } catch (e) {
    return { name, ok: false, ms: Date.now() - start, error: String(e) };
  }
}

async function firstId<T extends Record<string, unknown>>(
  fn: (p: { page_size: number }) => Promise<DsoPage<T>>,
  field: keyof T
): Promise<string | null> {
  try {
    const page = await fn({ page_size: 1 });
    const items = Object.values(page._embedded)[0] as T[] | undefined;
    const first = items?.[0];
    if (!first || !(field in first)) return null;
    return String(first[field]);
  } catch {
    return null;
  }
}

const tests: Array<() => Promise<TestResult>> = [
  // BAG
  () => check("bag / panden (list)",               () => listPanden({ page_size: 1 })),
  () => check("bag / panden (get)",                async () => { const id = await firstId(listPanden, "identificatie"); if (!id) throw new Error("geen panden"); return getPand(id); }),
  () => check("bag / verblijfsobjecten (list)",    () => listVerblijfsobjecten({ page_size: 1 })),
  () => check("bag / verblijfsobjecten (get)",     async () => { const id = await firstId(listVerblijfsobjecten, "identificatie"); if (!id) throw new Error("geen verblijfsobjecten"); return getVerblijfsobject(id); }),
  () => check("bag / nummeraanduidingen (list)",   () => listNummeraanduidingen({ page_size: 1 })),
  () => check("bag / openbareruimtes (list)",      () => listOpenbareruimtes({ page_size: 1 })),
  () => check("bag / openbareruimtes (get)",       async () => { const id = await firstId(listOpenbareruimtes, "identificatie"); if (!id) throw new Error("geen openbareruimtes"); return getOpenbareruimte(id); }),
  () => check("bag / woonplaatsen (list)",         () => listWoonplaatsen({ page_size: 1 })),
  () => check("bag / standplaatsen (list)",        () => listStandplaatsen({ page_size: 1 })),
  () => check("bag / ligplaatsen (list)",          () => listLigplaatsen({ page_size: 1 })),

  // Afval
  () => check("afval / containers (list)",         () => listAfvalcontainers({ page_size: 1 })),
  () => check("afval / containers (get)",          async () => { const id = await firstId(listAfvalcontainers, "id"); if (!id) throw new Error("geen containers"); return getAfvalcontainer(id); }),
  () => check("afval / afvalwijzer (list)",        () => listAfvalwijzer({ page_size: 1 })),
  () => check("afval / recyclepunten (list)",      () => listRecyclepunten({ page_size: 1 })),

  // Bodem
  () => check("bodem / onderzoeken (list)",        () => listBodemonderzoeken({ page_size: 1 })),
  () => check("bodem / historisch (list)",         () => listHistorischeBodeminfo({ page_size: 1 })),
  () => check("bodem / explosieven (list)",        () => listExplosieven({ page_size: 1 })),
  () => check("bodem / oorlogsresten (list)",      () => listOntplofbareOorlogsresten({ page_size: 1 })),
  () => check("bodem / leidingen (list)",          () => listLeidingen({ page_size: 1 })),

  // Duurzaamheid
  () => check("duurzaamheid / aardgasvrij (list)", () => listAardgasVrijeZones({ page_size: 1 })),
  () => check("duurzaamheid / duurzaamheid (list)",() => listDuurzaamheid({ page_size: 1 })),
  () => check("duurzaamheid / energieverbruik (list)", () => listEnergieverbruikMra({ page_size: 1 })),

  // Erfgoed
  () => check("erfgoed / monumenten (list)",       () => listMonumenten({ page_size: 1 })),
  () => check("erfgoed / monumenten (get)",        async () => { const id = await firstId(listMonumenten, "identificatie"); if (!id) throw new Error("geen monumenten"); return getMonument(id); }),
  () => check("erfgoed / stadsgezichten (list)",   () => listBeschermdeStadsgezichten({ page_size: 1 })),
  () => check("erfgoed / canon (list)",            () => listCanon({ page_size: 1 })),

  // Gebieden
  () => check("gebieden / stadsdelen (list)",      () => listStadsdelen({ page_size: 1 })),
  () => check("gebieden / stadsdelen (get)",       async () => { const id = await firstId(listStadsdelen, "identificatie"); if (!id) throw new Error("geen stadsdelen"); return getStadsdeel(id); }),
  () => check("gebieden / wijken (list)",          () => listWijken({ page_size: 1 })),
  () => check("gebieden / wijken (get)",           async () => { const id = await firstId(listWijken, "identificatie"); if (!id) throw new Error("geen wijken"); return getWijk(id); }),
  () => check("gebieden / buurten (list)",         () => listBuurten({ page_size: 1 })),
  () => check("gebieden / buurten (get)",          async () => { const id = await firstId(listBuurten, "identificatie"); if (!id) throw new Error("geen buurten"); return getBuurt(id); }),
  () => check("gebieden / ggwgebieden (list)",     () => listGgwGebieden({ page_size: 1 })),
  () => check("gebieden / grootstedelijk (list)",  () => listGrootstedelijkeGebieden({ page_size: 1 })),

  // Groen
  () => check("groen / bomen (list)",              () => listBomen({ page_size: 1 })),
  () => check("groen / bomen (get)",               async () => { const id = await firstId(listBomen, "id"); if (!id) throw new Error("geen bomen"); return getBoom(id); }),
  () => check("groen / ecologie (list)",           () => listEcologie({ page_size: 1 })),
  () => check("groen / ziekten plagen (list)",     () => listZiektePlagenExoten({ page_size: 1 })),
  () => check("groen / functionele gebieden (list)", () => listFunctioneleGebieden({ page_size: 1 })),

  // Meldingen
  () => check("meldingen / meldingen (list)",      () => listMeldingen({ page_size: 1 })),

  // Openbare ruimte
  () => check("openbare-ruimte / bgt (list)",            () => listBgt({ page_size: 1 })),
  () => check("openbare-ruimte / nap peilmerken (list)", () => listNapPeilmerken({ page_size: 1 })),
  () => check("openbare-ruimte / meetbouten (list)",     () => listMeetbouten({ page_size: 1 })),
  () => check("openbare-ruimte / meetbouten (get)",      async () => { const id = await firstId(listMeetbouten, "identificatie"); if (!id) throw new Error("geen meetbouten"); return getMeetbout(id); }),
  () => check("openbare-ruimte / civieleconstructies (list)", () => listCivieleConstructies({ page_size: 1 })),
  () => check("openbare-ruimte / bouwstroompunten (list)", () => listBouwstroompunten({ page_size: 1 })),
  () => check("openbare-ruimte / objecten (list)",       () => listObjectenOpenbareRuimte({ page_size: 1 })),

  // Sport & voorzieningen
  () => check("sport / sport (list)",                    () => listSport({ page_size: 1 })),
  () => check("sport / maatschappelijk (list)",          () => listMaatschappelijkeVoorzieningen({ page_size: 1 })),
  () => check("sport / schoolgebouwen (list)",           () => listSchoolgebouwen({ page_size: 1 })),
  () => check("sport / loopafstanden (list)",            () => listPrimairOnderwijsLoopafstanden({ page_size: 1 })),

  // Statistieken
  () => check("statistieken / bbga (list)",              () => listBbga({ page_size: 1 })),
  () => check("statistieken / statistieken (list)",      () => listStatistieken({ page_size: 1 })),
  () => check("statistieken / indicatoren (list)",       () => listIndicatoren({ page_size: 1 })),

  // Vastgoed
  () => check("vastgoed / woz (list)",                   () => listWoz({ page_size: 1 })),
  () => check("vastgoed / gemeentelijk vastgoed (list)", () => listGemeentelijkVastgoed({ page_size: 1 })),
  () => check("vastgoed / nieuwbouwplannen (list)",      () => listNieuwbouwplannen({ page_size: 1 })),
  () => check("vastgoed / grex (list)",                  () => listGrex({ page_size: 1 })),
  () => check("vastgoed / precariobelasting (list)",     () => listPrecariobelasting({ page_size: 1 })),

  // Veiligheid
  () => check("veiligheid / risicozones (list)",         () => listRisicozones({ page_size: 1 })),
  () => check("veiligheid / geluidszones (list)",        () => listGeluidszones({ page_size: 1 })),
  () => check("veiligheid / overlastgebieden (list)",    () => listOverlastgebieden({ page_size: 1 })),
  () => check("veiligheid / veilige afstanden (list)",   () => listVeiligheidsAfstanden({ page_size: 1 })),
  () => check("veiligheid / schiphol zones (list)",      () => listSchipholZones({ page_size: 1 })),

  // Vergunningen
  () => check("vergunningen / vergunningen (list)",      () => listVergunningen({ page_size: 1 })),
  () => check("vergunningen / evenementen (list)",       () => listEvenementen({ page_size: 1 })),
  () => check("vergunningen / horeca (list)",            () => listHoreca({ page_size: 1 })),
  () => check("vergunningen / biz (list)",               () => listBedrijvenInvesteringsZones({ page_size: 1 })),

  // Verkeer
  () => check("verkeer / parkeervakken (list)",          () => listParkeervakken({ page_size: 1 })),
  () => check("verkeer / parkeerzones (list)",           () => listParkeerzones({ page_size: 1 })),
  () => check("verkeer / milieuzones (list)",            () => listMilieuzones({ page_size: 1 })),
  () => check("verkeer / milieuzones2025 (list)",        () => listMilieuzones2025({ page_size: 1 })),
  () => check("verkeer / uitstootvrije zones (list)",    () => listUitstootVrijeZones({ page_size: 1 })),
  () => check("verkeer / wegenbestand (list)",           () => listWegenbestand({ page_size: 1 })),
  () => check("verkeer / touringcars (list)",            () => listTouringcars({ page_size: 1 })),
  () => check("verkeer / fietspaaltjes (list)",          () => listFietspaaltjes({ page_size: 1 })),
  () => check("verkeer / hoofdroutes (list)",            () => listHoofdroutes({ page_size: 1 })),
  () => check("verkeer / loopfietsnetwerk (list)",       () => listLoopfietsnetwerk({ page_size: 1 })),
  () => check("verkeer / verkeerssystemen (list)",       () => listVerkeersinformatiesystemen({ page_size: 1 })),

  // Verkiezingen
  () => check("verkiezingen / verkiezingen (list)",      () => listVerkiezingen({ page_size: 1 })),

  // Water
  () => check("water / water (list)",                    () => listWater({ page_size: 1 })),
  () => check("water / varen (list)",                    () => listVaren({ page_size: 1 })),

  // Winkelgebieden
  () => check("winkelgebieden / winkelgebieden (list)",  () => listWinkelgebieden({ page_size: 1 })),

  // WIOR
  () => check("wior / projecten (list)",                 () => listWior({ page_size: 1 })),
  () => check("wior / storingsmeldingen (list)",         () => listStoringsmeldingen({ page_size: 1 })),
  () => check("wior / stroomstoringen (list)",           () => listStroomstoringen({ page_size: 1 })),
];

// ── Near-radius integratietests ───────────────────────────────────────────────
// Zoekpunt: Grachtengordel-West, Amsterdam (52.37640267, 4.88736806)
// Bekende dataset-dichtheden op dit punt (empirisch vastgesteld):
//   monumenten   radius=500m  → ≥ 5  (daadwerkelijk ≥ 10)
//   meetbouten   radius=500m  → ≥ 50 (daadwerkelijk ≥ 150)
//   kademuren    radius=500m  → ≥ 10 (daadwerkelijk ≥ 19)
//   bodem/grond  radius=500m  → ≥ 50 (daadwerkelijk ≥ 100, vereist multi-page)
//   containers   radius=500m  → ≥ 8  (daadwerkelijk ≥ 12)
const NEAR_LAT = 52.37640267;
const NEAR_LON = 4.88736806;
const NEAR_RADIUS = 500;

async function checkNearRadius(
  name: string,
  dataset: string,
  collection: string,
  geoParam: string,
  minResults: number,
): Promise<TestResult> {
  return check(name, async () => {
    const result = await fetchNearRadius<Record<string, unknown>>(
      defaultClient, dataset, collection, geoParam,
      NEAR_LAT, NEAR_LON, NEAR_RADIUS, {}, 200,
    );
    const items = (Object.values(result._embedded ?? {})[0] ?? []) as Array<Record<string, unknown>>;
    if (items.length < minResults) {
      throw new Error(`${items.length} resultaten, verwacht ≥${minResults}`);
    }
    for (const item of items) {
      if (item["_distanceMeters"] === undefined) {
        throw new Error(`_distanceMeters ontbreekt op item ${item["identificatie"] ?? item["id"]}`);
      }
      if ((item["_distanceMeters"] as number) > NEAR_RADIUS) {
        throw new Error(`_distanceMeters ${item["_distanceMeters"]}m > radius ${NEAR_RADIUS}m`);
      }
    }
    return result;
  });
}

const nearRadiusTests: Array<() => Promise<TestResult>> = [
  () => checkNearRadius("near / monumenten (500m)",     "monumenten",         "monumenten",  "geometrie[intersects]",  5),
  () => checkNearRadius("near / meetbouten (500m)",     "meetbouten",         "meetbouten",  "geometrie[intersects]", 50),
  () => checkNearRadius("near / kademuren (500m)",      "civieleconstructies","kademuur",    "geometrie[intersects]", 10),
  () => checkNearRadius("near / bodemonderzoeken (500m)","bodem",             "grond",       "geometry[intersects]",  50),
  () => checkNearRadius("near / containers (500m)",     "huishoudelijkafval", "container",   "geometrie[intersects]",  8),
];

function pad(s: string, n: number): string {
  return s.length >= n ? s : s + " ".repeat(n - s.length);
}

async function main() {
  console.log(`\n${BOLD}Amsterdam API smoke tests${RESET}`);
  console.log("─".repeat(55));

  const results: TestResult[] = [];
  for (const t of [...tests, ...nearRadiusTests]) {
    const r = await t();
    results.push(r);
    const icon = r.ok ? `${GREEN}✓${RESET}` : `${RED}✗${RESET}`;
    console.log(`  ${icon}  ${pad(r.name, 45)} ${DIM}${r.ms}ms${RESET}`);
    if (!r.ok && r.error) {
      const msg = r.error.replace(/^Error:\s*/, "").slice(0, 120);
      console.log(`     ${DIM}${msg}${RESET}`);
    }
  }

  const passed = results.filter(r => r.ok).length;
  const failed = results.filter(r => !r.ok).length;

  console.log("─".repeat(55));
  if (failed === 0) {
    console.log(`${GREEN}${BOLD}Alle ${passed} tests geslaagd${RESET}\n`);
  } else {
    console.log(`${BOLD}${passed} geslaagd  ${RED}${failed} mislukt${RESET}\n`);
    process.exit(1);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
