import { Hono } from "hono";
import { Sites } from "@repo/core";
import { authMiddleware, type AuthEnv } from "../middleware/auth";
import { buildCtx } from "../ctx";
import { handleError } from "../lib/errors";

export const sitesRoute = new Hono<AuthEnv>()
  .use("*", authMiddleware)
  .get("/by-hostname", async (c) => {
    try {
      const hostname = c.req.query("hostname");
      if (!hostname) return c.json({ code: "bad_request", message: "hostname query param required" }, 400);
      const site = await Sites.getSiteByDomain(buildCtx(c), hostname);
      if (!site) return c.json({ code: "not_found", message: `no site for hostname: ${hostname}` }, 404);
      return c.json(site);
    } catch (err) { return handleError(err, c); }
  })
  .get("/", async (c) => {
    try {
      const data = await Sites.listSites(buildCtx(c));
      return c.json({ data });
    } catch (err) { return handleError(err, c); }
  })
  .post("/", async (c) => {
    try {
      const body = await c.req.json();
      const site = await Sites.createSite(buildCtx(c), body);
      return c.json(site, 201);
    } catch (err) { return handleError(err, c); }
  })
  .get("/:id", async (c) => {
    try {
      const site = await Sites.getSite(buildCtx(c), c.req.param("id"));
      return c.json(site);
    } catch (err) { return handleError(err, c); }
  })
  .patch("/:id", async (c) => {
    try {
      const body = await c.req.json();
      const site = await Sites.updateSite(buildCtx(c), { ...body, id: c.req.param("id") });
      return c.json(site);
    } catch (err) { return handleError(err, c); }
  })
  .delete("/:id", async (c) => {
    try {
      const result = await Sites.deleteSite(buildCtx(c), c.req.param("id"));
      return c.json(result);
    } catch (err) { return handleError(err, c); }
  })
  .post("/:id/domain", async (c) => {
    try {
      const { hostname } = await c.req.json<{ hostname: string }>();
      const result = await Sites.bindDomain(buildCtx(c), { siteId: c.req.param("id"), hostname });
      return c.json(result, 201);
    } catch (err) { return handleError(err, c); }
  });
