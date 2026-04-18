import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Platform Docs",
  description: "API, MCP, and SDK reference for the Agent-Native Website Platform.",
};

const NAV = [
  { href: "/", label: "Overview" },
  { href: "/getting-started", label: "Getting Started" },
  { href: "/api-reference", label: "API Reference" },
  { href: "/mcp-guide", label: "MCP / Agents" },
  { href: "/sdk", label: "SDK" },
  { href: "/cli", label: "CLI" },
  { href: "/webhooks", label: "Webhooks" },
  { href: "/compliance", label: "Compliance" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen font-sans antialiased" style={{ margin: 0 }}>
        <aside
          style={{
            width: 220,
            flexShrink: 0,
            borderRight: "1px solid #e5e7eb",
            padding: "24px 16px",
            background: "#fafafa",
          }}
        >
          <Link href="/" style={{ fontWeight: 700, fontSize: 14, textDecoration: "none", color: "#111" }}>
            Platform Docs
          </Link>
          <nav style={{ marginTop: 24 }}>
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                style={{
                  display: "block",
                  padding: "6px 8px",
                  fontSize: 13,
                  color: "#374151",
                  textDecoration: "none",
                  borderRadius: 4,
                }}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main style={{ flex: 1, padding: "40px 48px", maxWidth: 800 }}>{children}</main>
      </body>
    </html>
  );
}
