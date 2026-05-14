# mcp-gemeente-amsterdam

> **Note:** This project is not actively maintained. Pull requests and issues are not actively monitored.

MCP server exposing all public APIs from [Gemeente Amsterdam](https://api.data.amsterdam.nl/v1/docs/index.html) to LLMs. Built with [FastMCP](https://github.com/punkpeye/fastmcp) as a Turborepo monorepo.

## Install via .mcpb (recommended)

**[Download mcp-gemeente-amsterdam.mcpb](https://github.com/aronmartin/mcp-gemeente-amsterdam/releases/latest/download/mcp-gemeente-amsterdam.mcpb)**

1. Download the `.mcpb` file using the link above
2. Open it — your MCP client (e.g. Claude Desktop) will handle the installation
3. Enter your API key when prompted (see [API Key](#api-key) below)

## What can you do with this?

Once connected to any MCP-compatible AI assistant, you can ask questions about Amsterdam in plain language. Some examples:

**Buildings & addresses**
- "What year was the building at Keizersgracht 123 constructed?"
- "How many residential units are in this block?"

**Neighbourhoods & areas**
- "Which neighbourhood is the Rijksmuseum in, and what district does it belong to?"
- "Give me an overview of all boroughs in Amsterdam."

**Monuments & heritage**
- "Which monuments are located in the Jordaan?"
- "Is this building a protected city view?"

**Waste & recycling**
- "Where is the nearest glass container to Leidseplein?"
- "When is paper waste collected at this address?"

**Parking & traffic**
- "Where can I park near Centraal Station?"
- "Is my address within a low-emission zone?"

**Permits & events**
- "Which events have a permit in the city centre this month?"
- "Are there active excavation works near this address?"

**Sustainability & energy**
- "Is this street part of a gas-free zone?"
- "What is the energy consumption in this neighbourhood?"

**Property**
- "What is the WOZ value of this address?"
- "Are there known soil contamination reports for this plot?"

## API Key

An API key is required — it's free and takes about a minute to register. Get one at [keys.api.data.amsterdam.nl](https://keys.api.data.amsterdam.nl/clients/v1/) and add it as `AMSTERDAM_API_KEY` in your environment or via the `.mcpb` installer prompt.

## Packages

| Package | APIs | Description |
|---------|------|-------------|
| `@amsterdam-mcp/core` | — | Shared `AmsClient`, types, and tool helpers |
| `@amsterdam-mcp/bag` | `/v1/bag` | Buildings, addresses, residential objects, public spaces |
| `@amsterdam-mcp/gebieden` | `/v1/gebieden` | Districts, neighbourhoods, boroughs, GGW areas |
| `@amsterdam-mcp/groen` | `/v1/bomen` `/v1/ecologie` `/v1/functionele_gebieden` | Trees, ecological zones, parks |
| `@amsterdam-mcp/verkeer` | `/v1/parkeervakken` `/v1/milieuzones` `/v1/wegenbestand` etc. | Parking, environmental zones, roads, cycling |
| `@amsterdam-mcp/afval` | `/v1/huishoudelijkafval` `/v1/afvalwijzer` `/v1/recyclepunten` | Waste containers, collection schedule, recycling points |
| `@amsterdam-mcp/bodem` | `/v1/bodem` `/v1/explosieven` `/v1/leidingeninfrastructuur` etc. | Soil research, WWII explosives, pipelines |
| `@amsterdam-mcp/erfgoed` | `/v1/monumenten` `/v1/beschermdestadsdorpsgezichten` `/v1/amsterdam_canon` | Monuments, protected city views, Amsterdam canon |
| `@amsterdam-mcp/duurzaamheid` | `/v1/aardgasvrijezones` `/v1/duurzaamheid` `/v1/energieverbruik_mra` | Gas-free zones, sustainability, energy consumption |
| `@amsterdam-mcp/vastgoed` | `/v1/woz` `/v1/funderingen` `/v1/gemeentelijk_vastgoed` etc. | WOZ valuations, foundations, municipal property |
| `@amsterdam-mcp/openbare-ruimte` | `/v1/bgt` `/v1/nap` `/v1/meetbouten` `/v1/civieleconstructies` etc. | BGT, NAP benchmarks, bridges, fire hydrants |
| `@amsterdam-mcp/veiligheid` | `/v1/risicozones` `/v1/geluidszones` `/v1/overlastgebieden` etc. | Risk zones, noise zones, nuisance areas |
| `@amsterdam-mcp/vergunningen` | `/v1/vergunningen` `/v1/evenementen` `/v1/horeca` `/v1/bedrijveninvesteringszones` | Permits, events, hospitality, BIZ |
| `@amsterdam-mcp/sport-voorzieningen` | `/v1/sport` `/v1/maatschappelijke_voorzieningen` `/v1/schoolgebouwen` | Sports, social facilities, schools |
| `@amsterdam-mcp/statistieken` | `/v1/bbga` `/v1/statistieken` `/v1/indicatoren` | BBGA key figures, statistics per area |
| `@amsterdam-mcp/water` | `/v1/water` `/v1/varen` | Water objects, waterways |
| `@amsterdam-mcp/wior` | `/v1/wior` `/v1/storingsmeldingen_ovl_en_klokken` `/v1/stroomstoringen` | Excavation works, public lighting outages |
| `@amsterdam-mcp/winkelgebieden` | `/v1/winkelgebieden` `/v1/negenstraatjes` `/v1/benkagg` | Shopping areas, Negen Straatjes |
| `@amsterdam-mcp/meldingen` | `/v1/meldingen` | Public space incident reports |
| `@amsterdam-mcp/verkiezingen` | `/v1/verkiezingen` | Elections and polling stations |

## Building locally

```bash
pnpm install
pnpm mcpb
# → mcp-gemeente-amsterdam.mcpb
```

## Connect to Claude Desktop (stdio)

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "amsterdam": {
      "command": "node",
      "args": ["/path/to/mcp-gemeente-amsterdam/apps/server/dist/index.js"],
      "env": {
        "AMSTERDAM_API_KEY": "your-api-key"
      }
    }
  }
}
```

## Connect to Claude Code

```bash
claude mcp add amsterdam node /path/to/mcp-gemeente-amsterdam/apps/server/dist/index.js
```

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm build` | Compiles all TypeScript packages |
| `pnpm bundle` | Bundles the server to `dist/ncc/` (ncc, standalone) |
| `pnpm mcpb` | `build` + `bundle` + `mcpb pack` → `mcp-gemeente-amsterdam.mcpb` |
| `pnpm dev` | Starts all packages in watch mode |
| `pnpm release` | Interactive version bump and release |

## Adding a new package

1. Create `packages/<name>/` with `src/client.ts`, `src/tools.ts`, and `src/index.ts`
2. Use `AmsClient` from `@amsterdam-mcp/core` for API calls
3. Export `xxxToolDefinitions` and `handleXxxTool`
4. Add the package as a dependency in `apps/server/package.json`
5. Import and register the bundle in `apps/server/src/register-tools.ts`

## Creating a release

Push a version tag to trigger an automated release:

```bash
pnpm release
```

Or manually:

```bash
git tag v1.0.0
git push origin v1.0.0
```

GitHub Actions will build the `.mcpb` and upload it as a release asset.
