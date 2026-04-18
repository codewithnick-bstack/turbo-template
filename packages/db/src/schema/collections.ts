import { pgTable, uuid, text, timestamp, jsonb, uniqueIndex } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { sites } from "./sites";

export type FieldDef = {
  name: string;
  label: string;
  kind: "text" | "longtext" | "richtext" | "number" | "boolean" | "date" | "media" | "reference" | "json";
  required: boolean;
  multiple: boolean;
  referenceCollection?: string;
};

export const collections = pgTable(
  "collections",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    siteId: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    fields: jsonb("fields").notNull().$type<FieldDef[]>().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    slugSiteUnique: uniqueIndex("collections_slug_site_unique").on(t.siteId, t.slug),
  }),
);

export const entries = pgTable(
  "entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    collectionId: uuid("collection_id")
      .notNull()
      .references(() => collections.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    status: text("status").notNull().default("draft"),
    locale: text("locale").notNull().default("en"),
    data: jsonb("data").notNull().$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    slugCollectionLocaleUnique: uniqueIndex("entries_slug_collection_locale_unique").on(
      t.collectionId,
      t.slug,
      t.locale,
    ),
  }),
);
