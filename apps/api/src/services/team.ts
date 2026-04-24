import { eq, asc, or, ilike } from "drizzle-orm";
import type { Db } from "@repo/db";
import { schema } from "@repo/db";
import { AppError } from "@repo/observability";
import type { CreateTeamMember, UpdateTeamMember } from "../schemas/team";
import { compact } from "../lib/utils";
import { revalidatePaths } from "../lib/revalidate";

export async function listTeamMembers(db: Db, { limit = 100, search }: { limit?: number; search?: string } = {}) {
  const where = search
    ? or(ilike(schema.teamMembers.name, `%${search}%`), ilike(schema.teamMembers.title, `%${search}%`))
    : undefined;
  return db.query.teamMembers.findMany({ where, orderBy: [asc(schema.teamMembers.order)], limit });
}

export async function getTeamMember(db: Db, id: string) {
  const member = await db.query.teamMembers.findFirst({ where: eq(schema.teamMembers.id, id) });
  if (!member) throw new AppError("not_found", `Team member not found: ${id}`);
  return member;
}

export async function createTeamMember(db: Db, data: CreateTeamMember) {
  const [member] = await db.insert(schema.teamMembers).values(compact(data)).returning();
  if (!member) throw new AppError("internal", "Failed to create team member");
  revalidatePaths(["/team", "/about", "/"]);
  return member;
}

export async function updateTeamMember(db: Db, id: string, data: UpdateTeamMember) {
  const [updated] = await db
    .update(schema.teamMembers)
    .set(compact({ ...data, updatedAt: new Date() }))
    .where(eq(schema.teamMembers.id, id))
    .returning();
  if (!updated) throw new AppError("not_found", `Team member not found: ${id}`);
  revalidatePaths(["/team", "/about", "/"]);
  return updated;
}

export async function deleteTeamMember(db: Db, id: string) {
  const [deleted] = await db.delete(schema.teamMembers).where(eq(schema.teamMembers.id, id)).returning();
  if (!deleted) throw new AppError("not_found", `Team member not found: ${id}`);
  revalidatePaths(["/team", "/about", "/"]);
  return deleted;
}

export async function reorderTeamMembers(db: Db, ids: string[]) {
  await Promise.all(
    ids.map((id, index) =>
      db.update(schema.teamMembers).set({ order: index, updatedAt: new Date() }).where(eq(schema.teamMembers.id, id)),
    ),
  );
  revalidatePaths(["/team", "/about"]);
}
