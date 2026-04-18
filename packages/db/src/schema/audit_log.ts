import { pgTable, uuid, text, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    actorKind: text("actor_kind").notNull(),
    actorId: text("actor_id").notNull(),
    action: text("action").notNull(),
    resourceKind: text("resource_kind").notNull(),
    resourceId: text("resource_id").notNull(),
    before: jsonb("before"),
    after: jsonb("after"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    tenantTimeIdx: index("audit_log_tenant_time_idx").on(t.tenantId, t.createdAt),
    resourceIdx: index("audit_log_resource_idx").on(t.resourceKind, t.resourceId),
  }),
);
