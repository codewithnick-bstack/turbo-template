"use client";

import { useId, useRef, useState } from "react";
import { toast } from "sonner";
import { clientApiUrl } from "@/lib/api";

type Mode = "blog-draft" | "meta";

const MODE_LABELS: Record<Mode, string> = {
  "blog-draft": "Blog Draft",
  meta: "Meta Description",
};

export function AiAssistant() {
  const [mode, setMode] = useState<Mode>("blog-draft");
  const [title, setTitle] = useState("");
  const [outline, setOutline] = useState("");
  const [contentPreview, setContentPreview] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const titleId = useId();
  const outlineId = useId();
  const contentPreviewId = useId();
  const resultId = useId();
  const panelId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const modes: Mode[] = ["blog-draft", "meta"];

  async function generate() {
    if (!title.trim()) return;
    setLoading(true);
    setResult("");
    try {
      if (mode === "blog-draft") {
        const res = await fetch(`${clientApiUrl}/api/v1/ai/generate/blog-draft`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ title, outline: outline || undefined }),
        });
        if (!res.ok) throw new Error("Generation failed");
        const data = await res.json() as { content: string };
        setResult(data.content);
      } else {
        const res = await fetch(`${clientApiUrl}/api/v1/ai/generate/meta`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ pageTitle: title, contentPreview }),
        });
        if (!res.ok) throw new Error("Generation failed");
        const data = await res.json() as { metaDescription: string };
        setResult(data.metaDescription);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error generating content");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div
        role="tablist"
        aria-label="Generation mode"
        className="flex gap-2"
        onKeyDown={(e) => {
          const idx = modes.indexOf(mode);
          if (e.key === "ArrowRight") {
            const next = modes[(idx + 1) % modes.length]!;
            setMode(next);
            tabRefs.current[modes.indexOf(next)]?.focus();
          } else if (e.key === "ArrowLeft") {
            const prev = modes[(idx - 1 + modes.length) % modes.length]!;
            setMode(prev);
            tabRefs.current[modes.indexOf(prev)]?.focus();
          }
        }}
      >
        {modes.map((m, i) => (
          <button
            key={m}
            ref={(el) => { tabRefs.current[i] = el; }}
            role="tab"
            aria-selected={mode === m}
            aria-controls={`${panelId}-${m}`}
            tabIndex={mode === m ? 0 : -1}
            onClick={() => setMode(m)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              mode === m
                ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                : "border border-[var(--border)] hover:bg-[var(--muted)]"
            }`}
          >
            {MODE_LABELS[m]}
          </button>
        ))}
      </div>
      <div
        id={`${panelId}-${mode}`}
        role="tabpanel"
        aria-label={MODE_LABELS[mode]}
        className="space-y-4"
      >

      <div>
        <label htmlFor={titleId} className="mb-1 block text-sm font-medium">Title</label>
        <input
          id={titleId}
          className="input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={mode === "blog-draft" ? "Blog post title" : "Page title"}
        />
      </div>

      {mode === "blog-draft" && (
        <div>
          <label htmlFor={outlineId} className="mb-1 block text-sm font-medium">Outline (optional)</label>
          <textarea
            id={outlineId}
            className="input"
            rows={3}
            value={outline}
            onChange={(e) => setOutline(e.target.value)}
            placeholder="Key points to cover…"
          />
        </div>
      )}

      {mode === "meta" && (
        <div>
          <label htmlFor={contentPreviewId} className="mb-1 block text-sm font-medium">Content preview</label>
          <textarea
            id={contentPreviewId}
            className="input"
            rows={3}
            value={contentPreview}
            onChange={(e) => setContentPreview(e.target.value)}
            placeholder="Paste page content to generate a description from…"
          />
        </div>
      )}

      </div>

      <button
        onClick={generate}
        disabled={loading || !title.trim()}
        className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Generating…" : "Generate"}
      </button>

      {result && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <label htmlFor={resultId} className="text-sm font-medium">Result</label>
            <button
              onClick={() => { void navigator.clipboard.writeText(result); toast.success("Copied"); }}
              className="text-xs text-[var(--primary)] hover:underline"
            >
              Copy
            </button>
          </div>
          <textarea
            id={resultId}
            className="input font-mono text-sm"
            rows={12}
            value={result}
            onChange={(e) => setResult(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}
