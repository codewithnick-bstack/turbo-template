"use client";

import { useState } from "react";

export type SearchProps = {
  placeholder?: string;
  apiUrl?: string;
  tenantId?: string;
};

export function SearchBlock({ placeholder = "Search…", apiUrl = "", tenantId = "" }: SearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Array<{ doc: { title: string; url: string; kind: string }; snippet?: string }>>([]);
  const [loading, setLoading] = useState(false);

  async function search() {
    if (!query.trim() || !apiUrl || !tenantId) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${apiUrl}/v1/search?q=${encodeURIComponent(query)}&limit=10`,
        { headers: { "x-tenant-id": tenantId } },
      );
      const data = await res.json() as { data: typeof results };
      setResults(data.data ?? []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto py-8 px-4">
      <div className="flex gap-2 mb-4">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && search()}
          placeholder={placeholder}
          className="flex-1 border border-neutral-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={search}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm px-4 py-2 rounded-lg"
        >
          {loading ? "…" : "Search"}
        </button>
      </div>
      {results.length > 0 && (
        <ul className="space-y-3">
          {results.map((hit, i) => (
            <li key={i} className="border border-neutral-200 rounded-lg px-4 py-3">
              <a href={hit.doc.url} className="font-medium text-indigo-700 hover:underline text-sm">
                {hit.doc.title}
              </a>
              {hit.snippet && (
                <p
                  className="text-xs text-neutral-500 mt-1"
                  dangerouslySetInnerHTML={{ __html: hit.snippet }}
                />
              )}
              <span className="text-xs text-neutral-400 capitalize">{hit.doc.kind}</span>
            </li>
          ))}
        </ul>
      )}
      {results.length === 0 && query && !loading && (
        <p className="text-neutral-400 text-sm text-center">No results for &ldquo;{query}&rdquo;</p>
      )}
    </div>
  );
}
