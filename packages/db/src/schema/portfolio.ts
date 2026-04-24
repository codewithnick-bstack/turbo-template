import { pgTable, uuid, text, timestamp, integer, index, pgEnum, jsonb } from "drizzle-orm/pg-core";

export const portfolioStatus = pgEnum("portfolio_status", ["draft", "published"]);

export const portfolioEntries = pgTable(
  "portfolio_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    client: text("client"),
    description: text("description"),
    coverImageUrl: text("cover_image_url"),
    images: jsonb("images").$type<string[]>().default([]),
    tags: text("tags").array().default([]).notNull(),
    url: text("url"),
    order: integer("order").notNull().default(0),
    status: portfolioStatus("status").notNull().default("draft"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    statusIdx: index("portfolio_status_idx").on(t.status),
    orderIdx: index("portfolio_order_idx").on(t.order),
  }),
);
