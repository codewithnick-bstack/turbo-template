import { Hono } from "hono";
import { Tenants } from "@repo/core";
import { authMiddleware, type AuthEnv } from "../middleware/auth";
import { buildCtx } from "../ctx";
import { handleError } from "../lib/errors";

export const tenantsRoute = new Hono<AuthEnv>()
  .use("*", authMiddleware)
  .get("/current", async (c) => {
    try {
      const tenant = await Tenants.getTenant(buildCtx(c));
      return c.json(tenant);
    } catch (err) { return handleError(err, c); }
  })
  .get("/current/children", async (c) => {
    try {
      const data = await Tenants.listChildTenants(buildCtx(c));
      return c.json({ data });
    } catch (err) { return handleError(err, c); }
  })
  .post("/", async (c) => {
    try {
      const body = await c.req.json();
      const tenant = await Tenants.createTenant(buildCtx(c), body);
      return c.json(tenant, 201);
    } catch (err) { return handleError(err, c); }
  });
