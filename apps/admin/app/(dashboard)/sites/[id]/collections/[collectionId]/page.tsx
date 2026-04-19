import Link from "next/link";
import { getApiClient } from "../../../../../../lib/api";

type FieldDef = { name: string; label: string; kind: string; required: boolean };
type Collection = { id: string; slug: string; name: string; fields: FieldDef[] };
type Entry = { id: string; slug: string; locale: string; status: string; data: Record<string, unknown>; createdAt: string };

export default async function CollectionEntriesPage({
  params,
}: {
  params: Promise<{ id: string; collectionId: string }>;
}) {
  const { id: siteId, collectionId } = await params;
  const api = getApiClient();

  let collection: Collection | null = null;
  let entries: Entry[] = [];

  try {
    [collection, { data: entries }] = await Promise.all([
      api.collections.list(siteId).then((r) => {
        const res = r as { data: Collection[] };
        return res.data.find((c) => c.id === collectionId) ?? null;
      }),
      api.entries.list(collectionId) as Promise<{ data: Entry[] }>,
    ]);
  } catch { /* API unavailable */ }

  if (!collection) {
    return <div className="text-sm text-[var(--muted-foreground)]">Collection not found.</div>;
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <Link href={`/sites/${siteId}`} className="text-sm text-[var(--muted-foreground)] hover:underline">Site</Link>
        <span className="text-[var(--muted-foreground)]">/</span>
        <Link href={`/sites/${siteId}/collections`} className="text-sm text-[var(--muted-foreground)] hover:underline">Collections</Link>
        <span className="text-[var(--muted-foreground)]">/</span>
        <h1 className="text-2xl font-bold">{collection.name}</h1>
      </div>
      <p className="text-xs text-[var(--muted-foreground)] mb-6">
        Fields: {collection.fields.map((f) => f.name).join(", ")}
      </p>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{entries.length} {entries.length === 1 ? "entry" : "entries"}</h2>
        <Link
          href={`/sites/${siteId}/collections/${collectionId}/entries/new`}
          className="rounded-xl bg-[var(--primary)] px-4 py-2 text-sm text-[var(--primary-foreground)] hover:opacity-90"
        >
          New entry
        </Link>
      </div>

      {entries.length === 0 ? (
        <p className="text-sm text-[var(--muted-foreground)]">No entries yet.</p>
      ) : (
        <div className="border border-[var(--border)] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-neutral-50">
                <th className="px-4 py-2 text-left text-xs font-semibold text-[var(--muted-foreground)]">Slug</th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-[var(--muted-foreground)]">Status</th>
                {collection.fields.slice(0, 2).map((f) => (
                  <th key={f.name} className="px-4 py-2 text-left text-xs font-semibold text-[var(--muted-foreground)]">{f.label || f.name}</th>
                ))}
                <th className="px-4 py-2 text-left text-xs font-semibold text-[var(--muted-foreground)]">Created</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-4 py-2 font-mono text-xs">{entry.slug}</td>
                  <td className="px-4 py-2">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${entry.status === "published" ? "bg-green-100 text-green-700" : "bg-neutral-100 text-neutral-600"}`}>
                      {entry.status}
                    </span>
                  </td>
                  {collection.fields.slice(0, 2).map((f) => (
                    <td key={f.name} className="px-4 py-2 text-xs text-[var(--muted-foreground)] max-w-[160px] truncate">
                      {String(entry.data[f.name] ?? "")}
                    </td>
                  ))}
                  <td className="px-4 py-2 text-xs text-[var(--muted-foreground)]">
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
