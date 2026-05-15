#!/usr/bin/env tsx
/**
 * AUTO-GEGENEREERD SCRIPT — Run: pnpm generate-schemas
 * Haalt schema-informatie op voor alle bekende Amsterdam API endpoints
 * en schrijft deze naar packages/aggregatie/src/generated-schemas.ts
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// Laad .env (project root of worktree root)
function loadEnv(): void {
  for (const envPath of [resolve(ROOT, ".env"), resolve(ROOT, "..", ".env"), resolve(ROOT, "..", "..", ".env")]) {
    try {
      const content = readFileSync(envPath, "utf-8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx === -1) continue;
        const key = trimmed.slice(0, eqIdx).trim();
        const value = trimmed.slice(eqIdx + 1).trim();
        if (!process.env[key]) process.env[key] = value;
      }
      console.log(`Loaded .env from ${envPath}`);
      return;
    } catch {
      // try next
    }
  }
  console.warn("No .env file found, using environment variables");
}

loadEnv();

const API_KEY = process.env.AMSTERDAM_API_KEY;
const BASE_URL = "https://api.data.amsterdam.nl";

// Alle endpoints uit de domain tools.ts bestanden
const ENDPOINTS: string[] = [
  // afval
  "huishoudelijkafval/container",
  "afvalwijzer/afvalwijzer",
  "recyclepunten/wegingen",
  // bag
  "bag/verblijfsobjecten",
  "bag/panden",
  "bag/nummeraanduidingen",
  "bag/openbareruimtes",
  "bag/woonplaatsen",
  "bag/standplaatsen",
  "bag/ligplaatsen",
  // duurzaamheid
  "aardgasvrijezones/buurt",
  "duurzaamheid/energielabel",
  "energieverbruik_mra/gas_en_elektriciteit_kwartaal",
  // erfgoed
  "monumenten/monumenten",
  "beschermdestadsdorpsgezichten/beschermdestadsdorpsgezichten",
  "amsterdam_canon/canon_amsterdam_2025",
  // groen
  "bomen/stamgegevens",
  "ecologie/kerngebieden",
  "ziekte_plagen_exoten_groen/eikenprocessierups",
  "functionele_gebieden/groen",
  // meldingen
  "meldingen/meldingen",
  // openbare-ruimte
  "bgt/wegdelen",
  "nap/peilmerken",
  "meetbouten/meetbouten",
  "civieleconstructies/kademuur",
  "bouwstroompunten/bouwstroompunten",
  "objectenopenbareruimte/afvalbakken",
  // bodem
  "bodem/grond",
  "historische_bodeminformatie/onderzoeken",
  "explosieven/verdachtgebied",
  "ontplofbare_oorlogsresten/inslagen",
  "leidingeninfrastructuur/waternet_rioolleidingen",
  // statistieken
  "bbga/kerncijfers",
  "statistieken/cijfers",
  "indicatoren/buurt",
  // vastgoed
  "woz/objecten",
  "gemeentelijk_vastgoed/gebouwobjecten",
  "nieuwbouwplannen/woningbouwplannen_openbaar",
  "grex/projecten",
  "precariobelasting/terrassen",
  // veiligheid
  "risicozones/bedrijven",
  "geluidszones/industrie",
  "overlastgebieden/algemeenoverlast",
  "veiligeafstanden/veiligeafstanden",
  "schiphol/geluidzones",
  // verkeer
  "parkeervakken/parkeervakken",
  "parkeerzones/parkeerzones",
  "milieuzones/vrachtauto",
  "milieuzones2025/vracht_en_bestelauto",
  "uitstootvrije_zones/brom_en_snorfiets",
  "wegenbestand/routes_gevaarlijke_stoffen",
  "touringcars/haltes",
  "fietspaaltjes/fietspaaltjes",
  "hoofdroutes/u_routes",
  "loopfietsnetwerk/edges",
  "verkeersinformatiesystemen/verkeersinformatiesystemen",
  // gebieden
  "gebieden/stadsdelen",
  "gebieden/wijken",
  "gebieden/buurten",
  "gebieden/ggwgebieden",
  "gebieden/grootstedelijke_projecten",
  // water
  "water/binnenwater",
  "varen/ligplaats",
  // wior
  "wior/wior",
  "storingsmeldingen_ovl_en_klokken/openbare_verlichting",
  "stroomstoringen/stroomstoringen",
  // verkiezingen
  "verkiezingen/processenverbaal",
  // sport-voorzieningen
  "sport/openbaresportplek",
  "maatschappelijke_voorzieningen/voorziening_individueel",
  "schoolgebouwen/accommodatie",
  "primair_onderwijs_loopafstanden/afstanden",
  // winkelgebieden
  "winkelgebieden/winkelgebieden",
  // vergunningen
  "vergunningen/omzetting",
  "evenementen/evenementen",
  "horeca/exploitatievergunning",
  "bedrijveninvesteringszones/gebieden",
];

const SKIP_KEYS = new Set(["schema", "_links", "_embedded", "geometry", "geometrie", "geopoint"]);

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

type SchemaEntry = {
  fields: Record<string, string>;
  numeric_fields: string[];
};

async function fetchSchema(endpoint: string): Promise<SchemaEntry | null> {
  const [dataset, collection] = endpoint.split("/");
  const url = `${BASE_URL}/v1/${dataset}/${collection}/?page_size=10`;

  const headers: Record<string, string> = { Accept: "application/hal+json" };
  if (API_KEY) headers["X-Api-Key"] = API_KEY;

  try {
    const res = await fetch(url, { headers });
    if (!res.ok) {
      console.warn(`  SKIP ${endpoint}: HTTP ${res.status}`);
      return null;
    }

    const data = (await res.json()) as {
      _embedded?: Record<string, unknown[]>;
    };
    const items = Object.values(data._embedded ?? {}).flat() as Record<string, unknown>[];

    if (items.length === 0) {
      console.warn(`  SKIP ${endpoint}: geen items in response`);
      return null;
    }

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

    return { fields, numeric_fields };
  } catch (err) {
    console.warn(`  SKIP ${endpoint}: ${err instanceof Error ? err.message : String(err)}`);
    return null;
  }
}

async function main(): Promise<void> {
  console.log(`Fetching schemas for ${ENDPOINTS.length} endpoints...`);

  const results: Record<string, SchemaEntry> = {};

  for (const endpoint of ENDPOINTS) {
    process.stdout.write(`  ${endpoint}... `);
    const schema = await fetchSchema(endpoint);
    if (schema) {
      results[endpoint] = schema;
      console.log(`OK (${Object.keys(schema.fields).length} velden)`);
    }
    // kleine pauze om rate limits te vermijden
    await new Promise((r) => setTimeout(r, 50));
  }

  const lines: string[] = [
    "// AUTO-GEGENEREERD — niet handmatig bewerken. Run: pnpm generate-schemas",
    "// Gegenereerd op: " + new Date().toISOString(),
    "",
    "export type EndpointSchema = {",
    "  fields: Record<string, string>;",
    "  numeric_fields: string[];",
    "};",
    "",
    "export const ENDPOINT_SCHEMAS: Record<string, EndpointSchema> = {",
  ];

  for (const [endpoint, schema] of Object.entries(results)) {
    const fieldsStr = Object.entries(schema.fields)
      .map(([k, v]) => `    ${JSON.stringify(k)}: ${JSON.stringify(v)}`)
      .join(",\n");
    const numericStr = schema.numeric_fields.map((f) => JSON.stringify(f)).join(", ");

    lines.push(`  ${JSON.stringify(endpoint)}: {`);
    lines.push(`    fields: {`);
    lines.push(fieldsStr);
    lines.push(`    },`);
    lines.push(`    numeric_fields: [${numericStr}],`);
    lines.push(`  },`);
  }

  lines.push("};");
  lines.push("");

  const outputPath = resolve(ROOT, "packages/aggregatie/src/generated-schemas.ts");
  writeFileSync(outputPath, lines.join("\n"), "utf-8");
  console.log(`\nSchemas geschreven naar ${outputPath}`);
  console.log(`${Object.keys(results).length}/${ENDPOINTS.length} endpoints succesvol`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
