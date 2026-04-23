import type { Metadata } from "next";

export const metadata: Metadata = { title: "Agency & Clients" };

export default function AgencyPage() {
  return (
    <article>
      <h1>Agency & Client Workspaces</h1>
      <p>The agency tier allows agencies to manage multiple client tenants from a single dashboard, with full white-label branding and reseller billing support.</p>

      <h2>Requirements</h2>
      <p>Agency features require the <strong>Agency</strong> plan. Attempting to access agency endpoints on other plans returns <code>403 Forbidden</code>.</p>

      <h2>Client workspaces</h2>
      <p>Each client is a child tenant isolated from other clients. Client workspaces share the agency's billing plan but have independent:</p>
      <ul>
        <li>Sites, pages, and content</li>
        <li>Members and role assignments</li>
        <li>API keys and OAuth apps</li>
        <li>Audit logs</li>
      </ul>

      <h2>Creating a client workspace</h2>
      <pre><code>{`POST /v1/agency/clients
Authorization: Bearer <agency-token>
Content-Type: application/json

{
  "name": "Acme Corp",
  "slug": "acme-corp"
}`}</code></pre>

      <h3>SDK</h3>
      <pre><code>{`const client = await platformClient.agency.createClient({
  name: "Acme Corp",
  slug: "acme-corp",
});`}</code></pre>

      <h3>MCP tool</h3>
      <pre><code>{`create_client_workspace({ name: "Acme Corp", slug: "acme-corp" })`}</code></pre>

      <h2>Switching context to a client</h2>
      <p>Most API operations accept an <code>X-Tenant-Id</code> header to scope the request to a specific client workspace. Your agency token must have the <code>agency:impersonate</code> scope.</p>
      <pre><code>{`GET /v1/sites
Authorization: Bearer <agency-token>
X-Tenant-Id: <client-tenant-id>`}</code></pre>

      <h2>White-label branding</h2>
      <p>Set your agency branding and it will be inherited by all client workspaces. Override per-client by patching that client's branding.</p>
      <pre><code>{`PATCH /v1/branding
{
  "logoUrl": "https://cdn.example.com/logo.svg",
  "primaryColor": "#0070f3",
  "supportEmail": "support@youragency.com",
  "privacyUrl": "https://youragency.com/privacy",
  "termsUrl": "https://youragency.com/terms"
}`}</code></pre>

      <h2>Webhook events</h2>
      <table>
        <thead><tr><th>Event</th><th>Trigger</th></tr></thead>
        <tbody>
          <tr><td><code>agency.client_created</code></td><td>New client workspace created</td></tr>
          <tr><td><code>agency.client_updated</code></td><td>Client name or settings changed</td></tr>
          <tr><td><code>agency.client_removed</code></td><td>Client workspace deleted</td></tr>
        </tbody>
      </table>
    </article>
  );
}
