import { pgTable, uuid, text, timestamp, pgEnum, index } from "drizzle-orm/pg-core";

export const inviteStatus = pgEnum("invite_status", ["pending", "accepted", "expired", "revoked"]);

export const invites = pgTable(
  "invites",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").notNull(),
    email: text("email").notNull(),
    role: text("role").notNull().default("editor"),
    token: text("token").notNull().unique(),
    status: inviteStatus("status").notNull().default("pending"),
    invitedBy: uuid("invited_by").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    tenantIdx: index("invites_tenant_idx").on(t.tenantId),
    emailTenantIdx: index("invites_email_tenant_idx").on(t.email, t.tenantId),
  }),
);
