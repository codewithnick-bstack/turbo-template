import { getApiClient } from "../../../lib/api";

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
      <h1 className="text-2xl font-bold">Media</h1>
      {items.length === 0 ? (
        <p className="mt-6 text-sm text-[var(--muted-foreground)]">No media uploaded yet.</p>
      ) : (
        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-left text-xs text-[var(--muted-foreground)]">
              <th className="pb-2 pr-4">Filename</th>
              <th className="pb-2 pr-4">Type</th>
              <th className="pb-2 pr-4">Size</th>
              <th className="pb-2">Kind</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-[var(--border)]">
                <td className="py-3 pr-4 font-medium">{item.originalFilename}</td>
                <td className="py-3 pr-4 text-[var(--muted-foreground)]">{item.mimeType}</td>
                <td className="py-3 pr-4 text-[var(--muted-foreground)]">{formatBytes(item.sizeBytes)}</td>
                <td className="py-3 text-[var(--muted-foreground)]">{item.kind}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
