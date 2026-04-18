import { eq, and, desc } from "drizzle-orm";
import { schema } from "@repo/db";
import { AppError } from "@repo/observability";
import {
  CreatePageInput,
  UpdatePageInput,
  PublishPageInput,
  type TPage,
  Blocks,
} from "@repo/schemas";
import { defineContract } from "../parity";
import type { ServiceContext } from "../context";
import { recordAudit } from "../audit";
import { emitEvent } from "../events";

export const createPageContract = defineContract({
  operation: "pages.create",
  description: "Create a new page within a site (draft by default).",
  http: { method: "POST", path: "/v1/pages" },
  mcp: { tool: "create_page" },
  webhook: { event: "page.created" },
});

export const listPagesContract = defineContract({
  operation: "pages.list",
  description: "List pages in a site.",
  idempotent: true,
  http: { method: "GET", path: "/v1/pages" },
  mcp: { tool: "list_pages" },
});

export const getPageContract = defineContract({
  operation: "pages.get",
  description: "Get a page by id.",
  idempotent: true,
  http: { method: "GET", path: "/v1/pages/:id" },
  mcp: { tool: "get_page" },
});

export const updatePageContract = defineContract({
  operation: "pages.update",
  description: "Update a page's metadata or draft content.",
  http: { method: "PATCH", path: "/v1/pages/:id" },
  mcp: { tool: "update_page" },
  webhook: { event: "page.updated" },
  idempotent: true,
});

export const publishPageContract = defineContract({
  operation: "pages.publish",
  description: "Promote draft content to published state and revalidate the renderer.",
  http: { method: "POST", path: "/v1/pages/:id/publish" },
  mcp: { tool: "publish_page", requiresApproval: true },
  webhook: { event: "page.published" },
});

export const unpublishPageContract = defineContract({
  operation: "pages.unpublish",
  description: "Return a page to draft-only state.",
  http: { method: "POST", path: "/v1/pages/:id/unpublish" },
  mcp: { tool: "unpublish_page", requiresApproval: true },
  webhook: { event: "page.unpublished" },
});

type PageRow = typeof schema.pages.$inferSelect;

function toPage(row: PageRow): TPage {
  return {
    id: row.id,
    siteId: row.siteId,
    slug: row.slug,
    title: row.title,
    description: row.description,
    status: row.status,
    locale: row.locale,
    content: row.content as unknown as TPage["content"],
    contentDraft: (row.contentDraft as unknown as TPage["contentDraft"]) ?? null,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    version: row.version,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

const EMPTY_TREE: TPage["content"] = { version: 1, blocks: [] };

export async function createPage(ctx: ServiceContext, input: unknown): Promise<TPage> {
  const parsed = CreatePageInput.parse(input);

  const existing = await ctx.db
    .select({ id: schema.pages.id })
    .from(schema.pages)
    .where(
      and(
        eq(schema.pages.siteId, parsed.siteId),
        eq(schema.pages.slug, parsed.slug),
        eq(schema.pages.locale, parsed.locale ?? "en"),
      ),
    )
    .limit(1);
  if (existing.length > 0) {
    throw new AppError("conflict", `page slug already exists: ${parsed.slug}`);
  }

  const content = parsed.content ?? EMPTY_TREE;
  Blocks.BlockTree.parse(content);

  const [row] = await ctx.db
    .insert(schema.pages)
    .values({
      tenantId: ctx.tenantId,
      siteId: parsed.siteId,
      slug: parsed.slug,
      title: parsed.title,
      description: parsed.description ?? null,
      locale: parsed.locale ?? "en",
      content,
      contentDraft: content,
    })
    .returning();
  if (!row) throw new AppError("internal", "page insert returned no row");

  await recordAudit({
    db: ctx.db,
    tenantId: ctx.tenantId,
    actor: ctx.actor,
    action: "create",
    resourceKind: "page",
    resourceId: row.id,
    after: toPage(row) as unknown as Record<string, unknown>,
  });

  return toPage(row);
}

export async function listPages(ctx: ServiceContext, filter: { siteId: string }): Promise<TPage[]> {
  const rows = await ctx.db
    .select()
    .from(schema.pages)
    .where(and(eq(schema.pages.tenantId, ctx.tenantId), eq(schema.pages.siteId, filter.siteId)))
    .orderBy(desc(schema.pages.updatedAt));
  return rows.map(toPage);
}

export async function getPage(ctx: ServiceContext, id: string): Promise<TPage> {
  const [row] = await ctx.db
    .select()
    .from(schema.pages)
    .where(and(eq(schema.pages.id, id), eq(schema.pages.tenantId, ctx.tenantId)))
    .limit(1);
  if (!row) throw new AppError("not_found", `page not found: ${id}`);
  return toPage(row);
}

export async function getPageBySlug(
  ctx: ServiceContext,
  args: { siteId: string; slug: string; locale?: string },
): Promise<TPage | null> {
  const [row] = await ctx.db
    .select()
    .from(schema.pages)
    .where(
      and(
        eq(schema.pages.tenantId, ctx.tenantId),
        eq(schema.pages.siteId, args.siteId),
        eq(schema.pages.slug, args.slug),
        eq(schema.pages.locale, args.locale ?? "en"),
      ),
    )
    .limit(1);
  return row ? toPage(row) : null;
}

export async function updatePage(ctx: ServiceContext, input: unknown): Promise<TPage> {
  const parsed = UpdatePageInput.parse(input);
  const current = await getPage(ctx, parsed.id);

  const patch: Partial<typeof schema.pages.$inferInsert> = { updatedAt: new Date() };
  if (parsed.title !== undefined) patch.title = parsed.title;
  if (parsed.slug !== undefined) patch.slug = parsed.slug;
  if (parsed.description !== undefined) patch.description = parsed.description ?? null;
  if (parsed.locale !== undefined) patch.locale = parsed.locale;
  if (parsed.content !== undefined) {
    Blocks.BlockTree.parse(parsed.content);
    patch.contentDraft = parsed.content;
  }

  const [row] = await ctx.db
    .update(schema.pages)
    .set(patch)
    .where(and(eq(schema.pages.id, parsed.id), eq(schema.pages.tenantId, ctx.tenantId)))
    .returning();
  if (!row) throw new AppError("internal", "page update returned no row");

  await recordAudit({
    db: ctx.db,
    tenantId: ctx.tenantId,
    actor: ctx.actor,
    action: "update",
    resourceKind: "page",
    resourceId: row.id,
    before: current as unknown as Record<string, unknown>,
    after: toPage(row) as unknown as Record<string, unknown>,
  });

  await emitEvent({
    db: ctx.db,
    tenantId: ctx.tenantId,
    event: "page.updated",
    payload: { page: toPage(row) },
  });

  return toPage(row);
}

export async function publishPage(ctx: ServiceContext, input: unknown): Promise<TPage> {
  const parsed = PublishPageInput.parse(input);
  const current = await getPage(ctx, parsed.id);

  const draft = (current.contentDraft ?? current.content) as TPage["content"];
  Blocks.BlockTree.parse(draft);

  const [row] = await ctx.db
    .update(schema.pages)
    .set({
      status: "published",
      content: draft,
      publishedAt: new Date(),
      version: current.version + 1,
      updatedAt: new Date(),
    })
    .where(and(eq(schema.pages.id, parsed.id), eq(schema.pages.tenantId, ctx.tenantId)))
    .returning();
  if (!row) throw new AppError("internal", "page publish returned no row");

  await recordAudit({
    db: ctx.db,
    tenantId: ctx.tenantId,
    actor: ctx.actor,
    action: "publish",
    resourceKind: "page",
    resourceId: row.id,
    before: current as unknown as Record<string, unknown>,
    after: toPage(row) as unknown as Record<string, unknown>,
  });

  await emitEvent({
    db: ctx.db,
    tenantId: ctx.tenantId,
    event: "page.published",
    payload: { page: toPage(row) },
  });

  return toPage(row);
}

export async function unpublishPage(ctx: ServiceContext, input: unknown): Promise<TPage> {
  const parsed = PublishPageInput.parse(input);
  const current = await getPage(ctx, parsed.id);

  const [row] = await ctx.db
    .update(schema.pages)
    .set({ status: "draft", publishedAt: null, updatedAt: new Date() })
    .where(and(eq(schema.pages.id, parsed.id), eq(schema.pages.tenantId, ctx.tenantId)))
    .returning();
  if (!row) throw new AppError("internal", "page unpublish returned no row");

  await recordAudit({
    db: ctx.db,
    tenantId: ctx.tenantId,
    actor: ctx.actor,
    action: "unpublish",
    resourceKind: "page",
    resourceId: row.id,
    before: current as unknown as Record<string, unknown>,
    after: toPage(row) as unknown as Record<string, unknown>,
  });

  await emitEvent({
    db: ctx.db,
    tenantId: ctx.tenantId,
    event: "page.unpublished",
    payload: { page: toPage(row) },
  });

  return toPage(row);
}
