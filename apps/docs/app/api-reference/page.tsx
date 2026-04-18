export default function ApiReferencePage() {
  return (
    <article>
      <h1>API Reference</h1>
      <p>Base URL: <code>http://localhost:4100</code> (production: your domain)</p>

      <h2>Authentication</h2>
      <p>All endpoints (except analytics ingest and health) require auth headers:</p>
      <Pre>{`# Mock (dev only)
x-tenant-id: <uuid>
x-user-id:   <uuid>
x-role:      owner | admin | editor | viewer

# Production (JWT)
Authorization: Bearer <session_token>`}</Pre>

      <h2>Response format</h2>
      <Pre>{`// Success (list)
{ "data": [...] }

// Success (single)
{ "id": "...", ... }

// Error
{ "code": "not_found", "message": "...", "details": {} }`}</Pre>

      <h2>Error codes</h2>
      <Table
        headers={["Code", "HTTP", "When"]}
        rows={[
          ["bad_request", "400", "Validation failed"],
          ["unauthorized", "401", "Missing or invalid auth"],
          ["forbidden", "403", "Insufficient role"],
          ["not_found", "404", "Resource doesn't exist"],
          ["conflict", "409", "Duplicate slug / constraint"],
          ["unprocessable", "422", "Spam detected / captcha failed"],
          ["internal", "500", "Unexpected server error"],
        ]}
      />

      <h2>Core endpoints</h2>
      <Table
        headers={["Method", "Path", "Description"]}
        rows={[
          ["GET", "/health", "Health check"],
          ["GET", "/v1/whoami", "Authenticated user + membership"],
          ["GET/POST", "/v1/sites", "List / create sites"],
          ["GET/PATCH", "/v1/sites/:id", "Get / update site"],
          ["GET/POST", "/v1/pages", "List / create pages"],
          ["POST", "/v1/pages/:id/publish", "Publish page"],
          ["GET/POST", "/v1/forms", "List / create forms"],
          ["POST", "/v1/forms/:id/submit", "Public form submit"],
          ["GET/POST", "/v1/blog/posts", "List / create blog posts"],
          ["POST", "/v1/blog/posts/:id/publish", "Publish post"],
          ["POST", "/v1/analytics/events", "Ingest analytics event (public)"],
          ["GET", "/v1/analytics", "Get aggregated analytics"],
          ["GET", "/v1/search", "Full-text content search"],
          ["POST", "/v1/ai/chat", "Site assistant chat"],
          ["POST", "/v1/ai/chatbot", "Visitor chatbot (public, ?tid=)"],
          ["POST", "/v1/ai/seo/audit", "AI SEO audit"],
          ["GET/PATCH", "/v1/branding", "Tenant branding"],
          ["GET/POST", "/v1/members", "List / invite members"],
          ["GET", "/v1/templates", "List templates"],
          ["POST", "/v1/templates/:id/use", "Create site from template"],
          ["GET/PATCH", "/v1/billing/entitlements", "Check entitlements"],
          ["POST", "/v1/billing/webhook", "Stripe webhook (raw body)"],
        ]}
      />
    </article>
  );
}

function Pre({ children }: { children: string }) {
  return (
    <pre style={{ background: "#1e1e1e", color: "#d4d4d4", padding: 16, borderRadius: 8, fontSize: 13, overflowX: "auto", margin: "12px 0" }}>
      <code>{children}</code>
    </pre>
  );
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div style={{ overflowX: "auto", margin: "16px 0" }}>
      <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13 }}>
        <thead>
          <tr>{headers.map((h) => <th key={h} style={{ border: "1px solid #e5e7eb", padding: "8px 12px", background: "#f9fafb", textAlign: "left" }}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>{row.map((cell, j) => <td key={j} style={{ border: "1px solid #e5e7eb", padding: "8px 12px" }}><code style={{ fontSize: 12 }}>{cell}</code></td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
