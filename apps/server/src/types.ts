export type JsonSchemaProp = {
  type: string;
  description?: string;
  items?: { type: string };
  additionalProperties?: { type: string };
};
