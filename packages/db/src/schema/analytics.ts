import { pgTable, uuid, text, timestamp, integer, index, jsonb } from "drizzle-orm/pg-core";

export const analyticsEvents = pgTable(
  "analytics_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").notNull(),
    siteId: uuid("site_id").notNull(),
    sessionId: text("session_id"),
    visitorId: text("visitor_id"),
    event: text("event").notNull(),
    path: text("path"),
    referrer: text("referrer"),
    userAgent: text("user_agent"),
    country: text("country"),
    props: jsonb("props").default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    tenantIdx: index("analytics_tenant_idx").on(t.tenantId),
    siteIdx: index("analytics_site_idx").on(t.siteId),
    createdIdx: index("analytics_created_idx").on(t.createdAt),
  }),
);

export const analyticsRollups = pgTable(
  "analytics_rollups",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").notNull(),
    siteId: uuid("site_id").notNull(),
    date: text("date").notNull(),
    path: text("path"),
    pageViews: integer("page_views").notNull().default(0),
    uniqueVisitors: integer("unique_visitors").notNull().default(0),
    bounceRate: integer("bounce_rate_pct"),
  },
  (t) => ({
    siteIdx: index("rollups_site_idx").on(t.siteId, t.date),
  }),
);
