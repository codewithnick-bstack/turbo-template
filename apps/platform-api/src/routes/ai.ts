import { Hono } from "hono";
import * as AI from "@repo/core/ai";
import { authMiddleware, type AuthEnv } from "../middleware/auth";
import { rateLimit } from "../middleware/rate-limit";
import { buildCtx, getDb } from "../ctx";
import { handleError } from "../lib/errors";

export const aiRoute = new Hono<AuthEnv>()
  .post("/chat", authMiddleware, async (c) => {
    try {
      const result = await AI.chat(buildCtx(c), await c.req.json());
      return c.json(result);
    } catch (err) { return handleError(err, c); }
  })
  .post("/generate/blog-post", authMiddleware, async (c) => {
    try {
      const result = await AI.generateBlogPost(buildCtx(c), await c.req.json());
      return c.json(result);
    } catch (err) { return handleError(err, c); }
  })
  .post("/generate/section-copy", authMiddleware, async (c) => {
    try {
      const result = await AI.generateSectionCopy(buildCtx(c), await c.req.json());
      return c.json(result);
    } catch (err) { return handleError(err, c); }
  })
  .post("/generate/alt-text", authMiddleware, async (c) => {
    try {
      const result = await AI.generateAltText(buildCtx(c), await c.req.json());
      return c.json(result);
    } catch (err) { return handleError(err, c); }
  })
  .post("/seo/audit", authMiddleware, async (c) => {
    try {
      const result = await AI.seoAudit(buildCtx(c), await c.req.json());
      return c.json(result);
    } catch (err) { return handleError(err, c); }
  })
  .post("/seo/generate-meta", authMiddleware, async (c) => {
    try {
      const result = await AI.seoGenerateMeta(buildCtx(c), await c.req.json());
      return c.json(result);
    } catch (err) { return handleError(err, c); }
  })
  .post("/chatbot", rateLimit({ windowMs: 60_000, max: 20 }), async (c) => {
    try {
      const tid = c.req.query("tid");
      if (!tid) return c.json({ code: "bad_request", message: "tid required" }, 400);
      const ctx = {
        db: getDb(),
        tenantId: tid,
        actor: { kind: "system" as const, reason: "chatbot" },
        requestId: crypto.randomUUID(),
        log: console,
      };
      const result = await AI.chatbot(ctx, await c.req.json());
      return c.json(result);
    } catch (err) { return handleError(err, c); }
  });
