import Link from "next/link";

type Props = { params: Promise<{ id: string; pageId: string }> };

const API = process.env.PLATFORM_API_URL ?? "http://localhost:4100";
const DEV_TENANT = process.env.DEV_TENANT_ID ?? "dev-tenant-id";

type Finding = { severity: string; rule: string; evidence: string; suggested_fix: string };

export default async function SeoAuditPage({ params }: Props) {
  const { id, pageId } = await params;
  let findings: Finding[] = [];
  let error = "";

  try {
    const res = await fetch(`${API}/v1/ai/seo/audit`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-tenant-id": DEV_TENANT,
        "x-user-id": "dev-user-id",
        "x-role": "owner",
      },
      body: JSON.stringify({ pageId }),
    });
    const data = await res.json() as { findings?: Finding[]; message?: string };
    if (res.ok) findings = Array.isArray(data.findings) ? data.findings : [];
    else error = data.message ?? "Audit failed";
  } catch {
    error = "API unavailable";
  }

  const severityColor: Record<string, string> = {
    critical: "text-red-700 bg-red-50 border-red-200",
    warning: "text-amber-700 bg-amber-50 border-amber-200",
    info: "text-blue-700 bg-blue-50 border-blue-200",
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Link href={`/sites/${id}/seo`} className="text-sm text-neutral-400 hover:text-neutral-600">← SEO</Link>
        <h1 className="text-xl font-bold">SEO Audit</h1>
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {findings.length === 0 && !error && (
        <p className="text-neutral-400 text-sm">No issues found — looks good!</p>
      )}

      <div className="space-y-3">
        {findings.map((f, i) => (
          <div key={i} className={`border rounded-xl px-4 py-3 ${severityColor[f.severity] ?? "border-neutral-200"}`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider">{f.severity}</span>
              <span className="text-xs font-mono">{f.rule}</span>
            </div>
            <p className="text-sm mb-1">{f.evidence}</p>
            {f.suggested_fix && (
              <p className="text-xs opacity-80">Fix: {f.suggested_fix}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
