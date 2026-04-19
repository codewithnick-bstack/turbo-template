import Link from "next/link";
import { getApiClient } from "../../../../../../../../lib/api";
import NewEntryForm from "./new-entry-form";

type FieldDef = { name: string; label: string; kind: string; required: boolean };
type Collection = { id: string; slug: string; name: string; fields: FieldDef[] };

export default async function NewEntryPage({
  params,
}: {
  params: Promise<{ id: string; collectionId: string }>;
}) {
  const { id: siteId, collectionId } = await params;
  const api = getApiClient();

  let collection: Collection | null = null;
  try {
    const res = await api.collections.list(siteId) as { data: Collection[] };
    collection = res.data.find((c) => c.id === collectionId) ?? null;
  } catch { /* API unavailable */ }

  if (!collection) {
    return <div className="text-sm text-[var(--muted-foreground)]">Collection not found.</div>;
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/sites/${siteId}/collections/${collectionId}`} className="text-sm text-[var(--muted-foreground)] hover:underline">
          {collection.name}
        </Link>
        <span className="text-[var(--muted-foreground)]">/</span>
        <h1 className="text-2xl font-bold">New entry</h1>
      </div>
      <NewEntryForm collectionId={collectionId} fields={collection.fields} backHref={`/sites/${siteId}/collections/${collectionId}`} />
    </div>
  );
}
