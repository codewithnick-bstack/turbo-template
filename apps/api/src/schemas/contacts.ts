import { z } from "zod";

export const CreateContactSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().max(300),
  phone: z.string().max(50).optional(),
  subject: z.string().max(500).optional(),
  message: z.string().min(1).max(5000),
});

export type CreateContact = z.infer<typeof CreateContactSchema>;
