import { z } from "zod";
import { httpsUrl } from "./lib";

export const CreateTeamMemberSchema = z.object({
  name: z.string().min(1).max(200),
  title: z.string().min(1).max(200),
  bio: z.string().max(2000).optional(),
  photoUrl: httpsUrl.optional(),
  order: z.number().int().min(0).default(0),
  linkedinUrl: httpsUrl.optional(),
  twitterUrl: httpsUrl.optional(),
});

export const UpdateTeamMemberSchema = CreateTeamMemberSchema.partial();
export const ReorderTeamSchema = z.object({ ids: z.array(z.string().uuid()) });

export type CreateTeamMember = z.infer<typeof CreateTeamMemberSchema>;
export type UpdateTeamMember = z.infer<typeof UpdateTeamMemberSchema>;
