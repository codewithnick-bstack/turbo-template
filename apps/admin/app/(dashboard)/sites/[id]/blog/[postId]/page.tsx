"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

type Post = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  tags?: string[];
  status: string;
};

export default function EditBlogPostPage({
  params,
}: {
  params: Promise<{ id: string; postId: string }>;
}) {
  const { id: siteId, postId } = use(params);
  const router = useRouter();

  const [post, setPost] = useState<Post | null>(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [tags, setTags] = useState("");
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`/api/blog/posts/${postId}`)
      .then((r) => r.json())
      .then((p: Post) => {
        setPost(p);
        setTitle(p.title ?? "");
        setSlug(p.slug ?? "");
        setContent(p.content ?? "");
        setExcerpt(p.excerpt ?? "");
        setTags((p.tags ?? []).join(", "));
      })
      .catch(() => setError("Failed to load post"));
  }, [postId]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch(`/api/blog/posts/${postId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title,
          slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          content,
          excerpt: excerpt || undefined,
          tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        }),
      });
      if (!res.ok) {
        const err = (await res.json()) as { message?: string };
        throw new Error(err.message ?? "Save failed");
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    setPublishing(true);
    setError(null);
    try {
      const res = await fetch(`/api/blog/posts/${postId}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "publish" }),
      });
      if (!res.ok) {
        const err = (await res.json()) as { message?: string };
        throw new Error(err.message ?? "Publish failed");
      }
      router.push(`/sites/${siteId}/blog`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setPublishing(false);
    }
  }

  if (!post) {
    return (
      <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] mt-8">
        <Loader2 size={16} className="animate-spin" />
        Loading…
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/sites/${siteId}/blog`} className="text-sm text-[var(--muted-foreground)] hover:underline">
          Blog
        </Link>
        <span className="text-[var(--muted-foreground)]">/</span>
        <h1 className="text-2xl font-bold truncate">{post.title || "Edit Post"}</h1>
        {post.status === "published" && (
          <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded">Published</span>
        )}
      </div>

      {error && <div className="mb-4 rounded bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>}

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full rounded border border-[var(--border)] bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-[var(--primary)]"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Slug</label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="auto-generated from title"
            className="w-full rounded border border-[var(--border)] bg-transparent px-3 py-2 text-sm font-mono focus:outline-none focus:border-[var(--primary)]"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={14}
            className="w-full rounded border border-[var(--border)] bg-transparent px-3 py-2 text-sm font-mono focus:outline-none focus:border-[var(--primary)]"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Excerpt</label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
            placeholder="Short summary shown in post lists"
            className="w-full rounded border border-[var(--border)] bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-[var(--primary)]"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Tags (comma-separated)</label>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="news, product, update"
            className="w-full rounded border border-[var(--border)] bg-transparent px-3 py-2 text-sm focus:outline-none focus:border-[var(--primary)]"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded bg-[var(--primary)] px-4 py-2 text-sm text-[var(--primary-foreground)] disabled:opacity-50"
          >
            {saving ? "Saving…" : saved ? "Saved!" : "Save draft"}
          </button>
          {post.status !== "published" && (
            <button
              type="button"
              onClick={handlePublish}
              disabled={publishing}
              className="rounded border border-green-600 text-green-700 px-4 py-2 text-sm hover:bg-green-50 disabled:opacity-50"
            >
              {publishing ? "Publishing…" : "Publish"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
