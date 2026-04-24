import type { Metadata } from "next";
import Link from "next/link";
import { serverFetch } from "@/lib/api";
import type { PortfolioEntry } from "@/lib/types";

export const metadata: Metadata = { title: "Portfolio" };

export default async function PortfolioPage() {
  let entries: PortfolioEntry[] = [];
  try {
    entries = await serverFetch<PortfolioEntry[]>("/portfolio/admin/all");
  } catch {
    // unauthenticated or unavailable
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Portfolio</h1>
        <Link
          href="/portfolio/new"
          className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90"
        >
          Add entry
        </Link>
      </div>

      {entries.length === 0 ? (
        <div className="rounded-xl border border-[var(--border)] px-6 py-12 text-center">
          <p className="text-sm text-[var(--muted-foreground)]">No portfolio entries yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <Link
              key={entry.id}
              href={`/portfolio/${entry.id}`}
              className="flex items-center justify-between rounded-xl border border-[var(--border)] px-4 py-3 hover:bg-[var(--muted)] transition-colors"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{entry.title}</p>
                {entry.client ? (
                  <p className="text-xs text-[var(--muted-foreground)]">{entry.client}</p>
                ) : null}
              </div>
              <div className="ml-4 flex shrink-0 items-center gap-3">
                {entry.tags.length > 0 && (
                  <span className="text-xs text-[var(--muted-foreground)]">{entry.tags.join(", ")}</span>
                )}
                <span
                  className={`text-xs font-medium ${
                    entry.status === "published" ? "text-green-600 dark:text-green-400" : "text-[var(--muted-foreground)]"
                  }`}
                >
                  {entry.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
