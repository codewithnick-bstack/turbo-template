import { Router } from "express";
import type { RequestHandler } from "express";
import rateLimit from "express-rate-limit";
import type { Db } from "@repo/db";
import { UpdateSettingsSchema } from "../schemas/settings";
import * as settingsService from "../services/settings";

const writeRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { code: "rate_limited", message: "Too many requests, please try again later." },
});

export function createSettingsRouter(db: Db, authGuard: RequestHandler) {
  const router = Router();

  // Public read (web needs settings for display)
  router.get("/", async (_req, res) => {
    const settings = await settingsService.getSettings(db);
    res.set("Cache-Control", "public, max-age=300, stale-while-revalidate=86400");
    res.json(settings);
  });

  // Auth-gated write
  router.patch("/", authGuard, writeRateLimit, async (req, res) => {
    const data = UpdateSettingsSchema.parse(req.body);
    const settings = await settingsService.updateSettings(db, data);
    res.json(settings);
  });

  return router;
}
