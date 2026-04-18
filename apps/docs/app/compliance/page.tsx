export default function CompliancePage() {
  return (
    <article>
      <h1>Compliance</h1>
      <p>GDPR, CCPA, and SOC 2 readiness guidance for the platform.</p>

      <h2>Data residency</h2>
      <p>
        All tenant data is stored in your PostgreSQL database. Configure
        <code>DATABASE_URL</code> to point to a region-appropriate instance.
        No data is sent to third parties without explicit configuration.
      </p>

      <h2>Analytics — privacy controls</h2>
      <ul>
        <li><strong>DNT respected:</strong> The <code>AnalyticsBeacon</code> checks <code>navigator.doNotTrack</code> and drops the event server-side when <code>dnt: true</code> is sent.</li>
        <li><strong>No PII:</strong> Events store <code>visitorId</code> (random sessionStorage UUID, not tied to identity) and <code>path</code> only.</li>
        <li><strong>IP not stored:</strong> Events table has no IP column. Use a reverse proxy (Cloudflare, nginx) to strip IPs before they reach the API.</li>
      </ul>

      <h2>GDPR data export</h2>
      <Pre>{`# Export all data for a tenant (admin use)
GET /v1/tenants/:id/export   # → JSON archive (planned Phase 6.4)

# Or query directly:
SELECT * FROM form_submissions WHERE tenant_id = $1;
SELECT * FROM analytics_events WHERE tenant_id = $1;`}</Pre>

      <h2>Data deletion</h2>
      <Pre>{`# Delete tenant and all associated data (cascades via FK)
DELETE FROM tenants WHERE id = $1;`}</Pre>
      <p>All child tables use <code>ON DELETE CASCADE</code>.</p>

      <h2>Cookie consent</h2>
      <p>
        The platform does not set cookies by default. Session cookies are set only when
        WorkOS / Clerk auth is enabled. For visitor-facing analytics, no cookies are used
        — <code>visitorId</code> is stored in <code>sessionStorage</code>.
      </p>

      <h2>SOC 2 readiness checklist</h2>
      <ul>
        <li>✅ Audit log — every mutation recorded in <code>audit_log</code></li>
        <li>✅ RBAC — owner / admin / editor / viewer roles enforced on every route</li>
        <li>✅ Secrets in env — no hardcoded credentials</li>
        <li>✅ HMAC webhook signatures — <code>sha256</code></li>
        <li>✅ Stripe webhook verification — <code>constructWebhookEvent</code></li>
        <li>⬜ Penetration test — schedule annually</li>
        <li>⬜ Formal access review — quarterly (see <code>docs/runbooks/access-review.md</code>)</li>
        <li>⬜ Backup verification — monthly restore test</li>
      </ul>
    </article>
  );
}

function Pre({ children }: { children: string }) {
  return <pre style={{ background: "#1e1e1e", color: "#d4d4d4", padding: 16, borderRadius: 8, fontSize: 13, overflowX: "auto", margin: "12px 0" }}><code>{children}</code></pre>;
}
