import { eq, and, isNull } from "drizzle-orm";
import { schema } from "@repo/db";
import { AppError } from "@repo/observability";
import { z } from "zod";
import { defineContract } from "../parity";
import type { ServiceContext } from "../context";
import { recordAudit } from "../audit";
import { emitEvent } from "../events";
import type { TTenant } from "@repo/schemas";

// ── Contracts ──────────────────────────────────────────────────────────────

export const createClientWorkspaceContract = defineContract({
  operation: "agency.create_client_workspace",
  description: "Create a client workspace under the current agency tenant.",
  http: { method: "POST", path: "/v1/agency/clients" },
  mcp: { tool: "create_client_workspace" },
  webhook: { event: "agency.client_created" },
});

export const listClientWorkspacesContract = defineContract({
  operation: "agency.list_client_workspaces",
  description: "List all client workspaces under the current agency tenant.",
  idempotent: true,
  http: { method: "GET", path: "/v1/agency/clients" },
  mcp: { tool: "list_client_workspaces" },
});

export const getClientWorkspaceContract = defineContract({
  operation: "agency.get_client_workspace",
  description: "Get a single client workspace by ID.",
  idempotent: true,
  http: { method: "GET", path: "/v1/agency/clients/:clientId" },
  mcp: { tool: "get_client_workspace" },
});

export const removeClientWorkspaceContract = defineContract({
  operation: "agency.remove_client_workspace",
  description: "Remove a client workspace from the agency.",
  http: { method: "DELETE", path: "/v1/agency/clients/:clientId" },
  mcp: { tool: "remove_client_workspace" },
  webhook: { event: "agency.client_removed" },
});

export const updateClientWorkspaceContract = defineContract({
  operation: "agency.update_client_workspace",
  description: "Update a client workspace name.",
  http: { method: "PATCH", path: "/v1/agency/clients/:clientId" },
  mcp: { tool: "update_client_workspace" },
});

// ── Input schemas ──────────────────────────────────────────────────────────

const CreateClientInput = z.object({
  name: z.string().min(1).max(120),
  slug: z.string().min(2).max(60).regex(/^[a-z0-9-]+$/),
});

const UpdateClientInput = z.object({
  name: z.string().min(1).max(120).optional(),
});

// ── Helpers ────────────────────────────────────────────────────────────────

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

async function assertAgency(ctx: ServiceContext) {
  const [row] = await ctx.db
    .select({ type: schema.tenants.type })
    .from(schema.tenants)
    .where(and(eq(schema.tenants.id, ctx.tenantId), isNull(schema.tenants.deletedAt)))
    .limit(1);
  if (!row || row.type !== "agency") {
    throw new AppError("forbidden", "only agency tenants can manage client workspaces");
  }
}

async function assertOwnsClient(ctx: ServiceContext, clientId: string): Promise<TenantRow> {
  const [row] = await ctx.db
    .select()
    .from(schema.tenants)
    .where(
      and(
        eq(schema.tenants.id, clientId),
        eq(schema.tenants.parentTenantId, ctx.tenantId),
        isNull(schema.tenants.deletedAt),
      ),
    )
    .limit(1);
  if (!row) throw new AppError("not_found", `client workspace not found: ${clientId}`);
  return row;
}

// ── Service functions ──────────────────────────────────────────────────────

export async function createClientWorkspace(ctx: ServiceContext, input: unknown): Promise<TTenant> {
  await assertAgency(ctx);
  const parsed = CreateClientInput.parse(input);

  const existing = await ctx.db
    .select({ id: schema.tenants.id })
    .from(schema.tenants)
    .where(and(eq(schema.tenants.slug, parsed.slug), isNull(schema.tenants.deletedAt)))
    .limit(1);
  if (existing.length > 0) {
    throw new AppError("conflict", `slug already in use: ${parsed.slug}`);
  }

  const [row] = await ctx.db
    .insert(schema.tenants)
    .values({
      slug: parsed.slug,
      name: parsed.name,
      type: "client",
      parentTenantId: ctx.tenantId,
    })
    .returning();
  if (!row) throw new AppError("internal", "insert returned no row");

  await recordAudit({
    db: ctx.db,
    tenantId: ctx.tenantId,
    actor: ctx.actor,
    action: "create",
    resourceKind: "tenant",
    resourceId: row.id,
    after: toTenant(row) as unknown as Record<string, unknown>,
  });

  await emitEvent({
    db: ctx.db,
    tenantId: ctx.tenantId,
    event: "agency.client_created",
    payload: { client: toTenant(row) },
  });

  return toTenant(row);
}

export async function listClientWorkspaces(ctx: ServiceContext): Promise<TTenant[]> {
  await assertAgency(ctx);
  const rows = await ctx.db
    .select()
    .from(schema.tenants)
    .where(
      and(eq(schema.tenants.parentTenantId, ctx.tenantId), isNull(schema.tenants.deletedAt)),
    )
    .orderBy(schema.tenants.createdAt);
  return rows.map(toTenant);
}

export async function getClientWorkspace(ctx: ServiceContext, clientId: string): Promise<TTenant> {
  await assertAgency(ctx);
  return toTenant(await assertOwnsClient(ctx, clientId));
}

export async function updateClientWorkspace(
  ctx: ServiceContext,
  clientId: string,
  input: unknown,
): Promise<TTenant> {
  await assertAgency(ctx);
  await assertOwnsClient(ctx, clientId);
  const parsed = UpdateClientInput.parse(input);

  const [updated] = await ctx.db
    .update(schema.tenants)
    .set({ name: parsed.name, updatedAt: new Date() })
    .where(eq(schema.tenants.id, clientId))
    .returning();
  if (!updated) throw new AppError("internal", "update returned no row");

  await recordAudit({
    db: ctx.db,
    tenantId: ctx.tenantId,
    actor: ctx.actor,
    action: "update",
    resourceKind: "tenant",
    resourceId: clientId,
    after: toTenant(updated) as unknown as Record<string, unknown>,
  });

  return toTenant(updated);
}

export async function removeClientWorkspace(
  ctx: ServiceContext,
  clientId: string,
): Promise<{ deleted: string }> {
  await assertAgency(ctx);
  await assertOwnsClient(ctx, clientId);

  await ctx.db
    .update(schema.tenants)
    .set({ deletedAt: new Date() })
    .where(eq(schema.tenants.id, clientId));

  await recordAudit({
    db: ctx.db,
    tenantId: ctx.tenantId,
    actor: ctx.actor,
    action: "delete",
    resourceKind: "tenant",
    resourceId: clientId,
  });

  await emitEvent({
    db: ctx.db,
    tenantId: ctx.tenantId,
    event: "agency.client_removed",
    payload: { clientId },
  });

  return { deleted: clientId };
}
