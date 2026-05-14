import { createAmsterdamMcpServer } from "./create-server.js";
import { startServerTransport } from "./start-transport.js";

(async () => {
  const server = createAmsterdamMcpServer();
  await startServerTransport(server);
})().catch(console.error);
