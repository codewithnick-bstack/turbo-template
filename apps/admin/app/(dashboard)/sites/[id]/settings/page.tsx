"use client";

import { useState, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Site = { id: string; name: string; slug: string; primaryDomain: string | null };

export default function SiteSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [site, setSite] = useState<Site | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [domain, setDomain] = useState("");
  const [bindingDomain, setBindingDomain] = useState(false);
  const [domainMsg, setDomainMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/sites/${id}`)
      .then((r) => r.json())
      .then((s: Site) => {
        setSite(s);
        setName(s.name ?? "");
        setSlug(s.slug ?? "");
      })
      .catch(() => setError("Failed to load site"));
  }, [id]);

  async function handleBindDomain(e: React.FormEvent) {
    e.preventDefault();
    setBindingDomain(true);
    setDomainMsg(null);
    try {
      const res = await fetch(`/api/sites/${id}/domain`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ hostname: domain }),
      });
      if (!res.ok) {
        const err = (await res.json()) as { message?: string };
        throw new Error(err.message ?? "Failed to bind domain");
      }
      setDomainMsg(`Domain "${domain}" binding initiated. Add a CNAME to your DNS.`);
      setDomain("");
    } catch (err) {
      setDomainMsg(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setBindingDomain(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch(`/api/sites/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, slug }),
      });
      if (!res.ok) {
        const err = (await res.json()) as { message?: string };
        throw new Error(err.message ?? "Save failed");
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete site "${site?.name}"? This will permanently delete all pages, blog posts, forms, and content. This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/sites/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = (await res.json()) as { message?: string };
        throw new Error(err.message ?? "Delete failed");
      }
      router.push("/sites");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setDeleting(false);
    }
  }

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/sites/${id}`} className="text-sm text-[var(--muted-foreground)] hover:underline">
          Site
        </Link>
        <span className="text-[var(--muted-foreground)]">/</span>
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      {error && <div className="mb-4 rounded bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>}

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Site name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full rounded border border-[var(--border)] bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-[var(--primary)]"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Slug</label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
            className="w-full rounded border border-[var(--border)] bg-transparent px-3 py-2 text-sm font-mono focus:outline-none focus:border-[var(--primary)]"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded bg-[var(--primary)] px-4 py-2 text-sm text-[var(--primary-foreground)] disabled:opacity-50"
        >
          {saving ? "Saving…" : saved ? "Saved!" : "Save changes"}
        </button>
      </form>

      <div className="mt-10 border-t border-[var(--border)] pt-6">
        <h2 className="text-sm font-semibold mb-2">Custom Domain</h2>
        {site?.primaryDomain && (
          <p className="text-sm text-[var(--muted-foreground)] mb-3">
            Current: <code className="font-mono text-xs">{site.primaryDomain}</code>
          </p>
        )}
        <form onSubmit={handleBindDomain} className="flex gap-2 max-w-md">
          <input
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            required
            placeholder="yourdomain.com"
            className="flex-1 rounded border border-[var(--border)] bg-transparent px-3 py-2 text-sm font-mono focus:outline-none focus:border-[var(--primary)]"
          />
          <button
            type="submit"
            disabled={bindingDomain}
            className="rounded border border-[var(--border)] px-4 py-2 text-sm hover:bg-neutral-50 disabled:opacity-50"
          >
            {bindingDomain ? "Binding…" : "Bind domain"}
          </button>
        </form>
        {domainMsg && (
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">{domainMsg}</p>
        )}
      </div>

      <div className="mt-10 border-t border-red-200 pt-6">
        <h2 className="text-sm font-semibold text-red-700 mb-2">Danger Zone</h2>
        <p className="text-sm text-[var(--muted-foreground)] mb-4">
          Permanently delete this site and all of its content. This action cannot be reversed.
        </p>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="rounded border border-red-500 text-red-600 px-4 py-2 text-sm hover:bg-red-50 disabled:opacity-50"
        >
          {deleting ? "Deleting…" : "Delete site"}
        </button>
      </div>
    </div>
  );
}
