import { z } from "zod";
import { Id, Slug, Timestamps } from "./common";

export const TenantType = z.enum(["direct", "agency", "client"]);

export const Tenant = z
  .object({
    id: Id,
    slug: Slug,
    name: z.string().min(1).max(120),
    type: TenantType,
    parentTenantId: Id.nullable(),
    plan: z.enum(["starter", "pro", "agency"]).default("starter"),
    status: z.enum(["active", "past_due", "suspended"]).default("active"),
  })
  .merge(Timestamps);

export const CreateTenantInput = Tenant.pick({ slug: true, name: true, type: true }).extend({
  parentTenantId: Id.optional(),
});

export type TTenant = z.infer<typeof Tenant>;
export type TCreateTenantInput = z.infer<typeof CreateTenantInput>;
