"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

function guessKind(mimeType: string): "image" | "video" | "document" {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  return "document";
}

export function UploadButton({ siteId }: { siteId?: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<string>("");

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);

    for (const file of Array.from(files)) {
      try {
        setProgress(`Preparing ${file.name}…`);
        const presignRes = await fetch("/api/media/presign", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            filename: file.name,
            mimeType: file.type || "application/octet-stream",
            sizeBytes: file.size,
            siteId,
          }),
        });
        if (!presignRes.ok) throw new Error("Presign failed");
        const { storageKey, url, method, headers } = await presignRes.json() as {
          storageKey: string; url: string; method: string; headers: Record<string, string>;
        };

        if (!url.includes("local-r2-stub")) {
          setProgress(`Uploading ${file.name}…`);
          const uploadRes = await fetch(url, { method, headers, body: file });
          if (!uploadRes.ok) throw new Error("Upload to storage failed");
        }

        setProgress(`Finalizing ${file.name}…`);
        const finalizeRes = await fetch("/api/media/finalize", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            storageKey,
            originalFilename: file.name,
            mimeType: file.type || "application/octet-stream",
            sizeBytes: file.size,
            kind: guessKind(file.type),
            siteId,
          }),
        });
        if (!finalizeRes.ok) throw new Error("Finalize failed");
        toast.success(`${file.name} uploaded`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Upload failed");
        break;
      }
    }

    setProgress("");
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
    router.refresh();
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*,video/*,.pdf,.doc,.docx"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="rounded-xl bg-[var(--primary)] px-4 py-2 text-sm text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-50"
      >
        {uploading ? progress || "Uploading…" : "Upload file"}
      </button>
    </div>
  );
}
