import type { Db } from "@repo/db";
import type { Logger } from "@repo/observability";

export type Actor =
  | { kind: "user"; userId: string }
  | { kind: "api_key"; apiKeyId: string }
  | { kind: "agent"; sessionId: string; userId?: string }
  | { kind: "system"; reason: string };

export type ServiceContext = {
  db: Db;
  logger: Logger;
  tenantId: string;
  actor: Actor;
  requestId?: string;
};
