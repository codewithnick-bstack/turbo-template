import { Hono } from "hono";
import { Analytics } from "@repo/core";
import { authMiddleware, type AuthEnv } from "../middleware/auth";
import { rateLimit } from "../middleware/rate-limit";
import { buildCtx, getDb } from "../ctx";
import { handleError } from "../lib/errors";
import { createLogger } from "@repo/observability";
import { env } from "../env";

const logger = createLogger({ service: "analytics-ingest", env: env.NODE_ENV });

export const analyticsRoute = new Hono<AuthEnv>()
  .post("/events", rateLimit({ windowMs: 60_000, max: 100 }), async (c) => {
    // Public endpoint — tenant identified via query param
    try {
      const tenantId = c.req.query("tid");
      if (!tenantId) return c.json({ code: "bad_request", message: "tid required" }, 400);
      const body = await c.req.json();
      const ctx = {
        db: getDb(),
        logger,
        tenantId,
        actor: { kind: "system" as const, reason: "analytics-ingest" },
        requestId: c.req.header("x-request-id"),
      };
      const result = await Analytics.ingestEvent(ctx, body);
      return c.json(result);
    } catch (err) {
      return handleError(err, c);
    }
  })
  .use("/", authMiddleware)
  .get("/", async (c) => {
    try {
      const ctx = buildCtx(c);
      const result = await Analytics.getAnalytics(ctx, {
        siteId: c.req.query("siteId"),
        days: c.req.query("days"),
      });
      return c.json(result);
    } catch (err) {
      return handleError(err, c);
    }
  });
