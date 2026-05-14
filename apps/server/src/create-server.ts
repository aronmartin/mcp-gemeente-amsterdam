import { FastMCP } from "fastmcp";
import { registerAmsterdamTools } from "./register-tools.js";

export function createAmsterdamMcpServer(): FastMCP {
  const server = new FastMCP({
    name: "mcp-gemeente-amsterdam",
    version: "0.1.0",
  });
  registerAmsterdamTools(server);
  return server;
}
