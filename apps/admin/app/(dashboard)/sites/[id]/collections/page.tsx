import Link from "next/link";
import { getApiClient } from "../../../../../lib/api";
import NewCollectionForm from "./new-collection-form";
import type { TCollection } from "@repo/sdk";

export default async function CollectionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: siteId } = await params;
  const api = getApiClient();
  let collections: TCollection[] = [];
  try {
    const res = await api.collections.list(siteId);
    collections = res.data ?? [];
  } catch { /* API unavailable */ }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/sites/${siteId}`} className="text-sm text-[var(--muted-foreground)] hover:underline">Site</Link>
        <span className="text-[var(--muted-foreground)]">/</span>
        <h1 className="text-2xl font-bold">Collections</h1>
      </div>

      {collections.length === 0 ? (
        <p className="text-sm text-[var(--muted-foreground)] mb-8">No collections yet. Create one below.</p>
      ) : (
        <div className="mb-8 space-y-2">
          {collections.map((c) => (
            <Link
              key={c.id}
              href={`/sites/${siteId}/collections/${c.id}`}
              className="flex items-center justify-between px-4 py-3 border border-[var(--border)] rounded-xl hover:bg-neutral-50 transition-colors"
            >
              <div>
                <p className="font-medium text-sm">{c.name}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{c.slug} · {c.fields.length} field{c.fields.length === 1 ? "" : "s"}</p>
              </div>
              <span className="text-xs text-blue-600">View entries →</span>
            </Link>
          ))}
        </div>
      )}

      <NewCollectionForm siteId={siteId} />
    </div>
  );
}
