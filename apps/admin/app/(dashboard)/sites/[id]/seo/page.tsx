import Link from "next/link";
import { getApiClient } from "@/lib/api";
import type { TPage } from "@repo/sdk";

type Props = { params: Promise<{ id: string }> };

export default async function SeoPage({ params }: Props) {
  const { id } = await params;
  const api = getApiClient();
  let pages: TPage[] = [];
  try {
    const res = await api.pages.list(id);
    pages = res.data ?? [];
  } catch {
    // API unavailable
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-1">SEO Autopilot</h1>
      <p className="text-[var(--muted-foreground)] text-sm mb-6">AI-powered audit and meta generation per page.</p>
      <div className="space-y-3">
        {pages.length === 0 && (
          <p className="text-[var(--muted-foreground)] text-sm">No pages found. Publish a page first.</p>
        )}
        {pages.map((page) => (
          <div key={page.id} className="flex items-center justify-between border border-[var(--border)] rounded-lg px-4 py-3">
            <div>
              <p className="font-medium text-sm">{page.title}</p>
              <p className="text-xs text-[var(--muted-foreground)]">/{page.slug}</p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/sites/${id}/seo/${page.id}/audit`}
                className="text-xs bg-[var(--muted)] hover:bg-neutral-200 px-3 py-1.5 rounded-md font-medium"
              >
                Audit
              </Link>
              <Link
                href={`/sites/${id}/seo/${page.id}/generate-meta`}
                className="text-xs bg-[var(--primary)] hover:opacity-90 text-[var(--primary-foreground)] px-3 py-1.5 rounded-md font-medium"
              >
                Generate Meta
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
