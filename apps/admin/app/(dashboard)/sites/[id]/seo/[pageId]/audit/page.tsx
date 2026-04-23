import Link from "next/link";
import { getApiClient } from "../../../../../../../lib/api";

type Props = { params: Promise<{ id: string; pageId: string }> };

type Finding = { severity: string; rule: string; evidence: string; suggested_fix: string };

export default async function SeoAuditPage({ params }: Props) {
  const { id, pageId } = await params;
  const api = getApiClient();
  let findings: Finding[] = [];
  let error = "";

  try {
    const data = await api.aiAssistant.seoAudit(pageId) as { findings?: Finding[] };
    findings = Array.isArray(data.findings) ? data.findings : [];
  } catch (err) {
    error = err instanceof Error ? err.message : "Audit failed";
  }

  const severityColor: Record<string, string> = {
    critical: "text-red-700 bg-red-50 border-red-200",
    warning: "text-amber-700 bg-amber-50 border-amber-200",
    info: "text-blue-700 bg-blue-50 border-blue-200",
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Link href={`/sites/${id}/seo`} className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]">← SEO</Link>
        <h1 className="text-xl font-bold">SEO Audit</h1>
      </div>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      {findings.length === 0 && !error && (
        <p className="text-[var(--muted-foreground)] text-sm">No issues found — looks good!</p>
      )}

      <div className="space-y-3">
        {findings.map((f, i) => (
          <div key={i} className={`border rounded-xl px-4 py-3 ${severityColor[f.severity] ?? "border-[var(--border)]"}`}>
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
