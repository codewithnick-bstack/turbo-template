import { pgTable, uuid, text, timestamp, index, pgEnum } from "drizzle-orm/pg-core";

export const blogPostStatus = pgEnum("blog_post_status", ["draft", "published"]);

export const blogPosts = pgTable(
  "blog_posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    excerpt: text("excerpt"),
    content: text("content").notNull().default(""),
    author: text("author"),
    coverImageUrl: text("cover_image_url"),
    status: blogPostStatus("status").notNull().default("draft"),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    metaTitle: text("meta_title"),
    metaDescription: text("meta_description"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    slugIdx: index("blog_slug_idx").on(t.slug),
    statusIdx: index("blog_status_idx").on(t.status),
  }),
);
