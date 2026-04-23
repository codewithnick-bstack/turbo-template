import { Hono } from "hono";
import { Analytics } from "@repo/core";
import { authMiddleware, type AuthEnv } from "../middleware/auth";
import { rateLimit } from "../middleware/rate-limit";
import { buildCtx, getDb } from "../ctx";
import { handleError } from "../lib/errors";
import { createLogger } from "@repo/observability";
import { env } from "../env";

const logger = createLogger({ service: "experiments", env: env.NODE_ENV });

export const experimentsRoute = new Hono<AuthEnv>()
  .use("/*", authMiddleware)
  .post("/", async (c) => {
    try {
      const result = await Analytics.createExperiment(buildCtx(c), await c.req.json());
      return c.json(result, 201);
    } catch (err) { return handleError(err, c); }
  })
  .get("/", async (c) => {
    try {
      const result = await Analytics.listExperiments(buildCtx(c), { siteId: c.req.query("siteId") });
      return c.json(result);
    } catch (err) { return handleError(err, c); }
  })
  .get("/:id/results", async (c) => {
    try {
      const result = await Analytics.getExperimentResults(buildCtx(c), c.req.param("id"));
      return c.json(result);
    } catch (err) { return handleError(err, c); }
  })
  .get("/:id/variant", rateLimit({ windowMs: 60_000, max: 200 }), async (c) => {
    // Semi-public: reads variant assignment for a session
    try {
      const tenantId = c.req.query("tid") ?? (c as unknown as { get: (k: string) => string }).get("tenantId");
      if (!tenantId) return c.json({ code: "bad_request", message: "tid required" }, 400);
      const ctx = {
        db: getDb(),
        logger,
        tenantId,
        actor: { kind: "system" as const, reason: "experiment-variant" },
        requestId: c.req.header("x-request-id"),
      };
      const result = await Analytics.getVariant(ctx, c.req.param("id"), {
        sessionId: c.req.query("sessionId"),
        visitorId: c.req.query("visitorId"),
      });
      return c.json(result);
    } catch (err) { return handleError(err, c); }
  })
  .post("/:id/convert", rateLimit({ windowMs: 60_000, max: 200 }), async (c) => {
    // Semi-public: record conversion
    try {
      const tenantId = c.req.query("tid") ?? (c as unknown as { get: (k: string) => string }).get("tenantId");
      if (!tenantId) return c.json({ code: "bad_request", message: "tid required" }, 400);
      const ctx = {
        db: getDb(),
        logger,
        tenantId,
        actor: { kind: "system" as const, reason: "experiment-conversion" },
        requestId: c.req.header("x-request-id"),
      };
      const result = await Analytics.recordConversion(ctx, c.req.param("id"), await c.req.json());
      return c.json(result);
    } catch (err) { return handleError(err, c); }
  });
