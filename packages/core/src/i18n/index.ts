import { eq, and } from "drizzle-orm";
import { schema } from "@repo/db";
import { AppError } from "@repo/observability";
import { z } from "zod";
import { defineContract } from "../parity";
import type { ServiceContext } from "../context";

export const listLocalesContract = defineContract({
  operation: "i18n.list_locales",
  description: "List supported locales for a tenant.",
  idempotent: true,
  http: { method: "GET", path: "/v1/i18n/locales" },
  mcp: { tool: "list_locales" },
});

export const getTranslationContract = defineContract({
  operation: "i18n.get_translation",
  description: "Get translation strings for a locale.",
  idempotent: true,
  http: { method: "GET", path: "/v1/i18n/translations/:locale" },
  mcp: { tool: "get_translation" },
});

export const setTranslationContract = defineContract({
  operation: "i18n.set_translation",
  description: "Upsert translation strings for a locale.",
  http: { method: "PUT", path: "/v1/i18n/translations/:locale" },
  mcp: { tool: "set_translation" },
});

const BUILT_IN_LOCALES = ["en", "es", "fr", "de", "pt", "ja", "zh"] as const;

export type Locale = (typeof BUILT_IN_LOCALES)[number] | string;

export type TranslationMap = Record<string, string>;

const SetTranslationInput = z.object({
  locale: z.string().min(2).max(10),
  siteId: z.string().uuid().optional(),
  translations: z.record(z.string()),
});

export async function listLocales(_ctx: ServiceContext): Promise<{ locales: string[] }> {
  return { locales: [...BUILT_IN_LOCALES] };
}

export async function getTranslation(
  ctx: ServiceContext,
  locale: string,
  siteId?: string,
): Promise<TranslationMap> {
  const conditions = [
    eq(schema.contentEntries.tenantId, ctx.tenantId),
    eq(schema.contentEntries.locale, locale),
  ];
  if (siteId) conditions.push(eq(schema.contentEntries.siteId, siteId));

  const rows = await ctx.db
    .select({ key: schema.contentEntries.slug, value: schema.contentEntries.title })
    .from(schema.contentEntries)
    .where(and(...conditions))
    .limit(500);

  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export async function setTranslation(ctx: ServiceContext, input: unknown): Promise<{ updated: number }> {
  const parsed = SetTranslationInput.parse(input);
  const { locale, siteId, translations } = parsed;

  const entries = Object.entries(translations);
  if (entries.length === 0) return { updated: 0 };
  if (entries.length > 500) throw new AppError("bad_request" as never, "Max 500 translation keys per request");

  for (const [key, value] of entries) {
    const conditions = [
      eq(schema.contentEntries.tenantId, ctx.tenantId),
      eq(schema.contentEntries.locale, locale),
      eq(schema.contentEntries.slug, key),
    ];
    if (siteId) conditions.push(eq(schema.contentEntries.siteId, siteId!));

    const existing = await ctx.db
      .select({ id: schema.contentEntries.id })
      .from(schema.contentEntries)
      .where(and(...conditions))
      .limit(1);

    if (existing.length > 0) {
      await ctx.db
        .update(schema.contentEntries)
        .set({ title: value, updatedAt: new Date().toISOString() })
        .where(eq(schema.contentEntries.id, existing[0].id));
    } else {
      await ctx.db.insert(schema.contentEntries).values({
        id: crypto.randomUUID(),
        tenantId: ctx.tenantId,
        siteId: siteId ?? ctx.tenantId,
        collectionId: "i18n",
        slug: key,
        locale,
        title: value,
        status: "published",
        data: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }
  return { updated: entries.length };
}
