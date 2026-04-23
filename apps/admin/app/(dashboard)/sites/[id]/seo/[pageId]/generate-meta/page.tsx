import Link from "next/link";
import { getApiClient } from "../../../../../../../lib/api";

type Props = { params: Promise<{ id: string; pageId: string }> };

export default async function GenerateMetaPage({ params }: Props) {
  const { id, pageId } = await params;
  const api = getApiClient();
  let meta: { metaTitle?: string; metaDescription?: string } = {};
  let error = "";

  try {
    meta = await api.aiAssistant.seoGenerateMeta(pageId) as { metaTitle?: string; metaDescription?: string };
  } catch (err) {
    error = err instanceof Error ? err.message : "Generation failed";
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Link href={`/sites/${id}/seo`} className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">← SEO</Link>
        <h1 className="text-xl font-bold">AI-Generated Meta</h1>
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {meta.metaTitle && (
        <div className="space-y-4">
          <div className="border border-[var(--border)] rounded-xl px-4 py-3">
            <p className="text-xs font-semibold text-[var(--muted-foreground)] mb-1">Meta Title ({meta.metaTitle.length} chars)</p>
            <p className="font-medium text-sm">{meta.metaTitle}</p>
          </div>
          <div className="border border-[var(--border)] rounded-xl px-4 py-3">
            <p className="text-xs font-semibold text-[var(--muted-foreground)] mb-1">Meta Description ({meta.metaDescription?.length ?? 0} chars)</p>
            <p className="text-sm">{meta.metaDescription}</p>
          </div>
          <p className="text-xs text-[var(--muted-foreground)]">
            Copy these values into the page editor&apos;s SEO settings.
          </p>
        </div>
      )}

      {!meta.metaTitle && !error && (
        <p className="text-[var(--muted-foreground)] text-sm">Generating…</p>
      )}
    </div>
  );
}
