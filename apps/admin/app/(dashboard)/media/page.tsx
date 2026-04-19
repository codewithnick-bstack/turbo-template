import { getApiClient } from "../../../lib/api";
import { UploadButton } from "./upload-button";

type MediaItem = { id: string; originalFilename: string; mimeType: string; sizeBytes: number; kind: string; createdAt: string };

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default async function MediaPage() {
  const api = getApiClient();
  let items: MediaItem[] = [];
  try {
    const res = await api.media.list();
    items = res.data as MediaItem[];
  } catch {
    // API unavailable
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Media</h1>
        <UploadButton />
      </div>

      {items.length === 0 ? (
        <div className="mt-12 text-center">
          <p className="text-sm text-[var(--muted-foreground)] mb-4">No media uploaded yet.</p>
          <UploadButton />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {items.map((item) => (
            <div key={item.id} className="border border-[var(--border)] rounded-xl overflow-hidden">
              {item.mimeType.startsWith("image/") ? (
                <div className="aspect-video bg-neutral-100 flex items-center justify-center text-xs text-neutral-400">
                  {item.kind}
                </div>
              ) : (
                <div className="aspect-video bg-neutral-100 flex items-center justify-center">
                  <span className="text-2xl">{item.kind === "video" ? "🎬" : "📄"}</span>
                </div>
              )}
              <div className="px-3 py-2">
                <p className="text-xs font-medium truncate" title={item.originalFilename}>{item.originalFilename}</p>
                <p className="text-xs text-[var(--muted-foreground)]">{formatBytes(item.sizeBytes)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
