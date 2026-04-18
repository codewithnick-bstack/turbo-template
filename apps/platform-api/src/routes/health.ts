import { Hono } from "hono";
import { env } from "../env";

export const healthRoute = new Hono().get("/", (c) =>
  c.json({
    ok: true,
    service: "platform-api",
    env: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  }),
);
