import { z } from "zod";
import { Id, Slug, Tenanted, Timestamps } from "./common";

export const FieldKind = z.enum(["text", "longtext", "richtext", "number", "boolean", "date", "media", "reference", "json"]);

export const FieldDef = z.object({
  name: Slug,
  label: z.string(),
  kind: FieldKind,
  required: z.boolean().default(false),
  multiple: z.boolean().default(false),
  referenceCollection: Slug.optional(),
});

export const Collection = z
  .object({
    id: Id,
    siteId: Id,
    slug: Slug,
    name: z.string(),
    fields: z.array(FieldDef).min(1),
  })
  .merge(Tenanted)
  .merge(Timestamps);

export const Entry = z
  .object({
    id: Id,
    collectionId: Id,
    slug: Slug,
    status: z.enum(["draft", "published"]).default("draft"),
    locale: z.string().default("en"),
    data: z.record(z.unknown()),
  })
  .merge(Tenanted)
  .merge(Timestamps);

export type TCollection = z.infer<typeof Collection>;
export type TEntry = z.infer<typeof Entry>;
