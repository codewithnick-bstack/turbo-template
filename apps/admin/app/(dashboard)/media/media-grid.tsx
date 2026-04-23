"use client";

import { useState } from "react";
import { Trash2, Copy } from "lucide-react";
import { toast } from "sonner";
import type { TMedia } from "@repo/sdk";

const MEDIA_BASE = process.env.NEXT_PUBLIC_MEDIA_BASE_URL ?? "";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function mediaUrl(storageKey: string) {
  return MEDIA_BASE ? `${MEDIA_BASE}/${storageKey}` : null;
}

export function MediaGrid({ initialItems }: { initialItems: TMedia[] }) {
  const [items, setItems] = useState<TMedia[]>(initialItems);

  async function handleDelete(id: string, filename: string) {
    if (!confirm(`Delete "${filename}"?`)) return;
    try {
      const res = await fetch(`/api/media/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success(`${filename} deleted`);
    } catch {
      toast.error("Failed to delete file");
    }
  }

  function copyUrl(storageKey: string) {
    const url = mediaUrl(storageKey);
    if (!url) { toast.error("NEXT_PUBLIC_MEDIA_BASE_URL not configured"); return; }
    navigator.clipboard.writeText(url).then(
      () => toast.success("URL copied"),
      () => toast.error("Copy failed"),
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {items.map((item) => {
        const url = mediaUrl(item.storageKey);
        const isImage = item.mimeType.startsWith("image/");
        return (
          <div key={item.id} className="group border border-[var(--border)] rounded-xl overflow-hidden">
            <div className="aspect-video bg-[var(--muted)] flex items-center justify-center relative overflow-hidden">
              {isImage && url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={url}
                  alt={item.altText ?? item.originalFilename}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl">
                  {item.kind === "video" ? "🎬" : item.kind === "image" ? "🖼️" : "📄"}
                </span>
              )}
              <div className="absolute top-1 right-1 hidden group-hover:flex gap-1">
                <button
                  onClick={() => copyUrl(item.storageKey)}
                  className="bg-white border border-[var(--border)] rounded p-1 text-[var(--muted-foreground)] hover:text-neutral-800"
                  title="Copy URL"
                >
                  <Copy size={12} />
                </button>
                <button
                  onClick={() => handleDelete(item.id, item.originalFilename)}
                  className="bg-white border border-[var(--border)] rounded p-1 text-red-400 hover:text-red-600"
                  title="Delete"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
            <div className="px-3 py-2">
              <p className="text-xs font-medium truncate" title={item.originalFilename}>
                {item.originalFilename}
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">
                {formatBytes(item.sizeBytes)}{item.width && item.height ? ` · ${item.width}×${item.height}` : ""}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
