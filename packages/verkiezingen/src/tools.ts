import { listTool, type ToolDef } from "@amsterdam-mcp/core";

export const verkiezingenToolDefinitions: readonly ToolDef[] = [
  listTool({
    name: "ams_verkiezingen_list",
    description: "Geeft processen-verbaal van verkiezingen terug.",
    extraProps: {
      verkiezingsjaar: { type: "number", description: "Jaar van de verkiezing" },
    },
  }),
] as const;
