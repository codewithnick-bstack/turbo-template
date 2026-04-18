import { Hono } from "hono";
import * as Branding from "@repo/core/branding";
import { authMiddleware, type AuthEnv } from "../middleware/auth";
import { buildCtx } from "../ctx";
import { handleError } from "../lib/errors";

export const brandingRoute = new Hono<AuthEnv>()
  .use("*", authMiddleware)
  .get("/", async (c) => {
    try {
      const result = await Branding.getBranding(buildCtx(c));
      return c.json(result);
    } catch (err) { return handleError(err, c); }
  })
  .patch("/", async (c) => {
    try {
      const result = await Branding.updateBranding(buildCtx(c), await c.req.json());
      return c.json(result);
    } catch (err) { return handleError(err, c); }
  });
