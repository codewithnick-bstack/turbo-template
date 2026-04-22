"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { TMedia } from "@repo/sdk";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
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

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {items.map((item) => (
        <div key={item.id} className="group border border-[var(--border)] rounded-xl overflow-hidden">
          {item.mimeType.startsWith("image/") ? (
            <div className="aspect-video bg-neutral-100 flex items-center justify-center text-xs text-neutral-400 relative">
              <span>{item.kind}</span>
              <button
                onClick={() => handleDelete(item.id, item.originalFilename)}
                className="absolute top-1 right-1 hidden group-hover:flex bg-white border border-neutral-200 rounded p-1 text-red-400 hover:text-red-600"
                title="Delete"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ) : (
            <div className="aspect-video bg-neutral-100 flex items-center justify-center relative">
              <span className="text-2xl">{item.kind === "video" ? "🎬" : "📄"}</span>
              <button
                onClick={() => handleDelete(item.id, item.originalFilename)}
                className="absolute top-1 right-1 hidden group-hover:flex bg-white border border-neutral-200 rounded p-1 text-red-400 hover:text-red-600"
                title="Delete"
              >
                <Trash2 size={12} />
              </button>
            </div>
          )}
          <div className="px-3 py-2">
            <p className="text-xs font-medium truncate" title={item.originalFilename}>
              {item.originalFilename}
            </p>
            <p className="text-xs text-[var(--muted-foreground)]">{formatBytes(item.sizeBytes)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
