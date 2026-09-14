import { eq, desc } from "drizzle-orm";
import type { Db } from "@repo/db";
import { schema } from "@repo/db";
import { AppError } from "@repo/observability";
import type { CreateContact } from "../schemas/contacts";
import { sendContactNotification } from "./email";
import { env } from "../env";
import { compact } from "../lib/utils";

export async function listContacts(db: Db, opts: { status?: "new" | "read" | "archived" } = {}) {
  return db.query.contactSubmissions.findMany({
    where: opts.status ? eq(schema.contactSubmissions.status, opts.status) : undefined,
    orderBy: [desc(schema.contactSubmissions.createdAt)],
  });
}

export async function getContact(db: Db, id: string) {
  const contact = await db.query.contactSubmissions.findFirst({ where: eq(schema.contactSubmissions.id, id) });
  if (!contact) throw new AppError("not_found", `Contact not found: ${id}`);
  return contact;
}

export async function createContact(db: Db, data: CreateContact) {
  const [contact] = await db.insert(schema.contactSubmissions).values(compact(data)).returning();
  if (!contact) throw new AppError("internal", "Failed to save contact submission");

  const notifyEmail = env.NOTIFICATION_EMAIL ?? env.ADMIN_EMAIL;
  if (notifyEmail) {
    await sendContactNotification(contact, notifyEmail);
  }

  return contact;
}

export async function markContactRead(db: Db, id: string) {
  const [updated] = await db
    .update(schema.contactSubmissions)
    .set({ status: "read" })
    .where(eq(schema.contactSubmissions.id, id))
    .returning();
  if (!updated) throw new AppError("not_found", `Contact not found: ${id}`);
  return updated;
}

export async function archiveContact(db: Db, id: string) {
  const [updated] = await db
    .update(schema.contactSubmissions)
    .set({ status: "archived" })
    .where(eq(schema.contactSubmissions.id, id))
    .returning();
  if (!updated) throw new AppError("not_found", `Contact not found: ${id}`);
  return updated;
}
