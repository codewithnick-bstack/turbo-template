import { Router } from "express";
import type { RequestHandler } from "express";
import rateLimit from "express-rate-limit";
import type { Db } from "@repo/db";
import { CreateBlogPostSchema, UpdateBlogPostSchema } from "../schemas/blog";
import * as blogService from "../services/blog";
import { parsePaginationParams } from "../lib/utils";

const writeRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { code: "rate_limited", message: "Too many requests, please try again later." },
});

export function createBlogRouter(db: Db, authGuard: RequestHandler) {
  const router = Router();

  // Public read routes
  router.get("/", async (req, res) => {
    const search = typeof req.query.search === "string" && req.query.search.trim() ? req.query.search.trim() : undefined;
    const posts = await blogService.listBlogPosts(db, search ? { search } : {});
    if (!search) res.set("Cache-Control", "public, max-age=300, stale-while-revalidate=86400");
    res.json(posts);
  });

  router.get("/:slug", async (req, res) => {
    const post = await blogService.getBlogPostBySlug(db, String(req.params.slug));
    res.set("Cache-Control", "public, max-age=3600, stale-while-revalidate=604800");
    res.json(post);
  });

  // Auth-gated read (includes drafts)
  router.get("/admin/all", authGuard, async (req, res) => {
    const { limit, offset } = parsePaginationParams(req.query as Record<string, unknown>);
    const posts = await blogService.listBlogPosts(db, { includeAll: true, limit, offset });
    res.json(posts);
  });

  router.post("/", authGuard, writeRateLimit, async (req, res) => {
    const data = CreateBlogPostSchema.parse(req.body);
    const post = await blogService.createBlogPost(db, data);
    res.status(201).json(post);
  });

  router.patch("/:id", authGuard, writeRateLimit, async (req, res) => {
    const data = UpdateBlogPostSchema.parse(req.body);
    const post = await blogService.updateBlogPost(db, String(req.params.id), data);
    res.json(post);
  });

  router.post("/:id/publish", authGuard, writeRateLimit, async (req, res) => {
    const post = await blogService.publishBlogPost(db, String(req.params.id));
    res.json(post);
  });

  router.post("/:id/unpublish", authGuard, writeRateLimit, async (req, res) => {
    const post = await blogService.unpublishBlogPost(db, String(req.params.id));
    res.json(post);
  });

  router.delete("/:id", authGuard, writeRateLimit, async (req, res) => {
    await blogService.deleteBlogPost(db, String(req.params.id));
    res.status(204).end();
  });

  return router;
}
