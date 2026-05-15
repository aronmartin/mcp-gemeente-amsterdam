import { listTool, type ToolDef } from "@amsterdam-mcp/core";
import { ENDPOINT_SCHEMAS } from "@amsterdam-mcp/aggregatie";

export const winkelgebiedenToolDefinitions: readonly ToolDef[] = [
  listTool({
    name: "ams_winkelgebieden_list",
    endpoint: "winkelgebieden/winkelgebieden",
    schema: ENDPOINT_SCHEMAS["winkelgebieden/winkelgebieden"],
    description: "Geeft Amsterdamse winkelgebieden terug (aangewezen winkelstraten en -gebieden) op naam of categorie.",
    extraProps: {
      gebiedsnaam: { type: "string", description: "Naam van het winkelgebied" },
      categorienaam: { type: "string", description: "Categorie van het winkelgebied" },
    },
  }),
] as const;
