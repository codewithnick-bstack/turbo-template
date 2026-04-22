import { Hono } from "hono";
import { Agency } from "@repo/core";
import { authMiddleware, type AuthEnv } from "../middleware/auth";
import { buildCtx } from "../ctx";
import { handleError } from "../lib/errors";

export const agencyRoute = new Hono<AuthEnv>()
  .use("*", authMiddleware)
  .get("/clients", async (c) => {
    try {
      const data = await Agency.listClientWorkspaces(buildCtx(c));
      return c.json({ data });
    } catch (err) { return handleError(err, c); }
  })
  .post("/clients", async (c) => {
    try {
      const client = await Agency.createClientWorkspace(buildCtx(c), await c.req.json());
      return c.json(client, 201);
    } catch (err) { return handleError(err, c); }
  })
  .get("/clients/:clientId", async (c) => {
    try {
      const client = await Agency.getClientWorkspace(buildCtx(c), c.req.param("clientId"));
      return c.json(client);
    } catch (err) { return handleError(err, c); }
  })
  .patch("/clients/:clientId", async (c) => {
    try {
      const client = await Agency.updateClientWorkspace(buildCtx(c), c.req.param("clientId"), await c.req.json());
      return c.json(client);
    } catch (err) { return handleError(err, c); }
  })
  .delete("/clients/:clientId", async (c) => {
    try {
      const result = await Agency.removeClientWorkspace(buildCtx(c), c.req.param("clientId"));
      return c.json(result);
    } catch (err) { return handleError(err, c); }
  });
