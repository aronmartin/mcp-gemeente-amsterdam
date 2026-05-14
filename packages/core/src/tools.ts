export type PropSchema = {
  type: string;
  description?: string;
  items?: { type: string };
  enum?: string[];
};

export type ToolDef = {
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, PropSchema>;
    required?: readonly string[];
  };
};

/** Bouw een standaard list-tool definitie voor een DSO collectie */
export function listTool(opts: {
  name: string;
  description: string;
  extraProps?: Record<string, PropSchema>;
  required?: readonly string[];
}): ToolDef {
  return {
    name: opts.name,
    description: opts.description,
    parameters: {
      type: "object",
      properties: {
        page: { type: "number", description: "Paginanummer (standaard 1)" },
        page_size: { type: "number", description: "Resultaten per pagina (standaard 20, max 1000)" },
        _sort: { type: "string", description: "Sorteerveld, prefix met - voor aflopend" },
        detail: {
          type: "string",
          enum: ["minimal", "default", "full"],
          description: "Responsprofiel: minimal=kernvelden, default=standaard (aanbevolen), full=alles inclusief geometrie. Gebruik full alleen als geometrie of alle velden expliciet nodig zijn.",
        },
        fields: {
          type: "string",
          description: "Komma-gescheiden extra velden of overschrijvingen, bv. 'geometrie,_links.betreftBagPand'. Wint altijd van detail.",
        },
        ...opts.extraProps,
      },
      required: opts.required ?? ([] as const),
    },
  };
}

/** Bouw een standaard get-by-id tool definitie */
export function getTool(opts: {
  name: string;
  description: string;
  idProp?: string;
  idDescription?: string;
}): ToolDef {
  const idProp = opts.idProp ?? "id";
  return {
    name: opts.name,
    description: opts.description,
    parameters: {
      type: "object",
      properties: {
        [idProp]: {
          type: "string",
          description: opts.idDescription ?? `Uniek ID`,
        },
      },
      required: [idProp] as const,
    },
  };
}

export type ToolHandler = (
  toolName: string,
  args: Record<string, unknown>
) => Promise<unknown>;

/** Maak een dispatcher die tool-naam afbeeldt op een handler-map */
export function makeDispatcher(
  prefix: string,
  handlers: Record<string, (args: Record<string, unknown>) => Promise<unknown>>
): ToolHandler {
  return async (toolName, args) => {
    const fn = handlers[toolName];
    if (!fn) throw new Error(`Onbekende tool: ${toolName}`);
    return fn(args);
  };
}
