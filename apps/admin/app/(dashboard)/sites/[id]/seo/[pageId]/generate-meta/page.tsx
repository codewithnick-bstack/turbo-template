import Link from "next/link";

type Props = { params: Promise<{ id: string; pageId: string }> };

const API = process.env.PLATFORM_API_URL ?? "http://localhost:4100";
const DEV_TENANT = process.env.DEV_TENANT_ID ?? "dev-tenant-id";

export default async function GenerateMetaPage({ params }: Props) {
  const { id, pageId } = await params;
  let meta: { metaTitle?: string; metaDescription?: string } = {};
  let error = "";

  try {
    const res = await fetch(`${API}/v1/ai/seo/generate-meta`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-tenant-id": DEV_TENANT,
        "x-user-id": "dev-user-id",
        "x-role": "owner",
      },
      body: JSON.stringify({ pageId }),
    });
    const data = await res.json() as { metaTitle?: string; metaDescription?: string; message?: string };
    if (res.ok) meta = data;
    else error = data.message ?? "Generation failed";
  } catch {
    error = "API unavailable";
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Link href={`/sites/${id}/seo`} className="text-sm text-neutral-400 hover:text-neutral-600">← SEO</Link>
        <h1 className="text-xl font-bold">AI-Generated Meta</h1>
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {meta.metaTitle && (
        <div className="space-y-4">
          <div className="border border-neutral-200 rounded-xl px-4 py-3">
            <p className="text-xs font-semibold text-neutral-400 mb-1">Meta Title ({meta.metaTitle.length} chars)</p>
            <p className="font-medium text-sm">{meta.metaTitle}</p>
          </div>
          <div className="border border-neutral-200 rounded-xl px-4 py-3">
            <p className="text-xs font-semibold text-neutral-400 mb-1">Meta Description ({meta.metaDescription?.length ?? 0} chars)</p>
            <p className="text-sm">{meta.metaDescription}</p>
          </div>
          <p className="text-xs text-neutral-400">
            Copy these values into the page editor&apos;s SEO settings.
          </p>
        </div>
      )}

      {!meta.metaTitle && !error && (
        <p className="text-neutral-400 text-sm">Generating…</p>
      )}
    </div>
  );
}
