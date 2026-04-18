import { eq, and } from "drizzle-orm";
import { schema } from "@repo/db";
import { AppError } from "@repo/observability";
import { createModelAdapter } from "@repo/ai";
import {
  SITE_COPILOT_SYSTEM,
  BLOG_GENERATOR_SYSTEM,
  SEO_AUDITOR_SYSTEM,
} from "@repo/ai";
import { z } from "zod";
import { defineContract } from "../parity";
import type { ServiceContext } from "../context";

export const chatContract = defineContract({
  operation: "ai.chat",
  description: "Site assistant chat — multi-turn conversation with site context.",
  http: { method: "POST", path: "/v1/ai/chat" },
  mcp: { tool: "ai_chat" },
});

export const generateBlogPostContract = defineContract({
  operation: "ai.generate_blog_post",
  description: "Generate a first-draft blog post from title + outline.",
  http: { method: "POST", path: "/v1/ai/generate/blog-post" },
  mcp: { tool: "generate_blog_post" },
});

export const generateSectionCopyContract = defineContract({
  operation: "ai.generate_section_copy",
  description: "Generate copy for a page section block.",
  http: { method: "POST", path: "/v1/ai/generate/section-copy" },
  mcp: { tool: "generate_section_copy" },
});

export const generateAltTextContract = defineContract({
  operation: "ai.generate_alt_text",
  description: "Generate accessible alt text for a media asset.",
  http: { method: "POST", path: "/v1/ai/generate/alt-text" },
  mcp: { tool: "generate_alt_text" },
});

export const seoAuditContract = defineContract({
  operation: "ai.seo_audit",
  description: "Run an AI SEO audit on a page.",
  idempotent: true,
  http: { method: "POST", path: "/v1/ai/seo/audit" },
  mcp: { tool: "seo_audit" },
});

export const seoGenerateMetaContract = defineContract({
  operation: "ai.seo_generate_meta",
  description: "AI-generate optimised meta title and description for a page.",
  http: { method: "POST", path: "/v1/ai/seo/generate-meta" },
  mcp: { tool: "seo_generate_meta" },
});

export const chatbotContract = defineContract({
  operation: "ai.chatbot",
  description: "Visitor-facing site chatbot — answers questions from site content.",
  http: { method: "POST", path: "/v1/ai/chatbot" },
  mcp: { tool: "site_chatbot" },
});

function getAdapter() {
  return createModelAdapter({
    provider: (process.env.AI_PROVIDER as "anthropic" | "openai" | "mock") ?? "mock",
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    openaiApiKey: process.env.OPENAI_API_KEY,
  });
}

const ChatInput = z.object({
  siteId: z.string().uuid(),
  messages: z.array(
    z.object({ role: z.enum(["user", "assistant"]), content: z.string() }),
  ),
});

export async function chat(ctx: ServiceContext, input: unknown) {
  const parsed = ChatInput.parse(input);
  const [site] = await ctx.db
    .select({ id: schema.sites.id, name: schema.sites.name })
    .from(schema.sites)
    .where(and(eq(schema.sites.id, parsed.siteId), eq(schema.sites.tenantId, ctx.tenantId)))
    .limit(1);
  if (!site) throw new AppError("not_found", `site not found: ${parsed.siteId}`);

  const system = `${SITE_COPILOT_SYSTEM}\n\nSite name: ${site.name}\nSite ID: ${site.id}`;
  const adapter = getAdapter();
  const result = await adapter.complete({
    model: "claude-opus-4-7",
    system,
    messages: parsed.messages,
    maxTokens: 1024,
  });
  return { text: result.text, usage: result.usage };
}

const GenerateBlogPostInput = z.object({
  title: z.string().min(1).max(300),
  outline: z.string().max(2000).optional(),
  keywords: z.array(z.string()).default([]),
  tone: z.string().max(100).default("professional"),
});

export async function generateBlogPost(ctx: ServiceContext, input: unknown) {
  const parsed = GenerateBlogPostInput.parse(input);
  const prompt = [
    `Title: ${parsed.title}`,
    parsed.outline ? `Outline:\n${parsed.outline}` : "",
    parsed.keywords.length > 0 ? `Keywords: ${parsed.keywords.join(", ")}` : "",
    `Tone: ${parsed.tone}`,
    "Write a full blog post in Markdown.",
  ]
    .filter(Boolean)
    .join("\n\n");

  const adapter = getAdapter();
  const result = await adapter.complete({
    model: "claude-opus-4-7",
    system: BLOG_GENERATOR_SYSTEM,
    messages: [{ role: "user", content: prompt }],
    maxTokens: 4096,
  });
  return { content: result.text, usage: result.usage };
}

const GenerateSectionCopyInput = z.object({
  blockType: z.enum(["hero", "cta", "richtext", "features", "testimonials"]),
  context: z.string().max(1000),
  tone: z.string().max(100).default("professional"),
});

export async function generateSectionCopy(_ctx: ServiceContext, input: unknown) {
  const parsed = GenerateSectionCopyInput.parse(input);
  const prompt = `Generate copy for a ${parsed.blockType} block.\nContext: ${parsed.context}\nTone: ${parsed.tone}\nReturn JSON matching the block's props shape.`;
  const adapter = getAdapter();
  const result = await adapter.complete({
    model: "claude-opus-4-7",
    system: "You are a UX copywriter. Output only valid JSON, no prose.",
    messages: [{ role: "user", content: prompt }],
    maxTokens: 512,
  });
  let props: unknown;
  try {
    props = JSON.parse(result.text);
  } catch {
    props = { text: result.text };
  }
  return { props, usage: result.usage };
}

const GenerateAltTextInput = z.object({
  mediaId: z.string().uuid(),
  publicUrl: z.string().url().optional(),
  filename: z.string().optional(),
});

export async function generateAltText(ctx: ServiceContext, input: unknown) {
  const parsed = GenerateAltTextInput.parse(input);
  const [media] = await ctx.db
    .select()
    .from(schema.mediaAssets)
    .where(
      and(eq(schema.mediaAssets.id, parsed.mediaId), eq(schema.mediaAssets.tenantId, ctx.tenantId)),
    )
    .limit(1);
  if (!media) throw new AppError("not_found", `media not found: ${parsed.mediaId}`);

  const desc = parsed.filename ?? media.originalFilename;
  const prompt = `Generate concise alt text (under 125 characters) for an image.\nFilename: ${desc}\n${parsed.publicUrl ? `URL: ${parsed.publicUrl}` : ""}`;
  const adapter = getAdapter();
  const result = await adapter.complete({
    model: "claude-opus-4-7",
    system: "Output only the alt text string, no quotes.",
    messages: [{ role: "user", content: prompt }],
    maxTokens: 64,
  });
  return { altText: result.text.trim(), usage: result.usage };
}

const SeoAuditInput = z.object({ pageId: z.string().uuid() });

export async function seoAudit(ctx: ServiceContext, input: unknown) {
  const parsed = SeoAuditInput.parse(input);
  const [page] = await ctx.db
    .select()
    .from(schema.pages)
    .where(and(eq(schema.pages.id, parsed.pageId), eq(schema.pages.tenantId, ctx.tenantId)))
    .limit(1);
  if (!page) throw new AppError("not_found", `page not found: ${parsed.pageId}`);

  const pageData = JSON.stringify({
    title: page.title,
    description: page.description,
    slug: page.slug,
    content: page.content,
  });

  const adapter = getAdapter();
  const result = await adapter.complete({
    model: "claude-opus-4-7",
    system: SEO_AUDITOR_SYSTEM,
    messages: [{ role: "user", content: `Audit this page:\n${pageData}` }],
    maxTokens: 2048,
  });

  let findings: unknown;
  try {
    findings = JSON.parse(result.text);
  } catch {
    findings = [{ severity: "info", rule: "parse_error", evidence: result.text, suggested_fix: "" }];
  }
  return { pageId: parsed.pageId, findings, usage: result.usage };
}

const SeoGenerateMetaInput = z.object({ pageId: z.string().uuid() });

export async function seoGenerateMeta(ctx: ServiceContext, input: unknown) {
  const parsed = SeoGenerateMetaInput.parse(input);
  const [page] = await ctx.db
    .select()
    .from(schema.pages)
    .where(and(eq(schema.pages.id, parsed.pageId), eq(schema.pages.tenantId, ctx.tenantId)))
    .limit(1);
  if (!page) throw new AppError("not_found", `page not found: ${parsed.pageId}`);

  const prompt = `Page title: ${page.title}\nSlug: ${page.slug}\nContent preview: ${JSON.stringify(page.content).slice(0, 500)}\n\nGenerate: metaTitle (≤60 chars) and metaDescription (≤155 chars). Return JSON: {"metaTitle":"...","metaDescription":"..."}`;
  const adapter = getAdapter();
  const result = await adapter.complete({
    model: "claude-opus-4-7",
    system: "Output only valid JSON.",
    messages: [{ role: "user", content: prompt }],
    maxTokens: 256,
  });

  let meta: { metaTitle?: string; metaDescription?: string } = {};
  try {
    meta = JSON.parse(result.text);
  } catch {
    meta = {};
  }
  return { pageId: parsed.pageId, ...meta, usage: result.usage };
}

const ChatbotInput = z.object({
  siteId: z.string().uuid(),
  messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() })),
  visitorId: z.string().optional(),
});

export async function chatbot(ctx: ServiceContext, input: unknown) {
  const parsed = ChatbotInput.parse(input);
  const [site] = await ctx.db
    .select({ id: schema.sites.id, name: schema.sites.name })
    .from(schema.sites)
    .where(and(eq(schema.sites.id, parsed.siteId), eq(schema.sites.tenantId, ctx.tenantId)))
    .limit(1);
  if (!site) throw new AppError("not_found", `site not found: ${parsed.siteId}`);

  const system = `You are the helpful assistant for ${site.name}. Answer visitor questions concisely based on site content. If you don't know, say so honestly. Never make up facts. Keep answers under 3 sentences unless a detailed answer is clearly needed.`;
  const adapter = getAdapter();
  const result = await adapter.complete({
    model: "claude-opus-4-7",
    system,
    messages: parsed.messages,
    maxTokens: 512,
  });
  return { text: result.text, usage: result.usage };
}
