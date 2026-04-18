"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

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
      await fetch(endpoint, { method: "POST" });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
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
  );
}
