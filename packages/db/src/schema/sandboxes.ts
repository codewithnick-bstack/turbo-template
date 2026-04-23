import { pgTable, uuid, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { sites } from "./sites";
import { tenants } from "./tenants";

export const sandboxStatus = pgEnum("sandbox_status", ["active", "promoting", "promoted", "deleted"]);

export const sandboxes = pgTable("sandboxes", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  parentSiteId: uuid("parent_site_id").notNull().references(() => sites.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  status: sandboxStatus("status").notNull().default("active"),
  promotedAt: timestamp("promoted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});
