import { Hono } from "hono";
import { Content } from "@repo/core";
import { authMiddleware, type AuthEnv } from "../middleware/auth";
import { buildCtx } from "../ctx";
import { handleError } from "../lib/errors";

export const collectionsRoute = new Hono<AuthEnv>()
  .use("*", authMiddleware)
  .get("/", async (c) => {
    try {
      const siteId = c.req.query("siteId");
      if (!siteId) return c.json({ code: "bad_request", message: "siteId query param required" }, 400);
      const data = await Content.listCollections(buildCtx(c), { siteId });
      return c.json({ data });
    } catch (err) { return handleError(err, c); }
  })
  .post("/", async (c) => {
    try {
      const body = await c.req.json();
      const collection = await Content.createCollection(buildCtx(c), body);
      return c.json(collection, 201);
    } catch (err) { return handleError(err, c); }
  });

export const entriesRoute = new Hono<AuthEnv>()
  .use("*", authMiddleware)
  .get("/", async (c) => {
    try {
      const collectionId = c.req.query("collectionId");
      if (!collectionId) return c.json({ code: "bad_request", message: "collectionId query param required" }, 400);
      const status = c.req.query("status") as "draft" | "published" | undefined;
      const data = await Content.listEntries(buildCtx(c), { collectionId, status });
      return c.json({ data });
    } catch (err) { return handleError(err, c); }
  })
  .post("/", async (c) => {
    try {
      const body = await c.req.json();
      const entry = await Content.createEntry(buildCtx(c), body);
      return c.json(entry, 201);
    } catch (err) { return handleError(err, c); }
  });
