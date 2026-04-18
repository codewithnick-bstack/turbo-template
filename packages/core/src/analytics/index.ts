import { eq, and, desc, gte, count, countDistinct, sql } from "drizzle-orm";
import { schema } from "@repo/db";
import { z } from "zod";
import { defineContract } from "../parity";
import type { ServiceContext } from "../context";

export const ingestEventContract = defineContract({
  operation: "analytics.ingest",
  description: "Ingest a first-party analytics event from a site visitor.",
  http: { method: "POST", path: "/v1/analytics/events" },
  mcp: { tool: "ingest_analytics_event" },
});

export const getAnalyticsContract = defineContract({
  operation: "analytics.get",
  description: "Get aggregated analytics for a site.",
  idempotent: true,
  http: { method: "GET", path: "/v1/analytics" },
  mcp: { tool: "get_analytics" },
});

const IngestInput = z.object({
  siteId: z.string().uuid(),
  sessionId: z.string().optional(),
  visitorId: z.string().optional(),
  event: z.enum(["pageview", "click", "form_start", "form_submit", "custom"]),
  path: z.string().optional(),
  referrer: z.string().optional(),
  userAgent: z.string().optional(),
  country: z.string().max(2).optional(),
  props: z.record(z.unknown()).optional(),
  dnt: z.boolean().optional(),
});

export async function ingestEvent(ctx: ServiceContext, input: unknown) {
  const parsed = IngestInput.parse(input);
  if (parsed.dnt) return { ok: true, dropped: true };

  const row = {
    tenantId: ctx.tenantId,
    siteId: parsed.siteId,
    sessionId: parsed.sessionId,
    visitorId: parsed.visitorId,
    event: parsed.event,
    path: parsed.path,
    referrer: parsed.referrer,
    userAgent: parsed.userAgent,
    country: parsed.country,
    props: parsed.props ?? {},
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await ctx.db.insert(schema.analyticsEvents).values(row as any);

  return { ok: true };
}

const GetAnalyticsInput = z.object({
  siteId: z.string().uuid(),
  days: z.coerce.number().int().min(1).max(90).default(30),
});

export async function getAnalytics(ctx: ServiceContext, query: unknown) {
  const parsed = GetAnalyticsInput.parse(query);
  const since = new Date(Date.now() - parsed.days * 86_400_000);

  const [totals] = await ctx.db
    .select({
      pageViews: count(),
      uniqueVisitors: countDistinct(schema.analyticsEvents.visitorId),
    })
    .from(schema.analyticsEvents)
    .where(
      and(
        eq(schema.analyticsEvents.tenantId, ctx.tenantId),
        eq(schema.analyticsEvents.siteId, parsed.siteId),
        eq(schema.analyticsEvents.event, "pageview"),
        gte(schema.analyticsEvents.createdAt, since),
      ),
    );

  const topPages = await ctx.db
    .select({
      path: schema.analyticsEvents.path,
      views: count(),
    })
    .from(schema.analyticsEvents)
    .where(
      and(
        eq(schema.analyticsEvents.tenantId, ctx.tenantId),
        eq(schema.analyticsEvents.siteId, parsed.siteId),
        eq(schema.analyticsEvents.event, "pageview"),
        gte(schema.analyticsEvents.createdAt, since),
      ),
    )
    .groupBy(schema.analyticsEvents.path)
    .orderBy(desc(sql`count(*)`))
    .limit(10);

  const dailyViews = await ctx.db
    .select({
      date: sql<string>`date_trunc('day', ${schema.analyticsEvents.createdAt})::text`,
      views: count(),
    })
    .from(schema.analyticsEvents)
    .where(
      and(
        eq(schema.analyticsEvents.tenantId, ctx.tenantId),
        eq(schema.analyticsEvents.siteId, parsed.siteId),
        eq(schema.analyticsEvents.event, "pageview"),
        gte(schema.analyticsEvents.createdAt, since),
      ),
    )
    .groupBy(sql`date_trunc('day', ${schema.analyticsEvents.createdAt})`)
    .orderBy(sql`date_trunc('day', ${schema.analyticsEvents.createdAt})`);

  return {
    pageViews: totals?.pageViews ?? 0,
    uniqueVisitors: totals?.uniqueVisitors ?? 0,
    topPages,
    dailyViews,
    period: { days: parsed.days, since: since.toISOString() },
  };
}
