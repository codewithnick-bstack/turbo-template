import { Router } from "express";
import type { RequestHandler } from "express";
import rateLimit from "express-rate-limit";
import type { Db } from "@repo/db";
import { CreatePortfolioEntrySchema, UpdatePortfolioEntrySchema } from "../schemas/portfolio";
import * as portfolioService from "../services/portfolio";
import { parsePaginationParams } from "../lib/utils";

const writeRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { code: "rate_limited", message: "Too many requests, please try again later." },
});

export function createPortfolioRouter(db: Db, authGuard: RequestHandler) {
  const router = Router();

  router.get("/", async (req, res) => {
    const search = typeof req.query.search === "string" && req.query.search.trim() ? req.query.search.trim() : undefined;
    const entries = await portfolioService.listPortfolioEntries(db, search ? { search } : {});
    if (!search) res.set("Cache-Control", "public, max-age=300, stale-while-revalidate=86400");
    res.json(entries);
  });

  // Temporarily public for testing - should be protected
  router.get("/admin/all", async (req, res) => {
    const { limit, offset } = parsePaginationParams(req.query as Record<string, unknown>);
    const entries = await portfolioService.listPortfolioEntries(db, { includeAll: true, limit, offset });
    res.json(entries);
  });

  router.get("/:id", async (req, res) => {
    const entry = await portfolioService.getPortfolioEntry(db, String(req.params.id));
    res.set("Cache-Control", "public, max-age=3600, stale-while-revalidate=604800");
    res.json(entry);
  });

  router.post("/", authGuard, writeRateLimit, async (req, res) => {
    const data = CreatePortfolioEntrySchema.parse(req.body);
    const entry = await portfolioService.createPortfolioEntry(db, data);
    res.status(201).json(entry);
  });

  router.patch("/:id", authGuard, writeRateLimit, async (req, res) => {
    const data = UpdatePortfolioEntrySchema.parse(req.body);
    const entry = await portfolioService.updatePortfolioEntry(db, String(req.params.id), data);
    res.json(entry);
  });

  router.delete("/:id", authGuard, writeRateLimit, async (req, res) => {
    await portfolioService.deletePortfolioEntry(db, String(req.params.id));
    res.status(204).end();
  });

  return router;
}
