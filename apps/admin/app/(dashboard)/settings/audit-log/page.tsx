import { getApiClient } from "@/lib/api";
import { AuditLogClient } from "./audit-log-client";

type AuditEntry = {
  id: string;
  actorKind: string;
  actorId: string;
  action: string;
  resourceKind: string;
  resourceId: string;
  createdAt: string;
};

export default async function AuditLogPage() {
  const api = getApiClient();
  let entries: AuditEntry[] = [];
  try {
    const res = (await api.audit.list({ limit: 50 })) as { data: AuditEntry[] };
    entries = res.data ?? [];
  } catch {
    // API unavailable during build
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Audit Log</h1>
      <p className="mt-1 text-sm text-[var(--muted-foreground)]">
        All mutations in your workspace, most recent first.
      </p>
      <AuditLogClient initialEntries={entries} />
    </div>
  );
}
