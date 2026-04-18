import { z } from "zod";

export const Id = z.string().uuid();
export const Slug = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, "lowercase, digits, hyphens; cannot start or end with hyphen");

export const Timestamps = z.object({
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const Tenanted = z.object({ tenantId: Id });

export const Pagination = z.object({
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(200).default(50),
});

export const PageMeta = z.object({
  nextCursor: z.string().nullable(),
  total: z.number().int().nonnegative().optional(),
});

export type TId = z.infer<typeof Id>;
export type TSlug = z.infer<typeof Slug>;
