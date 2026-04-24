import { z } from "zod";
import { httpsUrl } from "./lib";

export const CreatePortfolioEntrySchema = z.object({
  title: z.string().min(1).max(500),
  client: z.string().max(200).optional(),
  description: z.string().max(5000).optional(),
  coverImageUrl: httpsUrl.optional(),
  images: z.array(httpsUrl).default([]),
  tags: z.array(z.string().max(50)).default([]),
  url: httpsUrl.optional(),
  order: z.number().int().min(0).default(0),
  status: z.enum(["draft", "published"]).default("draft"),
});

export const UpdatePortfolioEntrySchema = CreatePortfolioEntrySchema.partial();

export type CreatePortfolioEntry = z.infer<typeof CreatePortfolioEntrySchema>;
export type UpdatePortfolioEntry = z.infer<typeof UpdatePortfolioEntrySchema>;
