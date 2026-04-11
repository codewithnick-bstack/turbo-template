import { config } from "dotenv";
import { z } from "zod";

config();

const emptyToUndefined = (value: unknown) => {
  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }

  return value;
};

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  WEB_ORIGIN: z.string().default("http://localhost:3000"),
  CONTACT_FROM_EMAIL: z.preprocess(emptyToUndefined, z.string().email().optional()),
  CONTACT_TO_EMAIL: z.preprocess(emptyToUndefined, z.string().email().optional()),
  RESEND_API_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
  SMTP_HOST: z.preprocess(emptyToUndefined, z.string().optional()),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.preprocess(emptyToUndefined, z.string().optional()),
  SMTP_PASS: z.preprocess(emptyToUndefined, z.string().optional()),
});

export const env = envSchema.parse(process.env);
