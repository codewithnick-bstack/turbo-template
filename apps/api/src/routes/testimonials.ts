import { Router } from "express";
import type { RequestHandler } from "express";
import rateLimit from "express-rate-limit";
import type { Db } from "@repo/db";
import { CreateTestimonialSchema, UpdateTestimonialSchema } from "../schemas/testimonials";
import * as testimonialsService from "../services/testimonials";

const writeRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { code: "rate_limited", message: "Too many requests, please try again later." },
});

export function createTestimonialsRouter(db: Db, authGuard: RequestHandler) {
  const router = Router();

  router.get("/", async (req, res) => {
    const featured = req.query.featured === "true";
    const items = await testimonialsService.listTestimonials(db, { featuredOnly: featured });
    res.set("Cache-Control", "public, max-age=300, stale-while-revalidate=86400");
    res.json(items);
  });

  router.get("/:id", async (req, res) => {
    const item = await testimonialsService.getTestimonial(db, String(req.params.id));
    res.set("Cache-Control", "public, max-age=3600, stale-while-revalidate=604800");
    res.json(item);
  });

  router.post("/", authGuard, writeRateLimit, async (req, res) => {
    const data = CreateTestimonialSchema.parse(req.body);
    const item = await testimonialsService.createTestimonial(db, data);
    res.status(201).json(item);
  });

  router.patch("/:id", authGuard, writeRateLimit, async (req, res) => {
    const data = UpdateTestimonialSchema.parse(req.body);
    const item = await testimonialsService.updateTestimonial(db, String(req.params.id), data);
    res.json(item);
  });

  router.delete("/:id", authGuard, writeRateLimit, async (req, res) => {
    await testimonialsService.deleteTestimonial(db, String(req.params.id));
    res.status(204).end();
  });

  return router;
}
