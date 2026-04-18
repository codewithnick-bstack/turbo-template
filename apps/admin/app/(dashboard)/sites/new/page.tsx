"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewSitePage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/sites", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          slug: form.get("slug"),
          description: form.get("description") || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed to create site");
      router.push(`/sites/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold">New site</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <Field label="Name" name="name" required placeholder="My Awesome Site" />
        <Field label="Slug" name="slug" required placeholder="my-awesome-site" pattern="[a-z0-9-]+" />
        <Field label="Description" name="description" placeholder="Optional description" />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-[var(--primary)] px-5 py-2 text-sm text-[var(--primary-foreground)] disabled:opacity-50"
        >
          {loading ? "Creating…" : "Create site"}
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
