import Link from "next/link";
import { getApiClient } from "../../../../../lib/api";
import NewFormClient from "./new-form-client";
import { DeleteFormButton } from "./form-actions";

type Form = { id: string; name: string; fields: unknown[]; captcha: boolean; createdAt: string };

export default async function SiteFormsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: siteId } = await params;
  const api = getApiClient();
  let forms: Form[] = [];
  try {
    const res = await api.forms.list(siteId) as { data: Form[] };
    forms = res.data ?? [];
  } catch { /* API unavailable */ }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/sites/${siteId}`} className="text-sm text-[var(--muted-foreground)] hover:underline">Site</Link>
        <span className="text-[var(--muted-foreground)]">/</span>
        <h1 className="text-2xl font-bold">Forms</h1>
      </div>

      {forms.length === 0 ? (
        <p className="text-sm text-[var(--muted-foreground)] mb-8">No forms yet. Create one below.</p>
      ) : (
        <div className="mb-8 space-y-2">
          {forms.map((f) => (
            <div key={f.id} className="flex items-center justify-between px-4 py-3 border border-[var(--border)] rounded-xl">
              <div>
                <p className="font-medium text-sm">{f.name}</p>
                <p className="text-xs text-[var(--muted-foreground)]">
                  {(f.fields as unknown[]).length} field{(f.fields as unknown[]).length === 1 ? "" : "s"}
                  {f.captcha ? " · captcha enabled" : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href={`/sites/${siteId}/forms/${f.id}/submissions`}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Submissions
                </Link>
                <DeleteFormButton formId={f.id} />
              </div>
            </div>
          ))}
        </div>
      )}

      <NewFormClient siteId={siteId} />
    </div>
  );
}
