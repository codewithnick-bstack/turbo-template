import { pgTable, uuid, text, timestamp, integer, boolean, index } from "drizzle-orm/pg-core";

export const testimonials = pgTable(
  "testimonials",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    authorName: text("author_name").notNull(),
    company: text("company"),
    role: text("role"),
    quote: text("quote").notNull(),
    rating: integer("rating").notNull().default(5),
    photoUrl: text("photo_url"),
    featured: boolean("featured").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    featuredIdx: index("testimonials_featured_idx").on(t.featured),
  }),
);
