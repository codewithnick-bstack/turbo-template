import { pgTable, uuid, text, timestamp, integer, index } from "drizzle-orm/pg-core";

export const teamMembers = pgTable(
  "team_members",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    title: text("title").notNull(),
    bio: text("bio"),
    photoUrl: text("photo_url"),
    order: integer("order").notNull().default(0),
    linkedinUrl: text("linkedin_url"),
    twitterUrl: text("twitter_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    orderIdx: index("team_order_idx").on(t.order),
  }),
);
