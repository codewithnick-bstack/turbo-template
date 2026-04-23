import { eq, and, isNull } from "drizzle-orm";
import { schema } from "@repo/db";
import { AppError } from "@repo/observability";
import { defineContract } from "../parity";
import type { ServiceContext } from "../context";
import { recordAudit } from "../audit";

// ── Contracts ──────────────────────────────────────────────────────────────

export const exportDataContract = defineContract({
  operation: "compliance.export_data",
  description: "Export all tenant data as a JSON archive (GDPR/CCPA DSR).",
  http: { method: "POST", path: "/v1/compliance/export" },
  mcp: { tool: "export_tenant_data" },
});

export const deleteTenantContract = defineContract({
  operation: "compliance.delete_tenant",
  description: "Permanently delete tenant and all associated data (GDPR right to erasure).",
  http: { method: "DELETE", path: "/v1/compliance/tenant" },
  mcp: { tool: "delete_tenant_data" },
  webhook: { event: "tenant.deleted" },
});

// ── Export ─────────────────────────────────────────────────────────────────

export async function exportTenantData(ctx: ServiceContext): Promise<{ data: Record<string, unknown> }> {
  const [tenant] = await ctx.db
    .select()
    .from(schema.tenants)
    .where(and(eq(schema.tenants.id, ctx.tenantId), isNull(schema.tenants.deletedAt)))
    .limit(1);
  if (!tenant) throw new AppError("not_found", "tenant not found");

  const [sites, memberships, auditEntries] = await Promise.all([
    ctx.db.select().from(schema.sites).where(eq(schema.sites.tenantId, ctx.tenantId)),
    ctx.db.select().from(schema.memberships).where(eq(schema.memberships.tenantId, ctx.tenantId)),
    ctx.db.select().from(schema.auditLog).where(eq(schema.auditLog.tenantId, ctx.tenantId)).limit(1000),
  ]);

  await recordAudit({
    db: ctx.db,
    tenantId: ctx.tenantId,
    actor: ctx.actor,
    action: "export",
    resourceKind: "tenant",
    resourceId: ctx.tenantId,
  });

  return {
    data: {
      exportedAt: new Date().toISOString(),
      tenant: {
        id: tenant.id,
        slug: tenant.slug,
        name: tenant.name,
        plan: tenant.plan,
        createdAt: tenant.createdAt,
      },
      sites: sites.map((s) => ({ id: s.id, name: s.name, slug: s.slug, createdAt: s.createdAt })),
      members: memberships.map((m) => ({ userId: m.userId, role: m.role, joinedAt: m.createdAt })),
      auditLog: auditEntries.map((e) => ({
        id: e.id,
        action: e.action,
        resourceKind: e.resourceKind,
        resourceId: e.resourceId,
        createdAt: e.createdAt,
      })),
    },
  };
}

// ── Delete (soft, queues async purge) ─────────────────────────────────────

export async function deleteTenantData(
  ctx: ServiceContext,
): Promise<{ scheduled: true; purgeAfterDays: number }> {
  const [tenant] = await ctx.db
    .select({ id: schema.tenants.id, type: schema.tenants.type })
    .from(schema.tenants)
    .where(and(eq(schema.tenants.id, ctx.tenantId), isNull(schema.tenants.deletedAt)))
    .limit(1);
  if (!tenant) throw new AppError("not_found", "tenant not found");
  if (tenant.type === "agency") {
    const children = await ctx.db
      .select({ id: schema.tenants.id })
      .from(schema.tenants)
      .where(
        and(eq(schema.tenants.parentTenantId, ctx.tenantId), isNull(schema.tenants.deletedAt)),
      );
    if (children.length > 0) {
      throw new AppError(
        "conflict",
        "remove all client workspaces before deleting the agency tenant",
      );
    }
  }

  await ctx.db
    .update(schema.tenants)
    .set({ deletedAt: new Date(), status: "suspended" })
    .where(eq(schema.tenants.id, ctx.tenantId));

  await recordAudit({
    db: ctx.db,
    tenantId: ctx.tenantId,
    actor: ctx.actor,
    action: "delete",
    resourceKind: "tenant",
    resourceId: ctx.tenantId,
  });

  return { scheduled: true, purgeAfterDays: 30 };
}
