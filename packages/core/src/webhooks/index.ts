import { randomBytes } from "node:crypto";
import { eq, and, desc, gte } from "drizzle-orm";
import { schema } from "@repo/db";
import { AppError } from "@repo/observability";
import { z } from "zod";
import { defineContract } from "../parity";
import type { ServiceContext } from "../context";

export const subscribeWebhookContract = defineContract({
  operation: "webhooks.subscribe",
  description: "Create a webhook subscription for specific events.",
  http: { method: "POST", path: "/v1/webhooks/subscriptions" },
  mcp: { tool: "subscribe_webhook" },
});

export const listWebhooksContract = defineContract({
  operation: "webhooks.list",
  description: "List webhook subscriptions for the tenant.",
  idempotent: true,
  http: { method: "GET", path: "/v1/webhooks/subscriptions" },
  mcp: { tool: "list_webhook_subscriptions" },
});

export const listDeliveriesContract = defineContract({
  operation: "webhooks.deliveries.list",
  description: "List recent webhook deliveries.",
  idempotent: true,
  http: { method: "GET", path: "/v1/webhooks/deliveries" },
  mcp: { tool: "list_webhook_deliveries" },
});

export const replayWebhookContract = defineContract({
  operation: "webhooks.replay",
  description: "Replay webhook deliveries over a time window.",
  http: { method: "POST", path: "/v1/webhooks/replay" },
  mcp: { tool: "replay_webhook", requiresApproval: true },
});

const SubscribeInput = z.object({
  url: z.string().url(),
  events: z.array(z.string()).min(1),
});

const ReplayInput = z.object({
  sinceIsoDate: z.string().datetime(),
  subscriptionId: z.string().uuid().optional(),
});

export async function subscribeWebhook(ctx: ServiceContext, input: unknown) {
  const parsed = SubscribeInput.parse(input);
  const secret = `whsec_${randomBytes(24).toString("hex")}`;

  const [row] = await ctx.db
    .insert(schema.webhookSubscriptions)
    .values({
      tenantId: ctx.tenantId,
      url: parsed.url,
      events: parsed.events,
      secret,
    })
    .returning();
  if (!row) throw new AppError("internal", "subscription insert returned no row");
  return row;
}

export async function listWebhooks(ctx: ServiceContext) {
  return ctx.db
    .select()
    .from(schema.webhookSubscriptions)
    .where(eq(schema.webhookSubscriptions.tenantId, ctx.tenantId))
    .orderBy(desc(schema.webhookSubscriptions.createdAt));
}

export async function listDeliveries(ctx: ServiceContext, filter: { limit?: number } = {}) {
  return ctx.db
    .select()
    .from(schema.webhookDeliveries)
    .where(eq(schema.webhookDeliveries.tenantId, ctx.tenantId))
    .orderBy(desc(schema.webhookDeliveries.createdAt))
    .limit(Math.min(filter.limit ?? 50, 500));
}

export async function replayWebhook(ctx: ServiceContext, input: unknown) {
  const parsed = ReplayInput.parse(input);
  const since = new Date(parsed.sinceIsoDate);

  const conditions = [
    eq(schema.webhookDeliveries.tenantId, ctx.tenantId),
    gte(schema.webhookDeliveries.createdAt, since),
  ];
  if (parsed.subscriptionId) {
    conditions.push(eq(schema.webhookDeliveries.subscriptionId, parsed.subscriptionId));
  }

  const deliveries = await ctx.db
    .select()
    .from(schema.webhookDeliveries)
    .where(and(...conditions));

  if (deliveries.length === 0) return { queued: 0 };

  await ctx.db.insert(schema.webhookDeliveries).values(
    deliveries.map((d) => ({
      tenantId: ctx.tenantId,
      subscriptionId: d.subscriptionId,
      event: d.event,
      payload: d.payload,
      status: "pending",
      attempts: 0,
    })),
  );

  return { queued: deliveries.length };
}
