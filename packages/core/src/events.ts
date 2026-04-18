import { eq, and, sql } from "drizzle-orm";
import { schema, type Db } from "@repo/db";

/**
 * Emit a webhook event for a tenant. Persists one webhook_delivery row per
 * matching active subscription with status=pending. The worker picks up
 * pending rows and performs the HTTP POST with HMAC signing.
 */
export async function emitEvent(params: {
  db: Db;
  tenantId: string;
  event: string;
  payload: Record<string, unknown>;
}): Promise<void> {
  const subs = await params.db
    .select()
    .from(schema.webhookSubscriptions)
    .where(
      and(
        eq(schema.webhookSubscriptions.tenantId, params.tenantId),
        eq(schema.webhookSubscriptions.active, true),
        sql`${schema.webhookSubscriptions.events} ? ${params.event}`,
      ),
    );

  if (subs.length === 0) return;

  await params.db.insert(schema.webhookDeliveries).values(
    subs.map((sub) => ({
      tenantId: params.tenantId,
      subscriptionId: sub.id,
      event: params.event,
      payload: params.payload,
      status: "pending",
      attempts: 0,
    })),
  );
}
