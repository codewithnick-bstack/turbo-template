import { Hono } from "hono";
import { OAuth } from "@repo/core";
import { authMiddleware, type AuthEnv } from "../middleware/auth";
import { buildCtx } from "../ctx";
import { handleError } from "../lib/errors";

export const oauthRoute = new Hono<AuthEnv>()
  .use("*", authMiddleware)
  .get("/apps", async (c) => {
    try {
      const data = await OAuth.listOAuthApps(buildCtx(c));
      return c.json({ data });
    } catch (err) { return handleError(err, c); }
  })
  .post("/apps", async (c) => {
    try {
      const app = await OAuth.createOAuthApp(buildCtx(c), await c.req.json());
      return c.json(app, 201);
    } catch (err) { return handleError(err, c); }
  })
  .get("/apps/:appId", async (c) => {
    try {
      const app = await OAuth.getOAuthApp(buildCtx(c), c.req.param("appId"));
      return c.json(app);
    } catch (err) { return handleError(err, c); }
  })
  .delete("/apps/:appId", async (c) => {
    try {
      const result = await OAuth.deleteOAuthApp(buildCtx(c), c.req.param("appId"));
      return c.json(result);
    } catch (err) { return handleError(err, c); }
  })
  .post("/apps/:appId/rotate-secret", async (c) => {
    try {
      const result = await OAuth.rotateOAuthSecret(buildCtx(c), c.req.param("appId"));
      return c.json(result);
    } catch (err) { return handleError(err, c); }
  });
