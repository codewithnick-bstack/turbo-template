export default function McpGuidePage() {
  return (
    <article>
      <h1>MCP / Agents</h1>
      <p>
        The platform ships an MCP server (<code>apps/mcp</code>) that exposes every operation as
        an MCP tool. Claude and other agents can operate your sites end-to-end without a UI.
      </p>

      <h2>Start the MCP server</h2>
      <Pre>{`# env
PLATFORM_API_URL=http://localhost:4100
PLATFORM_API_KEY=your-api-key
DEV_TENANT_ID=your-tenant-uuid

pnpm --filter apps/mcp dev   # stdio transport, port 4200`}</Pre>

      <h2>Connect Claude Desktop</h2>
      <Pre>{`# ~/.config/claude/claude_desktop_config.json
{
  "mcpServers": {
    "platform": {
      "command": "node",
      "args": ["/path/to/apps/mcp/dist/index.js"],
      "env": {
        "PLATFORM_API_URL": "http://localhost:4100",
        "PLATFORM_API_KEY": "your-key",
        "DEV_TENANT_ID": "your-tenant-id"
      }
    }
  }
}`}</Pre>

      <h2>Available tools</h2>
      <p>All 40+ tools follow the Agent Parity Invariant — every HTTP operation has a matching tool.</p>
      <Table
        headers={["Tool", "Description"]}
        rows={TOOLS}
      />

      <h2>Agent Parity Invariant</h2>
      <p>
        Every operation the admin UI can perform, an agent can also perform via MCP.
        Operations with side effects (publish, delete, invite) are annotated
        <code>requiresApproval: true</code> so Claude asks for confirmation.
      </p>

      <h2>Example agent prompt</h2>
      <Pre>{`"Create a new blog post titled 'Why AI Agents Are the Future'
on site my-site, generate the content with AI, then publish it."`}</Pre>
    </article>
  );
}

const TOOLS = [
  ["whoami", "Get authenticated user"],
  ["list_sites / create_site / get_site", "Site management"],
  ["list_pages / create_page / publish_page", "Page management"],
  ["list_forms / submit_form", "Forms"],
  ["list_blog_posts / create_blog_post / publish_blog_post", "Blog"],
  ["get_analytics", "Analytics"],
  ["search", "Content search"],
  ["ai_chat", "Site assistant chat"],
  ["generate_blog_post", "AI blog draft"],
  ["seo_audit / seo_generate_meta", "SEO"],
  ["list_members / invite_member", "Team members"],
  ["list_templates / use_template", "Templates"],
  ["get_branding / update_branding", "White-label"],
  ["check_entitlement / set_plan", "Billing"],
  ["subscribe_webhook / replay_webhook", "Webhooks"],
  ["presign_media_upload / finalize_media", "Media"],
];

function Pre({ children }: { children: string }) {
  return <pre style={{ background: "#1e1e1e", color: "#d4d4d4", padding: 16, borderRadius: 8, fontSize: 13, overflowX: "auto", margin: "12px 0" }}><code>{children}</code></pre>;
}

function Table({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div style={{ overflowX: "auto", margin: "16px 0" }}>
      <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13 }}>
        <thead><tr>{headers.map((h) => <th key={h} style={{ border: "1px solid #e5e7eb", padding: "8px 12px", background: "#f9fafb", textAlign: "left" }}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j} style={{ border: "1px solid #e5e7eb", padding: "8px 12px" }}><code style={{ fontSize: 12 }}>{cell}</code></td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}
