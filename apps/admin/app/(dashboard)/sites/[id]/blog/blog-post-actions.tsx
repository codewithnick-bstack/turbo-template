"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function BlogPostActions({
  postId,
  status,
}: {
  postId: string;
  status: string;
  siteId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handlePublish() {
    setLoading(true);
    await fetch(`/api/blog/posts/${postId}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "publish" }),
    });
    router.refresh();
    setLoading(false);
  }

  async function handleDelete() {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    setLoading(true);
    await fetch(`/api/blog/posts/${postId}`, { method: "DELETE" });
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="flex items-center gap-3">
      {status !== "published" && (
        <button
          onClick={handlePublish}
          disabled={loading}
          className="text-xs text-green-600 hover:underline disabled:opacity-50"
        >
          {loading ? "…" : "Publish"}
        </button>
      )}
      <button
        onClick={handleDelete}
        disabled={loading}
        className="text-xs text-red-500 hover:underline disabled:opacity-50"
      >
        {loading ? "…" : "Delete"}
      </button>
    </div>
  );
}
