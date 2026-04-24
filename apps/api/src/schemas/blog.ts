import { z } from "zod";
import { httpsUrl } from "./lib";

export const BlogPostStatusSchema = z.enum(["draft", "published"]);

export const CreateBlogPostSchema = z.object({
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  title: z.string().min(1).max(500),
  excerpt: z.string().max(1000).optional(),
  content: z.string().default(""),
  author: z.string().max(200).optional(),
  coverImageUrl: httpsUrl.optional(),
  metaTitle: z.string().max(200).optional(),
  metaDescription: z.string().max(300).optional(),
});

export const UpdateBlogPostSchema = CreateBlogPostSchema.partial();

export type CreateBlogPost = z.infer<typeof CreateBlogPostSchema>;
export type UpdateBlogPost = z.infer<typeof UpdateBlogPostSchema>;
