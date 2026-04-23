import Link from "next/link";
import { getApiClient } from "../../../../../lib/api";
import { ExperimentsTab } from "./experiments-tab";
import type { TExperiment } from "@repo/sdk";

export default async function AnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const api = getApiClient();
  let data: Awaited<ReturnType<typeof api.analytics.get>> | null = null;
  let experiments: TExperiment[] = [];

  try {
    [data, { data: experiments }] = await Promise.all([
      api.analytics.get(id, 30),
      api.experiments.list(id),
    ]);
  } catch {
    // API unavailable or no data yet
  }

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

          {data.dailyViews.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-4">Daily Views</h2>
              <div className="flex items-end gap-1 h-32">
                {data.dailyViews.map((d, i) => {
                  const max = Math.max(...data!.dailyViews.map((x) => x.views), 1);
                  const pct = Math.round((d.views / max) * 100);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                      <div
                        className="w-full bg-[var(--primary)] rounded-t"
                        style={{ height: `${pct}%` }}
                      />
                      <span className="hidden group-hover:block absolute -top-6 text-xs bg-black text-white rounded px-1 py-0.5">
                        {d.views}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      <div className="mt-12">
        <ExperimentsTab siteId={id} initial={experiments} />
      </div>
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
