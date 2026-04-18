import { eq } from "drizzle-orm";
import { schema } from "@repo/db";
import { AppError } from "@repo/observability";
import {
  checkEntitlement as check,
  type Capability,
  type UsageSnapshot,
  type SubscriptionUpdatedPayload,
} from "@repo/billing";
import { defineContract } from "../parity";
import type { ServiceContext } from "../context";

export const entitlementCheckContract = defineContract({
  operation: "billing.check_entitlement",
  description: "Check whether a tenant is entitled to a capability or is within a quota.",
  idempotent: true,
  http: { method: "GET", path: "/v1/billing/entitlements" },
  mcp: { tool: "check_entitlement" },
});

export const setPlanContract = defineContract({
  operation: "billing.set_plan",
  description: "Set the tenant plan (admin-only; production is Stripe-driven).",
  http: { method: "POST", path: "/v1/billing/plan" },
  mcp: { tool: "set_plan", requiresApproval: true },
  webhook: { event: "tenant.upgraded" },
});

async function computeUsage(ctx: ServiceContext): Promise<UsageSnapshot> {
  const [sites, seats, submissions] = await Promise.all([
    ctx.db.$count(schema.sites, eq(schema.sites.tenantId, ctx.tenantId)),
    ctx.db.$count(schema.memberships, eq(schema.memberships.tenantId, ctx.tenantId)),
    ctx.db.$count(schema.formSubmissions, eq(schema.formSubmissions.tenantId, ctx.tenantId)),
  ]);
  return {
    sites,
    seats,
    formSubmissionsThisMonth: submissions,
    aiTokensThisMonth: 0,
  };
}

export async function checkEntitlement(ctx: ServiceContext, capability: Capability) {
  const [tenant] = await ctx.db
    .select()
    .from(schema.tenants)
    .where(eq(schema.tenants.id, ctx.tenantId))
    .limit(1);
  if (!tenant) throw new AppError("not_found", `tenant not found: ${ctx.tenantId}`);
  const usage = await computeUsage(ctx);
  return check(tenant.plan, capability, usage);
}

export async function setPlan(ctx: ServiceContext, plan: "starter" | "pro" | "agency") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [row] = await ctx.db.update(schema.tenants).set({ plan, updatedAt: new Date() } as any)
    .where(eq(schema.tenants.id, ctx.tenantId))
    .returning();
  if (!row) throw new AppError("internal", "plan update returned no row");
  return { id: row.id, plan: row.plan };
}

export async function getTenant(ctx: ServiceContext) {
  const [tenant] = await ctx.db
    .select()
    .from(schema.tenants)
    .where(eq(schema.tenants.id, ctx.tenantId))
    .limit(1);
  if (!tenant) throw new AppError("not_found", `tenant not found: ${ctx.tenantId}`);
  return tenant;
}

export async function handleSubscriptionUpdate(payload: SubscriptionUpdatedPayload) {
  // Tenant lookup is by Stripe customer ID — requires a direct DB connection.
  // This function is called from the webhook handler which has no session context.
  // Caller must supply db directly; we use a dynamic import to avoid circular deps.
  const { createDb } = await import("@repo/db");
  const url = process.env.DATABASE_URL;
  if (!url) return;
  const { db } = createDb({ url });
  const { eq } = await import("drizzle-orm");

  const newPlan = payload.status === "active" ? (payload.planId ?? "starter") : "starter";

  const updatePatch = { plan: newPlan, stripeSubscriptionId: payload.subscriptionId, updatedAt: new Date() };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await db.update(schema.tenants).set(updatePatch as any)
    .where(eq(schema.tenants.stripeCustomerId, payload.customerId));
}
