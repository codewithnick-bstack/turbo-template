import Link from "next/link";

export default function DocsIndex() {
  return (
    <article>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Platform Docs</h1>
      <p style={{ color: "#6b7280", marginBottom: 32 }}>
        Agent-Native Website Platform — every operation available as HTTP, MCP tool, and SDK call.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {CARDS.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            style={{
              display: "block",
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              padding: 20,
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{c.title}</p>
            <p style={{ fontSize: 13, color: "#6b7280" }}>{c.desc}</p>
          </Link>
        ))}
      </div>
    </article>
  );
}

const CARDS = [
  { href: "/getting-started", title: "Getting Started", desc: "Run the platform locally in 5 minutes." },
  { href: "/api-reference", title: "API Reference", desc: "All REST endpoints, auth, and error codes." },
  { href: "/mcp-guide", title: "MCP / Agents", desc: "Use the platform as an MCP server with Claude." },
  { href: "/sdk", title: "SDK", desc: "TypeScript SDK for server-side integrations." },
  { href: "/cli", title: "CLI", desc: "Command-line interface for scripting and CI." },
  { href: "/webhooks", title: "Webhooks", desc: "Subscribe to events and replay deliveries." },
];
