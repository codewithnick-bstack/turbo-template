import { z } from "zod";

export const httpsUrl = z
  .string()
  .url()
  .refine((u) => /^https:\/\//i.test(u), "Only HTTPS URLs are allowed");
