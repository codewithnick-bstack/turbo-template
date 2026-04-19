import { createHash, randomBytes } from "node:crypto";
import { eq, and, isNull } from "drizzle-orm";
import { schema } from "@repo/db";
import { AppError } from "@repo/observability";
import { z } from "zod";
import { defineContract } from "../parity";
import type { ServiceContext } from "../context";

export const createApiKeyContract = defineContract({
  operation: "api_keys.create",
  description: "Create an API key for programmatic or agent access.",
  http: { method: "POST", path: "/v1/api-keys" },
  mcp: { tool: "create_api_key", requiresApproval: true },
});

export const listApiKeysContract = defineContract({
  operation: "api_keys.list",
  description: "List active API keys for the tenant.",
  idempotent: true,
  http: { method: "GET", path: "/v1/api-keys" },
  mcp: { tool: "list_api_keys" },
});

export const revokeApiKeyContract = defineContract({
  operation: "api_keys.revoke",
  description: "Revoke an API key.",
  http: { method: "DELETE", path: "/v1/api-keys/:id" },
  mcp: { tool: "revoke_api_key", requiresApproval: true },
});

const CreateInput = z.object({
  name: z.string().min(1).max(100),
  scopes: z.array(z.string()).default([]),
});

export async function createApiKey(ctx: ServiceContext, input: unknown) {
  const parsed = CreateInput.parse(input);
  const raw = `pk_${randomBytes(32).toString("hex")}`;
  const prefix = raw.slice(0, 12);
  const hashed = createHash("sha256").update(raw).digest("hex");

  const [row] = await ctx.db
    .insert(schema.apiKeys)
    .values({
      tenantId: ctx.tenantId,
      name: parsed.name,
      hashedSecret: hashed,
      prefix,
      scopes: parsed.scopes,
    })
    .returning();
  if (!row) throw new AppError("internal", "API key insert returned no row");

  return { ...row, key: raw, hashedSecret: undefined };
}

export async function listApiKeys(ctx: ServiceContext) {
  const rows = await ctx.db
    .select({
      id: schema.apiKeys.id,
      name: schema.apiKeys.name,
      prefix: schema.apiKeys.prefix,
      scopes: schema.apiKeys.scopes,
      lastUsedAt: schema.apiKeys.lastUsedAt,
      createdAt: schema.apiKeys.createdAt,
    })
    .from(schema.apiKeys)
    .where(
      and(
        eq(schema.apiKeys.tenantId, ctx.tenantId),
        eq(schema.apiKeys.active, true),
        isNull(schema.apiKeys.revokedAt),
      ),
    );
  return rows;
}

export async function revokeApiKey(ctx: ServiceContext, id: string) {
  const now = new Date();
  const [row] = await ctx.db
    .update(schema.apiKeys)
    .set({ active: false, revokedAt: now })
    .where(
      and(
        eq(schema.apiKeys.id, id),
        eq(schema.apiKeys.tenantId, ctx.tenantId),
        eq(schema.apiKeys.active, true),
      ),
    )
    .returning({ id: schema.apiKeys.id });
  if (!row) throw new AppError("not_found", "API key not found", 404);
  return { revoked: row.id };
}
