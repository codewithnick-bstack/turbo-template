"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Sparkles } from "lucide-react";

export default function NewBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: siteId } = use(params);
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    if (!title.trim()) { setError("Enter a title first"); return; }
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/generate/blog-post", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ siteId, title, tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [] }),
      });
      if (!res.ok) {
        const err = await res.json() as { message?: string };
        throw new Error(err.message ?? "Generation failed");
      }
      const data = await res.json() as { content: string };
      setContent(data.content);
    } catch (e) {
      setError(e instanceof Error ? e.message : "AI generation failed");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/blog/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteId,
          title,
          slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          content,
          excerpt: excerpt || undefined,
          tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        }),
      });
      if (!res.ok) {
        const err = (await res.json()) as { message: string };
        throw new Error(err.message);
      }
      router.push(`/sites/${siteId}/blog`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/sites/${siteId}/blog`} className="text-sm text-[var(--muted-foreground)] hover:underline">
          Blog
        </Link>
        <span>/</span>
        <h1 className="text-2xl font-bold">New Post</h1>
      </div>

      {error && (
        <div className="mb-4 rounded bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block space-y-1">
          <span className="text-sm font-medium">Title</span>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slug) setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-"));
            }}
            required
            className="w-full rounded border border-[var(--border)] px-3 py-2 text-sm"
          />
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-medium">Slug</span>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full rounded border border-[var(--border)] px-3 py-2 text-sm font-mono"
          />
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-medium">Excerpt</span>
          <input
            type="text"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Short summary (optional)"
            className="w-full rounded border border-[var(--border)] px-3 py-2 text-sm"
          />
        </label>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Content</span>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating || !title.trim()}
              className="flex items-center gap-1.5 rounded border border-[var(--border)] px-3 py-1 text-xs hover:bg-[var(--border)] disabled:opacity-40 transition-colors"
            >
              {generating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
              {generating ? "Generating…" : "Generate with AI"}
            </button>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            className="w-full rounded border border-[var(--border)] px-3 py-2 text-sm font-mono"
          />
        </div>
        <label className="block space-y-1">
          <span className="text-sm font-medium">Tags</span>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Comma-separated tags"
            className="w-full rounded border border-[var(--border)] px-3 py-2 text-sm"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 rounded bg-[var(--primary)] px-6 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-50"
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          Create Draft
        </button>
      </form>
    </div>
  );
}
