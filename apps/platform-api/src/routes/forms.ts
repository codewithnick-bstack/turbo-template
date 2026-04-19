import { Hono } from "hono";
import { Forms } from "@repo/core";
import { authMiddleware, type AuthEnv } from "../middleware/auth";
import { rateLimit } from "../middleware/rate-limit";
import { buildCtx, getDb } from "../ctx";
import { handleError } from "../lib/errors";

export const formsRoute = new Hono<AuthEnv>()
  // Public form submit — no auth, tenant from tid query param
  .post("/:id/submit", rateLimit({ windowMs: 60_000, max: 10 }), async (c) => {
    try {
      const tid = c.req.query("tid");
      if (!tid) return c.json({ code: "bad_request", message: "tid query param required" }, 400);
      const body = await c.req.json();
      const ip = c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ?? c.req.header("cf-connecting-ip");
      const ua = c.req.header("user-agent");
      const ctx = {
        db: getDb(),
        tenantId: tid,
        actor: { kind: "system" as const, reason: "form-submit" },
        requestId: c.req.header("x-request-id"),
        log: console,
      };
      const result = await Forms.submitForm(ctx, {
        formId: c.req.param("id"),
        data: body,
        ipAddress: ip,
        userAgent: ua,
      });
      return c.json(result, 201);
    } catch (err) { return handleError(err, c); }
  })
  .use("*", authMiddleware)
  .get("/", async (c) => {
    try {
      const siteId = c.req.query("siteId");
      if (!siteId) return c.json({ code: "bad_request", message: "siteId query param required" }, 400);
      const data = await Forms.listForms(buildCtx(c), { siteId });
      return c.json({ data });
    } catch (err) { return handleError(err, c); }
  })
  .post("/", async (c) => {
    try {
      const body = await c.req.json();
      const form = await Forms.createForm(buildCtx(c), body);
      return c.json(form, 201);
    } catch (err) { return handleError(err, c); }
  })
  .get("/:id", async (c) => {
    try {
      const form = await Forms.getForm(buildCtx(c), c.req.param("id"));
      return c.json(form);
    } catch (err) { return handleError(err, c); }
  })
  .delete("/:id", async (c) => {
    try {
      const result = await Forms.deleteForm(buildCtx(c), c.req.param("id"));
      return c.json(result);
    } catch (err) { return handleError(err, c); }
  })
  .get("/:id/submissions", async (c) => {
    try {
      const limit = c.req.query("limit") ? Number(c.req.query("limit")) : undefined;
      const data = await Forms.listFormSubmissions(buildCtx(c), {
        formId: c.req.param("id"),
        limit,
      });
      return c.json({ data });
    } catch (err) { return handleError(err, c); }
  });
