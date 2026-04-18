import { z } from "zod";
import { Id, Timestamps } from "./common";

export const User = z
  .object({
    id: Id,
    email: z.string().email(),
    name: z.string().min(1).max(120).nullable(),
    avatarUrl: z.string().url().nullable(),
  })
  .merge(Timestamps);

export const Role = z.enum(["owner", "admin", "editor", "viewer"]);

export const Membership = z
  .object({
    id: Id,
    userId: Id,
    tenantId: Id,
    role: Role,
  })
  .merge(Timestamps);

export type TUser = z.infer<typeof User>;
export type TMembership = z.infer<typeof Membership>;
export type TRole = z.infer<typeof Role>;
