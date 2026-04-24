import { Router } from "express";
import type { RequestHandler } from "express";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import type { Db } from "@repo/db";
import * as aiService from "../services/ai";

const chatRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { code: "rate_limited", message: "Too many chat requests, please try again later." },
});

const generateRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { code: "rate_limited", message: "Too many generation requests, please try again later." },
});

const ChatSchema = z.object({
  messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() })).min(1),
});

const GenerateDraftSchema = z.object({
  title: z.string().min(1).max(500),
  outline: z.string().max(2000).optional(),
});

const GenerateMetaSchema = z.object({
  pageTitle: z.string().min(1).max(200),
  contentPreview: z.string().min(1).max(2000),
});

export function createAiRouter(db: Db, authGuard: RequestHandler) {
  const router = Router();

  // Public chatbot endpoint
  router.post("/chat", chatRateLimit, async (req, res) => {
    const { messages } = ChatSchema.parse(req.body);
    try {
      const text = await aiService.chatWithSiteContext(db, messages);
      res.json({ text });
    } catch (err) {
      console.error("[ai/chat] error:", err);
      res.json({ text: null, fallback: true });
    }
  });

  // Auth-gated generation endpoints
  router.post("/generate/blog-draft", authGuard, generateRateLimit, async (req, res) => {
    const { title, outline } = GenerateDraftSchema.parse(req.body);
    const draft = await aiService.generateDraft(title, outline);
    res.json({ content: draft });
  });

  router.post("/generate/meta", authGuard, generateRateLimit, async (req, res) => {
    const { pageTitle, contentPreview } = GenerateMetaSchema.parse(req.body);
    const meta = await aiService.generateMeta(pageTitle, contentPreview);
    res.json({ metaDescription: meta });
  });

  return router;
}
