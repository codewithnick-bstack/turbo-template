"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export function PublishButton({ pageId, status }: { pageId: string; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const isPublished = status === "published";

  async function toggle() {
    setLoading(true);
    try {
      const endpoint = isPublished
        ? `/api/pages/${pageId}/unpublish`
        : `/api/pages/${pageId}/publish`;
      const res = await fetch(endpoint, { method: "POST" });
      if (!res.ok) throw new Error();
      toast.success(isPublished ? "Page unpublished" : "Page published");
      router.refresh();
    } catch {
      toast.error(isPublished ? "Failed to unpublish" : "Failed to publish");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this page? This cannot be undone.")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/pages/${pageId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Page deleted");
      router.refresh();
    } catch {
      toast.error("Failed to delete page");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggle}
        disabled={loading}
        className={`rounded px-3 py-1 text-xs font-medium disabled:opacity-50 ${
          isPublished
            ? "border border-[var(--border)] text-[var(--muted-foreground)] hover:border-red-400 hover:text-red-500"
            : "bg-green-600 text-white hover:bg-green-700"
        }`}
      >
        {loading ? "…" : isPublished ? "Unpublish" : "Publish"}
      </button>
      <button
        onClick={handleDelete}
        disabled={loading}
        className="rounded px-3 py-1 text-xs font-medium text-red-500 hover:underline disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  );
}
