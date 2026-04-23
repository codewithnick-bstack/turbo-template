import Link from "next/link";
import { getApiClient } from "../../../../lib/api";
import { PublishButton } from "../../../../components/publish-button";
import type { TSite, TPage } from "@repo/sdk";

export default async function SiteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const api = getApiClient();

  let site: TSite | null = null;
  let pages: TPage[] = [];
  try {
    [site, { data: pages }] = await Promise.all([
      api.sites.get(id),
      api.pages.list(id),
    ]);
  } catch {
    // API unavailable during build
  }

  if (!site) {
    return <div className="text-sm text-[var(--muted-foreground)]">Site not found.</div>;
  }

  return (
    <div>
      <div className="flex items-center gap-3">
        <Link href="/sites" className="text-sm text-[var(--muted-foreground)] hover:underline">Sites</Link>
        <span className="text-[var(--muted-foreground)]">/</span>
        <h1 className="text-2xl font-bold">{site.name}</h1>
      </div>
      <p className="mt-1 text-sm text-[var(--muted-foreground)]">{site.slug}{site.primaryDomain ? ` · ${site.primaryDomain}` : ""}</p>

      <div className="mt-5 flex flex-wrap gap-1 border-b border-[var(--border)] pb-0">
        {[
          { href: `/sites/${id}/analytics`, label: "Analytics" },
          { href: `/sites/${id}/blog`, label: "Blog" },
          { href: `/sites/${id}/collections`, label: "Collections" },
          { href: `/sites/${id}/forms`, label: "Forms" },
          { href: `/sites/${id}/seo`, label: "SEO" },
          { href: `/sites/${id}/assistant`, label: "AI Assistant" },
          { href: `/sites/${id}/search`, label: "Search" },
          { href: `/sites/${id}/sandboxes`, label: "Sandboxes" },
          { href: `/sites/${id}/settings`, label: "Settings" },
        ].map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="px-3 py-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] border-b-2 border-transparent hover:border-[var(--foreground)] transition-colors -mb-px"
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Pages</h2>
        <Link
          href={`/sites/${id}/pages/new`}
          className="rounded bg-[var(--primary)] px-4 py-2 text-sm text-[var(--primary-foreground)] hover:opacity-90"
        >
          New page
        </Link>
      </div>

      {pages.length === 0 ? (
        <p className="mt-6 text-sm text-[var(--muted-foreground)]">No pages yet.</p>
      ) : (
        <table className="mt-4 w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-left text-xs text-[var(--muted-foreground)]">
              <th className="pb-2 pr-4">Title</th>
              <th className="pb-2 pr-4">Slug</th>
              <th className="pb-2 pr-4">Status</th>
              <th className="pb-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => (
              <tr key={page.id} className="border-b border-[var(--border)]">
                <td className="py-3 pr-4 font-medium">{page.title}</td>
                <td className="py-3 pr-4 text-[var(--muted-foreground)]">{page.slug}</td>
                <td className="py-3 pr-4">
                  <span className={`text-xs font-medium ${page.status === "published" ? "text-green-600" : "text-[var(--muted-foreground)]"}`}>
                    {page.status}
                  </span>
                </td>
                <td className="py-3 flex items-center gap-3">
                  <Link href={`/sites/${id}/pages/${page.id}/builder`} className="text-[var(--primary)] hover:underline text-xs">Edit</Link>
                  <PublishButton pageId={page.id} status={page.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
