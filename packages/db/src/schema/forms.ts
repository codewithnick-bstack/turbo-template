import { pgTable, uuid, text, timestamp, jsonb, boolean, doublePrecision } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";
import { sites } from "./sites";

export type FormField = {
  name: string;
  label: string;
  kind: "text" | "email" | "textarea" | "select" | "checkbox" | "phone";
  required: boolean;
  options?: string[];
};

export const forms = pgTable("forms", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  siteId: uuid("site_id")
    .notNull()
    .references(() => sites.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  fields: jsonb("fields").notNull().$type<FormField[]>().default([]),
  captcha: boolean("captcha").notNull().default(true),
  deliverEmails: jsonb("deliver_emails").notNull().$type<string[]>().default([]),
  deliverWebhookUrl: text("deliver_webhook_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const formSubmissions = pgTable("form_submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  formId: uuid("form_id")
    .notNull()
    .references(() => forms.id, { onDelete: "cascade" }),
  data: jsonb("data").notNull().$type<Record<string, unknown>>().default({}),
  leadScore: doublePrecision("lead_score"),
  ipHashed: text("ip_hashed"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
