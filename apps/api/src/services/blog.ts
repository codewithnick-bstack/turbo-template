import { eq, desc, or, ilike, and } from "drizzle-orm";
import type { Db } from "@repo/db";
import { schema } from "@repo/db";
import { AppError } from "@repo/observability";
import type { CreateBlogPost, UpdateBlogPost } from "../schemas/blog";
import { compact } from "../lib/utils";
import { revalidatePaths } from "../lib/revalidate";

export async function listBlogPosts(db: Db, { includeAll = false, limit = 50, offset = 0, search }: { includeAll?: boolean; limit?: number; offset?: number; search?: string } = {}) {
  const searchFilter = search
    ? or(ilike(schema.blogPosts.title, `%${search}%`), ilike(schema.blogPosts.excerpt, `%${search}%`))
    : undefined;
  const statusFilter = includeAll ? undefined : eq(schema.blogPosts.status, "published");
  const where = searchFilter && statusFilter ? and(statusFilter, searchFilter) : searchFilter ?? statusFilter;
  return db.query.blogPosts.findMany({
    where,
    orderBy: [desc(schema.blogPosts.publishedAt), desc(schema.blogPosts.createdAt)],
    limit,
    offset,
  });
}

export async function getBlogPostBySlug(db: Db, slug: string) {
  const post = await db.query.blogPosts.findFirst({ where: eq(schema.blogPosts.slug, slug) });
  if (!post) throw new AppError("not_found", `Blog post not found: ${slug}`);
  return post;
}

export async function getBlogPostById(db: Db, id: string) {
  const post = await db.query.blogPosts.findFirst({ where: eq(schema.blogPosts.id, id) });
  if (!post) throw new AppError("not_found", `Blog post not found: ${id}`);
  return post;
}

export async function createBlogPost(db: Db, data: CreateBlogPost) {
  const [post] = await db.insert(schema.blogPosts).values(compact(data)).returning();
  if (!post) throw new AppError("internal", "Failed to create blog post");
  revalidatePaths(["/blog", "/"]);
  return post;
}

export async function updateBlogPost(db: Db, id: string, data: UpdateBlogPost) {
  const [updated] = await db
    .update(schema.blogPosts)
    .set(compact({ ...data, updatedAt: new Date() }))
    .where(eq(schema.blogPosts.id, id))
    .returning();
  if (!updated) throw new AppError("not_found", `Blog post not found: ${id}`);
  revalidatePaths([`/blog/${updated.slug}`, "/blog", "/"]);
  return updated;
}

export async function publishBlogPost(db: Db, id: string) {
  const [updated] = await db
    .update(schema.blogPosts)
    .set({ status: "published", publishedAt: new Date(), updatedAt: new Date() })
    .where(eq(schema.blogPosts.id, id))
    .returning();
  if (!updated) throw new AppError("not_found", `Blog post not found: ${id}`);
  revalidatePaths([`/blog/${updated.slug}`, "/blog", "/"]);
  return updated;
}

export async function unpublishBlogPost(db: Db, id: string) {
  const [updated] = await db
    .update(schema.blogPosts)
    .set({ status: "draft", updatedAt: new Date() })
    .where(eq(schema.blogPosts.id, id))
    .returning();
  if (!updated) throw new AppError("not_found", `Blog post not found: ${id}`);
  revalidatePaths([`/blog/${updated.slug}`, "/blog", "/"]);
  return updated;
}

export async function deleteBlogPost(db: Db, id: string) {
  const [deleted] = await db.delete(schema.blogPosts).where(eq(schema.blogPosts.id, id)).returning();
  if (!deleted) throw new AppError("not_found", `Blog post not found: ${id}`);
  revalidatePaths([`/blog/${deleted.slug}`, "/blog", "/"]);
  return deleted;
}
