import { eq, asc, or, ilike, and } from "drizzle-orm";
import type { Db } from "@repo/db";
import { schema } from "@repo/db";
import { AppError } from "@repo/observability";
import type { CreatePortfolioEntry, UpdatePortfolioEntry } from "../schemas/portfolio";
import { compact } from "../lib/utils";
import { revalidatePaths } from "../lib/revalidate";

export async function listPortfolioEntries(db: Db, { includeAll = false, limit = 50, offset = 0, search }: { includeAll?: boolean; limit?: number; offset?: number; search?: string } = {}) {
  const searchFilter = search
    ? or(ilike(schema.portfolioEntries.title, `%${search}%`), ilike(schema.portfolioEntries.description, `%${search}%`))
    : undefined;
  const statusFilter = includeAll ? undefined : eq(schema.portfolioEntries.status, "published");
  const where = searchFilter && statusFilter ? and(statusFilter, searchFilter) : searchFilter ?? statusFilter;
  return db.query.portfolioEntries.findMany({
    where,
    orderBy: [asc(schema.portfolioEntries.order)],
    limit,
    offset,
  });
}

export async function getPortfolioEntry(db: Db, id: string) {
  const entry = await db.query.portfolioEntries.findFirst({ where: eq(schema.portfolioEntries.id, id) });
  if (!entry) throw new AppError("not_found", `Portfolio entry not found: ${id}`);
  return entry;
}

export async function createPortfolioEntry(db: Db, data: CreatePortfolioEntry) {
  const [entry] = await db.insert(schema.portfolioEntries).values(compact(data)).returning();
  if (!entry) throw new AppError("internal", "Failed to create portfolio entry");
  revalidatePaths(["/portfolio", "/"]);
  return entry;
}

export async function updatePortfolioEntry(db: Db, id: string, data: UpdatePortfolioEntry) {
  const [updated] = await db
    .update(schema.portfolioEntries)
    .set(compact({ ...data, updatedAt: new Date() }))
    .where(eq(schema.portfolioEntries.id, id))
    .returning();
  if (!updated) throw new AppError("not_found", `Portfolio entry not found: ${id}`);
  revalidatePaths(["/portfolio", "/"]);
  return updated;
}

export async function deletePortfolioEntry(db: Db, id: string) {
  const [deleted] = await db.delete(schema.portfolioEntries).where(eq(schema.portfolioEntries.id, id)).returning();
  if (!deleted) throw new AppError("not_found", `Portfolio entry not found: ${id}`);
  revalidatePaths(["/portfolio", "/"]);
  return deleted;
}
