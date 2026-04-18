import { z } from "zod";
import { Id, Tenanted, Timestamps } from "./common";

export const Media = z
  .object({
    id: Id,
    siteId: Id.nullable(),
    kind: z.enum(["image", "video", "document"]),
    originalFilename: z.string(),
    mimeType: z.string(),
    sizeBytes: z.number().int().nonnegative(),
    width: z.number().int().nullable(),
    height: z.number().int().nullable(),
    altText: z.string().nullable(),
    focalPoint: z.object({ x: z.number(), y: z.number() }).nullable(),
    contentHash: z.string(),
    storageKey: z.string(),
  })
  .merge(Tenanted)
  .merge(Timestamps);

export type TMedia = z.infer<typeof Media>;
