import { AmsClient } from "@amsterdam-mcp/core";

const client = new AmsClient();
const PDOK_REVERSE = "https://api.pdok.nl/bzk/locatieserver/search/v3_1/reverse";

async function pdokReverseBuurt(lat: number, lon: number): Promise<{ naam: string; code: string } | null> {
  const url = `${PDOK_REVERSE}?lat=${lat}&lon=${lon}&rows=1&type=buurt&fl=buurtnaam,buurtcode`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json() as { response?: { docs?: { buurtnaam?: string; buurtcode?: string }[] } };
  const doc = data.response?.docs?.[0];
  if (!doc?.buurtnaam || !doc?.buurtcode) return null;
  // CBS buurtcode: "BU0363MD01" → strip gemeente-prefix → "MD01"
  const code = doc.buurtcode.replace(/^BU\d{4}/, "");
  return { naam: doc.buurtnaam, code };
}

// RD New (EPSG:28992) → WGS84 — lineaire benadering verankerd aan Amsterdam Centraal.
// Nauwkeurig tot ~30m binnen Amsterdam; voldoende voor buurt-level queries.
// Referentie: RD(121389, 487366) = WGS84(52.378784°, 4.900276°)
function rdToWgs84(rdX: number, rdY: number): { lat: number; lon: number } {
  return {
    lat: Math.round((52.378784 + (rdY - 487366) / 111320) * 1e6) / 1e6,
    lon: Math.round((4.900276 + (rdX - 121389) / 67886) * 1e6) / 1e6,
  };
}

function polygonCentroid(coords: number[][]): { x: number; y: number } {
  const n = coords.length;
  return {
    x: coords.reduce((s, c) => s + c[0], 0) / n,
    y: coords.reduce((s, c) => s + c[1], 0) / n,
  };
}

function geometrieCentroidWgs84(geometrie: unknown): { lat: number; lon: number } | null {
  if (!geometrie || typeof geometrie !== "object") return null;
  const g = geometrie as { type?: string; coordinates?: unknown };
  let coords: number[][] = [];
  if (g.type === "Point") coords = [g.coordinates as number[]];
  else if (g.type === "Polygon") coords = (g.coordinates as number[][][])[0] ?? [];
  else if (g.type === "MultiPolygon") coords = (g.coordinates as number[][][][])[0]?.[0] ?? [];
  else if (g.type === "LineString") coords = g.coordinates as number[][];
  if (!coords.length) return null;
  const { x, y } = polygonCentroid(coords);
  // RD x-coords are > 1000; WGS84 lon is 3–8
  return x > 100 ? rdToWgs84(x, y) : { lat: Math.round(y * 1e6) / 1e6, lon: Math.round(x * 1e6) / 1e6 };
}

type MeldingRaw = {
  gbdBuurtNaam?: string;
  gbdBuurtCode?: string;
  gbdStadsdeelNaam?: string;
};

type WiorRaw = {
  id?: string;
  projectnaam?: string;
  hoofdstatus?: string;
  geometrie?: unknown;
};


export type BuurtHotspot = {
  buurtNaam: string;
  meldingen_recent: number;
  wior_actief: number;
  parkeervakken: number;
  hotspot_score: number;
};

export type HotspotResultaat = {
  hotspots: BuurtHotspot[];
  metadata: {
    periode_meldingen: string;
    totaal_meldingen_opgehaald: number;
    totaal_wior_actief: number;
    buurten_met_wior: number;
    analyse_timestamp: string;
  };
};

async function runWithConcurrency<T>(
  tasks: (() => Promise<T>)[],
  concurrency: number
): Promise<T[]> {
  const results: T[] = [];
  for (let i = 0; i < tasks.length; i += concurrency) {
    const batch = await Promise.all(tasks.slice(i, i + concurrency).map(fn => fn()));
    results.push(...batch);
  }
  return results;
}

export async function analyseHotspots(params: {
  dagen?: number;
  stadsdeel?: string;
  top?: number;
}): Promise<HotspotResultaat> {
  const dagen = params.dagen ?? 7;
  const top = params.top ?? 10;
  const vandaag = new Date();
  const vanafDatum = new Date(vandaag.getTime() - dagen * 24 * 60 * 60 * 1000);
  const datumStr = vanafDatum.toISOString().split("T")[0];
  const vandaagStr = vandaag.toISOString().split("T")[0];

  // --- Stap 1: Meldingen aggregeren per buurt ---
  const meldingenPerBuurt = new Map<string, { count: number; code: string }>();
  let meldingenPage = 1;
  let hasMore = true;
  let totalMeldingen = 0;

  while (hasMore && meldingenPage <= 5) {
    const result = await client.list<MeldingRaw>("meldingen", "meldingen", {
      "datumMelding[gte]": datumStr,
      page_size: 500,
      page: meldingenPage,
      ...(params.stadsdeel ? { gbdStadsdeelNaam: params.stadsdeel } : {}),
    });
    const items = Object.values(result._embedded ?? {}).flat() as MeldingRaw[];
    totalMeldingen += items.length;
    for (const m of items) {
      if (!m.gbdBuurtNaam) continue;
      const existing = meldingenPerBuurt.get(m.gbdBuurtNaam);
      if (existing) {
        existing.count++;
      } else {
        meldingenPerBuurt.set(m.gbdBuurtNaam, { count: 1, code: m.gbdBuurtCode ?? "" });
      }
    }
    hasMore = items.length === 500;
    meldingenPage++;
  }

  // --- Stap 2: Actieve WIOR-projecten → buurt via reverse geocode ---
  const wiorPerBuurt = new Map<string, number>();

  const wiorResult = await client.list<WiorRaw>("wior", "wior", {
    hoofdstatus: "Uitvoering",
    "datumEindeUitvoering[gte]": datumStr,
    page_size: 500,
  });
  const wiorItems = Object.values(wiorResult._embedded ?? {}).flat() as WiorRaw[];

  const wiorLookups = wiorItems
    .map(wior => () => {
      const centroid = geometrieCentroidWgs84(wior.geometrie);
      if (!centroid) return Promise.resolve();
      return pdokReverseBuurt(centroid.lat, centroid.lon)
        .then(buurt => {
          if (buurt) {
            wiorPerBuurt.set(buurt.naam, (wiorPerBuurt.get(buurt.naam) ?? 0) + 1);
            // Sla ook buurtcode op zodat parkeervakken lookup werkt
            if (!meldingenPerBuurt.has(buurt.naam)) {
              meldingenPerBuurt.set(buurt.naam, { count: 0, code: buurt.code });
            }
          }
        })
        .catch(() => undefined);
    });

  await runWithConcurrency(wiorLookups, 8);

  // --- Stap 3: Parkeervakken per buurt (via gbdBuurtCode = parkeervakken buurtcode) ---
  const parkeervakkenPerBuurt = new Map<string, number>();
  const candidateBuurten = new Set([...meldingenPerBuurt.keys(), ...wiorPerBuurt.keys()]);

  const parkeerLookups = Array.from(candidateBuurten)
    .filter(naam => meldingenPerBuurt.get(naam)?.code)
    .map(naam => () => {
      const code = meldingenPerBuurt.get(naam)!.code;
      return client
        .list("parkeervakken", "parkeervakken", { buurtcode: code, page_size: 1000 })
        .then(r => {
          const items = Object.values(r._embedded ?? {}).flat();
          parkeervakkenPerBuurt.set(naam, items.length);
        })
        .catch(() => undefined);
    });

  await runWithConcurrency(parkeerLookups, 8);

  // --- Stap 4: Scoren en rangschikken ---
  const maxMeldingen = Math.max(1, ...Array.from(meldingenPerBuurt.values()).map(v => v.count));
  const maxWior = Math.max(1, ...Array.from(wiorPerBuurt.values()));
  const parkeerWaarden = Array.from(parkeervakkenPerBuurt.values());
  const minParkeer = parkeerWaarden.length ? Math.min(...parkeerWaarden) : 0;
  const maxParkeer = parkeerWaarden.length ? Math.max(1, ...parkeerWaarden) : 1;

  const hotspots: BuurtHotspot[] = [];

  for (const naam of candidateBuurten) {
    const meldingen = meldingenPerBuurt.get(naam)?.count ?? 0;
    const wior = wiorPerBuurt.get(naam) ?? 0;
    const parkeer = parkeervakkenPerBuurt.get(naam);

    // Alleen buurten die in minstens 2 van 3 dimensies actief zijn
    const actief = (meldingen > 0 ? 1 : 0) + (wior > 0 ? 1 : 0) + (parkeer !== undefined ? 1 : 0);
    if (actief < 2) continue;

    // Score: meldingen (0–4) + wior (0–4) + parkeer schaars (0–2)
    const meldingenScore = (meldingen / maxMeldingen) * 4;
    const wiorScore = (wior / maxWior) * 4;
    const parkeerScore = parkeer !== undefined
      ? ((maxParkeer - parkeer) / (maxParkeer - minParkeer + 1)) * 2
      : 0;

    hotspots.push({
      buurtNaam: naam,
      meldingen_recent: meldingen,
      wior_actief: wior,
      parkeervakken: parkeer ?? 0,
      hotspot_score: Math.round((meldingenScore + wiorScore + parkeerScore) * 10) / 10,
    });
  }

  hotspots.sort((a, b) => b.hotspot_score - a.hotspot_score);

  return {
    hotspots: hotspots.slice(0, top),
    metadata: {
      periode_meldingen: `${datumStr} t/m ${vandaagStr}`,
      totaal_meldingen_opgehaald: totalMeldingen,
      totaal_wior_actief: wiorItems.length,
      buurten_met_wior: wiorPerBuurt.size,
      analyse_timestamp: new Date().toISOString(),
    },
  };
}
