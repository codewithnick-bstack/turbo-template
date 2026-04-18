import Link from "next/link";
import { env } from "@/lib/env";

type AnalyticsData = {
  pageViews: number;
  uniqueVisitors: number;
  topPages: Array<{ path: string | null; views: number }>;
  dailyViews: Array<{ date: string; views: number }>;
};

async function getAnalytics(siteId: string): Promise<AnalyticsData | null> {
  try {
    const res = await fetch(
      `${env.PLATFORM_API_URL}/v1/analytics?siteId=${siteId}&days=30`,
      {
        headers: {
          "x-tenant-id": env.DEV_TENANT_ID,
          "x-user-id": env.DEV_USER_ID,
          "x-role": "owner",
        },
        cache: "no-store",
      },
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function AnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getAnalytics(id);

  return (
    <div>
      <div className="flex items-center gap-3">
        <Link href={`/sites/${id}`} className="text-sm text-[var(--muted-foreground)] hover:underline">
          Site
        </Link>
        <span className="text-[var(--muted-foreground)]">/</span>
        <h1 className="text-2xl font-bold">Analytics</h1>
      </div>
      <p className="mt-1 text-sm text-[var(--muted-foreground)]">Last 30 days</p>

      {!data ? (
        <p className="mt-8 text-sm text-[var(--muted-foreground)]">No analytics data yet.</p>
      ) : (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <StatCard label="Page Views" value={data.pageViews.toLocaleString()} />
            <StatCard label="Unique Visitors" value={data.uniqueVisitors.toLocaleString()} />
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-semibold">Top Pages</h2>
            {data.topPages.length === 0 ? (
              <p className="mt-4 text-sm text-[var(--muted-foreground)]">No data yet.</p>
            ) : (
              <table className="mt-4 w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--border)] text-left text-xs text-[var(--muted-foreground)]">
                    <th className="pb-2 pr-4">Path</th>
                    <th className="pb-2">Views</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topPages.map((row, i) => (
                    <tr key={i} className="border-b border-[var(--border)]">
                      <td className="py-2 pr-4 font-mono text-xs">{row.path ?? "/"}</td>
                      <td className="py-2">{row.views}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[var(--border)] p-6">
      <p className="text-sm text-[var(--muted-foreground)]">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}
