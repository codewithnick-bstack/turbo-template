import { serve } from "@hono/node-server";
import { env } from "./env";
import { buildServer } from "./server";

const app = buildServer();

serve({ fetch: app.fetch, port: env.PORT }, ({ port }) => {
  console.log(`platform-api listening on :${port} (${env.NODE_ENV})`);
});
