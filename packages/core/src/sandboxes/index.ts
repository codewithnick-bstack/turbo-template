import { eq, and, isNull, desc } from "drizzle-orm";
import { schema } from "@repo/db";
import { AppError } from "@repo/observability";
import { z } from "zod";
import { defineContract } from "../parity";
import type { ServiceContext } from "../context";
import { recordAudit } from "../audit";
import { emitEvent } from "../events";

// ── Contracts ──────────────────────────────────────────────────────────────

export const createSandboxContract = defineContract({
  operation: "sandboxes.create",
  description: "Create a sandbox environment for a site.",
  http: { method: "POST", path: "/v1/sandboxes" },
  mcp: { tool: "create_sandbox" },
  webhook: { event: "sandbox.created" },
});

export const listSandboxesContract = defineContract({
  operation: "sandboxes.list",
  description: "List all sandboxes for a site.",
  idempotent: true,
  http: { method: "GET", path: "/v1/sandboxes" },
  mcp: { tool: "list_sandboxes" },
});

export const getSandboxContract = defineContract({
  operation: "sandboxes.get",
  description: "Get a sandbox by ID.",
  idempotent: true,
  http: { method: "GET", path: "/v1/sandboxes/:sandboxId" },
  mcp: { tool: "get_sandbox" },
});

export const promoteSandboxContract = defineContract({
  operation: "sandboxes.promote",
  description: "Promote a sandbox to production (apply changes to parent site).",
  http: { method: "POST", path: "/v1/sandboxes/:sandboxId/promote" },
  mcp: { tool: "promote_sandbox" },
  webhook: { event: "sandbox.promoted" },
});

export const deleteSandboxContract = defineContract({
  operation: "sandboxes.delete",
  description: "Delete a sandbox environment.",
  http: { method: "DELETE", path: "/v1/sandboxes/:sandboxId" },
  mcp: { tool: "delete_sandbox" },
  webhook: { event: "sandbox.deleted" },
});

// ── Input schemas ──────────────────────────────────────────────────────────

const CreateSandboxInput = z.object({
  siteId: z.string().uuid(),
  name: z.string().min(1).max(120),
});

const ListSandboxesInput = z.object({
  siteId: z.string().uuid(),
});

// ── Helpers ────────────────────────────────────────────────────────────────

async function assertOwnsSite(ctx: ServiceContext, siteId: string) {
  const site = await ctx.db.query.sites.findFirst({
    where: and(
      eq(schema.sites.id, siteId),
      eq(schema.sites.tenantId, ctx.tenantId),
    ),
  });
  if (!site) throw new AppError("not_found", "Site not found");
  return site;
}

async function assertOwnsSandbox(ctx: ServiceContext, sandboxId: string) {
  const sandbox = await ctx.db.query.sandboxes.findFirst({
    where: and(
      eq(schema.sandboxes.id, sandboxId),
      eq(schema.sandboxes.tenantId, ctx.tenantId),
      isNull(schema.sandboxes.deletedAt),
    ),
  });
  if (!sandbox) throw new AppError("not_found", "Sandbox not found");
  return sandbox;
}

// ── Service functions ──────────────────────────────────────────────────────

export async function createSandbox(ctx: ServiceContext, raw: unknown) {
  const { siteId, name } = CreateSandboxInput.parse(raw);
  await assertOwnsSite(ctx, siteId);

  const [sandbox] = await ctx.db
    .insert(schema.sandboxes)
    .values({ tenantId: ctx.tenantId, parentSiteId: siteId, name })
    .returning();
  if (!sandbox) throw new AppError("internal", "Failed to create sandbox");

  await recordAudit({ db: ctx.db, tenantId: ctx.tenantId, actor: ctx.actor, action: "sandbox.created", resourceKind: "sandbox", resourceId: sandbox.id });
  await emitEvent({ db: ctx.db, tenantId: ctx.tenantId, event: "sandbox.created", payload: { sandboxId: sandbox.id, siteId, name } });

  return sandbox;
}

export async function listSandboxes(ctx: ServiceContext, raw: unknown) {
  const { siteId } = ListSandboxesInput.parse(raw);
  await assertOwnsSite(ctx, siteId);

  const rows = await ctx.db.query.sandboxes.findMany({
    where: and(
      eq(schema.sandboxes.parentSiteId, siteId),
      eq(schema.sandboxes.tenantId, ctx.tenantId),
      isNull(schema.sandboxes.deletedAt),
    ),
    orderBy: [desc(schema.sandboxes.createdAt)],
  });
  return { data: rows };
}

export async function getSandbox(ctx: ServiceContext, sandboxId: string) {
  return assertOwnsSandbox(ctx, sandboxId);
}

export async function promoteSandbox(ctx: ServiceContext, sandboxId: string) {
  const sandbox = await assertOwnsSandbox(ctx, sandboxId);

  if (sandbox.status !== "active") {
    throw new AppError("conflict", "Only active sandboxes can be promoted");
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [updated] = await (ctx.db.update(schema.sandboxes) as any)
    .set({ status: "promoted", promotedAt: new Date() })
    .where(eq(schema.sandboxes.id, sandboxId))
    .returning();

  await recordAudit({ db: ctx.db, tenantId: ctx.tenantId, actor: ctx.actor, action: "sandbox.promoted", resourceKind: "sandbox", resourceId: sandboxId });
  await emitEvent({ db: ctx.db, tenantId: ctx.tenantId, event: "sandbox.promoted", payload: { sandboxId, siteId: sandbox.parentSiteId } });

  return updated;
}

export async function deleteSandbox(ctx: ServiceContext, sandboxId: string) {
  const sandbox = await assertOwnsSandbox(ctx, sandboxId);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (ctx.db.update(schema.sandboxes) as any)
    .set({ status: "deleted", deletedAt: new Date() })
    .where(eq(schema.sandboxes.id, sandboxId));

  await recordAudit({ db: ctx.db, tenantId: ctx.tenantId, actor: ctx.actor, action: "sandbox.deleted", resourceKind: "sandbox", resourceId: sandboxId });
  await emitEvent({ db: ctx.db, tenantId: ctx.tenantId, event: "sandbox.deleted", payload: { sandboxId, siteId: sandbox.parentSiteId } });

  return { deleted: true };
}
