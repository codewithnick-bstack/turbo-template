"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type FieldDef = { name: string; label: string; kind: string; required: boolean };

export default function NewEntryForm({
  collectionId,
  fields,
  backHref,
}: {
  collectionId: string;
  fields: FieldDef[];
  backHref: string;
}) {
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [data, setData] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function setField(name: string, value: string) {
    setData((d) => ({ ...d, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const titleField = fields.find((f) => f.name === "title");
    const derivedSlug = slug || (titleField ? (data.title ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-") : "entry");
    try {
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ collectionId, slug: derivedSlug, data, status }),
      });
      const body = (await res.json()) as { message?: string };
      if (!res.ok) throw new Error(body.message ?? "Failed to create entry");
      router.push(backHref);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-[var(--muted-foreground)] mb-1">Slug (optional — auto-derived from title)</label>
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="auto-generated"
          className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
        />
      </div>

      {fields.map((field) => (
        <div key={field.name}>
          <label className="block text-xs font-semibold text-[var(--muted-foreground)] mb-1">
            {field.label || field.name}{field.required && " *"}
          </label>
          {field.kind === "longtext" || field.kind === "richtext" ? (
            <textarea
              value={data[field.name] ?? ""}
              onChange={(e) => setField(field.name, e.target.value)}
              required={field.required}
              rows={4}
              className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary)] resize-y"
            />
          ) : field.kind === "boolean" ? (
            <input
              type="checkbox"
              checked={data[field.name] === "true"}
              onChange={(e) => setField(field.name, String(e.target.checked))}
            />
          ) : field.kind === "number" ? (
            <input
              type="number"
              value={data[field.name] ?? ""}
              onChange={(e) => setField(field.name, e.target.value)}
              required={field.required}
              className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          ) : field.kind === "date" ? (
            <input
              type="date"
              value={data[field.name] ?? ""}
              onChange={(e) => setField(field.name, e.target.value)}
              required={field.required}
              className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          ) : (
            <input
              type="text"
              value={data[field.name] ?? ""}
              onChange={(e) => setField(field.name, e.target.value)}
              required={field.required}
              className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
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

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2 pt-2">
        <button type="submit" disabled={loading} className="rounded-xl bg-[var(--primary)] px-5 py-2 text-sm text-[var(--primary-foreground)] disabled:opacity-50">
          {loading ? "Creating…" : "Create entry"}
        </button>
        <a href={backHref} className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm hover:bg-[var(--muted)]">
          Cancel
        </a>
      </div>
    </form>
  );
}
