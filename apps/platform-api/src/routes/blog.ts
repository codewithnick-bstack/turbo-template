import { Hono } from "hono";
import { Blog } from "@repo/core";
import { authMiddleware, type AuthEnv } from "../middleware/auth";
import { buildCtx } from "../ctx";
import { handleError } from "../lib/errors";

export const blogRoute = new Hono<AuthEnv>()
  .use("*", authMiddleware)
  .get("/posts", async (c) => {
    try {
      const siteId = c.req.query("siteId");
      if (!siteId) return c.json({ code: "bad_request", message: "siteId required" }, 400);
      const posts = await Blog.listPosts(buildCtx(c), {
        siteId,
        status: c.req.query("status"),
        limit: Number(c.req.query("limit") ?? 50),
      });
      return c.json({ data: posts });
    } catch (err) {
      return handleError(err, c);
    }
  })
  .post("/posts", async (c) => {
    try {
      const body = await c.req.json();
      const post = await Blog.createPost(buildCtx(c), body);
      return c.json(post, 201);
    } catch (err) {
      return handleError(err, c);
    }
  })
  .get("/posts/:id", async (c) => {
    try {
      const post = await Blog.getPost(buildCtx(c), c.req.param("id"));
      return c.json(post);
    } catch (err) {
      return handleError(err, c);
    }
  })
  .patch("/posts/:id", async (c) => {
    try {
      const body = await c.req.json();
      const post = await Blog.updatePost(buildCtx(c), c.req.param("id"), body);
      return c.json(post);
    } catch (err) {
      return handleError(err, c);
    }
  })
  .post("/posts/:id/publish", async (c) => {
    try {
      const post = await Blog.publishPost(buildCtx(c), c.req.param("id"));
      return c.json(post);
    } catch (err) {
      return handleError(err, c);
    }
  })
  .delete("/posts/:id", async (c) => {
    try {
      const result = await Blog.deletePost(buildCtx(c), c.req.param("id"));
      return c.json(result);
    } catch (err) {
      return handleError(err, c);
    }
  });
