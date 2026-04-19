"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type FieldDef = { name: string; label: string; kind: string; required: boolean };

const FIELD_KINDS = ["text", "longtext", "richtext", "number", "boolean", "date", "media", "json"] as const;

export default function NewCollectionForm({ siteId }: { siteId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [fields, setFields] = useState<FieldDef[]>([{ name: "title", label: "Title", kind: "text", required: true }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function addField() {
    setFields((f) => [...f, { name: "", label: "", kind: "text", required: false }]);
  }

  function removeField(i: number) {
    setFields((f) => f.filter((_, idx) => idx !== i));
  }

  function updateField(i: number, patch: Partial<FieldDef>) {
    setFields((f) => f.map((field, idx) => idx === i ? { ...field, ...patch } : field));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ siteId, name, slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), fields }),
      });
      const data = (await res.json()) as { message?: string };
      if (!res.ok) throw new Error(data.message ?? "Failed to create collection");
      router.refresh();
      setOpen(false);
      setName("");
      setSlug("");
      setFields([{ name: "title", label: "Title", kind: "text", required: true }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-xl bg-[var(--primary)] px-4 py-2 text-sm text-[var(--primary-foreground)] hover:opacity-90"
      >
        New collection
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border border-[var(--border)] rounded-2xl p-6 max-w-xl space-y-4">
      <h2 className="text-lg font-semibold">New collection</h2>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-[var(--muted-foreground)] mb-1">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Products"
            className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[var(--muted-foreground)] mb-1">Slug</label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="auto-generated"
            className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-[var(--muted-foreground)]">Fields</label>
          <button type="button" onClick={addField} className="text-xs text-blue-600 hover:underline">+ Add field</button>
        </div>
        <div className="space-y-2">
          {fields.map((field, i) => (
            <div key={i} className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 items-center">
              <input
                value={field.name}
                onChange={(e) => updateField(i, { name: e.target.value })}
                required
                placeholder="field_name"
                className="border border-[var(--border)] rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <select
                value={field.kind}
                onChange={(e) => updateField(i, { kind: e.target.value })}
                className="border border-[var(--border)] rounded px-2 py-1 text-xs focus:outline-none"
              >
                {FIELD_KINDS.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
              <label className="flex items-center gap-1 text-xs">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) => updateField(i, { required: e.target.checked })}
                />
                Req
              </label>
              <button type="button" onClick={() => removeField(i)} className="text-xs text-red-500 hover:underline" disabled={fields.length === 1}>✕</button>
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button type="submit" disabled={loading} className="rounded-xl bg-[var(--primary)] px-4 py-2 text-sm text-[var(--primary-foreground)] disabled:opacity-50">
          {loading ? "Creating…" : "Create"}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm hover:bg-neutral-50">
          Cancel
        </button>
      </div>
    </form>
  );
}
