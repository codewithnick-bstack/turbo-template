"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search } from "lucide-react";

import { searchContent } from "@/lib/api";
import type { BlogPost, PortfolioEntry } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { ANALYTICS_EVENTS, trackEvent } from "@/lib/analytics";

function useDebounce<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") ?? "";

  const [query, setQuery] = useState(initialQ);
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioEntry[]>([]);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query.trim(), 350);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (debouncedQuery) {
      params.set("q", debouncedQuery);
    } else {
      params.delete("q");
    }
    router.replace(`/search?${params.toString()}`, { scroll: false });
  }, [debouncedQuery, router, searchParams]);

  const runSearch = useCallback(async (q: string) => {
    if (!q) {
      setPosts([]);
      setPortfolio([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    try {
      const [blogResults, portfolioResults] = await searchContent(q);
      const publishedPosts = blogResults.filter(
        (p) => p.status === "published",
      );
      const publishedPortfolio = portfolioResults.filter(
        (e) => e.status === "published",
      );
      setPosts(publishedPosts);
      setPortfolio(publishedPortfolio);
      setSearched(true);
      trackEvent(ANALYTICS_EVENTS.NAV_LINK_CLICKED, {
        href: "/search",
        label: `search:${q}`,
      });
    } catch {
      setPosts([]);
      setPortfolio([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void runSearch(debouncedQuery);
  }, [debouncedQuery, runSearch]);

  const total = posts.length + portfolio.length;

  return (
    <main className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Search</h1>

      <div className="relative mb-10">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <label htmlFor="search-input" className="sr-only">
          Search
        </label>
        <input
          id="search-input"
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search blog posts and portfolio…"
          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
          aria-label="Search"
          aria-busy={loading}
        />
      </div>

      {loading && (
        <p
          className="text-sm text-slate-500 dark:text-slate-400"
          aria-live="polite"
        >
          Searching…
        </p>
      )}

      {!loading && searched && (
        <p
          className="text-sm text-slate-500 dark:text-slate-400 mb-6"
          aria-live="polite"
          aria-atomic="true"
        >
          {total === 0
            ? `No results for "${debouncedQuery}"`
            : `${total} result${total === 1 ? "" : "s"} for "${debouncedQuery}"`}
        </p>
      )}

      {!loading && posts.length > 0 && (
        <section aria-labelledby="blog-results-heading" className="mb-10">
          <h2
            id="blog-results-heading"
            className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4"
          >
            Blog posts
          </h2>
          <ul className="space-y-3">
            {posts.map((post) => (
              <li key={post.id}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group block rounded-xl border border-slate-200 bg-white p-4 hover:border-[var(--accent)] hover:shadow-sm transition-all dark:border-slate-800 dark:bg-slate-900 dark:hover:border-[var(--accent)]"
                >
                  <p className="font-medium text-slate-900 group-hover:text-[var(--accent-text)] dark:text-slate-100">
                    {post.title}
                  </p>
                  {post.excerpt && (
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}
                  {post.author && (
                    <p className="mt-2 text-xs text-slate-400">{post.author}</p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!loading && portfolio.length > 0 && (
        <section aria-labelledby="portfolio-results-heading">
          <h2
            id="portfolio-results-heading"
            className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4"
          >
            Portfolio
          </h2>
          <ul className="space-y-3">
            {portfolio.map((entry) => (
              <li key={entry.id}>
                <Link
                  href={`/portfolio/${entry.id}`}
                  className="group block rounded-xl border border-slate-200 bg-white p-4 hover:border-[var(--accent)] hover:shadow-sm transition-all dark:border-slate-800 dark:bg-slate-900 dark:hover:border-[var(--accent)]"
                >
                  <p className="font-medium text-slate-900 group-hover:text-[var(--accent-text)] dark:text-slate-100">
                    {entry.title}
                  </p>
                  {entry.client && (
                    <p className="mt-0.5 text-xs text-slate-400">
                      Client: {entry.client}
                    </p>
                  )}
                  {entry.description && (
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                      {entry.description}
                    </p>
                  )}
                  {entry.tags?.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {entry.tags.map((tag) => (
                        <Badge key={tag} className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!loading && !searched && (
        <p className="text-sm text-slate-400 dark:text-slate-500">
          Type to search across blog posts and portfolio.
        </p>
      )}
    </main>
  );
}
