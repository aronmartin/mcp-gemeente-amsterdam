import { z } from "zod";
import type { JsonSchemaProp } from "./types.js";

function propToBaseZod(prop: JsonSchemaProp): z.ZodTypeAny {
  const baseSchema =
    prop.type === "string"
      ? z.string()
      : prop.type === "number"
        ? z.number()
        : prop.type === "array"
          ? z.array(z.string())
          : z.unknown();

  return prop.description ? baseSchema.describe(prop.description) : baseSchema;
}

export function buildZodSchema(
  properties: Record<string, JsonSchemaProp>,
  required: string[],
): z.ZodObject<Record<string, z.ZodTypeAny>> {
  const requiredSet = new Set(required);

  const shape = Object.fromEntries(
    Object.entries(properties).map(([key, prop]) => {
      const fieldSchema = propToBaseZod(prop);
      const withOptionality = requiredSet.has(key) ? fieldSchema : fieldSchema.optional();
      return [key, withOptionality] as const;
    }),
  );

  return z.object(shape as Record<string, z.ZodTypeAny>);
}
