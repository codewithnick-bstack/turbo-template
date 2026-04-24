import { eq, desc } from "drizzle-orm";
import type { Db } from "@repo/db";
import { schema } from "@repo/db";
import { AppError } from "@repo/observability";
import type { CreateTestimonial, UpdateTestimonial } from "../schemas/testimonials";
import { compact } from "../lib/utils";

export async function listTestimonials(db: Db, { featuredOnly = false, limit = 100 } = {}) {
  return db.query.testimonials.findMany({
    where: featuredOnly ? eq(schema.testimonials.featured, true) : undefined,
    orderBy: [desc(schema.testimonials.createdAt)],
    limit,
  });
}

export async function getTestimonial(db: Db, id: string) {
  const t = await db.query.testimonials.findFirst({ where: eq(schema.testimonials.id, id) });
  if (!t) throw new AppError("not_found", `Testimonial not found: ${id}`);
  return t;
}

export async function createTestimonial(db: Db, data: CreateTestimonial) {
  const [t] = await db.insert(schema.testimonials).values(compact(data)).returning();
  if (!t) throw new AppError("internal", "Failed to create testimonial");
  return t;
}

export async function updateTestimonial(db: Db, id: string, data: UpdateTestimonial) {
  const [updated] = await db
    .update(schema.testimonials)
    .set(compact({ ...data, updatedAt: new Date() }))
    .where(eq(schema.testimonials.id, id))
    .returning();
  if (!updated) throw new AppError("not_found", `Testimonial not found: ${id}`);
  return updated;
}

export async function deleteTestimonial(db: Db, id: string) {
  const [deleted] = await db.delete(schema.testimonials).where(eq(schema.testimonials.id, id)).returning();
  if (!deleted) throw new AppError("not_found", `Testimonial not found: ${id}`);
  return deleted;
}
