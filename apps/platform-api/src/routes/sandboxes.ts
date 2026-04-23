import { Hono } from "hono";
import { Sandboxes } from "@repo/core";
import { authMiddleware, type AuthEnv } from "../middleware/auth";
import { buildCtx } from "../ctx";
import { handleError } from "../lib/errors";

export const sandboxesRoute = new Hono<AuthEnv>()
  .use("*", authMiddleware)
  .get("/", async (c) => {
    try {
      const siteId = c.req.query("siteId");
      if (!siteId) return c.json({ error: "siteId is required" }, 400);
      const data = await Sandboxes.listSandboxes(buildCtx(c), { siteId });
      return c.json(data);
    } catch (err) { return handleError(err, c); }
  })
  .post("/", async (c) => {
    try {
      const sandbox = await Sandboxes.createSandbox(buildCtx(c), await c.req.json());
      return c.json(sandbox, 201);
    } catch (err) { return handleError(err, c); }
  })
  .get("/:sandboxId", async (c) => {
    try {
      const sandbox = await Sandboxes.getSandbox(buildCtx(c), c.req.param("sandboxId"));
      return c.json(sandbox);
    } catch (err) { return handleError(err, c); }
  })
  .post("/:sandboxId/promote", async (c) => {
    try {
      const sandbox = await Sandboxes.promoteSandbox(buildCtx(c), c.req.param("sandboxId"));
      return c.json(sandbox);
    } catch (err) { return handleError(err, c); }
  })
  .delete("/:sandboxId", async (c) => {
    try {
      const result = await Sandboxes.deleteSandbox(buildCtx(c), c.req.param("sandboxId"));
      return c.json(result);
    } catch (err) { return handleError(err, c); }
  });
