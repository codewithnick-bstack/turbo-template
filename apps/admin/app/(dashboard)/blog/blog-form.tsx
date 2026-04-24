"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { clientApiUrl } from "@/lib/api";
import type { BlogPost } from "@/lib/types";

type Props = { post?: BlogPost };

function renderMarkdown(md: string): string {
  return md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/```[\w]*\n?([\s\S]*?)```/g, "<pre><code>$1</code></pre>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>")
    .replace(/\n{2,}/g, "</p><p>")
    .replace(/^(?!<[hupol]|<pre|<ul)(.+)$/gm, "<p>$1</p>")
    .replace(/<\/p><p>/g, "</p>\n<p>");
}

export function BlogForm({ post }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [values, setValues] = useState({
    slug: post?.slug ?? "",
    title: post?.title ?? "",
    excerpt: post?.excerpt ?? "",
    content: post?.content ?? "",
    author: post?.author ?? "",
  });

  const set = (k: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const method = post ? "PATCH" : "POST";
      const url = post
        ? `${clientApiUrl}/api/v1/blog/${post.id}`
        : `${clientApiUrl}/api/v1/blog`;
      const res = await fetch(url, {
        method,
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Failed to save post");
      toast.success(post ? "Post updated" : "Post created");
      router.push("/blog");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function publish() {
    if (!post) return;
    setSaving(true);
    try {
      const res = await fetch(`${clientApiUrl}/api/v1/blog/${post.id}/publish`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to publish");
      toast.success("Post published");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function deletePost() {
    if (!post || !confirm("Delete this post?")) return;
    setSaving(true);
    try {
      await fetch(`${clientApiUrl}/api/v1/blog/${post.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      toast.success("Post deleted");
      router.push("/blog");
      router.refresh();
    } catch {
      toast.error("Failed to delete");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Title" htmlFor="blog-title">
        <input
          id="blog-title"
          required
          className="input"
          value={values.title}
          onChange={set("title")}
          placeholder="Post title"
        />
      </Field>
      <Field label="Slug" htmlFor="blog-slug">
        <input
          id="blog-slug"
          required
          className="input"
          value={values.slug}
          onChange={set("slug")}
          placeholder="post-slug"
          pattern="[a-z0-9-]+"
        />
      </Field>
      <Field label="Author" htmlFor="blog-author">
        <input id="blog-author" className="input" value={values.author} onChange={set("author")} placeholder="Author name" />
      </Field>
      <Field label="Excerpt" htmlFor="blog-excerpt">
        <textarea id="blog-excerpt" className="input min-h-[80px]" value={values.excerpt} onChange={set("excerpt")} placeholder="Short summary" />
      </Field>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <label htmlFor="blog-content" className="text-sm font-medium">Content</label>
          <div className="flex gap-1 text-xs" role="tablist" aria-label="Content editor mode">
            <button
              type="button"
              role="tab"
              aria-selected={tab === "write"}
              onClick={() => setTab("write")}
              className={`rounded px-2 py-1 font-medium transition-colors ${tab === "write" ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}`}
            >
              Write
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "preview"}
              onClick={() => setTab("preview")}
              className={`rounded px-2 py-1 font-medium transition-colors ${tab === "preview" ? "bg-[var(--primary)] text-[var(--primary-foreground)]" : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"}`}
            >
              Preview
            </button>
          </div>
        </div>
        {tab === "write" ? (
          <textarea
            id="blog-content"
            className="input min-h-[320px] font-mono text-sm"
            value={values.content}
            onChange={set("content")}
            placeholder="Write in Markdown…"
          />
        ) : (
          <div
            className="input min-h-[320px] overflow-auto prose prose-sm max-w-none dark:prose-invert [&_h1]:text-xl [&_h1]:font-bold [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:font-semibold [&_code]:bg-[var(--muted)] [&_code]:px-1 [&_code]:rounded [&_pre]:bg-[var(--muted)] [&_pre]:p-3 [&_pre]:rounded [&_ul]:list-disc [&_ul]:pl-4"
            dangerouslySetInnerHTML={{ __html: values.content ? renderMarkdown(values.content) : '<p class="text-[var(--muted-foreground)]">Nothing to preview.</p>' }}
          />
        )}
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          Supports Markdown: **bold**, _italic_, `code`, # headings, - lists
        </p>
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save draft"}
        </button>
        {post && post.status !== "published" && (
          <button
            type="button"
            disabled={saving}
            onClick={publish}
            className="rounded-lg border border-green-600 px-4 py-2 text-sm font-medium text-green-600 hover:bg-green-50 dark:hover:bg-green-950 disabled:opacity-50"
          >
            Publish
          </button>
        )}
        {post && (
          <button
            type="button"
            disabled={saving}
            onClick={deletePost}
            className="ml-auto rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950 disabled:opacity-50"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}
