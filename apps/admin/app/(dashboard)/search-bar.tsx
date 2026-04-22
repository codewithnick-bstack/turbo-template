"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

type SearchResult = {
  id: string;
  kind: string;
  title: string;
  url: string;
};

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
        setTimeout(() => ref.current?.querySelector("input")?.focus(), 50);
      }
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json() as { data?: SearchResult[] };
        setResults(data.data ?? []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-2 rounded border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--muted-foreground)] hover:border-[var(--foreground)] transition-colors"
      >
        <Search size={12} />
        <span className="flex-1 text-left">Search…</span>
        <kbd className="hidden sm:inline text-[10px] bg-[var(--border)] px-1 rounded">⌘K</kbd>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => { setOpen(false); setQuery(""); setResults([]); }}
          />
          <div className="fixed left-1/2 top-1/4 z-50 w-full max-w-md -translate-x-1/2 rounded-xl border border-[var(--border)] bg-[var(--background)] shadow-xl">
            <div className="flex items-center gap-2 border-b border-[var(--border)] px-4 py-3">
              <Search size={14} className="text-[var(--muted-foreground)]" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search sites, pages, posts…"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--muted-foreground)]"
              />
              {loading && <span className="text-xs text-[var(--muted-foreground)]">…</span>}
            </div>
            {results.length > 0 && (
              <ul className="max-h-64 overflow-y-auto divide-y divide-[var(--border)]">
                {results.map((r) => (
                  <li key={r.id}>
                    <Link
                      href={r.url}
                      onClick={() => { setOpen(false); setQuery(""); setResults([]); }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--border)] transition-colors"
                    >
                      <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--muted-foreground)] w-12 shrink-0">
                        {r.kind}
                      </span>
                      <span className="text-sm truncate">{r.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            {query.trim() && !loading && results.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-[var(--muted-foreground)]">No results for &quot;{query}&quot;</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
