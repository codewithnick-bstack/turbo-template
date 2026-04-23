"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function UseTemplateClient({ templateId }: { templateId: string }) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");
  const router = useRouter();

  function deriveSlug(value: string) {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    try {
      const res = await fetch(`/api/templates/${templateId}/use`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, slug }),
      });
      const data = await res.json() as { site?: { id: string } };
      if (!res.ok) {
        setError((data as { message?: string }).message ?? "Failed");
        setStatus("error");
        return;
      }
      router.push(`/sites/${data.site?.id}`);
    } catch {
      setStatus("error");
      setError("Request failed.");
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Site Name</label>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => { setName(e.target.value); setSlug(deriveSlug(e.target.value)); }}
          className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          placeholder="My Awesome Site"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Slug</label>
        <input
          type="text"
          required
          value={slug}
          onChange={(e) => setSlug(deriveSlug(e.target.value))}
          className="w-full border border-[var(--border)] rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          placeholder="my-awesome-site"
        />
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg font-medium"
      >
        {status === "loading" ? "Creating…" : "Create Site"}
      </button>
    </form>
  );
}
