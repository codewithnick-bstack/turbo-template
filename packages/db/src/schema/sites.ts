import { pgTable, uuid, text, timestamp, jsonb, uniqueIndex, pgEnum } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

export const siteStatus = pgEnum("site_status", ["active", "archived"]);

export const sites = pgTable(
  "sites",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    primaryDomain: text("primary_domain"),
    status: siteStatus("status").notNull().default("active"),
    locales: jsonb("locales").notNull().$type<string[]>().default(["en"]),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    slugTenantUnique: uniqueIndex("sites_slug_tenant_unique").on(t.tenantId, t.slug),
    domainUnique: uniqueIndex("sites_primary_domain_unique").on(t.primaryDomain),
  }),
);
