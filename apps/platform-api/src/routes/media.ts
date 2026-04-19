import { Hono } from "hono";
import { Media } from "@repo/core";
import { authMiddleware, type AuthEnv } from "../middleware/auth";
import { buildCtx } from "../ctx";
import { handleError } from "../lib/errors";

export const mediaRoute = new Hono<AuthEnv>()
  .use("*", authMiddleware)
  .get("/", async (c) => {
    try {
      const siteId = c.req.query("siteId");
      const limit = c.req.query("limit") ? Number(c.req.query("limit")) : undefined;
      const data = await Media.listMedia(buildCtx(c), { siteId, limit });
      return c.json({ data });
    } catch (err) { return handleError(err, c); }
  })
  .post("/presign", async (c) => {
    try {
      const body = await c.req.json();
      const result = await Media.presignUpload(buildCtx(c), body);
      return c.json(result);
    } catch (err) { return handleError(err, c); }
  })
  .post("/finalize", async (c) => {
    try {
      const body = await c.req.json();
      const media = await Media.finalizeMedia(buildCtx(c), body);
      return c.json(media, 201);
    } catch (err) { return handleError(err, c); }
  })
  .delete("/:id", async (c) => {
    try {
      const result = await Media.deleteMedia(buildCtx(c), c.req.param("id"));
      return c.json(result);
    } catch (err) { return handleError(err, c); }
  });
