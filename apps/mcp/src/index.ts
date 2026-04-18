import { serve } from "@hono/node-server";
import { env } from "./env";
import { buildMcpServer } from "./server";

const app = buildMcpServer();
serve({ fetch: app.fetch, port: env.PORT }, ({ port }) => {
  console.log(`mcp listening on :${port} (${env.NODE_ENV})`);
});
