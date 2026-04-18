"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function WebhooksPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubscribe(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/webhooks/subscriptions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          url: form.get("url"),
          events: (form.get("events") as string).split(",").map((e) => e.trim()),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Failed");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Webhooks</h1>
      <div className="mt-6 max-w-lg">
        <h2 className="text-sm font-semibold">Add subscription</h2>
        <form onSubmit={handleSubscribe} className="mt-3 space-y-3">
          <div>
            <label className="mb-1 block text-sm">Endpoint URL</label>
            <input
              name="url"
              required
              type="url"
              placeholder="https://example.com/webhook"
              className="w-full rounded border border-[var(--border)] bg-transparent px-3 py-2 text-sm focus:border-[var(--primary)] outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm">Events (comma-separated)</label>
            <input
              name="events"
              required
              placeholder="site.created,page.published"
              className="w-full rounded border border-[var(--border)] bg-transparent px-3 py-2 text-sm focus:border-[var(--primary)] outline-none"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="rounded bg-[var(--primary)] px-4 py-2 text-sm text-[var(--primary-foreground)] disabled:opacity-50"
          >
            {loading ? "Subscribing…" : "Subscribe"}
          </button>
        </form>
      </div>
    </div>
  );
}
