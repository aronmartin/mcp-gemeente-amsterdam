import { defaultClient } from "@amsterdam-mcp/core";

const PDOK_REVERSE = "https://api.pdok.nl/bzk/locatieserver/search/v3_1/reverse";
const PDOK_FREE = "https://api.pdok.nl/bzk/locatieserver/search/v3_1/free";

type PdokDoc = {
  weergavenaam?: string;
  centroide_ll?: string;
  postcode?: string;
  huisnummer?: number;
  huisletter?: string;
  straatnaam?: string;
  woonplaatsnaam?: string;
  buurtnaam?: string;
  buurtcode?: string;
};
type PdokResponse = { response?: { docs?: PdokDoc[] } };

function parseCentroidLL(wkt?: string): { lat: number; lon: number } | null {
  if (!wkt) return null;
  const m = wkt.match(/POINT\(([^ ]+) ([^ )]+)\)/);
  if (!m) return null;
  return { lon: parseFloat(m[1]), lat: parseFloat(m[2]) };
}

async function pdokFree(q: string): Promise<{ doc: PdokDoc; lat: number; lon: number } | null> {
  const url = `${PDOK_FREE}?q=${encodeURIComponent(q)}&fq=type:adres&rows=1&fl=*`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = (await res.json()) as PdokResponse;
  const doc = data.response?.docs?.[0];
  if (!doc) return null;
  const coords = parseCentroidLL(doc.centroide_ll);
  if (!coords) return null;
  return { doc, ...coords };
}

async function pdokReverse(lat: number, lon: number, type: string, fields: string): Promise<PdokDoc | null> {
  const url = `${PDOK_REVERSE}?lat=${lat}&lon=${lon}&rows=1&type=${type}&fl=${fields}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = (await res.json()) as PdokResponse;
  return data.response?.docs?.[0] ?? null;
}

type BuurtRaw = {
  identificatie?: string;
  naam?: string;
  code?: string;
  ligtInWijkId?: string;
};
type WijkRaw = {
  identificatie?: string;
  naam?: string;
  code?: string;
  ligtInStadsdeelId?: string;
};
type StadsdeelRaw = {
  identificatie?: string;
  naam?: string;
  code?: string;
};

export type ResolvedLocation = {
  adres: {
    weergavenaam?: string;
    straatnaam?: string;
    huisnummer?: number;
    postcode?: string;
    woonplaats?: string;
    lat: number;
    lon: number;
  };
  buurt: { naam?: string; code?: string; cbsCode?: string; identificatie?: string } | null;
  wijk: { naam?: string; code?: string; identificatie?: string } | null;
  stadsdeel: { naam?: string; code?: string; identificatie?: string } | null;
};

export async function resolveLocation(params: {
  lat?: number;
  lon?: number;
  postcode?: string;
  huisnummer?: number;
  huisletter?: string;
}): Promise<ResolvedLocation> {
  let lat: number;
  let lon: number;
  let adresDoc: PdokDoc | null = null;

  if (params.lat !== undefined && params.lon !== undefined) {
    lat = params.lat;
    lon = params.lon;
    adresDoc = await pdokReverse(lat, lon, "adres", "weergavenaam,straatnaam,huisnummer,postcode,woonplaatsnaam");
  } else if (params.postcode && params.huisnummer !== undefined) {
    const q = `${params.postcode} ${params.huisnummer}${params.huisletter ?? ""}`.trim();
    const result = await pdokFree(q);
    if (!result) throw new Error(`Adres niet gevonden: ${q}`);
    lat = result.lat;
    lon = result.lon;
    adresDoc = result.doc;
  } else {
    throw new Error("Geef lat+lon op, of postcode+huisnummer");
  }

  // Resolve buurt CBS code via PDOK reverse
  const buurtDoc = await pdokReverse(lat, lon, "buurt", "buurtnaam,buurtcode");
  const cbsCode = buurtDoc?.buurtcode?.replace(/^BU\d{4}/, "") ?? null;

  let buurtResult: ResolvedLocation["buurt"] = null;
  let wijkResult: ResolvedLocation["wijk"] = null;
  let stadsdeelResult: ResolvedLocation["stadsdeel"] = null;

  if (cbsCode) {
    const buurtPage = await defaultClient.list<BuurtRaw>("gebieden", "buurten", { code: cbsCode, page_size: 1 });
    const buurt = Object.values(buurtPage._embedded ?? {}).flat()[0];
    if (buurt) {
      buurtResult = { naam: buurt.naam, code: buurt.code, cbsCode, identificatie: buurt.identificatie };
      if (buurt.ligtInWijkId) {
        const wijk = await defaultClient.get<WijkRaw>("gebieden", "wijken", buurt.ligtInWijkId);
        if (wijk) {
          wijkResult = { naam: wijk.naam, code: wijk.code, identificatie: wijk.identificatie };
          if (wijk.ligtInStadsdeelId) {
            const stadsdeel = await defaultClient.get<StadsdeelRaw>("gebieden", "stadsdelen", wijk.ligtInStadsdeelId);
            stadsdeelResult = stadsdeel ? { naam: stadsdeel.naam, code: stadsdeel.code, identificatie: stadsdeel.identificatie } : null;
          }
        }
      }
    }
  }

  return {
    adres: {
      weergavenaam: adresDoc?.weergavenaam,
      straatnaam: adresDoc?.straatnaam,
      huisnummer: adresDoc?.huisnummer,
      postcode: adresDoc?.postcode,
      woonplaats: adresDoc?.woonplaatsnaam,
      lat,
      lon,
    },
    buurt: buurtResult,
    wijk: wijkResult,
    stadsdeel: stadsdeelResult,
  };
}
