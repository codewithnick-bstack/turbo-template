import { config } from "dotenv";
import { z } from "zod";
import { parseEnv } from "@repo/config";

config();

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4200),
  PLATFORM_API_URL: z.string().url(),
  MCP_AUTH_SECRET: z.string().min(32),
});

export const env = parseEnv(schema);
