import { Hono } from "hono";
import { createPostgresSearchIndex } from "@repo/search";
import { rateLimit } from "../middleware/rate-limit";
import { getDb } from "../ctx";
import { handleError } from "../lib/errors";

// Public search endpoint — tenantId from tid query param or x-tenant-id header.
// Used by the web renderer's SearchBlock and admin (admin passes auth headers instead).
export const searchRoute = new Hono()
  .get("/", rateLimit({ windowMs: 60_000, max: 60 }), async (c) => {
    try {
      const tenantId = c.req.query("tid") ?? c.req.header("x-tenant-id");
      if (!tenantId) return c.json({ code: "bad_request", message: "tid query param or x-tenant-id header required" }, 400);
      const q = c.req.query("q");
      if (!q) return c.json({ code: "bad_request", message: "q query param required" }, 400);
      const limit = c.req.query("limit") ? Number(c.req.query("limit")) : 20;
      const index = createPostgresSearchIndex(getDb());
      const hits = await index.query({ tenantId, query: q, limit });
      return c.json({ data: hits });
    } catch (err) { return handleError(err, c); }
  });
