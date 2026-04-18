import { pgTable, uuid, text, timestamp, jsonb, index, boolean } from "drizzle-orm/pg-core";

export const templates = pgTable(
  "templates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    description: text("description"),
    thumbnailUrl: text("thumbnail_url"),
    previewUrl: text("preview_url"),
    category: text("category").notNull().default("general"),
    tags: text("tags").array().default([]).notNull(),
    pageTree: jsonb("page_tree").notNull().default({}),
    isPublic: boolean("is_public").notNull().default(true),
    createdBy: uuid("created_by"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    categoryIdx: index("templates_category_idx").on(t.category),
    publicIdx: index("templates_public_idx").on(t.isPublic),
  }),
);
