import { eq, and, desc } from "drizzle-orm";
import { schema } from "@repo/db";
import { AppError } from "@repo/observability";
import { z } from "zod";
import { defineContract } from "../parity";
import type { ServiceContext } from "../context";
import { recordAudit } from "../audit";
import { emitEvent } from "../events";

export const createCollectionContract = defineContract({
  operation: "content.collections.create",
  description: "Create a content collection (content type).",
  http: { method: "POST", path: "/v1/collections" },
  mcp: { tool: "create_collection" },
  webhook: { event: "content.collection_created" },
});

export const listCollectionsContract = defineContract({
  operation: "content.collections.list",
  description: "List content collections for a site.",
  idempotent: true,
  http: { method: "GET", path: "/v1/collections" },
  mcp: { tool: "list_collections" },
});

export const createEntryContract = defineContract({
  operation: "content.entries.create",
  description: "Create a content entry within a collection.",
  http: { method: "POST", path: "/v1/entries" },
  mcp: { tool: "create_entry" },
  webhook: { event: "content.updated" },
});

export const listEntriesContract = defineContract({
  operation: "content.entries.list",
  description: "List entries in a collection.",
  idempotent: true,
  http: { method: "GET", path: "/v1/entries" },
  mcp: { tool: "list_entries" },
});

const FieldDef = z.object({
  name: z.string().min(1),
  label: z.string().min(1),
  kind: z.enum(["text", "longtext", "richtext", "number", "boolean", "date", "media", "reference", "json"]),
  required: z.boolean().default(false),
  multiple: z.boolean().default(false),
  referenceCollection: z.string().optional(),
});

const CreateCollectionInput = z.object({
  siteId: z.string().uuid(),
  slug: z.string().min(1),
  name: z.string().min(1),
  fields: z.array(FieldDef).min(1),
});

const CreateEntryInput = z.object({
  collectionId: z.string().uuid(),
  slug: z.string().min(1),
  locale: z.string().default("en"),
  data: z.record(z.unknown()),
  status: z.enum(["draft", "published"]).default("draft"),
});

export async function createCollection(ctx: ServiceContext, input: unknown) {
  const parsed = CreateCollectionInput.parse(input);

  const [row] = await ctx.db
    .insert(schema.collections)
    .values({
      tenantId: ctx.tenantId,
      siteId: parsed.siteId,
      slug: parsed.slug,
      name: parsed.name,
      fields: parsed.fields,
    })
    .returning();
  if (!row) throw new AppError("internal", "collection insert returned no row");

  await recordAudit({
    db: ctx.db,
    tenantId: ctx.tenantId,
    actor: ctx.actor,
    action: "create",
    resourceKind: "collection",
    resourceId: row.id,
    after: { name: row.name, slug: row.slug },
  });

  await emitEvent({
    db: ctx.db,
    tenantId: ctx.tenantId,
    event: "content.collection_created",
    payload: { collection: { id: row.id, slug: row.slug, name: row.name } },
  });

  return row;
}

export async function listCollections(ctx: ServiceContext, filter: { siteId: string }) {
  return ctx.db
    .select()
    .from(schema.collections)
    .where(
      and(eq(schema.collections.tenantId, ctx.tenantId), eq(schema.collections.siteId, filter.siteId)),
    )
    .orderBy(desc(schema.collections.createdAt));
}

export async function createEntry(ctx: ServiceContext, input: unknown) {
  const parsed = CreateEntryInput.parse(input);

  const [row] = await ctx.db
    .insert(schema.entries)
    .values({
      tenantId: ctx.tenantId,
      collectionId: parsed.collectionId,
      slug: parsed.slug,
      locale: parsed.locale,
      data: parsed.data,
      status: parsed.status,
    })
    .returning();
  if (!row) throw new AppError("internal", "entry insert returned no row");

  await emitEvent({
    db: ctx.db,
    tenantId: ctx.tenantId,
    event: "content.updated",
    payload: { entryId: row.id, collectionId: row.collectionId },
  });

  return row;
}

export async function listEntries(
  ctx: ServiceContext,
  filter: { collectionId: string; status?: "draft" | "published" },
) {
  const conditions = [
    eq(schema.entries.tenantId, ctx.tenantId),
    eq(schema.entries.collectionId, filter.collectionId),
  ];
  if (filter.status) conditions.push(eq(schema.entries.status, filter.status));
  return ctx.db
    .select()
    .from(schema.entries)
    .where(and(...conditions))
    .orderBy(desc(schema.entries.updatedAt));
}
