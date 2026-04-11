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
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  CRON_SCHEDULE: z.string().default("*/30 * * * *"),
  SITEMAP_URL: z.string().url().default("http://localhost:3000/sitemap.xml"),
  INDEXNOW_HOST: z.string().default("localhost"),
  INDEXNOW_KEY: z.preprocess(emptyToUndefined, z.string().optional()),
  INDEXNOW_KEY_LOCATION: z.preprocess(emptyToUndefined, z.string().url().optional()),
  INDEXNOW_ENDPOINT: z.string().url().default("https://api.indexnow.org/indexnow"),
});

export const env = envSchema.parse(process.env);
