import { pgTable, uuid, text, timestamp, integer, index, jsonb, pgEnum } from "drizzle-orm/pg-core";

export const experimentStatus = pgEnum("experiment_status", [
  "draft",
  "running",
  "paused",
  "concluded",
]);

export const experiments = pgTable(
  "experiments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").notNull(),
    siteId: uuid("site_id").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    status: experimentStatus("status").notNull().default("draft"),
    variants: jsonb("variants").notNull().default([]),
    trafficPercent: integer("traffic_percent").notNull().default(100),
    goalEvent: text("goal_event").notNull().default("form_submit"),
    goalPath: text("goal_path"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    concludedAt: timestamp("concluded_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => ({
    tenantIdx: index("experiments_tenant_idx").on(t.tenantId),
    siteIdx: index("experiments_site_idx").on(t.siteId),
  }),
);

export const experimentImpressions = pgTable(
  "experiment_impressions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    experimentId: uuid("experiment_id").notNull(),
    variantId: text("variant_id").notNull(),
    sessionId: text("session_id").notNull(),
    visitorId: text("visitor_id"),
    converted: integer("converted").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    convertedAt: timestamp("converted_at", { withTimezone: true }),
  },
  (t) => ({
    experimentIdx: index("impressions_experiment_idx").on(t.experimentId),
    sessionIdx: index("impressions_session_idx").on(t.experimentId, t.sessionId),
  }),
);
