import { eq, and } from "drizzle-orm";
import { schema } from "@repo/db";
import { AppError } from "@repo/observability";
import { defineContract } from "../parity";
import type { ServiceContext } from "../context";

export const whoamiContract = defineContract({
  operation: "users.whoami",
  description: "Return the authenticated user + active membership.",
  idempotent: true,
  http: { method: "GET", path: "/v1/whoami" },
  mcp: { tool: "whoami" },
});

export async function whoami(ctx: ServiceContext) {
  if (ctx.actor.kind !== "user") {
    throw new AppError("unauthorized", "whoami requires a user actor");
  }
  const [user] = await ctx.db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, ctx.actor.userId))
    .limit(1);
  if (!user) throw new AppError("not_found", "user not found");

  const [membership] = await ctx.db
    .select()
    .from(schema.memberships)
    .where(
      and(eq(schema.memberships.userId, ctx.actor.userId), eq(schema.memberships.tenantId, ctx.tenantId)),
    )
    .limit(1);

  const [tenant] = await ctx.db
    .select()
    .from(schema.tenants)
    .where(eq(schema.tenants.id, ctx.tenantId))
    .limit(1);

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
    },
    tenant: tenant
      ? { id: tenant.id, slug: tenant.slug, name: tenant.name, plan: tenant.plan }
      : null,
    role: membership?.role ?? null,
  };
}
