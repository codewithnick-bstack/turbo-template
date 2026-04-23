"use client";

import { useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type SearchResult = {
  id: string;
  kind: string;
  title: string;
  url: string;
  snippet?: string;
};

export default function SiteSearchPage() {
  const params = useParams<{ id: string }>();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const search = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); setStatus("idle"); return; }
    setStatus("loading");
    setError("");
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&siteId=${params.id}`);
      const data = await res.json() as { data?: SearchResult[]; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Search failed");
      setResults(data.data ?? []);
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
      setStatus("error");
    }
  }, [params.id]);

  const kindLabel: Record<string, string> = {
    page: "Page",
    post: "Post",
    entry: "Entry",
    media: "Media",
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Link href={`/sites/${params.id}`} className="text-sm text-[var(--muted-foreground)] hover:underline mb-4 inline-block">
        ← Back to site
      </Link>
      <h1 className="text-2xl font-bold mb-1">Search</h1>
      <p className="text-[var(--muted-foreground)] text-sm mb-6">Full-text search across all site content.</p>

      <form
        onSubmit={(e) => { e.preventDefault(); search(query); }}
        className="flex gap-2 mb-6"
      >
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search pages, posts, collections…"
          className="flex-1 border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          autoFocus
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="bg-[var(--primary)] hover:opacity-90 disabled:opacity-50 text-[var(--primary-foreground)] text-sm px-4 py-2 rounded-lg font-medium"
        >
          {status === "loading" ? "Searching…" : "Search"}
        </button>
      </form>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {status === "done" && results.length === 0 && (
        <p className="text-[var(--muted-foreground)] text-sm">No results for &quot;{query}&quot;.</p>
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-[var(--muted-foreground)] mb-3">{results.length} result{results.length !== 1 ? "s" : ""}</p>
          {results.map((hit) => (
            <div key={hit.id} className="border border-[var(--border)] rounded-lg px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs bg-[var(--muted)] text-[var(--muted-foreground)] px-2 py-0.5 rounded">
                  {kindLabel[hit.kind] ?? hit.kind}
                </span>
                <p className="font-medium text-sm">{hit.title}</p>
              </div>
              {hit.snippet && (
                <p className="text-xs text-[var(--muted-foreground)] line-clamp-2">{hit.snippet}</p>
              )}
              <p className="text-xs text-[var(--muted-foreground)] mt-1 font-mono">{hit.url}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
