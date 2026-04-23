"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/toast";

const ALL_SCOPES = [
  "sites:read", "sites:write",
  "pages:read", "pages:write",
  "content:read", "content:write",
  "media:read", "media:write",
  "members:read", "members:write",
  "analytics:read",
  "webhooks:read", "webhooks:write",
];

type CreatedApp = {
  id: string;
  name: string;
  clientId: string;
  clientSecret: string;
};

export default function NewOAuthAppPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [redirectUri, setRedirectUri] = useState("");
  const [scopes, setScopes] = useState<string[]>([]);
  const [homepageUrl, setHomepageUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState<CreatedApp | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  function toggleScope(s: string) {
    setScopes((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (scopes.length === 0) {
      toast({ title: "Select at least one scope", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/developers/apps", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          description: description || undefined,
          redirectUris: [redirectUri],
          scopes,
          homepageUrl: homepageUrl || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json() as { message?: string };
        throw new Error(err.message ?? "Failed to create app");
      }
      const app = await res.json() as CreatedApp;
      setCreated(app);
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

  if (created) {
    return (
      <div className="max-w-lg p-6">
        <h1 className="text-xl font-bold mb-4">App created!</h1>
        <p className="text-sm text-[var(--muted-foreground)] mb-6">
          Save your client secret now — it will not be shown again.
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">Client ID</label>
            <code className="block w-full text-sm font-mono bg-[var(--border)]/30 rounded px-3 py-2 break-all">
              {created.clientId}
            </code>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--muted-foreground)] mb-1">
              Client Secret <span className="text-red-600">(shown once)</span>
            </label>
            <code className="block w-full text-sm font-mono bg-amber-50 border border-amber-200 rounded px-3 py-2 break-all text-amber-900">
              {created.clientSecret}
            </code>
          </div>
        </div>
        <button
          onClick={() => { router.push("/settings/developers"); router.refresh(); }}
          className="mt-6 rounded bg-[var(--primary)] px-5 py-2 text-sm text-[var(--primary-foreground)] hover:opacity-90"
        >
          Done
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/settings/developers" className="text-sm text-[var(--muted-foreground)] hover:underline">
          Developer Platform
        </Link>
        <span className="text-[var(--muted-foreground)]">/</span>
        <h1 className="text-xl font-bold">New OAuth App</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1">App name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="My Integration"
            className="w-full rounded border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description (optional)</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does this app do?"
            className="w-full rounded border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Redirect URI</label>
          <input
            type="url"
            value={redirectUri}
            onChange={(e) => setRedirectUri(e.target.value)}
            required
            placeholder="https://yourapp.com/oauth/callback"
            className="w-full rounded border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Homepage URL (optional)</label>
          <input
            type="url"
            value={homepageUrl}
            onChange={(e) => setHomepageUrl(e.target.value)}
            placeholder="https://yourapp.com"
            className="w-full rounded border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Scopes</label>
          <div className="grid grid-cols-2 gap-1.5">
            {ALL_SCOPES.map((s) => (
              <label key={s} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={scopes.includes(s)}
                  onChange={() => toggleScope(s)}
                  className="rounded"
                />
                <span className="text-xs font-mono">{s}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded bg-[var(--primary)] px-5 py-2 text-sm text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? "Creating…" : "Create app"}
          </button>
          <Link
            href="/settings/developers"
            className="rounded border border-[var(--border)] px-5 py-2 text-sm hover:bg-[var(--border)] transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
