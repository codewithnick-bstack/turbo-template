"use client";

import { Undo2, Redo2, Save, Globe, CheckCircle, Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { useBuilderStore } from "./use-builder-store";
import type { TBlockTree } from "@repo/schemas";

export function BuilderToolbar({
  pageId,
  onPublish,
}: {
  pageId: string;
  onPublish: () => Promise<void>;
}) {
  const { undo, redo, past, future, isDirty, isSaving, lastSavedAt, blocks, markSaving, markSaved } =
    useBuilderStore();

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function saveNow() {
    if (!isDirty) return;
    markSaving(true);
    const tree: TBlockTree = { version: 1, blocks };
    try {
      await fetch(`/api/pages/${pageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: tree }),
      });
      markSaved();
    } catch {
      markSaving(false);
    }
  }

  useEffect(() => {
    if (!isDirty) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(saveNow, 2000);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks, isDirty]);

  const canUndo = past.length > 0;
  const canRedo = future.length > 0;

  return (
    <div className="flex items-center gap-2 border-b border-neutral-200 bg-white px-4 py-2">
      <span className="text-sm font-semibold text-neutral-700 mr-2">Page Builder</span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={!canUndo}
          onClick={undo}
          className="rounded p-1.5 hover:bg-neutral-100 disabled:opacity-40"
          title="Undo"
        >
          <Undo2 size={16} />
        </button>
        <button
          type="button"
          disabled={!canRedo}
          onClick={redo}
          className="rounded p-1.5 hover:bg-neutral-100 disabled:opacity-40"
          title="Redo"
        >
          <Redo2 size={16} />
        </button>
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-1 text-xs text-neutral-400">
        {isSaving ? (
          <>
            <Loader2 size={12} className="animate-spin" />
            <span>Saving…</span>
          </>
        ) : lastSavedAt ? (
          <>
            <CheckCircle size={12} className="text-green-500" />
            <span>Saved</span>
          </>
        ) : isDirty ? (
          <span>Unsaved changes</span>
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => saveNow()}
        disabled={!isDirty || isSaving}
        className="flex items-center gap-1.5 rounded-md border border-neutral-200 px-3 py-1.5 text-sm hover:bg-neutral-50 disabled:opacity-40"
      >
        <Save size={14} />
        Save
      </button>
      <button
        type="button"
        onClick={onPublish}
        className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
      >
        <Globe size={14} />
        Publish
      </button>
    </div>
  );
}
