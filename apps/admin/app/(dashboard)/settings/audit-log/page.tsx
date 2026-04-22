import { getApiClient } from "@/lib/api";
import { AuditLogClient } from "./audit-log-client";
import type { TAuditEntry } from "@repo/sdk";

export default async function AuditLogPage() {
  const api = getApiClient();
  let entries: TAuditEntry[] = [];
  try {
    const res = await api.audit.list({ limit: 50 });
    entries = res.data;
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
