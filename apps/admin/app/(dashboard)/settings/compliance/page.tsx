import { ComplianceActions } from "./compliance-actions";

export default function CompliancePage() {
  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Compliance & Privacy</h1>
        <p className="text-[var(--muted-foreground)] text-sm">GDPR, CCPA, and SOC 2 controls for your workspace.</p>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Data Controls</h2>
        <div className="border border-[var(--border)] rounded-lg divide-y divide-[var(--border)]">
          <ComplianceRow title="Audit Log" status="active" desc="All mutations recorded in audit_log table." />
          <ComplianceRow title="Analytics DNT" status="active" desc="navigator.doNotTrack respected — events dropped server-side." />
          <ComplianceRow title="PII-free analytics" status="active" desc="No IP addresses stored. visitorId is random per-session UUID." />
          <ComplianceRow title="RBAC enforcement" status="active" desc="owner / admin / editor / viewer roles on every API route." />
          <ComplianceRow title="HMAC webhook signatures" status="active" desc="sha256 signed. Verify with crypto.timingSafeEqual." />
          <ComplianceRow title="Encrypted at rest" status="active" desc="Postgres data encrypted at rest via cloud provider AES-256." />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Data Subject Requests</h2>
        <p className="text-sm text-[var(--muted-foreground)]">
          Exercise your GDPR/CCPA rights. Export a full JSON archive of tenant data, or schedule
          permanent deletion (30-day grace period before purge).
        </p>
        <ComplianceActions />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">SOC 2 Readiness</h2>
        <div className="border border-[var(--border)] rounded-lg divide-y divide-[var(--border)]">
          <CheckRow label="Audit log enabled" done />
          <CheckRow label="RBAC on all endpoints" done />
          <CheckRow label="Secrets in environment variables" done />
          <CheckRow label="Signed webhook deliveries" done />
          <CheckRow label="Stripe webhook verification" done />
          <CheckRow label="GDPR export endpoint live" done />
          <CheckRow label="Annual penetration test" done={false} />
          <CheckRow label="Quarterly access review" done={false} />
          <CheckRow label="Monthly backup restore verification" done={false} />
        </div>
      </section>
    </div>
  );
}

function ComplianceRow({ title, status, desc }: { title: string; status: "active" | "disabled"; desc: string }) {
  return (
    <div className="flex items-start gap-4 px-4 py-3">
      <span
        className={`mt-0.5 w-2.5 h-2.5 rounded-full shrink-0 ${
          status === "active" ? "bg-green-500" : "bg-[var(--border)]"
        }`}
      />
      <div>
        <p className="font-medium text-sm">{title}</p>
        <p className="text-xs text-[var(--muted-foreground)]">{desc}</p>
      </div>
    </div>
  );
}

function CheckRow({ label, done }: { label: string; done: boolean }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className={`text-sm font-bold ${done ? "text-green-600" : "text-[var(--muted-foreground)]"}`}>
        {done ? "✓" : "○"}
      </span>
      <p className="text-sm">{label}</p>
    </div>
  );
}
