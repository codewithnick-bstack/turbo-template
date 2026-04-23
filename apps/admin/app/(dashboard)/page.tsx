import Link from "next/link";
import { getApiClient } from "../../lib/api";
import type { TSite, TAuditEntry } from "@repo/sdk";

export default async function DashboardPage() {
  const api = getApiClient();

  let sites: TSite[] = [];
  let mediaCount = 0;
  let templateCount = 0;
  let recentActivity: TAuditEntry[] = [];

  try {
    const [sitesRes, mediaRes, templatesRes, auditRes] = await Promise.all([
      api.sites.list(),
      api.media.list(undefined, 200),
      api.templates.list(),
      api.audit.list({ limit: 5 }),
    ]);
    sites = sitesRes.data ?? [];
    mediaCount = (mediaRes.data ?? []).length;
    templateCount = (templatesRes.data ?? []).length;
    recentActivity = auditRes.data ?? [];
  } catch {
    // API unavailable in preview
  }

  const activeSites = sites.filter((s) => s.status === "active").length;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total Sites" value={sites.length} href="/sites" />
        <StatCard label="Active Sites" value={activeSites} href="/sites" />
        <StatCard label="Media Assets" value={mediaCount} href="/media" />
        <StatCard label="Templates" value={templateCount} href="/templates" />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
            Recent Sites
          </h2>
          {sites.length === 0 ? (
            <div className="rounded-xl border border-[var(--border)] px-6 py-8 text-center">
              <p className="mb-4 text-sm text-[var(--muted-foreground)]">No sites yet.</p>
              <Link
                href="/sites/new"
                className="rounded bg-[var(--primary)] px-4 py-2 text-sm text-[var(--primary-foreground)] hover:opacity-90"
              >
                Create a site
              </Link>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {sites.slice(0, 5).map((site) => (
                  <Link
                    key={site.id}
                    href={`/sites/${site.id}`}
                    className="flex items-center justify-between rounded-xl border border-[var(--border)] px-4 py-3 hover:bg-[var(--border)] transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium">{site.name}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">{site.slug}{site.primaryDomain ? ` · ${site.primaryDomain}` : ""}</p>
                    </div>
                    <span className={`text-xs font-medium ${site.status === "active" ? "text-green-600" : "text-[var(--muted-foreground)]"}`}>
                      {site.status}
                    </span>
                  </Link>
                ))}
              </div>
              {sites.length > 5 && (
                <Link href="/sites" className="mt-3 block text-xs text-[var(--primary)] hover:underline">
                  View all {sites.length} sites →
                </Link>
              )}
            </>
          )}
        </div>

        {recentActivity.length > 0 && (
          <div>
            <h2 className="mb-3 text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
              Recent Activity
            </h2>
            <div className="space-y-2">
              {recentActivity.map((entry) => (
                <div key={entry.id} className="flex items-center gap-3 rounded-xl border border-[var(--border)] px-4 py-3">
                  <span className="text-xs font-mono text-[var(--muted-foreground)] shrink-0">
                    {entry.actorKind}
                  </span>
                  <span className="text-sm flex-1 truncate">
                    {entry.action} <span className="text-[var(--muted-foreground)]">{entry.resourceKind}</span>
                  </span>
                  <span className="text-xs text-[var(--muted-foreground)] shrink-0">
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
            <Link href="/settings/audit-log" className="mt-3 block text-xs text-[var(--primary)] hover:underline">
              View full audit log →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, href }: { label: string; value: number | string; href: string }) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-[var(--border)] px-5 py-4 hover:bg-[var(--border)] transition-colors"
    >
      <p className="text-2xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-[var(--muted-foreground)]">{label}</p>
    </Link>
  );
}
