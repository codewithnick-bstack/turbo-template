import { z } from "zod";
import { httpsUrl } from "./lib";

export const UpdateSettingsSchema = z.object({
  businessName: z.string().min(1).max(200).optional(),
  tagline: z.string().max(500).optional(),
  email: z.string().email().max(300).optional(),
  phone: z.string().max(50).optional(),
  address: z.string().max(500).optional(),
  logoUrl: httpsUrl.optional(),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color").optional(),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a valid hex color").optional(),
  fontHeading: z.string().max(100).optional(),
  fontBody: z.string().max(100).optional(),
  socialLinks: z.object({
    twitter: httpsUrl.optional(),
    linkedin: httpsUrl.optional(),
    github: httpsUrl.optional(),
    instagram: httpsUrl.optional(),
  }).optional(),
  seoTitle: z.string().max(200).optional(),
  seoDescription: z.string().max(300).optional(),
});

export type UpdateSettings = z.infer<typeof UpdateSettingsSchema>;
