import type { FastMCP } from "fastmcp";

type TransportKind = "stdio" | "http";

function resolveTransport(): TransportKind {
  const raw = process.env.TRANSPORT ?? "stdio";
  return raw === "http" ? "http" : "stdio";
}

export async function startServerTransport(server: FastMCP): Promise<void> {
  const transport = resolveTransport();

  if (transport !== "http") {
    await server.start({ transportType: "stdio" });
    return;
  }

  const port = Number(process.env.PORT ?? 3000);

  await server.start({
    transportType: "httpStream",
    httpStream: { port },
  });

  console.error(`mcp-nl server draait op http://localhost:${port}/mcp`);
}
