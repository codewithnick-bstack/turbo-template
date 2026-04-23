import { eq, and, desc, gte, count, countDistinct, sql, isNull } from "drizzle-orm";
import { schema } from "@repo/db";
import { AppError } from "@repo/observability";
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

// ── A/B Experiments ────────────────────────────────────────────────────────

export const createExperimentContract = defineContract({
  operation: "analytics.experiments.create",
  description: "Create an A/B experiment for a site.",
  http: { method: "POST", path: "/v1/experiments" },
  mcp: { tool: "create_experiment" },
  webhook: { event: "experiment.created" },
});

export const listExperimentsContract = defineContract({
  operation: "analytics.experiments.list",
  description: "List experiments for a site.",
  idempotent: true,
  http: { method: "GET", path: "/v1/experiments" },
  mcp: { tool: "list_experiments" },
});

export const getVariantContract = defineContract({
  operation: "analytics.experiments.get_variant",
  description: "Get sticky variant assignment for a session.",
  idempotent: true,
  http: { method: "GET", path: "/v1/experiments/:id/variant" },
  mcp: { tool: "get_experiment_variant" },
});

export const recordConversionContract = defineContract({
  operation: "analytics.experiments.convert",
  description: "Record a conversion for a session's variant.",
  http: { method: "POST", path: "/v1/experiments/:id/convert" },
  mcp: { tool: "record_experiment_conversion" },
});

export const getExperimentResultsContract = defineContract({
  operation: "analytics.experiments.results",
  description: "Get conversion results for an experiment.",
  idempotent: true,
  http: { method: "GET", path: "/v1/experiments/:id/results" },
  mcp: { tool: "get_experiment_results" },
});

export type ExperimentVariant = { id: string; name: string; weight: number };

const CreateExperimentInput = z.object({
  siteId: z.string().uuid(),
  name: z.string().min(1).max(120),
  description: z.string().optional(),
  variants: z
    .array(z.object({ id: z.string().min(1), name: z.string().min(1), weight: z.number().int().min(1).max(100) }))
    .min(2)
    .max(8)
    .refine((vs) => vs.reduce((s, v) => s + v.weight, 0) === 100, "variant weights must sum to 100"),
  trafficPercent: z.number().int().min(1).max(100).default(100),
  goalEvent: z.enum(["pageview", "click", "form_start", "form_submit", "custom"]).default("form_submit"),
  goalPath: z.string().optional(),
});

const ListExperimentsInput = z.object({
  siteId: z.string().uuid(),
});

const GetVariantInput = z.object({
  sessionId: z.string().min(1),
  visitorId: z.string().optional(),
});

const RecordConversionInput = z.object({
  sessionId: z.string().min(1),
});

function assignVariant(variants: ExperimentVariant[], sessionId: string, experimentId: string): ExperimentVariant {
  // Deterministic: hash of sessionId + experimentId → bucket 0-99
  let hash = 0;
  const seed = `${experimentId}:${sessionId}`;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) & 0xffffffff;
  }
  const bucket = Math.abs(hash) % 100;
  let cumulative = 0;
  for (const v of variants) {
    cumulative += v.weight;
    if (bucket < cumulative) return v;
  }
  return variants[variants.length - 1]!;
}

export async function createExperiment(ctx: ServiceContext, input: unknown) {
  const parsed = CreateExperimentInput.parse(input);

  const site = await ctx.db.query.sites.findFirst({
    where: and(eq(schema.sites.id, parsed.siteId), eq(schema.sites.tenantId, ctx.tenantId)),
  });
  if (!site) throw new AppError("not_found", "Site not found");

  const [exp] = await ctx.db
    .insert(schema.experiments)
    .values({
      tenantId: ctx.tenantId,
      siteId: parsed.siteId,
      name: parsed.name,
      description: parsed.description,
      variants: parsed.variants,
      trafficPercent: parsed.trafficPercent,
      goalEvent: parsed.goalEvent,
      goalPath: parsed.goalPath,
    })
    .returning();
  if (!exp) throw new AppError("internal", "Failed to create experiment");
  return exp;
}

export async function listExperiments(ctx: ServiceContext, query: unknown) {
  const { siteId } = ListExperimentsInput.parse(query);

  const site = await ctx.db.query.sites.findFirst({
    where: and(eq(schema.sites.id, siteId), eq(schema.sites.tenantId, ctx.tenantId)),
  });
  if (!site) throw new AppError("not_found", "Site not found");

  const rows = await ctx.db.query.experiments.findMany({
    where: and(
      eq(schema.experiments.siteId, siteId),
      eq(schema.experiments.tenantId, ctx.tenantId),
      isNull(schema.experiments.deletedAt),
    ),
    orderBy: [desc(schema.experiments.createdAt)],
  });
  return { data: rows };
}

export async function getVariant(ctx: ServiceContext, experimentId: string, query: unknown) {
  const { sessionId, visitorId } = GetVariantInput.parse(query);

  const exp = await ctx.db.query.experiments.findFirst({
    where: and(
      eq(schema.experiments.id, experimentId),
      eq(schema.experiments.tenantId, ctx.tenantId),
      isNull(schema.experiments.deletedAt),
    ),
  });
  if (!exp) throw new AppError("not_found", "Experiment not found");
  if (exp.status !== "running") {
    return { variant: null, reason: "experiment_not_running" };
  }

  // Traffic sampling: skip assignment for sessions outside traffic %
  let hash = 0;
  const trafficSeed = `traffic:${experimentId}:${sessionId}`;
  for (let i = 0; i < trafficSeed.length; i++) {
    hash = (hash * 31 + trafficSeed.charCodeAt(i)) & 0xffffffff;
  }
  if (Math.abs(hash) % 100 >= exp.trafficPercent) {
    return { variant: null, reason: "not_in_traffic" };
  }

  const variants = exp.variants as ExperimentVariant[];
  const variant = assignVariant(variants, sessionId, experimentId);

  // Upsert impression (idempotent by sessionId)
  const existing = await ctx.db.query.experimentImpressions.findFirst({
    where: and(
      eq(schema.experimentImpressions.experimentId, experimentId),
      eq(schema.experimentImpressions.sessionId, sessionId),
    ),
  });

  if (!existing) {
    await ctx.db.insert(schema.experimentImpressions).values({
      experimentId,
      variantId: variant.id,
      sessionId,
      visitorId,
    });
  }

  return { variant: existing ? (existing.variantId === variant.id ? variant : variants.find((v) => v.id === existing.variantId) ?? variant) : variant };
}

export async function recordConversion(ctx: ServiceContext, experimentId: string, input: unknown) {
  const { sessionId } = RecordConversionInput.parse(input);

  const impression = await ctx.db.query.experimentImpressions.findFirst({
    where: and(
      eq(schema.experimentImpressions.experimentId, experimentId),
      eq(schema.experimentImpressions.sessionId, sessionId),
    ),
  });
  if (!impression) return { converted: false, reason: "no_impression" };
  if (impression.converted) return { converted: false, reason: "already_converted" };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (ctx.db.update(schema.experimentImpressions) as any)
    .set({ converted: 1, convertedAt: new Date() })
    .where(eq(schema.experimentImpressions.id, impression.id));

  return { converted: true };
}

export async function getExperimentResults(ctx: ServiceContext, experimentId: string) {
  const exp = await ctx.db.query.experiments.findFirst({
    where: and(
      eq(schema.experiments.id, experimentId),
      eq(schema.experiments.tenantId, ctx.tenantId),
      isNull(schema.experiments.deletedAt),
    ),
  });
  if (!exp) throw new AppError("not_found", "Experiment not found");

  const rows = await ctx.db
    .select({
      variantId: schema.experimentImpressions.variantId,
      impressions: count(),
      conversions: sql<number>`SUM(${schema.experimentImpressions.converted})`,
    })
    .from(schema.experimentImpressions)
    .where(eq(schema.experimentImpressions.experimentId, experimentId))
    .groupBy(schema.experimentImpressions.variantId);

  const variants = exp.variants as ExperimentVariant[];
  const results = variants.map((v) => {
    const row = rows.find((r) => r.variantId === v.id);
    const impressions = row?.impressions ?? 0;
    const conversions = Number(row?.conversions ?? 0);
    return {
      variantId: v.id,
      variantName: v.name,
      impressions,
      conversions,
      conversionRate: impressions > 0 ? conversions / impressions : 0,
    };
  });

  return { experiment: exp, results };
}
