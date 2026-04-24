import { pgTable, uuid, text, timestamp, jsonb } from "drizzle-orm/pg-core";

export const siteSettings = pgTable("site_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessName: text("business_name").notNull().default("My Business"),
  tagline: text("tagline"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  logoUrl: text("logo_url"),
  primaryColor: text("primary_color").default("#6366f1"),
  accentColor: text("accent_color").default("#8b5cf6"),
  fontHeading: text("font_heading").default("Inter"),
  fontBody: text("font_body").default("Inter"),
  socialLinks: jsonb("social_links")
    .$type<{ twitter?: string; linkedin?: string; github?: string; instagram?: string }>()
    .default({}),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});
