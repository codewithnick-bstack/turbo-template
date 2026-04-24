import { Router } from "express";
import type { RequestHandler } from "express";
import rateLimit from "express-rate-limit";
import type { Db } from "@repo/db";
import { CreateTeamMemberSchema, UpdateTeamMemberSchema, ReorderTeamSchema } from "../schemas/team";
import * as teamService from "../services/team";

const writeRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { code: "rate_limited", message: "Too many requests, please try again later." },
});

export function createTeamRouter(db: Db, authGuard: RequestHandler) {
  const router = Router();

  router.get("/", async (req, res) => {
    const search = typeof req.query.search === "string" && req.query.search.trim() ? req.query.search.trim() : undefined;
    const members = await teamService.listTeamMembers(db, search ? { search } : {});
    if (!search) res.set("Cache-Control", "public, max-age=300, stale-while-revalidate=86400");
    res.json(members);
  });

  router.get("/:id", async (req, res) => {
    const member = await teamService.getTeamMember(db, String(req.params.id));
    res.set("Cache-Control", "public, max-age=3600, stale-while-revalidate=604800");
    res.json(member);
  });

  router.post("/", authGuard, writeRateLimit, async (req, res) => {
    const data = CreateTeamMemberSchema.parse(req.body);
    const member = await teamService.createTeamMember(db, data);
    res.status(201).json(member);
  });

  router.patch("/:id", authGuard, writeRateLimit, async (req, res) => {
    const data = UpdateTeamMemberSchema.parse(req.body);
    const member = await teamService.updateTeamMember(db, String(req.params.id), data);
    res.json(member);
  });

  router.delete("/:id", authGuard, writeRateLimit, async (req, res) => {
    await teamService.deleteTeamMember(db, String(req.params.id));
    res.status(204).end();
  });

  router.post("/reorder", authGuard, writeRateLimit, async (req, res) => {
    const { ids } = ReorderTeamSchema.parse(req.body);
    await teamService.reorderTeamMembers(db, ids);
    res.json({ ok: true });
  });

  return router;
}
