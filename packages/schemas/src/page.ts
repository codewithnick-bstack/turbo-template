import { z } from "zod";
import { Id, Slug, Timestamps } from "./common";
import { BlockTree } from "./blocks";

export const PageStatus = z.enum(["draft", "published", "archived"]);

export const Page = z
  .object({
    id: Id,
    siteId: Id,
    slug: Slug,
    title: z.string().min(1).max(200),
    description: z.string().max(280).nullable(),
    status: PageStatus.default("draft"),
    locale: z.string().default("en"),
    content: BlockTree,
    contentDraft: BlockTree.nullable(),
    publishedAt: z.string().datetime().nullable(),
    version: z.number().int().nonnegative().default(0),
  })
  .merge(Timestamps);

export const CreatePageInput = Page.pick({
  siteId: true,
  slug: true,
  title: true,
  description: true,
  locale: true,
}).extend({ content: BlockTree.optional() });

export const UpdatePageInput = CreatePageInput.partial().extend({ id: Id });
export const PublishPageInput = z.object({ id: Id });

export type TPage = z.infer<typeof Page>;
export type TPageStatus = z.infer<typeof PageStatus>;
