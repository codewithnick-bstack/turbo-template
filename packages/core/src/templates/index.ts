import { eq, and } from "drizzle-orm";
import { schema } from "@repo/db";
import { AppError } from "@repo/observability";
import { z } from "zod";
import { defineContract } from "../parity";
import type { ServiceContext } from "../context";

export const listTemplatesContract = defineContract({
  operation: "templates.list",
  description: "List available site templates.",
  idempotent: true,
  http: { method: "GET", path: "/v1/templates" },
  mcp: { tool: "list_templates" },
});

export const getTemplateContract = defineContract({
  operation: "templates.get",
  description: "Get a site template by id or slug.",
  idempotent: true,
  http: { method: "GET", path: "/v1/templates/:id" },
  mcp: { tool: "get_template" },
});

export const useTemplateContract = defineContract({
  operation: "templates.use",
  description: "Create a new site from a template.",
  http: { method: "POST", path: "/v1/templates/:id/use" },
  mcp: { tool: "use_template" },
  webhook: { event: "site.created_from_template" },
});

export const createTemplateContract = defineContract({
  operation: "templates.create",
  description: "Save a site as a reusable template (admin-only).",
  http: { method: "POST", path: "/v1/templates" },
  mcp: { tool: "create_template" },
});

export async function listTemplates(
  _ctx: ServiceContext,
  filter: { category?: string; limit?: number } = {},
) {
  const rows = await _ctx.db
    .select({
      id: schema.templates.id,
      slug: schema.templates.slug,
      name: schema.templates.name,
      description: schema.templates.description,
      thumbnailUrl: schema.templates.thumbnailUrl,
      category: schema.templates.category,
      tags: schema.templates.tags,
    })
    .from(schema.templates)
    .where(
      and(
        eq(schema.templates.isPublic, true),
        filter.category ? eq(schema.templates.category, filter.category) : undefined,
      ),
    )
    .limit(filter.limit ?? 50);
  return rows;
}

export async function getTemplate(_ctx: ServiceContext, idOrSlug: string) {
  const [byId] = await _ctx.db
    .select()
    .from(schema.templates)
    .where(eq(schema.templates.id, idOrSlug))
    .limit(1);
  if (byId) return byId;

  const [bySlug] = await _ctx.db
    .select()
    .from(schema.templates)
    .where(eq(schema.templates.slug, idOrSlug))
    .limit(1);
  if (bySlug) return bySlug;

  throw new AppError("not_found", `template not found: ${idOrSlug}`);
}

const UseTemplateInput = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
});

export async function useTemplate(ctx: ServiceContext, templateIdOrSlug: string, input: unknown) {
  const parsed = UseTemplateInput.parse(input);
  const template = await getTemplate(ctx, templateIdOrSlug);

  // Check for slug conflicts
  const existing = await ctx.db
    .select({ id: schema.sites.id })
    .from(schema.sites)
    .where(and(eq(schema.sites.slug, parsed.slug), eq(schema.sites.tenantId, ctx.tenantId)))
    .limit(1);
  if (existing.length > 0) throw new AppError("conflict", `site slug already exists: ${parsed.slug}`);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const siteValues = { tenantId: ctx.tenantId, slug: parsed.slug, name: parsed.name } as any;
  const [site] = await ctx.db.insert(schema.sites).values(siteValues).returning();
  if (!site) throw new AppError("internal", "site insert returned no row");

  // Create pages from template tree
  const pageTree = (template.pageTree as Record<string, unknown>) ?? {};
  const pages = Array.isArray((pageTree as { pages?: unknown }).pages)
    ? ((pageTree as { pages: unknown[] }).pages as Array<{ slug: string; title: string; content: unknown }>)
    : [];

  for (const p of pages) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pageValues = { tenantId: ctx.tenantId, siteId: site.id, slug: p.slug ?? "home", title: p.title ?? "Home", locale: "en", content: p.content ?? { version: 1, blocks: [] } } as any;
    await ctx.db.insert(schema.pages).values(pageValues);
  }

  return { site, templateId: template.id };
}

const CreateTemplateInput = z.object({
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/),
  name: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  thumbnailUrl: z.string().url().optional(),
  category: z.string().max(50).default("general"),
  tags: z.array(z.string()).default([]),
  pageTree: z.record(z.unknown()).default({}),
  isPublic: z.boolean().default(true),
});

export async function createTemplate(ctx: ServiceContext, input: unknown) {
  const parsed = CreateTemplateInput.parse(input);
  const actorId = ctx.actor.kind === "user" ? ctx.actor.userId : undefined;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const templateValues = { ...parsed, createdBy: actorId } as any;
  const [row] = await ctx.db.insert(schema.templates).values(templateValues).returning();
  if (!row) throw new AppError("internal", "template insert returned no row");
  return row;
}
