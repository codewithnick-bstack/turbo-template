import { pgTable, uuid, text, timestamp, index, pgEnum } from "drizzle-orm/pg-core";

export const contactStatus = pgEnum("contact_status", ["new", "read", "archived"]);

export const contactSubmissions = pgTable(
  "contact_submissions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    subject: text("subject"),
    message: text("message").notNull(),
    status: contactStatus("status").notNull().default("new"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    statusIdx: index("contacts_status_idx").on(t.status),
    createdIdx: index("contacts_created_idx").on(t.createdAt),
  }),
);
