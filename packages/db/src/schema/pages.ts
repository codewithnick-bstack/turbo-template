import { pgTable, uuid, text, timestamp, jsonb, pgEnum, uniqueIndex, integer } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { sites } from "./sites";

export const pageStatus = pgEnum("page_status", ["draft", "published", "archived"]);

export const pages = pgTable(
  "pages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    siteId: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    description: text("description"),
    status: pageStatus("status").notNull().default("draft"),
    locale: text("locale").notNull().default("en"),
    content: jsonb("content").notNull().$type<{ version: number; blocks: unknown[] }>().default({ version: 1, blocks: [] }),
    contentDraft: jsonb("content_draft").$type<{ version: number; blocks: unknown[] }>(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    version: integer("version").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    slugSiteLocaleUnique: uniqueIndex("pages_slug_site_locale_unique").on(t.siteId, t.slug, t.locale),
  }),
);
