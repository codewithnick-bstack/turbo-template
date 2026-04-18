import {
  pgTable,
  uuid,
  text,
  timestamp,
  index,
  pgEnum,
} from "drizzle-orm/pg-core";

export const blogPostStatus = pgEnum("blog_post_status", ["draft", "published", "archived"]);

export const blogPosts = pgTable(
  "blog_posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").notNull(),
    siteId: uuid("site_id").notNull(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    excerpt: text("excerpt"),
    content: text("content").notNull().default(""),
    coverImageId: uuid("cover_image_id"),
    authorId: uuid("author_id"),
    status: blogPostStatus("status").notNull().default("draft"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    tags: text("tags").array().default([]).notNull(),
    metaTitle: text("meta_title"),
    metaDescription: text("meta_description"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    tenantIdx: index("blog_tenant_idx").on(t.tenantId, t.siteId),
    slugIdx: index("blog_slug_idx").on(t.siteId, t.slug),
    statusIdx: index("blog_status_idx").on(t.tenantId, t.status),
  }),
);
