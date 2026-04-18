export default function GettingStartedPage() {
  return (
    <article>
      <h1>Getting Started</h1>
      <p>Run the full platform stack locally in ~5 minutes.</p>

      <h2>Prerequisites</h2>
      <ul>
        <li>Node.js 20+</li>
        <li>pnpm 10+</li>
        <li>Docker (for Postgres + Redis)</li>
      </ul>

      <h2>1. Clone and install</h2>
      <Pre>{`git clone https://github.com/your-org/platform.git
cd platform
pnpm install`}</Pre>

      <h2>2. Start backing services</h2>
      <Pre>{`docker compose -f infra/docker-compose.yml up -d`}</Pre>

      <h2>3. Configure environment</h2>
      <Pre>{`cp .env.example .env
# Edit .env — at minimum set DATABASE_URL`}</Pre>

      <h2>4. Run migrations</h2>
      <Pre>{`pnpm --filter @repo/db migrate`}</Pre>

      <h2>5. Start dev servers</h2>
      <Pre>{`pnpm dev
# admin  → http://localhost:4000
# web    → http://localhost:3000
# api    → http://localhost:4100
# docs   → http://localhost:4300`}</Pre>

      <h2>6. Seed test data (optional)</h2>
      <Pre>{`pnpm --filter @repo/db seed`}</Pre>

      <h2>Next steps</h2>
      <ul>
        <li>Create a tenant via <code>POST /v1/tenants</code></li>
        <li>Create a site, then pages</li>
        <li>Open the admin at localhost:4000</li>
        <li>Connect the MCP server — see <a href="/mcp-guide">MCP / Agents</a></li>
      </ul>
    </article>
  );
}

function Pre({ children }: { children: string }) {
  return (
    <pre
      style={{
        background: "#1e1e1e",
        color: "#d4d4d4",
        padding: "16px",
        borderRadius: 8,
        overflowX: "auto",
        fontSize: 13,
        lineHeight: 1.6,
        margin: "12px 0",
      }}
    >
      <code>{children}</code>
    </pre>
  );
}
