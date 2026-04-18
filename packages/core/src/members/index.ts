import { eq, and } from "drizzle-orm";
import { schema } from "@repo/db";
import { AppError } from "@repo/observability";
import { z } from "zod";
import { defineContract } from "../parity";
import type { ServiceContext } from "../context";
import { recordAudit } from "../audit";

export const listMembersContract = defineContract({
  operation: "members.list",
  description: "List members of the tenant.",
  idempotent: true,
  http: { method: "GET", path: "/v1/members" },
  mcp: { tool: "list_members" },
});

export const inviteMemberContract = defineContract({
  operation: "members.invite",
  description: "Invite a user to the tenant by email.",
  http: { method: "POST", path: "/v1/members/invite" },
  mcp: { tool: "invite_member" },
  webhook: { event: "member.invited" },
});

export const removeMemberContract = defineContract({
  operation: "members.remove",
  description: "Remove a member from the tenant.",
  http: { method: "DELETE", path: "/v1/members/:userId" },
  mcp: { tool: "remove_member" },
  webhook: { event: "member.removed" },
});

export const updateMemberRoleContract = defineContract({
  operation: "members.update_role",
  description: "Update a member's role.",
  http: { method: "PATCH", path: "/v1/members/:userId" },
  mcp: { tool: "update_member_role" },
});

export const listInvitesContract = defineContract({
  operation: "members.list_invites",
  description: "List pending invites for the tenant.",
  idempotent: true,
  http: { method: "GET", path: "/v1/members/invites" },
  mcp: { tool: "list_invites" },
});

export const revokeInviteContract = defineContract({
  operation: "members.revoke_invite",
  description: "Revoke a pending invite.",
  http: { method: "DELETE", path: "/v1/members/invites/:id" },
  mcp: { tool: "revoke_invite" },
});

const InviteInput = z.object({
  email: z.string().email(),
  role: z.enum(["admin", "editor", "viewer"]).default("editor"),
});

function generateToken() {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function listMembers(ctx: ServiceContext) {
  const rows = await ctx.db
    .select({
      userId: schema.memberships.userId,
      role: schema.memberships.role,
      createdAt: schema.memberships.createdAt,
      email: schema.users.email,
      name: schema.users.name,
      avatarUrl: schema.users.avatarUrl,
    })
    .from(schema.memberships)
    .leftJoin(schema.users, eq(schema.memberships.userId, schema.users.id))
    .where(eq(schema.memberships.tenantId, ctx.tenantId));
  return rows;
}

export async function inviteMember(ctx: ServiceContext, input: unknown) {
  const parsed = InviteInput.parse(input);
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const actorId =
    ctx.actor.kind === "user" ? ctx.actor.userId : "00000000-0000-0000-0000-000000000000";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [row] = await ctx.db.insert(schema.invites).values({
    tenantId: ctx.tenantId,
    email: parsed.email,
    role: parsed.role,
    token,
    invitedBy: actorId,
    expiresAt,
  } as any).returning();

  if (!row) throw new AppError("internal", "invite insert returned no row");

  // TODO: send invite email via Resend in production
  return { id: row.id, email: row.email, role: row.role, token: row.token, expiresAt };
}

export async function removeMember(ctx: ServiceContext, userId: string) {
  if (ctx.actor.kind === "user" && ctx.actor.userId === userId) {
    throw new AppError("bad_request", "cannot remove yourself");
  }
  const [row] = await ctx.db
    .delete(schema.memberships)
    .where(
      and(eq(schema.memberships.userId, userId), eq(schema.memberships.tenantId, ctx.tenantId)),
    )
    .returning();
  if (!row) throw new AppError("not_found", `member not found: ${userId}`);

  await recordAudit({
    db: ctx.db,
    tenantId: ctx.tenantId,
    actor: ctx.actor,
    action: "delete",
    resourceKind: "membership",
    resourceId: userId,
    after: null,
  });
  return { ok: true };
}

export async function updateMemberRole(ctx: ServiceContext, userId: string, role: string) {
  const validRoles = ["admin", "editor", "viewer"] as const;
  if (!validRoles.includes(role as (typeof validRoles)[number])) {
    throw new AppError("bad_request", `invalid role: ${role}`);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [row] = await ctx.db.update(schema.memberships).set({ role: role as any, updatedAt: new Date() } as any)
    .where(and(eq(schema.memberships.userId, userId), eq(schema.memberships.tenantId, ctx.tenantId)))
    .returning();
  if (!row) throw new AppError("not_found", `member not found: ${userId}`);
  return row;
}

export async function listInvites(ctx: ServiceContext) {
  return ctx.db
    .select()
    .from(schema.invites)
    .where(and(eq(schema.invites.tenantId, ctx.tenantId), eq(schema.invites.status, "pending")));
}

export async function revokeInvite(ctx: ServiceContext, id: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [row] = await ctx.db.update(schema.invites).set({ status: "revoked" } as any)
    .where(and(eq(schema.invites.id, id), eq(schema.invites.tenantId, ctx.tenantId)))
    .returning();
  if (!row) throw new AppError("not_found", `invite not found: ${id}`);
  return { ok: true };
}
