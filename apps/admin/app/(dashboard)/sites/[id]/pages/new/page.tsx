"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

export default function NewPagePage() {
  const { id: siteId } = useParams<{ id: string }>();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/pages", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          siteId,
          title: form.get("title"),
          slug: form.get("slug"),
          description: form.get("description") || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to create page");
      router.push(`/sites/${siteId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold">New page</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Field label="Title" name="title" required placeholder="Home" />
        <Field label="Slug" name="slug" required placeholder="home" pattern="[a-z0-9/-]+" />
        <Field label="Description" name="description" placeholder="Optional meta description" />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-[var(--primary)] px-5 py-2 text-sm text-[var(--primary-foreground)] disabled:opacity-50"
        >
          {loading ? "Creating…" : "Create page"}
        </button>
      </form>
    </div>
  );
}

function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, ...rest } = props;
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      <input
        {...rest}
        className="w-full rounded border border-[var(--border)] bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--primary)]"
      />
    </div>
  );
}
