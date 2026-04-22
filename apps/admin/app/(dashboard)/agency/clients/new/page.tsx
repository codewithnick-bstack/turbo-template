"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/toast";

export default function NewClientPage() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  function deriveSlug(n: string) {
    return n.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").slice(0, 60);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/agency/clients", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, slug }),
      });
      if (!res.ok) {
        const err = await res.json() as { message?: string };
        throw new Error(err.message ?? "Failed to create client");
      }
      toast({ title: "Client workspace created", description: name });
      router.push("/agency");
      router.refresh();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/agency" className="text-sm text-[var(--muted-foreground)] hover:underline">
          Agency
        </Link>
        <span className="text-[var(--muted-foreground)]">/</span>
        <h1 className="text-xl font-bold">New client workspace</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Client name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!slug || slug === deriveSlug(name)) setSlug(deriveSlug(e.target.value));
            }}
            placeholder="Acme Corp"
            required
            className="w-full rounded border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Slug</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="acme-corp"
            required
            pattern="[a-z0-9-]+"
            className="w-full rounded border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          />
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">Lowercase letters, numbers, and hyphens only.</p>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded bg-[var(--primary)] px-5 py-2 text-sm text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? "Creating…" : "Create client"}
          </button>
          <Link
            href="/agency"
            className="rounded border border-[var(--border)] px-5 py-2 text-sm hover:bg-[var(--border)] transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
