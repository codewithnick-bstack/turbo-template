import { Hono } from "hono";
import { Webhooks } from "@repo/core";
import { authMiddleware, type AuthEnv } from "../middleware/auth";
import { buildCtx } from "../ctx";
import { handleError } from "../lib/errors";

export const webhooksRoute = new Hono<AuthEnv>()
  .use("*", authMiddleware)
  .get("/subscriptions", async (c) => {
    try {
      const data = await Webhooks.listWebhooks(buildCtx(c));
      return c.json({ data });
    } catch (err) { return handleError(err, c); }
  })
  .post("/subscriptions", async (c) => {
    try {
      const body = await c.req.json();
      const sub = await Webhooks.subscribeWebhook(buildCtx(c), body);
      return c.json(sub, 201);
    } catch (err) { return handleError(err, c); }
  })
  .get("/deliveries", async (c) => {
    try {
      const limit = c.req.query("limit") ? Number(c.req.query("limit")) : undefined;
      const data = await Webhooks.listDeliveries(buildCtx(c), { limit });
      return c.json({ data });
    } catch (err) { return handleError(err, c); }
  })
  .delete("/subscriptions/:id", async (c) => {
    try {
      const result = await Webhooks.unsubscribeWebhook(buildCtx(c), c.req.param("id"));
      return c.json(result);
    } catch (err) { return handleError(err, c); }
  })
  .post("/replay", async (c) => {
    try {
      const body = await c.req.json();
      const result = await Webhooks.replayWebhook(buildCtx(c), body);
      return c.json(result);
    } catch (err) { return handleError(err, c); }
  });
