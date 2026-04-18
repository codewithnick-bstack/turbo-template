import { notFound } from "next/navigation";
import { getApiClient } from "@/lib/api";
import { BuilderClient } from "@/components/builder/builder-client";
import { BlockTree } from "@repo/schemas";

export default async function BuilderPage({
  params,
}: {
  params: Promise<{ id: string; pageId: string }>;
}) {
  const { id: siteId, pageId } = await params;
  const api = getApiClient();

  let page: Awaited<ReturnType<typeof api.pages.get>>;
  try {
    page = await api.pages.get(pageId);
  } catch {
    notFound();
  }

  const raw = page && typeof page === "object" && "content" in page ? page.content : null;
  const parsed = BlockTree.safeParse(raw);
  const initialTree = parsed.success ? parsed.data : { version: 1, blocks: [] };

  return <BuilderClient pageId={pageId} siteId={siteId} initialTree={initialTree} />;
}
