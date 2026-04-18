"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBuilderStore } from "./use-builder-store";
import { BlockPalette } from "./block-palette";
import { BuilderCanvas } from "./canvas";
import { Inspector } from "./inspector";
import { BuilderToolbar } from "./toolbar";
import type { TBlockTree } from "@repo/schemas";

export function BuilderClient({
  pageId,
  siteId,
  initialTree,
}: {
  pageId: string;
  siteId: string;
  initialTree: TBlockTree;
}) {
  const setBlocks = useBuilderStore((s) => s.setBlocks);
  const router = useRouter();

  useEffect(() => {
    setBlocks(initialTree.blocks, false);
  }, [pageId]);

  async function handlePublish() {
    await fetch(`/api/pages/${pageId}/publish`, { method: "POST" });
    router.push(`/sites/${siteId}`);
  }

  return (
    <div className="flex flex-col h-screen">
      <BuilderToolbar pageId={pageId} onPublish={handlePublish} />
      <div className="flex flex-1 overflow-hidden">
        <BlockPalette />
        <BuilderCanvas />
        <Inspector />
      </div>
    </div>
  );
}
