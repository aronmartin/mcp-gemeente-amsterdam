import { AmsClient } from "@amsterdam-mcp/core";

const client = new AmsClient();

/** Bekende dataset → default collection mappings (waar collection ≠ dataset). */
const DEFAULT_COLLECTION: Record<string, string> = {
  aardgasvrijezones: "buurt",
  amsterdam_canon: "canon_amsterdam_2025",
  bbga: "kerncijfers",
  bedrijveninvesteringszones: "gebieden",
  bgt: "wegdelen",
  bodem: "grond",
  bomen: "stamgegevens",
  civieleconstructies: "kademuur",
  duurzaamheid: "energielabel",
  ecologie: "kerngebieden",
  energieverbruik_mra: "gas_en_elektriciteit_kwartaal",
  explosieven: "verdachtgebied",
  functionele_gebieden: "groen",
  geluidszones: "industrie",
  gemeentelijk_vastgoed: "gebouwobjecten",
  grex: "projecten",
  historische_bodeminformatie: "onderzoeken",
  hoofdroutes: "u_routes",
  horeca: "exploitatievergunning",
  huishoudelijkafval: "container",
  indicatoren: "buurt",
  leidingeninfrastructuur: "waternet_rioolleidingen",
  loopfietsnetwerk: "edges",
  maatschappelijke_voorzieningen: "voorziening_individueel",
  milieuzones: "vrachtauto",
  milieuzones2025: "vracht_en_bestelauto",
  nap: "peilmerken",
  nieuwbouwplannen: "woningbouwplannen_openbaar",
  objectenopenbareruimte: "afvalbakken",
  ontplofbare_oorlogsresten: "inslagen",
  overlastgebieden: "algemeenoverlast",
  precariobelasting: "terrassen",
  primair_onderwijs_loopafstanden: "afstanden",
  recyclepunten: "wegingen",
  risicozones: "bedrijven",
  schiphol: "geluidzones",
  schoolgebouwen: "accommodatie",
  sport: "openbaresportplek",
  statistieken: "cijfers",
  storingsmeldingen_ovl_en_klokken: "openbare_verlichting",
  touringcars: "haltes",
  uitstootvrije_zones: "brom_en_snorfiets",
  varen: "ligplaats",
  vergunningen: "omzetting",
  verkiezingen: "processenverbaal",
  water: "binnenwater",
  wegenbestand: "routes_gevaarlijke_stoffen",
  woz: "objecten",
  ziekte_plagen_exoten_groen: "eikenprocessierups",
};

function parseEndpoint(endpoint: string): { dataset: string; collection: string } {
  const parts = endpoint.split("/");
  const dataset = parts[0];
  const collection = parts[1] ?? DEFAULT_COLLECTION[dataset] ?? dataset;
  return { dataset, collection };
}

function inferType(value: unknown): string {
  if (value === null || value === undefined) return "unknown";
  if (typeof value === "number") return Number.isInteger(value) ? "integer" : "number";
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "string") {
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) return "date";
    return "string";
  }
  if (Array.isArray(value)) return "array";
  return "object";
}

const SKIP_KEYS = new Set(["schema", "_links", "_embedded", "geometry", "geometrie", "geopoint"]);

export type SchemaResult = {
  endpoint: string;
  fields: Record<string, string>;
  numeric_fields: string[];
};

export async function getSchema(params: { endpoint: string }): Promise<SchemaResult> {
  const { dataset, collection } = parseEndpoint(params.endpoint);
  const page = await client.list<Record<string, unknown>>(dataset, collection, { page_size: 10 });
  const items = Object.values(page._embedded ?? {}).flat() as Record<string, unknown>[];

  const fieldTypes = new Map<string, string>();
  for (const item of items) {
    for (const [key, value] of Object.entries(item)) {
      if (key.startsWith("_") || SKIP_KEYS.has(key)) continue;
      if (value !== null && typeof value === "object" && !Array.isArray(value)) continue;
      const existing = fieldTypes.get(key);
      const inferred = inferType(value);
      if (!existing || existing === "unknown") fieldTypes.set(key, inferred);
    }
  }

  const fields = Object.fromEntries(fieldTypes.entries());
  const numeric_fields = [...fieldTypes.entries()]
    .filter(([, t]) => t === "integer" || t === "number")
    .map(([k]) => k);

  return { endpoint: params.endpoint, fields, numeric_fields };
}

type GroupAcc = {
  count: number;
  sums: Record<string, number>;
  avgSums: Record<string, number>;
  avgCounts: Record<string, number>;
};

export type AggregateParams = {
  endpoint: string;
  groupBy?: string;
  sum?: string[];
  avg?: string[];
  count?: boolean;
  filter?: Record<string, unknown>;
  limit?: number;
};

async function runWithConcurrency<T>(
  tasks: (() => Promise<T>)[],
  concurrency: number
): Promise<T[]> {
  const results: T[] = [];
  for (let i = 0; i < tasks.length; i += concurrency) {
    const batch = tasks.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map((fn) => fn()));
    results.push(...batchResults);
  }
  return results;
}

type PageResult = {
  _embedded?: Record<string, unknown[]>;
  _links?: { next?: { href?: string } };
  page?: { totalPages?: number };
};

function processPage(result: PageResult, acc: Map<string, GroupAcc>, params: AggregateParams): void {
  const items = Object.values(result._embedded ?? {}).flat() as Record<string, unknown>[];

  for (const item of items) {
    const groupKey = params.groupBy ? String(item[params.groupBy] ?? "__null__") : "__all__";

    if (!acc.has(groupKey)) {
      acc.set(groupKey, { count: 0, sums: {}, avgSums: {}, avgCounts: {} });
    }
    const entry = acc.get(groupKey)!;
    entry.count++;

    for (const field of params.sum ?? []) {
      const val = Number(item[field]);
      if (!isNaN(val)) entry.sums[field] = (entry.sums[field] ?? 0) + val;
    }

    for (const field of params.avg ?? []) {
      const val = Number(item[field]);
      if (!isNaN(val)) {
        entry.avgSums[field] = (entry.avgSums[field] ?? 0) + val;
        entry.avgCounts[field] = (entry.avgCounts[field] ?? 0) + 1;
      }
    }
  }
}

export async function aggregate(params: AggregateParams): Promise<Record<string, unknown>[]> {
  const { dataset, collection } = parseEndpoint(params.endpoint);

  const PAGE_SIZE = 1000;
  const MAX_PAGES = 500;
  const CONCURRENCY = 10;

  const hasReduceParams =
    params.groupBy || (params.sum?.length ?? 0) > 0 || (params.avg?.length ?? 0) > 0 || params.count;

  // Limit-only mode: return raw items without aggregation
  if (params.limit !== undefined && !hasReduceParams) {
    const result = await client.list<Record<string, unknown>>(dataset, collection, {
      ...(params.filter ?? {}),
      page: 1,
      page_size: params.limit,
    });
    const items = Object.values(result._embedded ?? {}).flat() as Record<string, unknown>[];
    return items.slice(0, params.limit);
  }

  const acc = new Map<string, GroupAcc>();

  // Pagina 1 ophalen
  const firstResult = await client.list<Record<string, unknown>>(dataset, collection, {
    ...(params.filter ?? {}),
    page: 1,
    page_size: PAGE_SIZE,
  });

  processPage(firstResult as PageResult, acc, params);

  const totalPages = (firstResult as PageResult).page?.totalPages ?? null;

  if (totalPages !== null && totalPages > 1) {
    // Alle overige pagina's parallel ophalen
    const remainingPages = Array.from(
      { length: Math.min(totalPages - 1, MAX_PAGES - 1) },
      (_, i) => i + 2
    );

    await runWithConcurrency(
      remainingPages.map((pageNum) => async () => {
        const result = await client.list<Record<string, unknown>>(dataset, collection, {
          ...(params.filter ?? {}),
          page: pageNum,
          page_size: PAGE_SIZE,
        });
        processPage(result as PageResult, acc, params);
      }),
      CONCURRENCY
    );
  } else if (totalPages === null) {
    // Fallback: geen totalPages bekend, sequentieel met next links
    let hasMore = !!(firstResult as PageResult)._links?.next?.href;
    let page = 2;
    while (hasMore && page <= MAX_PAGES) {
      const result = await client.list<Record<string, unknown>>(dataset, collection, {
        ...(params.filter ?? {}),
        page,
        page_size: PAGE_SIZE,
      });
      processPage(result as PageResult, acc, params);
      hasMore = !!(result as PageResult)._links?.next?.href;
      page++;
    }
  }

  const rows: Record<string, unknown>[] = [];
  for (const [key, entry] of acc.entries()) {
    const row: Record<string, unknown> = {};

    if (params.groupBy) row[params.groupBy] = key === "__null__" ? null : key;
    if (params.count) row.count = entry.count;

    for (const field of params.sum ?? []) {
      row[field] = entry.sums[field] ?? 0;
    }
    for (const field of params.avg ?? []) {
      const cnt = entry.avgCounts[field] ?? 0;
      row[`${field}_avg`] = cnt > 0 ? Math.round((entry.avgSums[field]! / cnt) * 100) / 100 : null;
    }

    rows.push(row);
  }

  if (params.groupBy) {
    const gb = params.groupBy;
    rows.sort((a, b) => String(a[gb] ?? "").localeCompare(String(b[gb] ?? "")));
  }

  return rows;
}
