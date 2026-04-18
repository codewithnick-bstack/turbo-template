import { schema, type Db } from "@repo/db";
import type { Actor } from "./context";

type AuditInput = {
  db: Db;
  tenantId: string;
  actor: Actor;
  action: string;
  resourceKind: string;
  resourceId: string;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  metadata?: Record<string, unknown>;
};

export async function recordAudit(input: AuditInput): Promise<void> {
  const actorId =
    input.actor.kind === "user"
      ? input.actor.userId
      : input.actor.kind === "api_key"
        ? input.actor.apiKeyId
        : input.actor.kind === "agent"
          ? input.actor.sessionId
          : input.actor.reason;

  await input.db.insert(schema.auditLog).values({
    tenantId: input.tenantId,
    actorKind: input.actor.kind,
    actorId,
    action: input.action,
    resourceKind: input.resourceKind,
    resourceId: input.resourceId,
    before: input.before ?? null,
    after: input.after ?? null,
    metadata: input.metadata ?? null,
  });
}
