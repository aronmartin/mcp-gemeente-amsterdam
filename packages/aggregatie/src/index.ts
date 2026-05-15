import { getSchema, aggregate } from "./client.js";
import { aggregatieToolDefinitions } from "./tools.js";

export { aggregatieToolDefinitions };
export type { SchemaResult, AggregateParams } from "./client.js";

export async function handleAggregatieTool(
  toolName: string,
  args: Record<string, unknown>
): Promise<unknown> {
  switch (toolName) {
    case "ams_get_schema":
      return getSchema({ endpoint: args.endpoint as string });

    case "ams_aggregate": {
      const { endpoint, groupBy, sum, avg, count, filter, limit, ...legacyFilter } = args;
      // Merge explicit filter object with any legacy extra params voor backwards-compat
      const mergedFilter = {
        ...(legacyFilter as Record<string, unknown>),
        ...(filter && typeof filter === "object" && !Array.isArray(filter)
          ? (filter as Record<string, unknown>)
          : {}),
      };
      return aggregate({
        endpoint: endpoint as string,
        groupBy: typeof groupBy === "string" ? groupBy : undefined,
        sum: Array.isArray(sum) ? (sum as string[]) : undefined,
        avg: Array.isArray(avg) ? (avg as string[]) : undefined,
        count: count === "true" || count === true,
        filter: mergedFilter,
        limit: typeof limit === "number" ? limit : undefined,
      });
    }

    default:
      throw new Error(`Onbekende aggregatie tool: ${toolName}`);
  }
}
