import { eq } from "drizzle-orm";
import { schema } from "@repo/db";
import { AppError } from "@repo/observability";
import { z } from "zod";
import { defineContract } from "../parity";
import type { ServiceContext } from "../context";

export const getBrandingContract = defineContract({
  operation: "branding.get",
  description: "Get tenant white-label branding settings.",
  idempotent: true,
  http: { method: "GET", path: "/v1/branding" },
  mcp: { tool: "get_branding" },
});

export const updateBrandingContract = defineContract({
  operation: "branding.update",
  description: "Update tenant white-label branding settings.",
  http: { method: "PATCH", path: "/v1/branding" },
  mcp: { tool: "update_branding" },
});

export type TenantBranding = {
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor?: string;
  accentColor?: string;
  customCss?: string;
  supportEmail?: string;
  privacyUrl?: string;
  termsUrl?: string;
};

const UpdateBrandingInput = z.object({
  logoUrl: z.string().url().optional().or(z.literal("")),
  faviconUrl: z.string().url().optional().or(z.literal("")),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  customCss: z.string().max(20000).optional(),
  supportEmail: z.string().email().optional().or(z.literal("")),
  privacyUrl: z.string().url().optional().or(z.literal("")),
  termsUrl: z.string().url().optional().or(z.literal("")),
});

export async function getBranding(ctx: ServiceContext): Promise<TenantBranding> {
  const [tenant] = await ctx.db
    .select({ branding: schema.tenants.branding })
    .from(schema.tenants)
    .where(eq(schema.tenants.id, ctx.tenantId))
    .limit(1);
  if (!tenant) throw new AppError("not_found", `tenant not found: ${ctx.tenantId}`);
  return (tenant.branding as TenantBranding) ?? {};
}

export async function updateBranding(ctx: ServiceContext, input: unknown): Promise<TenantBranding> {
  const parsed = UpdateBrandingInput.parse(input);
  const existing = await getBranding(ctx);
  const merged: TenantBranding = { ...existing, ...parsed };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [row] = await ctx.db.update(schema.tenants).set({ branding: merged, updatedAt: new Date() } as any)
    .where(eq(schema.tenants.id, ctx.tenantId))
    .returning({ branding: schema.tenants.branding });
  if (!row) throw new AppError("internal", "branding update returned no row");
  return (row.branding as TenantBranding) ?? {};
}
