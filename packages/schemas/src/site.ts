import { z } from "zod";
import { Id, Slug, Tenanted, Timestamps } from "./common";

export const Site = z
  .object({
    id: Id,
    slug: Slug,
    name: z.string().min(1).max(120),
    description: z.string().max(280).nullable(),
    primaryDomain: z.string().nullable(),
    status: z.enum(["active", "archived"]).default("active"),
    locales: z.array(z.string()).default(["en"]),
  })
  .merge(Tenanted)
  .merge(Timestamps);

export const CreateSiteInput = Site.pick({ slug: true, name: true, description: true });
export const UpdateSiteInput = CreateSiteInput.partial();

export type TSite = z.infer<typeof Site>;
export type TCreateSiteInput = z.infer<typeof CreateSiteInput>;
