import { Hono } from "hono";
import { ApiKeys } from "@repo/core";
import { authMiddleware, type AuthEnv } from "../middleware/auth";
import { buildCtx } from "../ctx";
import { handleError } from "../lib/errors";

export const apiKeysRoute = new Hono<AuthEnv>()
  .use("*", authMiddleware)
  .get("/", async (c) => {
    try {
      const data = await ApiKeys.listApiKeys(buildCtx(c));
      return c.json({ data });
    } catch (err) { return handleError(err, c); }
  })
  .post("/", async (c) => {
    try {
      const body = await c.req.json();
      const key = await ApiKeys.createApiKey(buildCtx(c), body);
      return c.json(key, 201);
    } catch (err) { return handleError(err, c); }
  })
  .delete("/:id", async (c) => {
    try {
      const result = await ApiKeys.revokeApiKey(buildCtx(c), c.req.param("id"));
      return c.json(result);
    } catch (err) { return handleError(err, c); }
  });
