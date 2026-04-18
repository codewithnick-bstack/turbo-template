import { Hono } from "hono";
import * as Templates from "@repo/core/templates";
import { authMiddleware, type AuthEnv } from "../middleware/auth";
import { buildCtx } from "../ctx";
import { handleError } from "../lib/errors";

export const templatesRoute = new Hono<AuthEnv>()
  .get("/", async (c) => {
    try {
      const ctx = buildCtx(c);
      const category = c.req.query("category");
      const limit = c.req.query("limit") ? Number(c.req.query("limit")) : 50;
      const result = await Templates.listTemplates(ctx, { category, limit });
      return c.json({ data: result });
    } catch (err) { return handleError(err, c); }
  })
  .get("/:id", async (c) => {
    try {
      const result = await Templates.getTemplate(buildCtx(c), c.req.param("id"));
      return c.json(result);
    } catch (err) { return handleError(err, c); }
  })
  .post("/", authMiddleware, async (c) => {
    try {
      const result = await Templates.createTemplate(buildCtx(c), await c.req.json());
      return c.json(result, 201);
    } catch (err) { return handleError(err, c); }
  })
  .post("/:id/use", authMiddleware, async (c) => {
    try {
      const result = await Templates.useTemplate(buildCtx(c), c.req.param("id"), await c.req.json());
      return c.json(result, 201);
    } catch (err) { return handleError(err, c); }
  });
