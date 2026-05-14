import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildRegistry, type FilterEntry } from "./registry.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WORKSPACE_ROOT = path.resolve(__dirname, "../../..");
const BASE_URL = "https://api.data.amsterdam.nl";
const API_KEY = process.env.AMSTERDAM_API_KEY;
const DRY_RUN = process.argv.includes("--dry-run");
const CONCURRENCY = 6;

const GREEN  = "\x1b[32m";
const RED    = "\x1b[31m";
const YELLOW = "\x1b[33m";
const DIM    = "\x1b[2m";
const BOLD   = "\x1b[1m";
const RESET  = "\x1b[0m";

// ── HTTP helper ───────────────────────────────────────────────────────────────

async function probeEndpoint(
  dataset: string,
  collection: string,
  params: Record<string, string | number>
): Promise<{ status: number; body: string }> {
  const url = new URL(`/v1/${dataset}/${collection}/`, BASE_URL);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));

  const headers: Record<string, string> = { Accept: "application/hal+json" };
  if (API_KEY) headers["X-Api-Key"] = API_KEY;

  const res = await fetch(url.toString(), { headers });
  const body = await res.text();
  return { status: res.status, body };
}

// Parses the Amsterdam DSO API error body.
// Returns the name from invalid-params[0], or null if unavailable.
// name === "invalid"   → the filter field is completely unknown upstream
// name === <fieldname> → the field is known but the value format was rejected
function parseInvalidParamName(body: string): string | null {
  try {
    const parsed = JSON.parse(body) as { "invalid-params"?: { name?: string }[] };
    return parsed["invalid-params"]?.[0]?.name ?? null;
  } catch {
    return null;
  }
}

// ── Test value heuristics ─────────────────────────────────────────────────────

function testValue(paramName: string, paramType: string): string | number {
  const lower = paramName.toLowerCase();
  if (lower.endsWith("[like]")) return "a";
  if (lower.endsWith("[gte]") || lower.endsWith("[lte]")) {
    if (lower.includes("datum") || lower.includes("date")) return "2020-01-01";
    if (lower.includes("jaar") || lower.includes("year")) return 2000;
    return 0;
  }
  if (paramType === "number") {
    if (lower.includes("jaar") || lower.includes("year")) return 2020;
    return 1;
  }
  if (lower.includes("datum") || lower.includes("date")) return "2020-01-01";
  if (lower.includes("postcode")) return "1011AA";
  // Enum-achtige velden die een code-waarde verwachten, geen vrije tekst
  const bare = lower.replace(/^.*\./, ""); // strip relation prefix
  if (bare === "statuscode" || bare === "meldingstatus" || bare === "storingstatus") return "1";
  // Boolean/indicatie velden
  if (bare.startsWith("indicatie")) return "true";
  return "test";
}

// ── Concurrency pool ──────────────────────────────────────────────────────────

async function pool<T>(tasks: (() => Promise<T>)[], limit: number): Promise<T[]> {
  const results: T[] = [];
  for (let i = 0; i < tasks.length; i += limit) {
    const batch = await Promise.all(tasks.slice(i, i + limit).map(fn => fn()));
    results.push(...batch);
  }
  return results;
}

// ── Source file patching ──────────────────────────────────────────────────────

function removeParamFromSource(filePath: string, paramKey: string): boolean {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  const escaped = paramKey.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`^\\s+(?:"${escaped}"|${escaped}):\\s*\\{`);

  const idx = lines.findIndex(line => pattern.test(line));
  if (idx === -1) return false;

  lines.splice(idx, 1);
  fs.writeFileSync(filePath, lines.join("\n"), "utf-8");
  return true;
}

// ── Verdict logic ─────────────────────────────────────────────────────────────

// Returns "remove", "keep", or "warn" for a 400 response.
// - "remove"  → field is genuinely unknown upstream, or [gte]/[lte] modifier not supported
// - "warn"    → field exists but our test value had wrong format; retried with "1" and it passed
// - "remove"  → field exists, wrong format, AND retry with "1" also failed
async function classify400(
  entry: FilterEntry,
  errorBody: string
): Promise<"remove" | "warn"> {
  const invalidName = parseInvalidParamName(errorBody);

  // Unknown field indicator from the Amsterdam DSO API
  if (invalidName === "invalid") return "remove";

  // [gte]/[lte] modifier: if the invalid-params name is the bare field (without modifier),
  // the modifier itself is not supported for this field → remove
  if ((entry.param.includes("[gte]") || entry.param.includes("[lte]"))) {
    const baseField = entry.param.replace(/\[(gte|lte)\]$/, "");
    if (invalidName === baseField) return "remove";
  }

  // Value format issue — retry with "1" to confirm the field itself works
  const retry = await probeEndpoint(entry.dataset, entry.collection, {
    page_size: 1,
    [entry.param]: "1",
  });
  return retry.status < 400 ? "warn" : "remove";
}

// ── Result types ──────────────────────────────────────────────────────────────

type Verdict = "accept" | "remove" | "warn" | "skip";
type ProbeResult = FilterEntry & { status: number; verdict: Verdict; note?: string };

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const entries = buildRegistry();

  console.log(`\n${BOLD}Amsterdam API filter probe${RESET}`);
  if (DRY_RUN) console.log(`${YELLOW}DRY RUN — bestanden worden niet aangepast${RESET}`);
  console.log(`${DIM}${entries.length} params over ${new Set(entries.map(e => e.toolName)).size} tools${RESET}`);
  console.log("─".repeat(70));

  // Baseline check per uniek endpoint
  const endpointKeys = new Set(entries.map(e => `${e.dataset}/${e.collection}`));
  const failedEndpoints = new Set<string>();

  console.log(`\n${BOLD}Baseline checks...${RESET}`);
  await pool(
    Array.from(endpointKeys).map(key => async () => {
      const [dataset, collection] = key.split("/");
      const { status } = await probeEndpoint(dataset, collection, { page_size: 1 });
      if (status >= 400) {
        failedEndpoints.add(key);
        console.log(`  ${RED}✗${RESET} ${DIM}${key}${RESET} ${RED}(${status} — endpoint onbereikbaar)${RESET}`);
      }
    }),
    CONCURRENCY
  );

  // Filter probes
  const activeEntries = entries.filter(
    e => !failedEndpoints.has(`${e.dataset}/${e.collection}`)
  );

  console.log(`\n${BOLD}Filter probes (${activeEntries.length})...${RESET}`);

  const results = await pool<ProbeResult>(
    activeEntries.map(entry => async () => {
      const value = testValue(entry.param, entry.paramType);
      const { status, body } = await probeEndpoint(entry.dataset, entry.collection, {
        page_size: 1,
        [entry.param]: value,
      });

      let verdict: Verdict;
      let note: string | undefined;

      if (status < 400) {
        verdict = "accept";
      } else if (status >= 500) {
        verdict = "skip";
        note = `${status}`;
      } else {
        // 4xx — determine if the field is truly unknown or just a bad test value
        const v = await classify400(entry, body);
        verdict = v === "warn" ? "warn" : "remove";
        if (v === "warn") note = `field bestaat maar testwaarde '${value}' is ongeldig`;
      }

      const icon =
        verdict === "accept" ? `${GREEN}✓${RESET}` :
        verdict === "remove" ? `${RED}✗${RESET}` :
        verdict === "warn"   ? `${YELLOW}~${RESET}` :
        `${DIM}?${RESET}`;

      console.log(`  ${icon}  ${entry.toolName}  ${DIM}?${entry.param}=${value}${RESET}  ${DIM}${status}${note ? ` — ${note}` : ""}${RESET}`);

      return { ...entry, status, verdict, note };
    }),
    CONCURRENCY
  );

  // Summary & patching
  const toRemove = results.filter(r => r.verdict === "remove");
  const warned   = results.filter(r => r.verdict === "warn");
  const accepted = results.filter(r => r.verdict === "accept");
  const skipped  = results.filter(r => r.verdict === "skip");

  console.log("\n" + "─".repeat(70));

  if (warned.length > 0) {
    console.log(`\n${YELLOW}${BOLD}${warned.length} waarschuwing(en) — filter bestaat maar testwaarde was ongeldig:${RESET}`);
    for (const w of warned) {
      console.log(`  ${YELLOW}~${RESET} ${w.toolName} ?${w.param}  ${DIM}${w.note}${RESET}`);
    }
  }

  if (toRemove.length === 0) {
    console.log(`\n${GREEN}${BOLD}Geen onbekende filters gevonden — niets te verwijderen.${RESET}`);
  } else {
    console.log(`\n${BOLD}${RED}${toRemove.length} filter(s) onbekend upstream${RESET} — worden verwijderd:\n`);
    const byFile = new Map<string, ProbeResult[]>();
    for (const r of toRemove) {
      const abs = path.join(WORKSPACE_ROOT, r.toolsFile);
      if (!byFile.has(abs)) byFile.set(abs, []);
      byFile.get(abs)!.push(r);
    }
    for (const [absFile, params] of byFile) {
      const relFile = path.relative(WORKSPACE_ROOT, absFile);
      console.log(`  ${BOLD}${relFile}${RESET}`);
      for (const p of params) {
        if (DRY_RUN) {
          console.log(`    ${YELLOW}~ ${p.param}${RESET}`);
        } else {
          const removed = removeParamFromSource(absFile, p.param);
          console.log(`    ${RED}-${RESET} ${p.param}${removed ? "" : `  ${YELLOW}(regel niet gevonden)${RESET}`}`);
        }
      }
    }
  }

  console.log(
    `\n${BOLD}${accepted.length} geaccepteerd  ` +
    `${toRemove.length > 0 ? RED : ""}${toRemove.length} verwijderd${RESET}  ` +
    `${YELLOW}${warned.length} waarschuwing${RESET}  ` +
    `${DIM}${skipped.length} overgeslagen (5xx)${RESET}\n`
  );

  if (toRemove.length > 0 && !DRY_RUN) {
    console.log(`${DIM}Herbouw na de wijzigingen: pnpm build${RESET}\n`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
