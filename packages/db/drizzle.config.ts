import type { Config } from "drizzle-kit";

export default {
  dialect: "postgresql",
  schema: "./src/schema/index.ts",
  out: "./migrations",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgres://postgres:postgres@localhost:5432/platform_dev",
  },
  strict: true,
} satisfies Config;
