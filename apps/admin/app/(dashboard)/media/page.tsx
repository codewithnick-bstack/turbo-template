import { getApiClient } from "../../../lib/api";
import { MediaGrid } from "./media-grid";
import { UploadButton } from "./upload-button";
import type { TMedia } from "@repo/sdk";

export default async function MediaPage() {
  const api = getApiClient();
  let items: TMedia[] = [];
  try {
    const res = await api.media.list();
    items = res.data;
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
        <MediaGrid initialItems={items} />
      )}
    </div>
  );
}
