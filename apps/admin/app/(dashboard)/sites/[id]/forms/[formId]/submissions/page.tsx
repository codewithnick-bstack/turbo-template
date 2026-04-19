import Link from "next/link";
import { getApiClient } from "@/lib/api";

type Submission = {
  id: string;
  data: Record<string, unknown>;
  ipAddress: string | null;
  createdAt: string;
};

export default async function FormSubmissionsPage({
  params,
}: {
  params: Promise<{ id: string; formId: string }>;
}) {
  const { id: siteId, formId } = await params;
  const api = getApiClient();
  let submissions: Submission[] = [];
  let formName = formId;

  try {
    const [subRes, formsRes] = await Promise.all([
      api.forms.listSubmissions(formId) as Promise<{ data: Submission[] }>,
      api.forms.list(siteId) as Promise<{ data: Array<{ id: string; name: string }> }>,
    ]);
    submissions = subRes.data ?? [];
    const form = (formsRes.data ?? []).find((f) => f.id === formId);
    if (form) formName = form.name;
  } catch {
    // API unavailable
  }

  const columns =
    submissions.length > 0
      ? Object.keys(submissions[0].data)
      : [];

  return (
    <div>
      <div className="flex items-center gap-2 mb-6 text-sm">
        <Link href={`/sites/${siteId}`} className="text-[var(--muted-foreground)] hover:underline">
          Site
        </Link>
        <span className="text-[var(--muted-foreground)]">/</span>
        <Link href={`/sites/${siteId}/forms`} className="text-[var(--muted-foreground)] hover:underline">
          Forms
        </Link>
        <span className="text-[var(--muted-foreground)]">/</span>
        <span className="font-medium">{formName}</span>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Submissions</h1>
        <span className="text-sm text-[var(--muted-foreground)]">{submissions.length} total</span>
      </div>

      {submissions.length === 0 ? (
        <p className="text-sm text-[var(--muted-foreground)]">No submissions yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-[var(--border)] rounded-xl overflow-hidden">
            <thead className="bg-[var(--border)] text-xs uppercase tracking-wider text-[var(--muted-foreground)]">
              <tr>
                {columns.map((col) => (
                  <th key={col} className="px-4 py-2 text-left">{col}</th>
                ))}
                <th className="px-4 py-2 text-left">Submitted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {submissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-[var(--border)] transition-colors">
                  {columns.map((col) => (
                    <td key={col} className="px-4 py-3 text-sm">
                      {String(sub.data[col] ?? "")}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-xs text-[var(--muted-foreground)]">
                    {new Date(sub.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
