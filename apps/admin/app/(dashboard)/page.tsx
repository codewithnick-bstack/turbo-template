import Link from "next/link";
import { getApiClient } from "../../lib/api";

type Site = { id: string; name: string; status: string };

export default async function DashboardPage() {
  const api = getApiClient();

  let sites: Site[] = [];
  let mediaCount = 0;

  try {
    const [sitesRes, mediaRes] = await Promise.all([
      api.sites.list() as Promise<{ data: Site[] }>,
      api.media.list(undefined, 200) as Promise<{ data: unknown[] }>,
    ]);
    sites = sitesRes.data ?? [];
    mediaCount = (mediaRes.data ?? []).length;
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
        <StatCard label="Templates" value="—" href="/templates" />
      </div>

      {sites.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-3 text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
            Recent Sites
          </h2>
          <div className="space-y-2">
            {sites.slice(0, 5).map((site) => (
              <Link
                key={site.id}
                href={`/sites/${site.id}`}
                className="flex items-center justify-between rounded-xl border border-[var(--border)] px-4 py-3 hover:bg-[var(--border)] transition-colors"
              >
                <span className="text-sm font-medium">{site.name}</span>
                <span className={`text-xs font-medium ${site.status === "active" ? "text-green-600" : "text-[var(--muted-foreground)]"}`}>
                  {site.status}
                </span>
              </Link>
            ))}
          </div>
          {sites.length > 5 && (
            <Link href="/sites" className="mt-3 block text-xs text-blue-600 hover:underline">
              View all {sites.length} sites →
            </Link>
          )}
        </div>
      )}

      {sites.length === 0 && (
        <div className="mt-16 text-center">
          <p className="mb-4 text-sm text-[var(--muted-foreground)]">No sites yet. Create your first site to get started.</p>
          <Link
            href="/sites/new"
            className="rounded bg-[var(--primary)] px-4 py-2 text-sm text-[var(--primary-foreground)] hover:opacity-90"
          >
            Create a site
          </Link>
        </div>
      )}
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
