import { createLogger } from "@repo/observability";
import { env } from "../env";

type Env = "development" | "test" | "production";

export const logger = createLogger({
  service: "api",
  env: (process.env.NODE_ENV ?? "development") as Env,
});

export { env };
