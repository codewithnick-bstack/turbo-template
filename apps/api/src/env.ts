import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  AUTH_SECRET: z.string().min(32),
  PORT: z.coerce.number().default(3001),
  API_URL: z.string().url().default("http://localhost:3001"),
  WEB_URL: z.string().url().default("http://localhost:3000"),
  ADMIN_URL: z.string().url().default("http://localhost:4000"),
  ADMIN_EMAIL: z.string().email().optional(),
  NOTIFICATION_EMAIL: z.string().email().optional(),
  AI_PROVIDER: z.enum(["anthropic", "openai", "mock"]).default("mock"),
  ANTHROPIC_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  FROM_EMAIL: z.string().email().default("noreply@example.com"),
  MCP_API_KEY: z.string().optional(),
  REVALIDATE_SECRET: z.string().optional(),
  ADMIN_PASSWORD: z.string().min(8).optional(),
  CAL_API_KEY: z.string().optional(),
  CAL_EVENT_TYPE_ID: z.coerce.number().optional(),
});

function parseEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("Invalid environment variables:");
    for (const [field, errors] of Object.entries(result.error.flatten().fieldErrors)) {
      console.error(`  ${field}: ${errors?.join(", ")}`);
    }
    process.exit(1);
  }
  return result.data;
}

export const env = parseEnv();
