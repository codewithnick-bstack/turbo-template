import { pgTable, uuid, text, timestamp, index, pgEnum } from "drizzle-orm/pg-core";

export const tenantType = pgEnum("tenant_type", ["direct", "agency", "client"]);
export const tenantPlan = pgEnum("tenant_plan", ["starter", "pro", "agency"]);
export const tenantStatus = pgEnum("tenant_status", ["active", "past_due", "suspended"]);

export const tenants = pgTable(
  "tenants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    type: tenantType("type").notNull().default("direct"),
    parentTenantId: uuid("parent_tenant_id"),
    plan: tenantPlan("plan").notNull().default("starter"),
    status: tenantStatus("status").notNull().default("active"),
    stripeCustomerId: text("stripe_customer_id"),
    stripeSubscriptionId: text("stripe_subscription_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => ({
    parentIdx: index("tenants_parent_idx").on(t.parentTenantId),
  }),
);
