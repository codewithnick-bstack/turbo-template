import { eq, and, desc } from "drizzle-orm";
import { schema } from "@repo/db";
import { AppError } from "@repo/observability";
import { CreateSiteInput, UpdateSiteInput, type TSite } from "@repo/schemas";
import { defineContract } from "../parity";
import type { ServiceContext } from "../context";
import { recordAudit } from "../audit";
import { emitEvent } from "../events";

export const createSiteContract = defineContract({
  operation: "sites.create",
  description: "Create a new site within the current tenant.",
  http: { method: "POST", path: "/v1/sites" },
  mcp: { tool: "create_site" },
  webhook: { event: "site.created" },
});

export const listSitesContract = defineContract({
  operation: "sites.list",
  description: "List sites in the current tenant.",
  idempotent: true,
  http: { method: "GET", path: "/v1/sites" },
  mcp: { tool: "list_sites" },
});

export const getSiteContract = defineContract({
  operation: "sites.get",
  description: "Get a site by id.",
  idempotent: true,
  http: { method: "GET", path: "/v1/sites/:id" },
  mcp: { tool: "get_site" },
});

export const updateSiteContract = defineContract({
  operation: "sites.update",
  description: "Update site metadata.",
  idempotent: true,
  http: { method: "PATCH", path: "/v1/sites/:id" },
  mcp: { tool: "update_site" },
  webhook: { event: "site.updated" },
});

export const bindDomainContract = defineContract({
  operation: "sites.bind_domain",
  description: "Bind a custom domain to a site; issues a verification token.",
  http: { method: "POST", path: "/v1/sites/:id/domain" },
  mcp: { tool: "bind_domain" },
  webhook: { event: "site.domain_bound" },
});

type SiteRow = typeof schema.sites.$inferSelect;

function toSite(row: SiteRow): TSite {
  return {
    id: row.id,
    tenantId: row.tenantId,
    slug: row.slug,
    name: row.name,
    description: row.description,
    primaryDomain: row.primaryDomain,
    status: row.status,
    locales: (row.locales as string[]) ?? ["en"],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function createSite(ctx: ServiceContext, input: unknown): Promise<TSite> {
  const parsed = CreateSiteInput.parse(input);

  const dup = await ctx.db
    .select({ id: schema.sites.id })
    .from(schema.sites)
    .where(and(eq(schema.sites.tenantId, ctx.tenantId), eq(schema.sites.slug, parsed.slug)))
    .limit(1);
  if (dup.length > 0) {
    throw new AppError("conflict", `site slug already exists in tenant: ${parsed.slug}`);
  }

  const [row] = await ctx.db
    .insert(schema.sites)
    .values({
      tenantId: ctx.tenantId,
      slug: parsed.slug,
      name: parsed.name,
      description: parsed.description ?? null,
    })
    .returning();
  if (!row) throw new AppError("internal", "site insert returned no row");

  await recordAudit({
    db: ctx.db,
    tenantId: ctx.tenantId,
    actor: ctx.actor,
    action: "create",
    resourceKind: "site",
    resourceId: row.id,
    after: toSite(row) as unknown as Record<string, unknown>,
  });

  await emitEvent({
    db: ctx.db,
    tenantId: ctx.tenantId,
    event: "site.created",
    payload: { site: toSite(row) },
  });

  return toSite(row);
}

export async function listSites(ctx: ServiceContext): Promise<TSite[]> {
  const rows = await ctx.db
    .select()
    .from(schema.sites)
    .where(eq(schema.sites.tenantId, ctx.tenantId))
    .orderBy(desc(schema.sites.createdAt));
  return rows.map(toSite);
}

export async function getSite(ctx: ServiceContext, id: string): Promise<TSite> {
  const [row] = await ctx.db
    .select()
    .from(schema.sites)
    .where(and(eq(schema.sites.id, id), eq(schema.sites.tenantId, ctx.tenantId)))
    .limit(1);
  if (!row) throw new AppError("not_found", `site not found: ${id}`);
  return toSite(row);
}

export async function getSiteByDomain(
  ctx: ServiceContext,
  hostname: string,
): Promise<TSite | null> {
  const [row] = await ctx.db
    .select()
    .from(schema.sites)
    .where(eq(schema.sites.primaryDomain, hostname))
    .limit(1);
  if (!row) return null;
  return toSite(row);
}

export async function updateSite(ctx: ServiceContext, input: unknown): Promise<TSite> {
  const parsed = UpdateSiteInput.parse(input);
  const id = (input as { id: string }).id;
  if (!id) throw new AppError("bad_request", "site id required");
  const current = await getSite(ctx, id);

  const patch: Partial<typeof schema.sites.$inferInsert> = { updatedAt: new Date() };
  if (parsed.name !== undefined) patch.name = parsed.name;
  if (parsed.slug !== undefined) patch.slug = parsed.slug;
  if (parsed.description !== undefined) patch.description = parsed.description ?? null;

  const [row] = await ctx.db
    .update(schema.sites)
    .set(patch)
    .where(and(eq(schema.sites.id, current.id), eq(schema.sites.tenantId, ctx.tenantId)))
    .returning();
  if (!row) throw new AppError("internal", "site update returned no row");

  await recordAudit({
    db: ctx.db,
    tenantId: ctx.tenantId,
    actor: ctx.actor,
    action: "update",
    resourceKind: "site",
    resourceId: row.id,
    before: current as unknown as Record<string, unknown>,
    after: toSite(row) as unknown as Record<string, unknown>,
  });

  await emitEvent({
    db: ctx.db,
    tenantId: ctx.tenantId,
    event: "site.updated",
    payload: { site: toSite(row) },
  });

  return toSite(row);
}

export async function deleteSite(ctx: ServiceContext, id: string) {
  const site = await getSite(ctx, id);
  await ctx.db
    .delete(schema.sites)
    .where(and(eq(schema.sites.id, site.id), eq(schema.sites.tenantId, ctx.tenantId)));

  await recordAudit({
    db: ctx.db,
    tenantId: ctx.tenantId,
    actor: ctx.actor,
    action: "delete",
    resourceKind: "site",
    resourceId: site.id,
    before: site as unknown as Record<string, unknown>,
  });

  await emitEvent({
    db: ctx.db,
    tenantId: ctx.tenantId,
    event: "site.deleted",
    payload: { siteId: site.id },
  });

  return { deleted: site.id };
}

export async function bindDomain(
  ctx: ServiceContext,
  input: { siteId: string; hostname: string },
) {
  await getSite(ctx, input.siteId);

  const existing = await ctx.db
    .select()
    .from(schema.domainBindings)
    .where(eq(schema.domainBindings.hostname, input.hostname))
    .limit(1);
  if (existing.length > 0) {
    throw new AppError("conflict", `domain already bound: ${input.hostname}`);
  }

  const verificationToken = crypto.randomUUID().replaceAll("-", "");
  const [row] = await ctx.db
    .insert(schema.domainBindings)
    .values({
      tenantId: ctx.tenantId,
      siteId: input.siteId,
      hostname: input.hostname,
      status: "pending",
      verificationToken,
    })
    .returning();
  if (!row) throw new AppError("internal", "domain_bindings insert returned no row");

  await emitEvent({
    db: ctx.db,
    tenantId: ctx.tenantId,
    event: "site.domain_bound",
    payload: { siteId: input.siteId, hostname: input.hostname, status: "pending" },
  });

  return { id: row.id, hostname: row.hostname, status: row.status, verificationToken };
}
