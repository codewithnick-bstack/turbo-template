import type { Context } from "hono";
import { createDb, type Db } from "@repo/db";
import { createLogger } from "@repo/observability";
import type { ServiceContext } from "@repo/core";
import type { AuthEnv } from "./middleware/auth";
import { env } from "./env";

let _db: Db | undefined;

export function getDb(): Db {
  if (!_db) {
    _db = createDb({ url: env.DATABASE_URL }).db;
  }
  return _db;
}

const logger = createLogger({ service: "platform-api", env: env.NODE_ENV });

export function buildCtx(c: Context<AuthEnv>): ServiceContext {
  const session = c.get("session");
  return {
    db: getDb(),
    logger,
    tenantId: session.tenantId,
    actor: { kind: "user", userId: session.userId },
    requestId: c.req.header("x-request-id"),
  };
}
