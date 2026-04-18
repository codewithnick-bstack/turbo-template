import { config } from "dotenv";
import { z } from "zod";
import { parseEnv, emptyToUndefined } from "@repo/config";

config();

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4100),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.preprocess(emptyToUndefined, z.string().url().optional()),
  SESSION_SECRET: z.string().min(32),
  OTEL_EXPORTER_OTLP_ENDPOINT: z.preprocess(emptyToUndefined, z.string().url().optional()),
  AUTH_PROVIDER: z.enum(["workos", "clerk", "mock"]).default("mock"),
  WORKOS_API_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
  CLERK_SECRET_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
  STRIPE_SECRET_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
  STRIPE_WEBHOOK_SECRET: z.preprocess(emptyToUndefined, z.string().optional()),
  STRIPE_PRICE_STARTER_MONTHLY: z.preprocess(emptyToUndefined, z.string().optional()),
  STRIPE_PRICE_PRO_MONTHLY: z.preprocess(emptyToUndefined, z.string().optional()),
  STRIPE_PRICE_AGENCY_MONTHLY: z.preprocess(emptyToUndefined, z.string().optional()),
  RESEND_API_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
  REVALIDATE_SECRET: z.preprocess(emptyToUndefined, z.string().optional()),
  R2_ACCOUNT_ID: z.preprocess(emptyToUndefined, z.string().optional()),
  R2_ACCESS_KEY_ID: z.preprocess(emptyToUndefined, z.string().optional()),
  R2_SECRET_ACCESS_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
  R2_BUCKET: z.preprocess(emptyToUndefined, z.string().optional()),
  R2_PUBLIC_URL: z.preprocess(emptyToUndefined, z.string().url().optional()),
  WEB_ORIGIN: z.string().default("http://localhost:3000"),
  ADMIN_ORIGIN: z.string().default("http://localhost:4000"),
  AI_PROVIDER: z.enum(["anthropic", "openai", "mock"]).default("mock"),
  ANTHROPIC_API_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
  OPENAI_API_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
});

export const env = parseEnv(schema);
