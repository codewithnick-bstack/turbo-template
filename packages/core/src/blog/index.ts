import { eq, and, desc, sql } from "drizzle-orm";
import { schema } from "@repo/db";
import { AppError } from "@repo/observability";
import { z } from "zod";
import { defineContract } from "../parity";
import type { ServiceContext } from "../context";
import { recordAudit } from "../audit";
import { emitEvent } from "../events";

export const createPostContract = defineContract({
  operation: "blog.create_post",
  description: "Create a new blog post (draft by default).",
  http: { method: "POST", path: "/v1/blog/posts" },
  mcp: { tool: "create_blog_post" },
  webhook: { event: "blog.post_created" },
});

export const listPostsContract = defineContract({
  operation: "blog.list_posts",
  description: "List blog posts for a site.",
  idempotent: true,
  http: { method: "GET", path: "/v1/blog/posts" },
  mcp: { tool: "list_blog_posts" },
});

export const getPostContract = defineContract({
  operation: "blog.get_post",
  description: "Get a blog post by id or slug.",
  idempotent: true,
  http: { method: "GET", path: "/v1/blog/posts/:id" },
  mcp: { tool: "get_blog_post" },
});

export const updatePostContract = defineContract({
  operation: "blog.update_post",
  description: "Update a blog post.",
  http: { method: "PATCH", path: "/v1/blog/posts/:id" },
  mcp: { tool: "update_blog_post" },
  webhook: { event: "blog.post_updated" },
  idempotent: true,
});

export const publishPostContract = defineContract({
  operation: "blog.publish_post",
  description: "Publish a blog post.",
  http: { method: "POST", path: "/v1/blog/posts/:id/publish" },
  mcp: { tool: "publish_blog_post" },
  webhook: { event: "blog.post_published" },
});

const CreatePostInput = z.object({
  siteId: z.string().uuid(),
  title: z.string().min(1).max(300),
  slug: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9-]+$/),
  excerpt: z.string().max(500).optional(),
  content: z.string().default(""),
  tags: z.array(z.string()).default([]),
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(160).optional(),
});

const UpdatePostInput = z.object({
  title: z.string().min(1).max(300).optional(),
  excerpt: z.string().max(500).optional(),
  content: z.string().optional(),
  tags: z.array(z.string()).optional(),
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(160).optional(),
});

export async function createPost(ctx: ServiceContext, input: unknown) {
  const parsed = CreatePostInput.parse(input);

  const existing = await ctx.db
    .select({ id: schema.blogPosts.id })
    .from(schema.blogPosts)
    .where(
      and(eq(schema.blogPosts.siteId, parsed.siteId), eq(schema.blogPosts.slug, parsed.slug)),
    )
    .limit(1);
  if (existing.length > 0)
    throw new AppError("conflict", `blog post slug already exists: ${parsed.slug}`);

  const newPost = {
    tenantId: ctx.tenantId,
    siteId: parsed.siteId,
    title: parsed.title,
    slug: parsed.slug,
    excerpt: parsed.excerpt,
    content: parsed.content,
    tags: parsed.tags,
    metaTitle: parsed.metaTitle,
    metaDescription: parsed.metaDescription,
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [row] = await ctx.db.insert(schema.blogPosts).values(newPost as any).returning();
  if (!row) throw new AppError("internal", "blog post insert returned no row");

  await recordAudit({
    db: ctx.db,
    tenantId: ctx.tenantId,
    actor: ctx.actor,
    action: "create",
    resourceKind: "blog_post",
    resourceId: row.id,
    after: { title: row.title },
  });

  return row;
}

export async function listPosts(
  ctx: ServiceContext,
  filter: { siteId: string; status?: string; limit?: number },
) {
  const conditions = [
    eq(schema.blogPosts.tenantId, ctx.tenantId),
    eq(schema.blogPosts.siteId, filter.siteId),
  ];
  if (filter.status) {
    conditions.push(
      eq(schema.blogPosts.status, filter.status as "draft" | "published" | "archived"),
    );
  }

  return ctx.db
    .select()
    .from(schema.blogPosts)
    .where(and(...conditions))
    .orderBy(desc(schema.blogPosts.createdAt))
    .limit(Math.min(filter.limit ?? 50, 200));
}

export async function getPost(ctx: ServiceContext, idOrSlug: string) {
  const byId = await ctx.db
    .select()
    .from(schema.blogPosts)
    .where(
      and(eq(schema.blogPosts.tenantId, ctx.tenantId), eq(schema.blogPosts.id, idOrSlug)),
    )
    .limit(1);
  if (byId[0]) return byId[0];

  const bySlug = await ctx.db
    .select()
    .from(schema.blogPosts)
    .where(
      and(eq(schema.blogPosts.tenantId, ctx.tenantId), eq(schema.blogPosts.slug, idOrSlug)),
    )
    .limit(1);
  if (bySlug[0]) return bySlug[0];

  throw new AppError("not_found", `blog post not found: ${idOrSlug}`);
}

export async function updatePost(ctx: ServiceContext, id: string, input: unknown) {
  const parsed = UpdatePostInput.parse(input);
  const patch: Record<string, unknown> = { updatedAt: sql`now()` };
  if (parsed.title !== undefined) patch.title = parsed.title;
  if (parsed.excerpt !== undefined) patch.excerpt = parsed.excerpt;
  if (parsed.content !== undefined) patch.content = parsed.content;
  if (parsed.tags !== undefined) patch.tags = parsed.tags;
  if (parsed.metaTitle !== undefined) patch.metaTitle = parsed.metaTitle;
  if (parsed.metaDescription !== undefined) patch.metaDescription = parsed.metaDescription;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [row] = await ctx.db.update(schema.blogPosts).set(patch as any)
    .where(and(eq(schema.blogPosts.id, id), eq(schema.blogPosts.tenantId, ctx.tenantId)))
    .returning();
  if (!row) throw new AppError("not_found", `blog post not found: ${id}`);
  return row;
}

export async function publishPost(ctx: ServiceContext, id: string) {
  const publishPatch = { status: "published", publishedAt: sql`now()`, updatedAt: sql`now()` };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [row] = await ctx.db.update(schema.blogPosts).set(publishPatch as any)
    .where(
      and(eq(schema.blogPosts.id, id), eq(schema.blogPosts.tenantId, ctx.tenantId)),
    )
    .returning();
  if (!row) throw new AppError("not_found", `blog post not found: ${id}`);

  await recordAudit({
    db: ctx.db,
    tenantId: ctx.tenantId,
    actor: ctx.actor,
    action: "publish",
    resourceKind: "blog_post",
    resourceId: row.id,
    after: { status: "published" },
  });

  await emitEvent({
    db: ctx.db,
    tenantId: ctx.tenantId,
    event: "blog.post_published",
    payload: { postId: row.id, slug: row.slug, siteId: row.siteId },
  });

  return row;
}

export async function deletePost(ctx: ServiceContext, id: string) {
  const [row] = await ctx.db
    .delete(schema.blogPosts)
    .where(
      and(eq(schema.blogPosts.id, id), eq(schema.blogPosts.tenantId, ctx.tenantId)),
    )
    .returning();
  if (!row) throw new AppError("not_found", `blog post not found: ${id}`);
  return { id: row.id };
}
