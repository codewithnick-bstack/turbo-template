export default function CompliancePage() {
  return (
    <div className="p-6 max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Compliance & Privacy</h1>
        <p className="text-neutral-500 text-sm">GDPR, CCPA, and SOC 2 controls for your workspace.</p>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Data Controls</h2>
        <div className="border border-neutral-200 rounded-xl divide-y divide-neutral-100">
          <ComplianceRow
            title="Audit Log"
            status="active"
            desc="All mutations recorded in audit_log table."
          />
          <ComplianceRow
            title="Analytics DNT"
            status="active"
            desc="navigator.doNotTrack respected — events dropped server-side."
          />
          <ComplianceRow
            title="PII-free analytics"
            status="active"
            desc="No IP addresses stored. visitorId is a random per-session UUID."
          />
          <ComplianceRow
            title="RBAC enforcement"
            status="active"
            desc="owner / admin / editor / viewer roles on every API route."
          />
          <ComplianceRow
            title="HMAC webhook signatures"
            status="active"
            desc="sha256 signed. Verify with crypto.timingSafeEqual."
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Data Export & Deletion</h2>
        <p className="text-sm text-neutral-500">
          Export all tenant data as a JSON archive, or delete the workspace and all associated data.
          These operations are available to workspace owners only.
        </p>
        <div className="flex gap-3">
          <button
            disabled
            className="text-sm border border-neutral-300 px-4 py-2 rounded-lg font-medium opacity-60 cursor-not-allowed"
          >
            Export Data (coming soon)
          </button>
          <button
            disabled
            className="text-sm border border-red-300 text-red-600 px-4 py-2 rounded-lg font-medium opacity-60 cursor-not-allowed"
          >
            Delete Workspace (coming soon)
          </button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">SOC 2 Checklist</h2>
        <div className="border border-neutral-200 rounded-xl divide-y divide-neutral-100">
          <CheckRow label="Audit log enabled" done />
          <CheckRow label="RBAC on all endpoints" done />
          <CheckRow label="Secrets in environment variables" done />
          <CheckRow label="Signed webhook deliveries" done />
          <CheckRow label="Stripe webhook verification" done />
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
      <span className={`mt-0.5 w-2.5 h-2.5 rounded-full shrink-0 ${status === "active" ? "bg-green-500" : "bg-neutral-300"}`} />
      <div>
        <p className="font-medium text-sm">{title}</p>
        <p className="text-xs text-neutral-400">{desc}</p>
      </div>
    </div>
  );
}

function CheckRow({ label, done }: { label: string; done: boolean }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="text-lg">{done ? "✅" : "⬜"}</span>
      <p className="text-sm">{label}</p>
    </div>
  );
}
