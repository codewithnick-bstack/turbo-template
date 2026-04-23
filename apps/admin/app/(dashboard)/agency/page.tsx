import Link from "next/link";
import { getApiClient } from "../../../lib/api";
import { RemoveClientButton } from "./client-actions";
import type { TTenant } from "@repo/sdk";

export default async function AgencyPage() {
  const api = getApiClient();
  let clients: TTenant[] = [];
  let tenant: TTenant | null = null;

  try {
    [{ data: clients }, tenant] = await Promise.all([
      api.agency.listClients(),
      api.tenants.current(),
    ]);
  } catch {
    // API unavailable
  }

  if (tenant && tenant.type !== "agency") {
    return (
      <div className="p-6 max-w-2xl">
        <h1 className="text-2xl font-bold mb-2">Agency Workspace</h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          Your current plan does not include agency features. Upgrade to the Agency plan to manage
          client workspaces.
        </p>
        <Link
          href="/settings/billing"
          className="mt-4 inline-block rounded bg-[var(--primary)] px-4 py-2 text-sm text-[var(--primary-foreground)] hover:opacity-90"
        >
          Upgrade plan
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Client Workspaces</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Manage workspaces for your agency clients.
          </p>
        </div>
        <Link
          href="/agency/clients/new"
          className="rounded bg-[var(--primary)] px-4 py-2 text-sm text-[var(--primary-foreground)] hover:opacity-90"
        >
          New client
        </Link>
      </div>

      {clients.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[var(--border)] py-16 text-center">
          <p className="text-sm text-[var(--muted-foreground)]">No client workspaces yet.</p>
          <Link
            href="/agency/clients/new"
            className="mt-3 inline-block text-sm text-[var(--primary)] hover:underline"
          >
            Create your first client workspace
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {clients.map((client) => (
            <div
              key={client.id}
              className="flex items-center justify-between rounded-lg border border-[var(--border)] px-4 py-3"
            >
              <div>
                <p className="font-medium text-sm">{client.name}</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {client.slug} · {client.plan} · {client.status}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded ${
                    client.status === "active"
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {client.status}
                </span>
                <RemoveClientButton clientId={client.id} clientName={client.name} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
