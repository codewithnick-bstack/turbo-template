import type { Db } from "@repo/db";
import { schema } from "@repo/db";
import { AppError } from "@repo/observability";
import type { UpdateSettings } from "../schemas/settings";
import { compact } from "../lib/utils";

export async function getSettings(db: Db) {
  const settings = await db.query.siteSettings.findFirst();
  if (!settings) {
    const [created] = await db.insert(schema.siteSettings).values({}).returning();
    if (!created) throw new AppError("internal", "Failed to initialize settings");
    return created;
  }
  return settings;
}

export async function updateSettings(db: Db, data: UpdateSettings) {
  const existing = await db.query.siteSettings.findFirst();

  if (!existing) {
    const [created] = await db.insert(schema.siteSettings).values(compact({ ...data, updatedAt: new Date() })).returning();
    if (!created) throw new AppError("internal", "Failed to create settings");
    return created;
  }

  const [updated] = await db
    .update(schema.siteSettings)
    .set(compact({ ...data, updatedAt: new Date() }))
    .returning();
  if (!updated) throw new AppError("internal", "Failed to update settings");
  return updated;
}
