import { z } from "zod";
import { httpsUrl } from "./lib";

export const CreateTestimonialSchema = z.object({
  authorName: z.string().min(1).max(200),
  company: z.string().max(200).optional(),
  role: z.string().max(200).optional(),
  quote: z.string().min(1).max(2000),
  rating: z.number().int().min(1).max(5).default(5),
  photoUrl: httpsUrl.optional(),
  featured: z.boolean().default(false),
});

export const UpdateTestimonialSchema = CreateTestimonialSchema.partial();

export type CreateTestimonial = z.infer<typeof CreateTestimonialSchema>;
export type UpdateTestimonial = z.infer<typeof UpdateTestimonialSchema>;
