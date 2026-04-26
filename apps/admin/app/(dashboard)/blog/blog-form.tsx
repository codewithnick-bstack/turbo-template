"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { clientApiUrl } from "@/lib/api";
import type { BlogPost } from "@/lib/types";
import { RichTextEditor } from "@/components/rich-text-editor";

type Props = { post?: BlogPost };

export function BlogForm({ post }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
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
        <label className="mb-1 block text-sm font-medium">Content</label>
        <RichTextEditor
          value={values.content}
          onChange={(html) => setValues((v) => ({ ...v, content: html }))}
        />
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
        {post && values.slug && (
          <a
            href={`${process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3000"}/blog/${values.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-medium hover:bg-[var(--muted)] disabled:opacity-50"
          >
            Preview ↗
          </a>
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
