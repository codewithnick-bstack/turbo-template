import { eq, asc } from "drizzle-orm";
import type { Db } from "@repo/db";
import { schema } from "@repo/db";
import { AppError } from "@repo/observability";
import type { CreatePortfolioEntry, UpdatePortfolioEntry } from "../schemas/portfolio";
import { compact } from "../lib/utils";
import { revalidatePaths } from "../lib/revalidate";

export async function listPortfolioEntries(db: Db, { includeAll = false, limit = 50, offset = 0 } = {}) {
  return db.query.portfolioEntries.findMany({
    where: includeAll ? undefined : eq(schema.portfolioEntries.status, "published"),
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
