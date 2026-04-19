import { Hono } from "hono";
import { authMiddleware, type AuthEnv } from "../middleware/auth";
import { buildCtx, getDb } from "../ctx";
import { handleError } from "../lib/errors";
import { schema } from "@repo/db";
import { desc, eq, and, gte } from "drizzle-orm";

export const auditRoute = new Hono<AuthEnv>()
  .use("*", authMiddleware)
  .get("/", async (c) => {
    try {
      const ctx = buildCtx(c);
      const limit = Math.min(Number(c.req.query("limit") ?? "50"), 200);
      const offset = Number(c.req.query("offset") ?? "0");
      const resourceKind = c.req.query("resourceKind");
      const since = c.req.query("since");

      const db = getDb();
      const conditions = [eq(schema.auditLog.tenantId, ctx.tenantId)];
      if (resourceKind) conditions.push(eq(schema.auditLog.resourceKind, resourceKind));
      if (since) conditions.push(gte(schema.auditLog.createdAt, new Date(since)));

      const rows = await db
        .select()
        .from(schema.auditLog)
        .where(and(...conditions))
        .orderBy(desc(schema.auditLog.createdAt))
        .limit(limit)
        .offset(offset);

      return c.json({ data: rows, limit, offset });
    } catch (err) {
      return handleError(err, c);
    }
  });
