import { Hono } from "hono";
import { createPostgresSearchIndex } from "@repo/search";
import { authMiddleware, type AuthEnv } from "../middleware/auth";
import { buildCtx } from "../ctx";
import { handleError } from "../lib/errors";

export const searchRoute = new Hono<AuthEnv>()
  .use("*", authMiddleware)
  .get("/", async (c) => {
    try {
      const q = c.req.query("q");
      if (!q) return c.json({ code: "bad_request", message: "q query param required" }, 400);
      const limit = c.req.query("limit") ? Number(c.req.query("limit")) : 20;
      const ctx = buildCtx(c);
      const index = createPostgresSearchIndex(ctx.db);
      const hits = await index.query({ tenantId: ctx.tenantId, query: q, limit });
      return c.json({ data: hits });
    } catch (err) { return handleError(err, c); }
  });
