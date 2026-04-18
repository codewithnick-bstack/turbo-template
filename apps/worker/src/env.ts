import { config } from "dotenv";
import { z } from "zod";
import { parseEnv, emptyToUndefined } from "@repo/config";

config();

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  REDIS_URL: z.string().url(),
  DATABASE_URL: z.string().url(),
  SITEMAP_URL: z.string().url(),
  INDEXNOW_HOST: z.string(),
  INDEXNOW_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
  INDEXNOW_KEY_LOCATION: z.preprocess(emptyToUndefined, z.string().optional()),
  INDEXNOW_ENDPOINT: z.string().url(),
  OTEL_EXPORTER_OTLP_ENDPOINT: z.preprocess(emptyToUndefined, z.string().url().optional()),
  REVALIDATE_SECRET: z.string().min(10),
  RENDERER_BASE_URL: z.string().url(),
});

export const env = parseEnv(schema);
