"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type FieldDef = { name: string; label: string; kind: string; required: boolean };
type Entry = { id: string; slug: string; data: Record<string, unknown>; status: string };

export default function EditEntryPage({
  params,
}: {
  params: Promise<{ id: string; collectionId: string; entryId: string }>;
}) {
  const { id: siteId, collectionId, entryId } = use(params);
  const router = useRouter();

  const [entry, setEntry] = useState<Entry | null>(null);
  const [fields, setFields] = useState<FieldDef[]>([]);
  const [slug, setSlug] = useState("");
  const [data, setData] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/entries/${entryId}`).then((r) => r.json()) as Promise<Entry>,
      fetch(`/api/collections?siteId=${siteId}`).then((r) => r.json()) as Promise<{
        data: Array<{ id: string; fields: FieldDef[] }>;
      }>,
    ]).then(([e, { data: collections }]) => {
      setEntry(e);
      setSlug(e.slug ?? "");
      setStatus((e.status as "draft" | "published") ?? "draft");
      const strData: Record<string, string> = {};
      for (const [k, v] of Object.entries(e.data ?? {})) {
        strData[k] = String(v);
      }
      setData(strData);
      const col = collections.find((c) => c.id === collectionId);
      if (col) setFields(col.fields);
    }).catch(() => setError("Failed to load entry"));
  }, [entryId, collectionId, siteId]);

  function setField(name: string, value: string) {
    setData((d) => ({ ...d, [name]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch(`/api/entries/${entryId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug, data, status }),
      });
      if (!res.ok) {
        const err = (await res.json()) as { message?: string };
        throw new Error(err.message ?? "Save failed");
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  }

  const backHref = `/sites/${siteId}/collections/${collectionId}`;

  if (!entry) {
    return <div className="text-sm text-[var(--muted-foreground)] mt-8">Loading…</div>;
  }

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-2 mb-6 text-sm">
        <Link href={`/sites/${siteId}/collections`} className="text-[var(--muted-foreground)] hover:underline">Collections</Link>
        <span className="text-[var(--muted-foreground)]">/</span>
        <Link href={backHref} className="text-[var(--muted-foreground)] hover:underline">Entries</Link>
        <span className="text-[var(--muted-foreground)]">/</span>
        <span className="font-medium">{entry.slug}</span>
      </div>

      {error && <div className="mb-4 rounded bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>}

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[var(--muted-foreground)] mb-1">Slug</label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {fields.map((field) => (
          <div key={field.name}>
            <label className="block text-xs font-semibold text-[var(--muted-foreground)] mb-1">
              {field.label}{field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {field.kind === "longtext" ? (
              <textarea
                value={data[field.name] ?? ""}
                onChange={(e) => setField(field.name, e.target.value)}
                rows={4}
                required={field.required}
                className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            ) : field.kind === "boolean" ? (
              <input
                type="checkbox"
                checked={data[field.name] === "true"}
                onChange={(e) => setField(field.name, e.target.checked ? "true" : "false")}
                className="h-4 w-4"
              />
            ) : field.kind === "number" ? (
              <input
                type="number"
                value={data[field.name] ?? ""}
                onChange={(e) => setField(field.name, e.target.value)}
                required={field.required}
                className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            ) : field.kind === "date" ? (
              <input
                type="date"
                value={data[field.name] ?? ""}
                onChange={(e) => setField(field.name, e.target.value)}
                required={field.required}
                className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            ) : (
              <input
                type="text"
                value={data[field.name] ?? ""}
                onChange={(e) => setField(field.name, e.target.value)}
                required={field.required}
                className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            )}
          </div>
        ))}

        <div>
          <label className="block text-xs font-semibold text-[var(--muted-foreground)] mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as "draft" | "published")}
            className="border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:outline-none"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-[var(--primary)] px-4 py-2 text-sm text-[var(--primary-foreground)] disabled:opacity-50"
          >
            {saving ? "Saving…" : saved ? "Saved!" : "Save"}
          </button>
          <Link href={backHref} className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm hover:bg-neutral-50">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
