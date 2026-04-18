import { eq, and, isNull } from "drizzle-orm";
import { schema } from "@repo/db";
import { AppError } from "@repo/observability";
import { CreateTenantInput, type TTenant } from "@repo/schemas";
import { defineContract } from "../parity";
import type { ServiceContext } from "../context";
import { recordAudit } from "../audit";
import { emitEvent } from "../events";

export const createTenantContract = defineContract({
  operation: "tenants.create",
  description: "Create a new tenant (direct, agency, or client).",
  http: { method: "POST", path: "/v1/tenants" },
  mcp: { tool: "create_tenant" },
  webhook: { event: "tenant.created" },
});

export const getTenantContract = defineContract({
  operation: "tenants.get",
  description: "Get the current tenant.",
  idempotent: true,
  http: { method: "GET", path: "/v1/tenants/current" },
  mcp: { tool: "get_tenant" },
});

type TenantRow = typeof schema.tenants.$inferSelect;

function toTenant(row: TenantRow): TTenant {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    type: row.type,
    parentTenantId: row.parentTenantId,
    plan: row.plan,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function createTenant(ctx: ServiceContext, input: unknown): Promise<TTenant> {
  const parsed = CreateTenantInput.parse(input);

  const existing = await ctx.db
    .select({ id: schema.tenants.id })
    .from(schema.tenants)
    .where(and(eq(schema.tenants.slug, parsed.slug), isNull(schema.tenants.deletedAt)))
    .limit(1);
  if (existing.length > 0) {
    throw new AppError("conflict", `tenant slug already in use: ${parsed.slug}`);
  }

  const [row] = await ctx.db
    .insert(schema.tenants)
    .values({
      slug: parsed.slug,
      name: parsed.name,
      type: parsed.type,
      parentTenantId: parsed.parentTenantId ?? null,
    })
    .returning();
  if (!row) throw new AppError("internal", "tenant insert returned no row");

  await recordAudit({
    db: ctx.db,
    tenantId: row.id,
    actor: ctx.actor,
    action: "create",
    resourceKind: "tenant",
    resourceId: row.id,
    after: toTenant(row) as unknown as Record<string, unknown>,
  });

  await emitEvent({
    db: ctx.db,
    tenantId: row.id,
    event: "tenant.created",
    payload: { tenant: toTenant(row) },
  });

  return toTenant(row);
}

export async function getTenant(ctx: ServiceContext): Promise<TTenant> {
  const [row] = await ctx.db
    .select()
    .from(schema.tenants)
    .where(and(eq(schema.tenants.id, ctx.tenantId), isNull(schema.tenants.deletedAt)))
    .limit(1);
  if (!row) throw new AppError("not_found", `tenant not found: ${ctx.tenantId}`);
  return toTenant(row);
}

export async function listChildTenants(ctx: ServiceContext): Promise<TTenant[]> {
  const rows = await ctx.db
    .select()
    .from(schema.tenants)
    .where(and(eq(schema.tenants.parentTenantId, ctx.tenantId), isNull(schema.tenants.deletedAt)));
  return rows.map(toTenant);
}
