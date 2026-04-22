import Link from "next/link";
import { getApiClient } from "../../../lib/api";
import type { TSite } from "@repo/sdk";

export default async function SitesPage() {
  const api = getApiClient();
  let sites: TSite[] = [];
  try {
    const res = await api.sites.list();
    sites = res.data;
  } catch {
    // API not running in build/preview — show empty state
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Sites</h1>
        <Link
          href="/sites/new"
          className="rounded bg-[var(--primary)] px-4 py-2 text-sm text-[var(--primary-foreground)] hover:opacity-90"
        >
          New site
        </Link>
      </div>

      {sites.length === 0 ? (
        <div className="mt-12 text-center text-sm text-[var(--muted-foreground)]">
          No sites yet. <Link href="/sites/new" className="text-blue-500 hover:underline">Create one.</Link>
        </div>
      ) : (
        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-left text-xs text-[var(--muted-foreground)]">
              <th className="pb-2 pr-4">Name</th>
              <th className="pb-2 pr-4">Slug</th>
              <th className="pb-2 pr-4">Domain</th>
              <th className="pb-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {sites.map((site) => (
              <tr key={site.id} className="border-b border-[var(--border)]">
                <td className="py-3 pr-4">
                  <Link href={`/sites/${site.id}`} className="font-medium hover:underline">
                    {site.name}
                  </Link>
                </td>
                <td className="py-3 pr-4 text-[var(--muted-foreground)]">{site.slug}</td>
                <td className="py-3 pr-4 text-[var(--muted-foreground)]">{site.primaryDomain ?? "—"}</td>
                <td className="py-3">
                  <StatusBadge status={site.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: TSite["status"] }) {
  const color = status === "active" ? "text-green-600" : "text-[var(--muted-foreground)]";
  return <span className={`text-xs font-medium ${color}`}>{status}</span>;
}
