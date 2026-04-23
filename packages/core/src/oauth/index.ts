import { eq, and, isNull } from "drizzle-orm";
import { randomBytes, createHash } from "crypto";
import { schema } from "@repo/db";
import { AppError } from "@repo/observability";
import { z } from "zod";
import { defineContract } from "../parity";
import type { ServiceContext } from "../context";
import { recordAudit } from "../audit";

// ── Contracts ──────────────────────────────────────────────────────────────

export const listOAuthAppsContract = defineContract({
  operation: "oauth.list_apps",
  description: "List OAuth apps registered by the tenant.",
  idempotent: true,
  http: { method: "GET", path: "/v1/oauth/apps" },
  mcp: { tool: "list_oauth_apps" },
});

export const createOAuthAppContract = defineContract({
  operation: "oauth.create_app",
  description: "Register a new OAuth app (developer platform).",
  http: { method: "POST", path: "/v1/oauth/apps" },
  mcp: { tool: "create_oauth_app" },
  webhook: { event: "oauth_app.created" },
});

export const getOAuthAppContract = defineContract({
  operation: "oauth.get_app",
  description: "Get an OAuth app by ID.",
  idempotent: true,
  http: { method: "GET", path: "/v1/oauth/apps/:appId" },
  mcp: { tool: "get_oauth_app" },
});

export const deleteOAuthAppContract = defineContract({
  operation: "oauth.delete_app",
  description: "Delete an OAuth app and revoke all grants.",
  http: { method: "DELETE", path: "/v1/oauth/apps/:appId" },
  mcp: { tool: "delete_oauth_app" },
  webhook: { event: "oauth_app.deleted" },
});

export const rotateOAuthSecretContract = defineContract({
  operation: "oauth.rotate_secret",
  description: "Rotate the client secret for an OAuth app.",
  http: { method: "POST", path: "/v1/oauth/apps/:appId/rotate-secret" },
  mcp: { tool: "rotate_oauth_secret" },
});

// ── Types ──────────────────────────────────────────────────────────────────

export type TOAuthApp = {
  id: string;
  name: string;
  description?: string | null;
  clientId: string;
  redirectUris: string[];
  scopes: string[];
  homepageUrl?: string | null;
  logoUrl?: string | null;
  createdAt: string;
};

export type TOAuthAppWithSecret = TOAuthApp & { clientSecret: string };

const VALID_SCOPES = [
  "sites:read", "sites:write",
  "pages:read", "pages:write",
  "content:read", "content:write",
  "media:read", "media:write",
  "members:read", "members:write",
  "analytics:read",
  "webhooks:read", "webhooks:write",
] as const;

const CreateAppInput = z.object({
  name: z.string().min(1).max(80),
  description: z.string().max(300).optional(),
  redirectUris: z.array(z.string().url()).min(1).max(10),
  scopes: z.array(z.enum(VALID_SCOPES)).min(1),
  homepageUrl: z.string().url().optional(),
  logoUrl: z.string().url().optional(),
});

// ── Helpers ────────────────────────────────────────────────────────────────

type AppRow = typeof schema.oauthApps.$inferSelect;

function toApp(row: AppRow): TOAuthApp {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    clientId: row.clientId,
    redirectUris: row.redirectUris,
    scopes: row.scopes,
    homepageUrl: row.homepageUrl,
    logoUrl: row.logoUrl,
    createdAt: row.createdAt.toISOString(),
  };
}

function generateClientId() {
  return `oc_${randomBytes(12).toString("hex")}`;
}

function generateClientSecret() {
  return `os_${randomBytes(32).toString("hex")}`;
}

async function hashSecret(secret: string) {
  return createHash("sha256").update(secret).digest("hex");
}

async function assertOwns(ctx: ServiceContext, appId: string): Promise<AppRow> {
  const [row] = await ctx.db
    .select()
    .from(schema.oauthApps)
    .where(
      and(
        eq(schema.oauthApps.id, appId),
        eq(schema.oauthApps.tenantId, ctx.tenantId),
        isNull(schema.oauthApps.deletedAt),
      ),
    )
    .limit(1);
  if (!row) throw new AppError("not_found", `OAuth app not found: ${appId}`);
  return row;
}

// ── Service functions ──────────────────────────────────────────────────────

export async function listOAuthApps(ctx: ServiceContext): Promise<TOAuthApp[]> {
  const rows = await ctx.db
    .select()
    .from(schema.oauthApps)
    .where(and(eq(schema.oauthApps.tenantId, ctx.tenantId), isNull(schema.oauthApps.deletedAt)))
    .orderBy(schema.oauthApps.createdAt);
  return rows.map(toApp);
}

export async function createOAuthApp(ctx: ServiceContext, input: unknown): Promise<TOAuthAppWithSecret> {
  const parsed = CreateAppInput.parse(input);
  const clientId = generateClientId();
  const plainSecret = generateClientSecret();
  const secretHash = await hashSecret(plainSecret);

  const [row] = await ctx.db
    .insert(schema.oauthApps)
    .values({
      tenantId: ctx.tenantId,
      name: parsed.name,
      description: parsed.description ?? null,
      clientId,
      clientSecret: secretHash,
      redirectUris: parsed.redirectUris,
      scopes: parsed.scopes,
      homepageUrl: parsed.homepageUrl ?? null,
      logoUrl: parsed.logoUrl ?? null,
    })
    .returning();
  if (!row) throw new AppError("internal", "insert returned no row");

  await recordAudit({
    db: ctx.db,
    tenantId: ctx.tenantId,
    actor: ctx.actor,
    action: "create",
    resourceKind: "oauth_app",
    resourceId: row.id,
    after: toApp(row) as unknown as Record<string, unknown>,
  });

  return { ...toApp(row), clientSecret: plainSecret };
}

export async function getOAuthApp(ctx: ServiceContext, appId: string): Promise<TOAuthApp> {
  return toApp(await assertOwns(ctx, appId));
}

export async function deleteOAuthApp(ctx: ServiceContext, appId: string): Promise<{ deleted: string }> {
  await assertOwns(ctx, appId);

  await ctx.db
    .update(schema.oauthApps)
    .set({ deletedAt: new Date() })
    .where(eq(schema.oauthApps.id, appId));

  await ctx.db
    .update(schema.oauthGrants)
    .set({ revokedAt: new Date() })
    .where(and(eq(schema.oauthGrants.appId, appId), isNull(schema.oauthGrants.revokedAt)));

  await recordAudit({
    db: ctx.db,
    tenantId: ctx.tenantId,
    actor: ctx.actor,
    action: "delete",
    resourceKind: "oauth_app",
    resourceId: appId,
  });

  return { deleted: appId };
}

export async function rotateOAuthSecret(ctx: ServiceContext, appId: string): Promise<{ clientSecret: string }> {
  await assertOwns(ctx, appId);
  const plainSecret = generateClientSecret();
  const secretHash = await hashSecret(plainSecret);

  await ctx.db
    .update(schema.oauthApps)
    .set({ clientSecret: secretHash, updatedAt: new Date() })
    .where(eq(schema.oauthApps.id, appId));

  await recordAudit({
    db: ctx.db,
    tenantId: ctx.tenantId,
    actor: ctx.actor,
    action: "rotate_secret",
    resourceKind: "oauth_app",
    resourceId: appId,
  });

  return { clientSecret: plainSecret };
}
