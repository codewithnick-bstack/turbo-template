import { Hono } from "hono";
import { Compliance } from "@repo/core";
import { authMiddleware, type AuthEnv } from "../middleware/auth";
import { buildCtx } from "../ctx";
import { handleError } from "../lib/errors";

export const complianceRoute = new Hono<AuthEnv>()
  .use("*", authMiddleware)
  .post("/export", async (c) => {
    try {
      const result = await Compliance.exportTenantData(buildCtx(c));
      return c.json(result);
    } catch (err) { return handleError(err, c); }
  })
  .delete("/tenant", async (c) => {
    try {
      const result = await Compliance.deleteTenantData(buildCtx(c));
      return c.json(result);
    } catch (err) { return handleError(err, c); }
  });
