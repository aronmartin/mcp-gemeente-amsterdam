import { analyseHotspots } from "./client.js";
import { analyseToolDefinitions } from "./tools.js";

export { analyseToolDefinitions };
export type { BuurtHotspot, HotspotResultaat } from "./client.js";

export async function handleAnalyseTool(
  toolName: string,
  args: Record<string, unknown>
): Promise<unknown> {
  switch (toolName) {
    case "ams_buurt_hotspot_analyse":
      return analyseHotspots({
        dagen: typeof args.dagen === "number" ? args.dagen : undefined,
        stadsdeel: typeof args.stadsdeel === "string" ? args.stadsdeel : undefined,
        top: typeof args.top === "number" ? args.top : undefined,
      });
    default:
      throw new Error(`Onbekende analyse tool: ${toolName}`);
  }
}
