import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sandboxes" };

export default function SandboxesPage() {
  return (
    <article>
      <h1>Sandboxes</h1>
      <p>Sandboxes are isolated copies of a site where you can safely test content changes, AI-generated updates, or agent workflows before promoting them to production.</p>

      <h2>How sandboxes work</h2>
      <ol>
        <li><strong>Create</strong> — Fork a site into a sandbox at the current point in time.</li>
        <li><strong>Edit</strong> — Make changes, run agent workflows, or test publishing flows.</li>
        <li><strong>Promote</strong> — Apply the sandbox changes back to the production site.</li>
        <li><strong>Delete</strong> — Discard the sandbox when no longer needed.</li>
      </ol>

      <h2>Creating a sandbox</h2>
      <h3>Via MCP tool</h3>
      <pre><code>{`create_sandbox({
  siteId: "site_abc123",
  name: "staging"
})`}</code></pre>

      <h3>Via SDK</h3>
      <pre><code>{`const sandbox = await client.sandboxes.create({
  siteId: "site_abc123",
  name: "staging",
});
console.log(sandbox.id); // "sbx_abc123"`}</code></pre>

      <h3>Via API</h3>
      <pre><code>{`POST /v1/sandboxes
Authorization: Bearer <token>
Content-Type: application/json

{
  "siteId": "site_abc123",
  "name": "staging"
}`}</code></pre>

      <h2>Listing sandboxes</h2>
      <pre><code>{`GET /v1/sandboxes?siteId=site_abc123`}</code></pre>

      <h2>Promoting to production</h2>
      <p>Promoting applies the sandbox state to the parent site. This action is audit-logged and triggers the <code>sandbox.promoted</code> webhook event.</p>
      <pre><code>{`POST /v1/sandboxes/{sandboxId}/promote`}</code></pre>

      <h2>Sandbox statuses</h2>
      <table>
        <thead>
          <tr><th>Status</th><th>Description</th></tr>
        </thead>
        <tbody>
          <tr><td><code>active</code></td><td>Sandbox is live and ready for editing.</td></tr>
          <tr><td><code>promoting</code></td><td>Promotion is in progress.</td></tr>
          <tr><td><code>promoted</code></td><td>Changes applied to production.</td></tr>
          <tr><td><code>deleted</code></td><td>Sandbox has been soft-deleted.</td></tr>
        </tbody>
      </table>

      <h2>Agent workflow example</h2>
      <p>A common pattern for agent-driven content updates:</p>
      <pre><code>{`// 1. Create sandbox
const sandbox = await client.sandboxes.create({ siteId, name: "ai-rewrite" });

// 2. Update pages in the sandbox (future: pass sandboxId to page updates)
// 3. Review changes

// 4. Promote
await client.sandboxes.promote(sandbox.id);

// 5. Cleanup
await client.sandboxes.delete(sandbox.id);`}</code></pre>
    </article>
  );
}
